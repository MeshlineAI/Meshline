// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice MESH — ERC-20 utility token for the Meshline scan credit and governance system.
contract MeshToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 50_000_000 * 10 ** 18;

    constructor(address initialOwner)
        ERC20("Meshline", "MESH")
        Ownable(initialOwner)
    {
        _mint(initialOwner, MAX_SUPPLY);
    }
}
