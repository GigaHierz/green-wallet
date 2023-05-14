import { ethers } from "hardhat";

async function main() {
  const CO2CompensateContract = await ethers.getContractFactory(
    "CO2CompensateContract"
  );
  const cO2CompensateContract = await CO2CompensateContract.deploy();

  await cO2CompensateContract.deployed();

  console.log(
    `CO2CompensateContract  deployed to  ${cO2CompensateContract.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
