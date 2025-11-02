import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { useAccount } from "@starknet-react/core"
import useAppStore from "../zustand/store"
import { Coins, Zap, Heart, Loader2, AlertTriangle } from "lucide-react"

export function PlayerStats() {
  const { status } = useAccount();
  const player = useAppStore(state => state.player);
  const isLoading = useAppStore(state => state.isLoading);

  const isConnected = status === "connected";

  // Memory game stats only
  const stats = [
    {
      label: "Games Played",
      value: player?.games_played || 0,
      color: "text-blue-400",
      icon: Zap
    },
    {
      label: "Wins",
      value: player?.wins || 0,
      color: "text-green-400",
      icon: Heart
    },
    {
      label: "Best Level",
      value: player?.best_level || 0,
      color: "text-yellow-400",
      icon: Coins
    },
  ];

  // Extra on-chain game stats if available
  const extra = player ? [
    { label: 'Games Played', value: player.games_played ?? 0 },
    { label: 'Wins', value: player.wins ?? 0 },
    { label: 'Losses', value: player.losses ?? 0 },
    { label: 'Best Level', value: player.best_level ?? 0 },
  ] : [];

  // Calculate win rate
  const winRate = player && (player.games_played ?? 0) > 0 
    ? Math.round(((player.wins ?? 0) / (player.games_played ?? 1)) * 100) 
    : 0;

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl font-bold">Player Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-slate-300">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading player data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-xl font-bold">Player Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main stats */}
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">{stat.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg ${stat.color}`}>
                  {stat.value}
                </span>
                {/* Low health indicator */}
                {stat.label === "Health" && stat.value <= 20 && (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          );
        })}

        {/* On-chain memory game stats */}
        {extra.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {extra.map((e) => (
              <div key={e.label} className="flex items-center justify-between text-slate-300">
                <span>{e.label}</span>
                <span className="font-semibold text-white/90">{e.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Win Rate */}
        {player && (player.games_played ?? 0) > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Win Rate</span>
              <span className="text-green-400 font-bold">
                {winRate}%
              </span>
            </div>
            <Progress
              value={winRate}
              className="h-2 bg-slate-700"
            />
          </div>
        )}

        {/* Connection states */}
        {!isConnected && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <Coins className="w-4 h-4" />
              <span>Connect controller to load real player stats</span>
            </div>
          </div>
        )}

        {isConnected && !player && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <Zap className="w-4 h-4" />
              <span>Creating your player automatically...</span>
            </div>
          </div>
        )}

        {isConnected && player && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Heart className="w-4 h-4" />
              <span>Player ready! Play the memory game to record results on-chain.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}