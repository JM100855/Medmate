import { ethers } from "hardhat";

async function main() {

    const recordContractAddress = "0xdFb11F1C4BA055744EB76747F49C9BA10D74cE42"
    const privateKey = "f03cc64d5181b3ce2530cb6078568ebde756a00a0a94140b13ed9e141cd5edc5"

    const Record = await ethers.getContractFactory("Record");
    const record = Record.attach(recordContractAddress)

    const recordDetails = await record.getDetails()

    console.log(recordDetails)

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
