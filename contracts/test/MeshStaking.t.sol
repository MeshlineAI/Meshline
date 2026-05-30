// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MeshToken.sol";
import "../src/MeshStaking.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}
    function mint(address to, uint256 amount) external { _mint(to, amount); }
    function decimals() public pure override returns (uint8) { return 6; }
}

contract MeshStakingTest is Test {
    MeshToken public mesh;
    MockUSDC public usdc;
    MeshStaking public staking;

    address public owner = address(1);
    address public alice = address(2);
    address public bob = address(3);
    address public treasury = address(4);

    uint256 constant MESH_UNIT = 1e18;
    uint256 constant USDC_UNIT = 1e6;

    function setUp() public {
        mesh = new MeshToken(owner);
        usdc = new MockUSDC();
        staking = new MeshStaking(address(mesh), address(usdc), owner);

        // Fund alice and bob with MESH
        vm.prank(owner);
        mesh.transfer(alice, 10_000 * MESH_UNIT);
        vm.prank(owner);
        mesh.transfer(bob, 5_000 * MESH_UNIT);

        // Approve staking contract
        vm.prank(alice);
        mesh.approve(address(staking), type(uint256).max);
        vm.prank(bob);
        mesh.approve(address(staking), type(uint256).max);
    }

    // ── Staking ───────────────────────────────────────────────────────────────

    function test_StakeIncreasesTotalStaked() public {
        vm.prank(alice);
        staking.stake(1_000 * MESH_UNIT);
        assertEq(staking.totalStaked(), 1_000 * MESH_UNIT);
    }

    function test_StakeTransfersMesh() public {
        uint256 before = mesh.balanceOf(alice);
        vm.prank(alice);
        staking.stake(500 * MESH_UNIT);
        assertEq(mesh.balanceOf(alice), before - 500 * MESH_UNIT);
        assertEq(mesh.balanceOf(address(staking)), 500 * MESH_UNIT);
    }

    function test_UnstakeReturnsTokens() public {
        vm.prank(alice);
        staking.stake(1_000 * MESH_UNIT);
        uint256 before = mesh.balanceOf(alice);
        vm.prank(alice);
        staking.unstake(1_000 * MESH_UNIT);
        assertEq(mesh.balanceOf(alice), before + 1_000 * MESH_UNIT);
    }

    function test_UnstakeRevertsOnInsufficientStake() public {
        vm.prank(alice);
        staking.stake(100 * MESH_UNIT);
        vm.prank(alice);
        vm.expectRevert("Insufficient stake");
        staking.unstake(200 * MESH_UNIT);
    }

    // ── Revenue distribution ──────────────────────────────────────────────────

    function test_DepositRevenueDistributesProportionally() public {
        vm.prank(alice);
        staking.stake(1_000 * MESH_UNIT); // alice: 1000
        vm.prank(bob);
        staking.stake(1_000 * MESH_UNIT); // bob: 1000 — equal stakes

        // Deposit 200 USDC revenue
        usdc.mint(treasury, 200 * USDC_UNIT);
        vm.prank(treasury);
        usdc.approve(address(staking), type(uint256).max);
        vm.prank(treasury);
        staking.depositRevenue(200 * USDC_UNIT);

        // Each should get 100 USDC
        assertEq(staking.pendingReward(alice), 100 * USDC_UNIT);
        assertEq(staking.pendingReward(bob), 100 * USDC_UNIT);
    }

    function test_ClaimRewardsTransfersUSDC() public {
        vm.prank(alice);
        staking.stake(1_000 * MESH_UNIT);

        usdc.mint(treasury, 100 * USDC_UNIT);
        vm.prank(treasury);
        usdc.approve(address(staking), type(uint256).max);
        vm.prank(treasury);
        staking.depositRevenue(100 * USDC_UNIT);

        vm.prank(alice);
        staking.claimRewards();
        assertEq(usdc.balanceOf(alice), 100 * USDC_UNIT);
        assertEq(staking.pendingReward(alice), 0);
    }

    function test_LaterStakerDoesNotGetPastRewards() public {
        vm.prank(alice);
        staking.stake(1_000 * MESH_UNIT);

        usdc.mint(treasury, 100 * USDC_UNIT);
        vm.prank(treasury);
        usdc.approve(address(staking), type(uint256).max);
        vm.prank(treasury);
        staking.depositRevenue(100 * USDC_UNIT);

        // Bob stakes AFTER revenue deposit
        vm.prank(bob);
        staking.stake(1_000 * MESH_UNIT);

        // Bob should get 0 pending from the past deposit
        assertEq(staking.pendingReward(bob), 0);
        // Alice should still get 100 USDC
        assertEq(staking.pendingReward(alice), 100 * USDC_UNIT);
    }

    // ── Discount tiers ────────────────────────────────────────────────────────

    function test_HoldingDiscountTiers() public view {
        // alice holds 10_000 MESH → free Pro
        assertEq(staking.holdingDiscount(alice), 100);

        // bob holds 5_000 MESH → 40% off
        assertEq(staking.holdingDiscount(bob), 40);

        // owner holds rest — more than 1000, less than 10000 depending on distribution
        // Just check zero address gets 0
        assertEq(staking.holdingDiscount(address(99)), 0);
    }

    function test_DiscountAt100Mesh() public {
        address charlie = address(5);
        vm.prank(owner);
        mesh.transfer(charlie, 100 * MESH_UNIT);
        assertEq(staking.holdingDiscount(charlie), 20);
    }
}
