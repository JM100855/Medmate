import { ethers } from "hardhat";

async function main() {

  const Record = await ethers.getContractFactory("Record");
  const record = await Record.deploy(
      'Name',
      'IPFS'
  );

  await record.deployed();

  console.log(`Record deployed to ${record.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
