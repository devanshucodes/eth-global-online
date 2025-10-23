// server.js
import express from "express";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const app = express();
app.use(express.json());

// Load RPC URL from .env
const RPC_URL = process.env.RPC_URL;
if (!RPC_URL) {
  console.error("❌ Error: RPC_URL not set in .env file");
  process.exit(1);
}

// Create ethers provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// API: GET /resolve?name=marketer-ai.eth
app.get("/resolve", async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) {
      return res.status(400).json({ error: "Missing query param: name" });
    }

    // Resolve ENS name to ETH address
    const address = await provider.resolveName(name);

    if (!address) {
      return res.status(404).json({ error: "ENS name not found or has no address record" });
    }

    return res.json({ name, address });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ ENS backend running at http://localhost:${PORT}`);
});
