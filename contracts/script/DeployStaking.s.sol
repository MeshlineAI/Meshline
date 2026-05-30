// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MeshStaking.sol";

/**
 * @notice Deploys MeshStaking to Base mainnet.
 * Run this once after the MESH token is launched and you have its contract address.
 *
 * Usage:
 *   forge script script/DeployStaking.s.sol \
 *     --rpc-url $BASE_RPC_URL \
 *     --broadcast \
 *     --verify \
 *     --etherscan-api-key $BASESCAN_API_KEY
 *
 * Required env vars:
 *   MESH_TOKEN_ADDRESS  — contract address from launchpad
 *   DEPLOYER_ADDRESS    — your deployer wallet (receives owner role)
 *
 * USDC on Base is hardcoded: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
 */
contract DeployStaking is Script {
    address constant USDC_BASE = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    function run() external {
        address meshToken = vm.envAddress("MESH_TOKEN_ADDRESS");
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");

        vm.startBroadcast();

        MeshStaking staking = new MeshStaking(meshToken, USDC_BASE, deployer);
        console.log("MeshStaking deployed:", address(staking));
        console.log("MESH token:", meshToken);
        console.log("Owner:", deployer);

        vm.stopBroadcast();
    }
}
