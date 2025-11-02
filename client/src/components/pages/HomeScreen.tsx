import { useSpawnPlayer } from "../../dojo/hooks/useSpawnPlayer";
import { useStarknetConnect } from "../../dojo/hooks/useStarknetConnect";
import { useRecordResult } from "../../dojo/hooks/useRecordResult";
import useAppStore from "../../zustand/store";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Wallet, UserPlus, Gamepad2, Loader2, ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export default function HomePage() {
  const player = useAppStore((state) => state.player);
  const { isInitializing, initializePlayer, txHash, txStatus } = useSpawnPlayer();
  const { state: recordState } = useRecordResult();
  const { 
    status, 
    address, 
    isConnecting, 
    handleConnect, 
    handleDisconnect 
  } = useStarknetConnect();
  
  const isConnected = status === "connected";
  const [showGameInline, setShowGameInline] = useState(true);

  const handlePlayGame = () => {
    setShowGameInline(true);
  };

  // Set up iframe message listener for game results
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        console.log("📨 Received iframe message:", data);
        
        if (!data || data.type !== 'PM_RESULT') {
          console.log("❌ Not a PM_RESULT message, ignoring");
          return;
        }
        
        console.log("✅ Valid PM_RESULT message, forwarding to useRecordResult");
        // Forward the message as a custom event for useRecordResult to handle
        window.dispatchEvent(new CustomEvent('pm:result', { detail: data }));
      } catch (error) {
        console.error('Error handling iframe message:', error);
      }
    };

    console.log("🎧 Setting up iframe message listener");
    window.addEventListener('message', handleMessage);
    return () => {
      console.log("🎧 Removing iframe message listener");
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-900">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">StarkPath</h1>
              <p className="text-slate-300 text-sm">
                {isConnected ? `Connected to Katana via Dojo${address ? ` • ${address.slice(0, 6)}...${address.slice(-4)}` : ''}` : "Connect to start playing"}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={isConnected ? handleDisconnect : handleConnect}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4 mr-2" />
                )}
                {isConnecting ? "Connecting..." : isConnected ? "Disconnect" : "Connect Wallet"}
              </Button>
              <Button
                onClick={initializePlayer}
                disabled={!isConnected || !!player || isInitializing}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
              >
                {isInitializing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                {isInitializing ? "Creating..." : "Spawn Player"}
              </Button>
              <Button
                onClick={handlePlayGame}
                disabled={!player}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Play Game
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-2 max-w-6xl">
        <Card className="bg-slate-900">
          <CardContent className="p-3">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Memory Game</h2>
              <p className="text-slate-300">Test your memory skills and compete on-chain</p>
            </div>

            {/* Game Modes removed per request */}

            {/* Player Stats removed per request */}

            {/* Transaction Verification - Player Spawn */}
            {txHash && (
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  {txStatus === 'SUCCESS' && <CheckCircle className="w-5 h-5 text-green-400 mr-2" />}
                  {txStatus === 'PENDING' && <Clock className="w-5 h-5 text-yellow-400 mr-2" />}
                  {txStatus === 'REJECTED' && <XCircle className="w-5 h-5 text-red-400 mr-2" />}
                  Player Spawn Transaction
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Transaction Hash:</span>
                    <code className="text-blue-400 text-xs bg-slate-900 px-2 py-1 rounded">
                      {txHash.slice(0, 10)}...{txHash.slice(-8)}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Status:</span>
                    <span className={`text-sm font-medium ${
                      txStatus === 'SUCCESS' ? 'text-green-400' :
                      txStatus === 'PENDING' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {txStatus}
                    </span>
                  </div>
                  <div className="pt-2">
                    <a
                      href={`https://sepolia.starkscan.co/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View on Starkscan
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Verification - Game Results */}
            {recordState.txHash && (
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  {recordState.txStatus === 'SUCCESS' && <CheckCircle className="w-5 h-5 text-green-400 mr-2" />}
                  {recordState.txStatus === 'PENDING' && <Clock className="w-5 h-5 text-yellow-400 mr-2" />}
                  {recordState.txStatus === 'REJECTED' && <XCircle className="w-5 h-5 text-red-400 mr-2" />}
                  Game Result Transaction
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Transaction Hash:</span>
                    <code className="text-blue-400 text-xs bg-slate-900 px-2 py-1 rounded">
                      {recordState.txHash.slice(0, 10)}...{recordState.txHash.slice(-8)}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Status:</span>
                    <span className={`text-sm font-medium ${
                      recordState.txStatus === 'SUCCESS' ? 'text-green-400' :
                      recordState.txStatus === 'PENDING' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {recordState.txStatus}
                    </span>
                  </div>
                  <div className="pt-2">
                    <a
                      href={`https://sepolia.starkscan.co/tx/${recordState.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View on Starkscan
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Inline Game */}
            {showGameInline && (
              <div className="mt-1 flex justify-center">
                <iframe
                  src="/pathmemory/index.html"
                  title="StarkPath Memory Game"
                  className="w-full max-w-[820px] h-[750px] rounded-xl shadow-xl"
                />
              </div>
            )}

            {/* Status Messages */}
            {!isConnected && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-6">
                <p className="text-yellow-400 text-center">
                  🔗 Connect your wallet to start playing StarkPath Memory Game
                </p>
              </div>
            )}
            
            {isConnected && !player && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-6">
                <p className="text-blue-400 text-center">
                  👤 Create your player to start recording game results on-chain
                </p>
              </div>
            )}
            
            {player && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-6">
                <p className="text-green-400 text-center">
                  ✅ Ready to play! Your game results will be recorded on-chain
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}