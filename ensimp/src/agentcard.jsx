import React from "react";
import { BrowserProvider, parseEther, toBeHex } from "ethers";

export default function AgentCard({ name, price, address }) {
  async function handleUnlock() {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to continue.");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await window.ethereum.request({ method: "eth_accounts" });

      // We already resolved ENS in Ens.jsx
      if (!address) {
        alert(`❌ No ETH address set for ${name}`);
        return;
      }

      // Convert ETH → wei
      const value = toBeHex(parseEther(price.toString()));

      // Send tx via MetaMask
      const tx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{ from: accounts[0], to: address, value }],
      });

      console.log("Tx hash:", tx);
      alert(`✅ Payment sent to ${name} (${address})`);
    } catch (err) {
      console.error("Tx error:", err);
      alert("❌ Transaction failed: " + (err.message || err));
    }
  }

  return (
    <div style={{ border: '1px solid #ddd',  margin: '8px', borderRadius: '8px', fontFamily: 'monospace', padding: '16px' }}>
     
      <h3 style={{ padding: '10px', margin: '0 0 4px 0' }}>{name}</h3>
      <p style={{ padding: '10px', margin: '0 0 6px 0' }}>Subscription: {price} ETH</p>
      {address ? (
        <div>
          <p style={{ fontSize: '12px', color: '#28a745', fontFamily: 'monospace' , padding: '10px' }}>
            ✅ Resolved: {address}
          </p>
          <button onClick={handleUnlock} style={{ 
            padding: '8px 16px', 
            backgroundColor: '#ff8a3d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Unlock
          </button>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '12px', color: '#dc3545' }}>
            ❌ ENS name not resolved
          </p>
          <button disabled style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'not-allowed'
          }}>
            Cannot Unlock
          </button>
        </div>
      )}
    </div>
  );
}
