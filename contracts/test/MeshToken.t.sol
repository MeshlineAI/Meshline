// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MeshToken.sol";

contract MeshTokenTest is Test {
    MeshToken public token;
    address public owner = address(1);

    function setUp() public {
        token = new MeshToken(owner);
    }

    function test_TotalSupply() public view {
        assertEq(token.totalSupply(), 50_000_000 * 10 ** 18);
    }

    function test_OwnerReceivesFullSupply() public view {
        assertEq(token.balanceOf(owner), 50_000_000 * 10 ** 18);
    }

    function test_Burn() public {
        vm.prank(owner);
        token.burn(1_000 * 10 ** 18);
        assertEq(token.totalSupply(), (50_000_000 - 1_000) * 10 ** 18);
    }

    function test_TransferReducesBalance() public {
        address recipient = address(2);
        vm.prank(owner);
        token.transfer(recipient, 500 * 10 ** 18);
        assertEq(token.balanceOf(recipient), 500 * 10 ** 18);
    }
}
