const Resolver = artifacts.require("./Resolver.sol");
const Registry = artifacts.require("./Registry.sol");

module.exports = function(deployer) {
  // Deploy Registry first
  deployer.deploy(Registry).then(() => {
    console.log("Registry deployed at:", Registry.address);

    // Deploy Resolver and pass the address of the deployed Registry
    return deployer.deploy(Resolver, Registry.address).then(() => {
      console.log("Resolver deployed at:", Resolver.address);
    });
  });
};