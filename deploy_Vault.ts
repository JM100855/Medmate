import { ethers } from "hardhat";

async function main() {

  const EHRVault = await ethers.getContractFactory("EHRVault");
  const ehrVault = await EHRVault.deploy();

  await ehrVault.deployed();

  console.log(`Record deployed to ${ehrVault.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
