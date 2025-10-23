import React, { useEffect, useState } from "react";
import AgentCard from "./agentcard";
import { JsonRpcProvider } from "ethers";  // ✅ for ENS resolution
import "./App.css";

export default function Ens() {
  const [agents, setAgents] = useState([
    { name: "themarketer.eth", price: 0.001 },
    { name: "thedeveloperai.eth", price: 0.001 },
    { name: "theceo.eth", price: 0.001 },
    { name: "thecmo.eth", price: 0.001 },
    { name: "thecto.eth", price: 0.001 },
    { name: "theresearcher.eth", price: 0.001 },
    { name: "headofengineering.eth", price: 0.001 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function resolveAll() {
      try {
        // Use Sepolia RPC for ENS resolution (ENS exists on testnets too)
        const sepoliaRpcUrl = "https://eth-sepolia.g.alchemy.com/v2/XpNvTRKlMbwMP6wxwRKpy";
        const rpcProvider = new JsonRpcProvider(sepoliaRpcUrl);

        const resolved = [];
        for (let agent of agents) {
          const addr = await rpcProvider.resolveName(agent.name);
          resolved.push({ ...agent, address: addr || null });
        }

        setAgents(resolved);
      } catch (err) {
        console.error("Error resolving ENS:", err);
      } finally {
        setLoading(false);
      }
    }

    resolveAll();
  }, []);

  if (loading) {
    return <p>Resolving ENS names... ⏳</p>;
  }

  return (
    <div className="agents-list">
      {agents.map((agent, i) => (
        <AgentCard key={i} {...agent} />
      ))}
    </div>
  );
}
