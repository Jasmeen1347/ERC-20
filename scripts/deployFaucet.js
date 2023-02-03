const hre = require("hardhat");

async function main() {

  const Faucet = await hre.ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy("0xf41a6e859D11606c0A809Fce3324E84b53fb2bE3");

  await faucet.deployed();

  console.log("Faucet deployed successfully: ", faucet.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// 0x1C4dBc6515E818F7BB78B31Da593f5Ec298F6036
// 0x1C4dBc6515E818F7BB78B31Da593f5Ec298F6036
// 0x019129DbF262BD12f694324b9b4B1a8BC82074e4 => New
// 0x0eBD5C3F6B73735509e8a93aAc3E500FDf008937 => New