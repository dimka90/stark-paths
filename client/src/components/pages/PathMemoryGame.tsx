import { useRecordResult } from "../../dojo/hooks/useRecordResult";

export default function PathMemoryGame() {
  const { state } = useRecordResult();
  // Listen for messages from the embedded game to record results
  // Expected postMessage payload from game: { type: 'PM_RESULT', level, score, livesRemaining, won }
  // We forward to the on-chain contract via dojo client
  // We keep it minimal here to avoid coupling; for a robust impl, move to a dedicated hook
  return (
    <div style={{height: "100vh", width: "100%", background: "#0b1220", position: "relative"}}>
      <iframe
        src="/pathmemory/index.html"
        title="Path Memory Game"
        style={{border: 0, width: "100%", height: "100%"}}
        allow="autoplay"
        onLoad={() => {
          // Attach a one-time message listener
          const handler = async (evt: MessageEvent) => {
            try {
              const data: any = evt.data;
              if (!data || data.type !== 'PM_RESULT') return;
              // Note: inside event handler we cannot use hooks. Defer to provider on window.
              // Fallback: emit a custom event that a hook can handle in a provider-aware component.
              window.dispatchEvent(new CustomEvent('pm:result', { detail: data }));
            } catch {}
          };
          window.addEventListener('message', handler);
        }}
      />
      {/* Toast */}
      {state.txStatus && (
        <div style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          background: "rgba(15,23,42,0.9)",
          color: state.txStatus === 'SUCCESS' ? '#34d399' : state.txStatus === 'PENDING' ? '#60a5fa' : '#f87171',
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: 12,
        }}>
          {state.txStatus === 'PENDING' && 'Submitting result...'}
          {state.txStatus === 'SUCCESS' && 'Result recorded on-chain'}
          {state.txStatus === 'REJECTED' && (state.error || 'Failed to record result')}
        </div>
      )}
    </div>
  );
}
