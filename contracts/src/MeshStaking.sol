// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MeshStaking
 * @notice Stake MESH to earn 20% of Meshline scan revenue (distributed in USDC).
 *         Also exposes holdingDiscount() for the backend to check Pro tier discounts.
 *
 * Revenue flow (handled off-chain by backend):
 *   - 20% of scan revenue → depositRevenue() weekly
 *   - 10% of scan revenue → buyback + burn (handled separately by treasury)
 *
 * Discount tiers (read by backend, enforced off-chain):
 *   - Hold 100  MESH → 20% off Pro subscription
 *   - Hold 1000 MESH → 40% off Pro subscription
 *   - Hold 10000 MESH → free Pro
 *
 * Scan credits:
 *   - burnForScan() lets users burn 1 MESH for 1 free Pro scan (backend verifies)
 */
contract MeshStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable mesh;
    IERC20 public immutable usdc;

    struct StakeInfo {
        uint256 amount;
        uint256 rewardDebt; // scaled 1e12
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    uint256 public accRewardPerShare; // accumulated USDC reward per MESH, scaled 1e12

    // ── Events ────────────────────────────────────────────────────────────────

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RevenueDeposited(uint256 amount);
    event ScanCreditBurned(address indexed user);

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor(address _mesh, address _usdc, address _owner)
        Ownable(_owner)
    {
        mesh = IERC20(_mesh);
        usdc = IERC20(_usdc);
    }

    // ── Staking ───────────────────────────────────────────────────────────────

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        _claimPending(msg.sender);
        mesh.safeTransferFrom(msg.sender, address(this), amount);
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].rewardDebt = _rewardDebt(stakes[msg.sender].amount);
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        require(stakes[msg.sender].amount >= amount, "Insufficient stake");
        _claimPending(msg.sender);
        stakes[msg.sender].amount -= amount;
        stakes[msg.sender].rewardDebt = _rewardDebt(stakes[msg.sender].amount);
        totalStaked -= amount;
        mesh.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        _claimPending(msg.sender);
    }

    // ── Revenue distribution (called by Meshline treasury weekly) ─────────────

    function depositRevenue(uint256 amount) external {
        require(amount > 0, "Zero deposit");
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        if (totalStaked > 0) {
            accRewardPerShare += (amount * 1e12) / totalStaked;
        }
        emit RevenueDeposited(amount);
    }

    // ── Scan credit burn (1 MESH = 1 free Pro scan) ───────────────────────────

    function burnForScan() external nonReentrant {
        uint256 ONE = 1e18;
        require(mesh.balanceOf(msg.sender) >= ONE, "Insufficient MESH");
        // Uses ERC20Burnable interface — MeshToken inherits it
        (bool ok,) = address(mesh).call(
            abi.encodeWithSignature("burnFrom(address,uint256)", msg.sender, ONE)
        );
        require(ok, "Burn failed");
        emit ScanCreditBurned(msg.sender);
    }

    // ── Discount lookup (read by backend off-chain) ───────────────────────────

    /// @return discount Percentage discount (0, 20, 40, or 100 = free Pro).
    function holdingDiscount(address user) external view returns (uint256) {
        uint256 balance = mesh.balanceOf(user);
        if (balance >= 10_000 * 1e18) return 100;
        if (balance >= 1_000 * 1e18) return 40;
        if (balance >= 100 * 1e18) return 20;
        return 0;
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    function pendingReward(address user) public view returns (uint256) {
        uint256 accumulated = _rewardDebt(stakes[user].amount);
        return accumulated > stakes[user].rewardDebt
            ? accumulated - stakes[user].rewardDebt
            : 0;
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    function _rewardDebt(uint256 amount) internal view returns (uint256) {
        return (amount * accRewardPerShare) / 1e12;
    }

    function _claimPending(address user) internal {
        uint256 pending = pendingReward(user);
        stakes[user].rewardDebt = _rewardDebt(stakes[user].amount);
        if (pending > 0) {
            usdc.safeTransfer(user, pending);
            emit RewardClaimed(user, pending);
        }
    }
}
