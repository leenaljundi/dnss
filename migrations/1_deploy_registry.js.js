// 1_deploy_registry.js
const Registry = artifacts.require("./Registry.sol");

module.exports = function(deployer) {
  deployer.deploy(Registry).then((instance) => {
    console.log("Registry deployed at:", instance.address);
  });
};