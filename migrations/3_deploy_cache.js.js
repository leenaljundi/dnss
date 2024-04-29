/// SPDX-License-Identifier: MIT
const Cache = artifacts.require("Cache");
const Registry = artifacts.require("Registry");
const Resolver = artifacts.require("Resolver");

module.exports = async function (deployer) {
  // Deploy Registry contract
  await deployer.deploy(Registry);
  const registryInstance = await Registry.deployed();

  // Deploy Resolver contract
  await deployer.deploy(Resolver, registryInstance.address);
  const resolverInstance = await Resolver.deployed();

  // Deploy Cache contract, passing addresses of Registry and Resolver contracts
  await deployer.deploy(Cache, registryInstance.address, resolverInstance.address);
  // No need to interact with the Cache contract here

 
};