require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const pinataSDK = require("@pinata/sdk");
const abi = require("./CrediNewsABI.json");

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const accounts = [
  new ethers.Wallet(process.env.PRIVATE_KEY1, provider),
  new ethers.Wallet(process.env.PRIVATE_KEY2, provider),
];

async function uploadAndPost(index, filePath) {
  const raw = fs.readFileSync(filePath);
  const json = JSON.parse(raw.toString());

  const options = {
    pinataMetadata: { name: json.name },
    pinataOptions: { cidVersion: 1 },
  };

  const result = await pinata.pinJSONToIPFS(json, options);
  const ipfsHash = result.IpfsHash;

  // Alternate accounts on every post (even index: accounts[0], odd index: accounts[1])
  const wallet = accounts[index % 2];
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    abi,
    wallet
  );

  console.log(`Posting "${json.name}" from ${wallet.address}`);
  const tx = await contract.createPost(json.name, ipfsHash);
  await tx.wait();
  console.log(`✅ Confirmed TX for "${json.name}" with IPFS: ${ipfsHash}`);
}

async function main() {
  const postFiles = fs.readdirSync(path.join("./posts")).sort();

  // Limit to 10 posts max (or less if folder has fewer)
  const totalPosts = Math.min(postFiles.length, 10);

  for (let i = 0; i < totalPosts; i++) {
    const filePath = path.join("./posts", postFiles[i]);
    await uploadAndPost(i, filePath);

    // NO delay here
  }

  console.log("🎉 All posts completed!");
}

main().catch(console.error);
