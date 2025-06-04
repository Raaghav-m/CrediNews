const fs = require("fs");
const path = require("path");

const titles = [
  "CrediNews: On-Chain Credit for Journalism",
  "Verifiable Newsrooms with Graphite",
  "Public Reputation as a Signal",
  "Journalist Trust Scores FTW",
  "Decentralized News Distribution",
  "How IPFS Powers Media Storage",
  "Bringing Reputation Onchain",
  "Open Newsrooms via Smart Contracts",
  "Credibility Tools for Web3 Media",
  "Journalism Meets Graph Protocol",
];

titles.forEach((title, i) => {
  const data = {
    name: title,
    description: "Post for Graphite Reputation Hackathon",
    tags: ["reputation", "graphite", "credinews", "web3"],
    postedBy: i < 5 ? "Account 1" : "Account 2",
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(__dirname, "posts", `post${i + 1}.json`),
    JSON.stringify(data, null, 2)
  );
});
