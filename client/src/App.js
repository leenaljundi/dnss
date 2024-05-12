import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Registry from "./contracts/Registry.json";
import Cache from "./contracts/Cache.json";
import Resolver from "./contracts/Resolver.json";

import BasicTabs from "./components";
import "./App.css"
import bg from './image/bg.jpeg'

import bg1 from './image/background.png'
import bg2 from './image/background2.png'
import icon from './image/icon.png'
import { TextField , Button } from "@mui/material";
import toast, { Toaster } from 'react-hot-toast';

const notify = () => toast.success('Successfully Registered  ')
const notifyUpdate = () => toast.success('Successfully Updated ')


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
        const web3Instance = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:7545'));
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
      notify()
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
      notifyUpdate()
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
    <div className="w3-black">




<nav className="w3-sidebar w3-bar-block w3-small w3-hide-small w3-center">
 
  <img src={icon} style={{width:'100%'}}/>
  <a href="#" className="w3-bar-item w3-button w3-padding-large w3-black">
    <i className="fa fa-home w3-xlarge"></i>
    <p>HOME</p>
  </a>
  <a href="#about" className="w3-bar-item w3-button w3-padding-large w3-hover-black">
    <i className="fa fa-user w3-xlarge"></i>
    <p>ABOUT</p>
  </a>
  <a href="#registration" className="w3-bar-item w3-button w3-padding-large w3-hover-black">
    <i className="fa fa-cloud w3-xlarge"></i>
    
    <p className="center">REGISTRATION</p>
  </a>
  <a href="#photos" className="w3-bar-item w3-button w3-padding-large w3-hover-black">
    <i className="fa fa-eye w3-xlarge"></i>
    <p>MORE</p>
  </a>
  <a href="#contact" className="w3-bar-item w3-button w3-padding-large w3-hover-black">
    <i className="fa fa-envelope w3-xlarge"></i>
    <p>CONTACT</p>
  </a>
</nav>


<div className="w3-top w3-hide-large w3-hide-medium" id="myNavbar">
  <div className="w3-bar w3-black w3-opacity w3-hover-opacity-off w3-center w3-small">
    <a href="#" className="w3-bar-item w3-button" style={{width:'25% !important'}}>HOME</a>
    <a href="#about" className="w3-bar-item w3-button" style={{width:'25% !important'}}>ABOUT</a>
    <a href="#registration" className="w3-bar-item w3-button" style={{width:'25% !important'}}>REGISTRATION</a>
    <a href="#photos" className="w3-bar-item w3-button" style={{width:'25% !important'}}>MORE</a>
    <a href="#contact" className="w3-bar-item w3-button" style={{width:'25% !important'}}>CONTACT</a>
  </div>
</div>


<div className="w3-padding-large" id="main">

  <header className="w3-container w3-padding-32 w3-center w3-black" id="home">
    <h1 className="w3-jumbo"><span className="w3-hide-small"></span> BC - DNS</h1>
   <div className="grid">
   {/* <img src={bg}  className="w3-image" width="992" height="1108"/> */}
   <img src={bg2}  className="w3-image border  " width="892" height="1000"/>
    <div className="center">

    <div className="inner-bg-container">
   <h2  className='bg-container-title'  >Enter Domain Name</h2>



   <input
   className="domain-input"
     type="text"
     placeholder="Domain Name"
    value={domainName}
onChange={(e) => setDomainName(e.target.value)}
   />

    </div>
<div  className="button-grid">
  <div></div>
    <Button variant="contained" style={{ backgroundColor: 'purple', color: 'white' }}  onClick={handleNavigate} >Search</Button>


   
   
    <div></div>
</div>
    </div>
    
   </div>
    
  </header>


  <div className="w3-content w3-justify w3-text-grey w3-padding-64" id="about">
    <h2 className="w3-text-light-grey">About Us</h2>
    <hr  style={{width:'200px ', color:"white" }} />
    <p style={{ color:"white" }} > If you are looking for system with leatest technology that offers unparalleled security, transparency,trust and precision also it protects your data from cyber attacks , ensures the legitimacy of domain names,eliminates intermediaries and very fast response, of course you will need a game-changer  , <div>



    The project successfully designs and implements a functional and robust distributed DNS system that integrates Blockchain technology. This system addresses critical concerns and enhances the security, resilience, and transparency of the DNS infrastructure. By leveraging the capabilities of BC technology, the project achieves its objective of creating a dependable and trustworthy decentralized DNS system. The resulting system improves the overall reliability of the DNS infrastructure by mitigating risks, ensuring data integrity, and fostering transparency. It eliminates the need for a central authority, enhancing security and resilience while providing a transparent and tamper-resistant DNS architecture.


    </div>

    </p>

{/* //////////////// */}


<h2 className="w3-text-light-grey" id="registration" >Join Us</h2>
    <hr  style={{width:'200px '}} className="w3-opacity"/>



     {/* Register section */}
     <div className="register">
      <div>
 <h2>Register Domain</h2>
 <input type="text" placeholder="Name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} />
<input type="text" placeholder="IP Address" value={registerIp} onChange={(e) => setRegisterIp(e.target.value)} />
<div className="p2"><Button variant="contained"  style={{ backgroundColor: 'purple', color: 'white' }} onClick={handleRegister}>Register</Button>
<Toaster    position="bottom-center"
  reverseOrder={false} /></div>
</div>


 {/* Update IP section */}
 <div>
<h2>Update IP</h2>
<input type="text" placeholder="Name" value={updateName} onChange={(e) => setUpdateName(e.target.value)} />
 <input type="text" placeholder="New IP Address" value={updateIp} onChange={(e) => setUpdateIp(e.target.value)} />
 <div className="p2">
 <Button variant="contained" style={{ backgroundColor: 'purple', color: 'white' }} onClick={handleUpdateIp}>Update IP</Button>
 <Toaster    position="bottom-center"
  reverseOrder={false} />
 </div>
 </div>
 </div>

    
 {/* Resolve section */}
 <h2>Resolve Domain</h2>
 <input type="text" placeholder="Domain Name" value={resolveName} onChange={(e) => setResolveName(e.target.value)} />

 <div className="p2">  <Button variant="contained" style={{ backgroundColor: 'purple', color: 'white' }} onClick={handleResolve}>Resolve </Button></div>
{resolvedIp && <p style={{ color:"white" }} >Resolved IP: {resolvedIp}</p>}


  </div>
  

  <div className="w3-padding-64 w3-content" id="photos">
    <h2 className="w3-text-light-grey">More about BlockChain</h2>
    <hr style={{width:'200px'}} className="w3-opacity"/>

    
    <div className="w3-row-padding" 
    // style="margin:0 -16px"
    >

<iframe width="560" height="315" src="https://www.youtube.com/embed/4Q6g64XIs_U?si=nRKi3uKBZHE12vzE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      {/* <div className="w3-half">
        <img src={bg1} style={{width:'100%'}}/>
        <img src={bg1} style={{width:'100%'}}/>
        <img src={bg} style={{width:'100%'}}/>
        <img src={bg} style={{width:'100%'}}/>
      </div>

      <div className="w3-half">
        <img src={bg} style={{width:'100%'}}/>
        <img src={bg}style={{width:'100%'}}/>
        <img src={bg} style={{width:'100%'}}/>
        <img src={bg} style={{width:'100%'}}/>
        
      </div> */}

    </div>
 
  </div>


  <div classNameName="w3-padding-64 w3-content w3-text-grey" id="contact">
    <h2 className="w3-text-light-grey">Contact Me</h2>
    <hr style= {{width:'200px'}} className="w3-opacity"/>

    <div className="w3-section">
      <p><i className="fa fa-map-marker fa-fw w3-text-white w3-xxlarge w3-margin-right"></i> Amman , Jordan</p>
      <p><i className="fa fa-phone fa-fw w3-text-white w3-xxlarge w3-margin-right"></i> Phone: +7788777777</p>
      <p><i className="fa fa-envelope fa-fw w3-text-white w3-xxlarge w3-margin-right"> </i> Email: mail@mail.com</p>
    </div><br/>
    <p>Let's get in touch. Send me a message:</p>

    <form action="/action_page.php" target="_blank">
      <p><input className="w3-input w3-padding-16" type="text" placeholder="Name" required name="Name"/></p>
      <p><input className="w3-input w3-padding-16" type="text" placeholder="Email" required name="Email"/></p>
      <p><input className="w3-input w3-padding-16" type="text" placeholder="Subject" required name="Subject"/></p>
      <p><input className="w3-input w3-padding-16" type="text" placeholder="Message" required name="Message"/></p>
      <p>
        <button className="w3-button w3-light-grey w3-padding-large" type="submit">
          <i className="fa fa-paper-plane"></i> SEND MESSAGE
        </button>
      </p>
    </form>

  </div>


  <footer className="w3-content w3-padding-64 w3-text-grey w3-xlarge">
    <i className="fa fa-facebook-official w3-hover-opacity"></i>
    <i className="fa fa-instagram w3-hover-opacity"></i>
    <i className="fa fa-snapchat w3-hover-opacity"></i>
    <i className="fa fa-pinterest-p w3-hover-opacity"></i>
    <i className="fa fa-twitter w3-hover-opacity"></i>


  </footer>


</div>






    </div>
  );
}

export default App;



