import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Registry from "./contracts/Registry.json";
import Cache from "./contracts/Cache.json";
import Resolver from "./contracts/Resolver.json";

function App() {
  const [web3, setWeb3] = useState(null);
  const [registryContract, setRegistryContract] = useState(null);
  const [cacheContract, setCacheContract] = useState(null);
  const [resolverContract, setResolverContract] = useState(null);
  const [registerName, setRegisterName] = useState("");
  const [registerIp, setRegisterIp] = useState("");
  const [resolveName, setResolveName] = useState("");
  const [resolvedIp, setResolvedIp] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateIp, setUpdateIp] = useState("");
  const [events, setEvents] = useState([]);
  const [domainName, setDomainName] = useState(""); 

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545'));
        setWeb3(web3Instance);

        const networkId = await web3Instance.eth.net.getId();

        const registryAddress = Registry.networks[networkId].address;
        const cacheAddress = Cache.networks[networkId].address;
        const resolverAddress = Resolver.networks[networkId].address;

        const registry = new web3Instance.eth.Contract(Registry.abi, registryAddress);
        const cache = new web3Instance.eth.Contract(Cache.abi, cacheAddress);
        const resolver = new web3Instance.eth.Contract(Resolver.abi, resolverAddress);

        setRegistryContract(registry);
        setCacheContract(cache);
        setResolverContract(resolver);

        // Listen for UpdateCacheEvent
        cache.events.UpdateCacheEvent()
          .on('data', (event) => {
            console.log('UpdateCacheEvent received:', event);
            setEvents(prevEvents => [...prevEvents, event]);
            // Update UI or cache based on event data
          })
          .on('error', (error) => {
            console.error('Error listening for UpdateCacheEvent:', error);
          });
      } catch (error) {
        console.error("Error initializing web3:", error);
      }
    };

    initWeb3();
  }, []);

  useEffect(() => {
    const pollEvents = async () => {
      try {
        if (!cacheContract) return;

        const blockNumber = await web3.eth.getBlockNumber();
        const events = await cacheContract.getPastEvents("UpdateCacheEvent", {
          fromBlock: blockNumber - 100, // Adjust the range as needed
          toBlock: "latest"
        });

        setEvents(events);
      } catch (error) {
        console.error("Error polling events:", error);
      }
    };
    const intervalId = setInterval(pollEvents, 5000); // Poll events every 5 seconds

    return () => clearInterval(intervalId); // Cleanup function
  }, [cacheContract, web3]); // Added web3 as a dependency

  useEffect(() => {
    events.forEach((event) => {
      console.log("UpdateCacheEvent received:", event);
      // Update UI or cache based on event data
    });
  }, [events]);

  const hashName = (name) => {
    return web3 ? web3.utils.keccak256(name) : "";
  };

  const handleRegister = async () => {
    try {
      if (!web3 || !registryContract) return;

      const hashedName = hashName(registerName);
      const ipBytes32 = web3.utils.fromAscii(registerIp);
      await registryContract.methods.register(hashedName, ipBytes32).send({ from: "0x3dE9bBcF350841788060108f7A3cD2352A790D61", gas: 300000 });
      console.log("Registered successfully");
    } catch (error) {
      console.error("Error registering:", error);
    }
  };

 const handleResolve = async () => {
  try {
    if (!web3 || !cacheContract || !resolverContract) return;

    const nameHash = hashName(resolveName);
    if (!nameHash) {
      console.error("Invalid name for resolution");
      return;
    }
    
    // Check Cache contract first
    const cachedIpBytes = await cacheContract.methods.resolve(nameHash).call();
    if (cachedIpBytes) {
      const cachedIp = web3.utils.hexToAscii(cachedIpBytes);
      setResolvedIp(cachedIp);
      return;
    }

    // If IP not found in cache, then use Resolver contract
    const ipBytes = await resolverContract.methods.resolve(nameHash).call();
    if (ipBytes && ipBytes !== '0x') {
      const ip = web3.utils.hexToAscii(ipBytes);
      setResolvedIp(ip);
    } else {
      console.error("No IP address resolved for the provided domain name");
    }
  } catch (error) {
    console.error("Error resolving domain:", error);
  }
};


  const handleUpdateIp = async () => {
    try {
      if (!web3 || !cacheContract) return;

      const hashedName = hashName(updateName);
      const ipBytes32 = web3.utils.fromAscii(updateIp);
      await cacheContract.methods.updateCache(hashedName, ipBytes32).send({ from: "0x3dE9bBcF350841788060108f7A3cD2352A790D61", gas: 300000 });
      console.log("Cache updated successfully");
    } catch (error) {
      console.error("Error updating cache:", error);
    }
  };
 const isValidDomain = (domain) => {
    // Regular expression to validate domain name format
    const domainRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.(?:com|net|org|edu|int|gov|mil|arpa|[a-z]{2})$/i;
    return domainRegex.test(domain);
  };

  const handleNavigate = () => {
    if (!isValidDomain(domainName)) {
      alert("Please enter a valid domain name.");
      return;
    }

    // Navigate to the specified website
    window.location.href = `http://${domainName}`;
  };

  return (
    <div className="App" style={{ textAlign: 'center', margin: 'auto', maxWidth: '400px' }}>
      <h1 style={{ color: 'blue' }}>Smart Contract Interaction</h1>

      {/* Register section */}
      <h2>Register Domain</h2>
      <input type="text" placeholder="Name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} />
      <input type="text" placeholder="IP Address" value={registerIp} onChange={(e) => setRegisterIp(e.target.value)} />
      <button style={{ backgroundColor: 'purple', color: 'white' }} onClick={handleRegister}>Register</button>

      {/* Resolve section */}
      <h2>Resolve Domain</h2>
      <input type="text" placeholder="Domain Name" value={resolveName} onChange={(e) => setResolveName(e.target.value)} />
      <button style={{ backgroundColor: 'purple', color: 'white' }} onClick={handleResolve}>Resolve</button>
      {resolvedIp && <p>Resolved IP: {resolvedIp}</p>}

      {/* Update IP section */}
      <h2>Update IP</h2>
      <input type="text" placeholder="Name" value={updateName} onChange={(e) => setUpdateName(e.target.value)} />
      <input type="text" placeholder="New IP Address" value={updateIp} onChange={(e) => setUpdateIp(e.target.value)} />
      <button style={{ backgroundColor: 'purple', color: 'white' }} onClick={handleUpdateIp}>Update IP</button>

      {/* Enter Domain Name section */}
      <div className="App">
        <h2>Enter Domain Name</h2>
        <input
          type="text"
          placeholder="Enter Domain Name"
          value={domainName}
          onChange={(e) => setDomainName(e.target.value)}
        />
        <button onClick={handleNavigate}>Go</button>
      </div>
    </div>
  );
}

export default App;



