const { Wallet, utils } = require("zksync-web3");
const ethers = require("ethers");
const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");

// An example of a deploy script that will deploy and call a simple contract.
module.exports = async function (hre) {

  // Initialize the wallet.
  const wallet = new Wallet("");
  

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
const Factory= await deployer.loadArtifact("UniswapV2Factory");
let deploymentFee = await deployer.estimateDeployFee(Factory, ["0xDB54Af380625a0486235d6789c9f2A18565c1007"]);
  let parsedFee = ethers.utils.formatEther(deploymentFee.toString());

  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

 const factory = await deployer.deploy(Factory, ["0xDB54Af380625a0486235d6789c9f2A18565c1007"]);
  
console.log("Factory Address: " ,factory.address);
  await hre.run("verify:verify", {
    address: factory.address,
    contract: "contracts/factoryfix.sol:UniswapV2Factory",
    constructorArguments : ["0xDB54Af380625a0486235d6789c9f2A18565c1007"]
  });


  
}