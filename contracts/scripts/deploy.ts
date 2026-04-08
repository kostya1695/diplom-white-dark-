import { ethers } from "hardhat";

async function main() {
  const registry = await ethers.deployContract("DiplomaRegistry");
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`DiplomaRegistry deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
