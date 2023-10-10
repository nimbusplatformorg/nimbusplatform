// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

/**
✍ Script for deploying this strategy

$ npx hardhat run scripts/template/Box/deployCircle.ts --network bscTestnet
*/

import { ethers, upgrades } from "hardhat";
import hre from "hardhat";
import { addDeployment, getContractField, verifyDeploymentWithContract } from "../../scripts/utils/deployment";
import { getContractAddress } from "@openzeppelin/hardhat-upgrades/dist/utils";
var path = require("path");

// 📌 Constants
const VERIFY_DEPLOYMENTS: boolean = true;

let CONTRACT_NAME = "Circle";

export async function mainTask0001_Deploy() {
    var scriptName = path.basename(__filename);
    console.log(`🔁 Executing ${scriptName}`);

    // 💻 Network
    let network = hre.network.name;
    console.log(`💻 Network: ${network}`);

    // 🤓 EOA - Addresses
    let [deployer] = await ethers.getSigners();

    // 🔊 EOAs
    console.log(`🤓 Deployer: ${deployer.address}`);

    // Deploying
    const Circle = await ethers.getContractFactory(CONTRACT_NAME);
    console.log('Deploying Box...');

    // Deploy proxy contract and initialize it
    const circleContract = await upgrades.deployProxy(Circle, [41], { initializer: 'initialize' });
    await circleContract.waitForDeployment();
    let deploymentReceipt = await circleContract.deploymentTransaction()?.wait(1)
    let upgradableProxyAddress = await circleContract.getAddress();
    let proxyAdminAddress = await (await upgrades.admin.getInstance()).getAddress();
    let transactionHash = deploymentReceipt?.hash;
    let contractABI = Circle.interface.format();
    let contractAddress = await getContractAddress(proxyAdminAddress);
    const currentImplAddress = await upgrades.erc1967.getImplementationAddress(upgradableProxyAddress);

    console.log(`📖 Deployment hash: ${deploymentReceipt?.hash}`);
    console.log("📖 Proxy admin:", proxyAdminAddress);
    console.log("📖 Upgradable proxy:", (upgradableProxyAddress));
    console.log(`📖 Circle  contract address: ${currentImplAddress}`);
    console.log(`📖 Circle ABI: ${contractABI}`);

    await addDeployment(
        network,
        CONTRACT_NAME,
        circleContract,
        contractABI,
        transactionHash
    );
}


export async function mainTask0001_Verify() {
    // 💻 Network
    let network = hre.network.name;
    console.log(`💻 Network: ${network}`);

    // ===================================================
    // Verify deployments (mandatory ❗)
    // ===================================================
    if (network != "hardhat") {
        // Leaving a few seconds to etherscan to index the contract
        console.log(`\n⏳ Waiting 30 seconds for etherscan to index the contract...\n`);
        await new Promise(r => setTimeout(r, 30000));

        // 📘 Getting address for contract
        const contractAddress = getContractField(network, CONTRACT_NAME, "address");

        // ✍ Verify Strategy
        await verifyDeploymentWithContract(hre, CONTRACT_NAME, contractAddress, []);
    }

    console.log("\n\n\n");
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (false) {
    mainDeployCircle().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}
