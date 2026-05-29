// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MeshToken.sol";

contract Deploy is Script {
    function run() external {
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        vm.startBroadcast();
        MeshToken token = new MeshToken(deployer);
        console.log("MeshToken deployed at:", address(token));
        vm.stopBroadcast();
    }
}
