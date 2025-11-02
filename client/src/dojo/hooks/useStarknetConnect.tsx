// hooks/useStarknetConnect.ts
import { useConnect, useAccount, useDisconnect } from "@starknet-react/core";
import { useState, useCallback } from "react";

export function useStarknetConnect() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { status, address } = useAccount();
  const [hasTriedConnect, setHasTriedConnect] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = useCallback(async () => {
    if (!connectors || connectors.length === 0) {
      console.error("No connectors found");
      return;
    }
    
    // Try to find a working connector
    let connector = connectors[0]; // Default to first connector
    
    // For local development, prefer injected connectors
    const injectedConnector = connectors.find(c => c.id === "braavos" || c.id === "argentX");
    if (injectedConnector) {
      connector = injectedConnector;
    }
    
    try {
      setIsConnecting(true);
      setHasTriedConnect(true);
      console.log("🔗 Attempting to connect with connector:", connector.id);
      await connect({ connector });
      console.log("✅ Connected successfully with:", connector.id);
    } catch (error) {
      console.error("❌ Connection failed:", error);
      // Try fallback connector if available
      if (connectors.length > 1 && connector !== connectors[1]) {
        try {
          console.log("🔄 Trying fallback connector:", connectors[1].id);
          await connect({ connector: connectors[1] });
          console.log("✅ Connected with fallback connector");
        } catch (fallbackError) {
          console.error("❌ Fallback connection also failed:", fallbackError);
        }
      }
    } finally {
      setIsConnecting(false);
    }
  }, [connect, connectors]);

  const handleDisconnect = useCallback(async () => {
    try {
      console.log("🔌 Disconnecting controller...");
      await disconnect();
      setHasTriedConnect(false);
      console.log("✅ controller disconnected successfully");
    } catch (error) {
      console.error("❌ Disconnection failed:", error);
    }
  }, [disconnect]);

  console.log("🎮 Starknet Connect Status:", {
    status,
    address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
    isConnecting,
    hasTriedConnect,
    availableConnectors: connectors.length
  });

  return { 
    status, 
    address,
    isConnecting,
    hasTriedConnect, 
    handleConnect,
    handleDisconnect,
    setHasTriedConnect 
  };
}