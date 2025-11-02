import type { PropsWithChildren } from "react";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
    jsonRpcProvider,
    StarknetConfig,
    starkscan,
} from "@starknet-react/core";
import cartridgeConnector from "../config/cartridgeConnector";

export default function StarknetProvider({ children }: PropsWithChildren) {
    const { VITE_PUBLIC_DEPLOY_TYPE, VITE_PUBLIC_NODE_URL } = import.meta.env;

    // Get RPC URL based on environment
    const getRpcUrl = () => {
        // If we have a local node URL, use it (for Katana)
        if (VITE_PUBLIC_NODE_URL) {
            return VITE_PUBLIC_NODE_URL;
        }
        
        switch (VITE_PUBLIC_DEPLOY_TYPE) {
            case "mainnet":
                return "https://api.cartridge.gg/x/starknet/mainnet";
            case "sepolia":
                return "https://api.cartridge.gg/x/starknet/sepolia";
            case "localhost":
                return "http://localhost:5050"; // Katana default
            default:
                return "http://localhost:5050"; // Default to Katana for local development
        }
    };

    // Create provider with the correct RPC URL
    const provider = jsonRpcProvider({
        rpc: () => ({ nodeUrl: getRpcUrl() }),
    });

    // Determine which chain to use
    const chains = VITE_PUBLIC_DEPLOY_TYPE === "mainnet" 
        ? [mainnet] 
        : [sepolia];

    // Choose connectors based on environment
    const getConnectors = () => {
        if (VITE_PUBLIC_DEPLOY_TYPE === "localhost" || VITE_PUBLIC_NODE_URL) {
            return [cartridgeConnector];
        }
        return [cartridgeConnector];
    };

    return (
        <StarknetConfig
            autoConnect
            chains={chains}
            connectors={getConnectors()}
            explorer={starkscan}
            provider={provider}
        >
            {children}
        </StarknetConfig>
    );
}