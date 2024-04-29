// SPDX-License-Identifier: MIT
pragma solidity >=0.5.1 <0.9.0;

import "./Registry.sol";

contract Resolver {
    Registry public registry;
    address public rAddress;

    // Address of Registry contract
    constructor(address _rAddress) public {
        // store the Registry address
        rAddress = _rAddress;
        registry = Registry(rAddress);
    }

    // Resolve name to IP address
    function resolve(bytes32 nameHash) public view returns (bytes memory) {
        // Declare ip variable
        bytes memory ip;
        // Query Registry contract
        (, ip, , ) = registry.records(nameHash);
        return ip;
    }
}
