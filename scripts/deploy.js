const hre = require("hardhat");

async function main() {

  const CoinicToken = await hre.ethers.getContractFactory("CoinicToken");
  const coinictoken = await CoinicToken.deploy(100000000, 50);

  await coinictoken.deployed();

  console.log("Coinic deployed successfully: ", coinictoken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// 0xf41a6e859D11606c0A809Fce3324E84b53fb2bE3