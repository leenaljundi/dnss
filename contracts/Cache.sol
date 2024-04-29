// SPDX-License-Identifier: MIT
pragma solidity >=0.5.1 <0.9.0;

import "./Registry.sol";
import "./Resolver.sol";

contract Cache {
    Registry public registry;
    Resolver public resolver;
    address public rAddress;
    address public resolverAddress;

    event UpdateCacheEvent(bytes32 indexed nameHash, bytes ip);

    struct Record {
        bytes32 nameHash;
        bytes ip;
    }

    mapping(bytes32 => Record) public records;

    // Address of Registry and Resolver contracts
    constructor(address _rAddress, address _resolverAddress) public {
        // store the Registry and Resolver addresses
        rAddress = _rAddress;
        resolverAddress = _resolverAddress;
        registry = Registry(rAddress);
        resolver = Resolver(resolverAddress);
    }

    // Resolve name to IP address
    function resolve(bytes32 nameHash) public returns (bytes memory ip) {
        Record storage record = records[nameHash];
        if (record.ip.length != 0) {
            // IP is in cache
            return record.ip;
        } else {
            // IP is not in cache, get it from Resolver
            ip = resolver.resolve(nameHash);
            // Update cache
            updateCache(nameHash, ip);
            return ip;
        }
    }

    function updateCache(bytes32 nameHash, bytes memory ip) public {
        Record storage record = records[nameHash];
        record.nameHash = nameHash;
        record.ip = ip;

        // Emit the event
        emit UpdateCacheEvent(nameHash, ip);
    }
}
