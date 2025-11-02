import { useCallback, useEffect, useState } from "react";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { useAccount } from "@starknet-react/core";
import { Account } from "starknet";

interface RecordState {
  isSubmitting: boolean;
  error: string | null;
  txHash: string | null;
  txStatus: 'PENDING' | 'SUCCESS' | 'REJECTED' | null;
}

export function useRecordResult() {
  const { client } = useDojoSDK();
  const { account, status } = useAccount();
  const [state, setState] = useState<RecordState>({
    isSubmitting: false,
    error: null,
    txHash: null,
    txStatus: null,
  });

  const record = useCallback(async (level: number, score: bigint, livesRemaining: number, won: boolean) => {
    console.log("📤 Starting record_result transaction...", { level, score, livesRemaining, won });
    
    if (!account || status !== 'connected') {
      console.log("❌ No account or not connected:", { account: !!account, status });
      setState((s) => ({ ...s, error: 'Connect controller first' }));
      return;
    }
    
    try {
      setState({ isSubmitting: true, error: null, txHash: null, txStatus: 'PENDING' });
      console.log("📤 Calling client.game.recordResult...");
      const tx = await client.game.recordResult(account as Account, level, score, livesRemaining, won);
      console.log("📥 Transaction response:", tx);
      
      if (tx?.transaction_hash) {
        console.log("✅ Transaction hash received:", tx.transaction_hash);
        setState((s) => ({ ...s, txHash: tx.transaction_hash }));
      }
      
      if (tx && tx.code === 'SUCCESS') {
        console.log("🎉 Transaction successful!");
        setState({ isSubmitting: false, error: null, txHash: tx.transaction_hash ?? null, txStatus: 'SUCCESS' });
        setTimeout(() => setState({ isSubmitting: false, error: null, txHash: null, txStatus: null }), 3000);
      } else {
        console.log("❌ Transaction failed:", tx?.code);
        throw new Error(`record_result failed: ${tx?.code || 'unknown'}`);
      }
    } catch (e) {
      console.error("❌ Error in record_result:", e);
      setState({ isSubmitting: false, error: e instanceof Error ? e.message : 'Unknown error', txHash: null, txStatus: 'REJECTED' });
    }
  }, [account, status, client.game]);

  // Bridge: listen for iframe messages dispatched as custom events
  useEffect(() => {
    const onResult = (evt: Event) => {
      const detail: any = (evt as CustomEvent).detail;
      console.log("🎮 Game result received:", detail);
      if (!detail) return;
      const level = Number(detail.level ?? 0);
      const score = BigInt(detail.score ?? 0);
      const livesRemaining = Number(detail.livesRemaining ?? 0);
      const won = Boolean(detail.won);
      console.log("🎯 Recording result:", { level, score, livesRemaining, won });
      record(level, score, livesRemaining, won);
    };
    window.addEventListener('pm:result', onResult as any);
    return () => window.removeEventListener('pm:result', onResult as any);
  }, [record]);

  return { state, record };
}


