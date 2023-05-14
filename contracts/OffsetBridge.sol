// contracts/OffsetBridge.sol
// SPDX-License-Identifier: MIT OR Apache-2.0

pragma solidity ^0.8.3;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract OffsetBridge {
    uint256 public fee = 0;

    event NewFeeSet(uint256 newFee);

    constructor(address owner) {
        _transferOwnership(owner);
    }

    function sendFee(address _sender, uint256 newFee) external onlyOwner {
        fee = newFee;
    }
}
