const hre = require("hardhat");
require("dotenv").config();

async function main() {

  console.log("Deploying CrediNews contract...");

  const CrediNews = await hre.ethers.getContractFactory("CrediNews");
  const crediNews = await CrediNews.deploy();

  await crediNews.waitForDeployment();
  const address = await crediNews.getAddress();

  console.log(`CrediNews deployed to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
