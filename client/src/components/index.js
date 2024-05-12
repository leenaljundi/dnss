import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [domainName, setDomainName] = useState(""); 

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
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Home" {...a11yProps(0)} />
          <Tab label="registration" {...a11yProps(1)} />
          <Tab label="About us" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <div  className="grid">
            <div></div>
 <div className='bg-container'>



 <div className="inner-bg-container">
   <h2  className='bg-container-title'  >Enter Domain Name</h2>
   <input
     type="text"
     placeholder="Enter Domain Name"
    value={domainName}
onChange={(e) => setDomainName(e.target.value)}
   />
  <button onClick={handleNavigate}>Go</button>
    </div>
 </div>
 <div></div>
 </div>






      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        Item Two
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel>
    </Box>
  );
}



// {/* <h1 style={{ color: 'blue' }}>Smart Contract Interaction</h1>
      

// {/* Register section */}
// <h2>Register Domain</h2>
// <input type="text" placeholder="Name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} />
// <input type="text" placeholder="IP Address" value={registerIp} onChange={(e) => setRegisterIp(e.target.value)} />
// <button style={{ backgroundColor: 'purple', color: 'white' }} onClick={handleRegister}>Register</button>

// {/* Resolve section */}
// <h2>Resolve Domain</h2>
// <input type="text" placeholder="Domain Name" value={resolveName} onChange={(e) => setResolveName(e.target.value)} />
// <button style={{ backgroundColor: 'purple', color: 'white' }} onClick={handleResolve}>Resolve</button>
// {resolvedIp && <p>Resolved IP: {resolvedIp}</p>}

// {/* Update IP section */}
// <h2>Update IP</h2>
// <input type="text" placeholder="Name" value={updateName} onChange={(e) => setUpdateName(e.target.value)} />
// <input type="text" placeholder="New IP Address" value={updateIp} onChange={(e) => setUpdateIp(e.target.value)} />
// <button style={{ backgroundColor: 'purple', color: 'white' }} onClick={handleUpdateIp}>Update IP</button>

// {/* Enter Domain Name section */}
// <div className="App">
//   <h2>Enter Domain Name</h2>
//   <input
//     type="text"
//     placeholder="Enter Domain Name"
//     value={domainName}
//     onChange={(e) => setDomainName(e.target.value)}
//   />
//   <button onClick={handleNavigate}>Go</button>
// </div> */}