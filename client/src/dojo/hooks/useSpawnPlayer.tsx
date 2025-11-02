import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from "@starknet-react/core";
import { Account } from "starknet";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { useStarknetConnect } from "./useStarknetConnect";
import { usePlayer } from "./usePlayer";
import useAppStore, { Player } from "../../zustand/store";

// Types
interface InitializeState {
  isInitializing: boolean;
  error: string | null;
  completed: boolean;
  step: 'checking' | 'spawning' | 'loading' | 'success';
  txHash: string | null;
  txStatus: 'PENDING' | 'SUCCESS' | 'REJECTED' | null;
}

interface InitializeResponse {
  success: boolean;
  playerExists: boolean;
  transactionHash?: string;
  error?: string;
}

export const useSpawnPlayer = () => {
  const { useDojoStore, client } = useDojoSDK();
  const dojoState = useDojoStore((state) => state);
  const { account } = useAccount();
  const { status } = useStarknetConnect();
  const { player, isLoading: playerLoading, refetch: refetchPlayer } = usePlayer();
  const { setLoading, setPlayer } = useAppStore();

  // Local state
  const [initState, setInitState] = useState<InitializeState>({
    isInitializing: false,
    error: null,
    completed: false,
    step: 'checking',
    txHash: null,
    txStatus: null
  });

  // Tracking if we are initializing
  const [isInitializing, setIsInitializing] = useState(false);

  /**
   * Checks if the player exists and initializes as needed
   */
  const initializePlayer = useCallback(async (): Promise<InitializeResponse> => {
    // Prevent multiple executions
    if (isInitializing) {
      return { success: false, playerExists: false, error: "Already initializing" };
    }

    setIsInitializing(true);

    // Validation: Check that the controller is connected
    if (status !== "connected") {
      const error = "Controller not connected. Please connect your controller first.";
      setInitState(prev => ({ ...prev, error }));
      setIsInitializing(false);
      return { success: false, playerExists: false, error };
    }

    // Validation: Check that the account exists
    if (!account) {
      const error = "No account found. Please connect your controller.";
      setInitState(prev => ({ ...prev, error }));
      setIsInitializing(false);
      return { success: false, playerExists: false, error };
    }

    const transactionId = uuidv4();

    try {
      // Start initialization process
      setInitState(prev => ({
        ...prev,
        isInitializing: true,
        error: null,
        step: 'checking'
      }));

      console.log("🎮 Starting player initialization...");

      // For Sepolia, skip GraphQL fetch and check store directly
      console.log("⚠️ Skipping GraphQL fetch for Sepolia - checking store directly");
      
      // Direct check from the store
      const storePlayer = useAppStore.getState().player;

      // Simple check if the player exists in the store
      const playerExists = storePlayer !== null;

      console.log("🎮 Final player check:", {
        playerExists,
        playerInStore: !!storePlayer,
        accountAddress: account.address
      });

      if (playerExists) {
        // Player exists - load data and continue
        console.log("✅ Player already exists, continuing with existing data...");

        setInitState(prev => ({
          ...prev,
          step: 'loading'
        }));

        // Small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 1000));

        setInitState(prev => ({
          ...prev,
          completed: true,
          isInitializing: false,
          step: 'success'
        }));

        setIsInitializing(false);
        return {
          success: true,
          playerExists: true
        };

      } else {
        // Player does not exist - create new player
        console.log("🆕 Player does not exist, spawning new player...");

        setInitState(prev => ({
          ...prev,
          step: 'spawning',
          txStatus: 'PENDING'
        }));

        // Execute spawn transaction
        console.log("📤 Executing spawn transaction...");
        const spawnTx = await client.game.spawnPlayer(account as Account);

        console.log("📥 Spawn transaction response:", spawnTx);

        if (spawnTx?.transaction_hash) {
          setInitState(prev => ({
            ...prev,
            txHash: spawnTx.transaction_hash
          }));
        }

        if (spawnTx && spawnTx.code === "SUCCESS") {
          console.log("🎉 Player spawned successfully!");

          setInitState(prev => ({
            ...prev,
            txStatus: 'SUCCESS'
          }));

          // Wait for the transaction to be processed
          console.log("⏳ Waiting for transaction to be processed...");
          await new Promise(resolve => setTimeout(resolve, 3500));

          // Create a new player object and set it in the store
          // Since GraphQL is disabled for Sepolia, we create a default player
          const newPlayer: Player = {
            owner: account.address,
            experience: 0,
            health: 100,
            coins: 0,
            creation_day: Math.floor(Date.now() / (1000 * 60 * 60 * 24)), // Current day
            games_played: 0,
            wins: 0,
            losses: 0,
            best_level: 0,
            last_score: 0
          };

          console.log("💾 Setting new player in store:", newPlayer);
          setPlayer(newPlayer);

          // Skip refetch for Sepolia since GraphQL is disabled
          console.log("⚠️ Skipping refetch for Sepolia - player already set in store");

          setInitState(prev => ({
            ...prev,
            completed: true,
            isInitializing: false,
            step: 'success'
          }));

          // Confirm transaction in the Dojo store
          dojoState.confirmTransaction(transactionId);

          setIsInitializing(false);
          return {
            success: true,
            playerExists: false,
            transactionHash: spawnTx.transaction_hash
          };
        } else {
          // Update transaction state to rejected
          setInitState(prev => ({
            ...prev,
            txStatus: 'REJECTED'
          }));
          throw new Error("Spawn transaction failed with code: " + spawnTx?.code);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to initialize player. Please try again.";

      console.error("❌ Error initializing player:", error);

      // Revert optimistic update if applicable
      dojoState.revertOptimisticUpdate(transactionId);

      // Update transaction state to rejected if there was a transaction
      if (initState.txHash) {
        setInitState(prev => ({
          ...prev,
          txStatus: 'REJECTED'
        }));
      }

      setInitState(prev => ({
        ...prev,
        error: errorMessage,
        isInitializing: false,
        step: 'checking'
      }));

      setIsInitializing(false);
      return { success: false, playerExists: false, error: errorMessage };
    }
  }, [status, account, refetchPlayer, player, isInitializing, client.game, dojoState]);

  /**
   * Reset the initialization state
   */
  const resetInitializer = useCallback(() => {
    console.log("🔄 Resetting initializer state...");
    setIsInitializing(false);
    setInitState({
      isInitializing: false,
      error: null,
      completed: false,
      step: 'checking',
      txHash: null,
      txStatus: null
    });
  }, []);

  // Sync loading state with the store
  useEffect(() => {
    setLoading(initState.isInitializing || playerLoading);
  }, [initState.isInitializing, playerLoading, setLoading]);

  return {
    // State
    isInitializing: initState.isInitializing,
    error: initState.error,
    completed: initState.completed,
    currentStep: initState.step,
    txHash: initState.txHash,
    txStatus: initState.txStatus,
    isConnected: status === "connected",
    playerExists: useAppStore.getState().player !== null,

    // Actions
    initializePlayer,
    resetInitializer
  };
};