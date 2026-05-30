// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MeshToken.sol";
import "../src/MeshStaking.sol";

/**
 * @notice Deploys MeshToken and MeshStaking to Base.
 *
 * Usage:
 *   forge script script/DeployAll.s.sol \
 *     --rpc-url $BASE_RPC_URL \
 *     --broadcast \
 *     --verify \
 *     --etherscan-api-key $BASESCAN_API_KEY
 *
 * Required env vars:
 *   DEPLOYER_ADDRESS  — deployer EOA (receives all initial MESH supply)
 *   USDC_BASE         — USDC contract on Base (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
 */
contract DeployAll is Script {
    address constant USDC_BASE = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    function run() external {
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        address usdc = vm.envOr("USDC_BASE", USDC_BASE);

        vm.startBroadcast();

        MeshToken token = new MeshToken(deployer);
        console.log("MeshToken deployed:", address(token));

        MeshStaking staking = new MeshStaking(address(token), usdc, deployer);
        console.log("MeshStaking deployed:", address(staking));

        vm.stopBroadcast();
    }
}
