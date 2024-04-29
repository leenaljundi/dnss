// SPDX-License-Identifier: MIT
 pragma solidity >=0.5.1 <0.9.0;


contract Registry {
    event LogInitialized(string message, uint256 value);

    struct Record {
        bytes32 nameHash; 
        bytes ip;
        address owner;
	bool registered;
    }

    mapping(bytes32 => Record) public records; 

    // Constructor to initialize the contract
    constructor() public {
        // No specific initialization logic
    }

    // Register domain name & IP
    function register(bytes32 nameHash, bytes memory ip) public {
        // Emit an event to log the registration
        emit LogInitialized("Registering domain", block.timestamp);
        // Lookup existing record
        Record storage record = records[nameHash];
        // Store IP and owner
	require(!record.registered, "Domain already registered");
	record.nameHash = nameHash;
        record.ip = ip;
        record.owner = msg.sender;
	record.registered = true;
    }
    event IPUpdated(bytes32 nameHash, bytes newIp);
    function updateIp(bytes32 nameHash, bytes memory newIp) public {
    Record storage record = records[nameHash];
    require(msg.sender == record.owner, "Only owner can update IP");
    record.ip = newIp;
    emit IPUpdated(nameHash, newIp);
}
}