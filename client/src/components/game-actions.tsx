import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Gamepad2, Loader2, Play } from "lucide-react";
import { useSpawnPlayer } from "../dojo/hooks/useSpawnPlayer";
import useAppStore from "../zustand/store";

export function GameActions() {
  const player = useAppStore((state) => state.player);
  const { isInitializing, initializePlayer, isConnected } = useSpawnPlayer();

  const actions = [
    {
      icon: Gamepad2,
      label: "Create Player",
      description: "Initialize your on-chain profile",
      onClick: initializePlayer,
      color: "from-purple-500 to-purple-600",
      canExecute: isConnected && !player && !isInitializing,
    },
    {
      icon: Play,
      label: "Play Memory Game",
      description: "Play StarkPath Memory Game",
      onClick: () => window.open('/pathmemory/index.html', '_blank'),
      color: "from-blue-500 to-blue-600",
      canExecute: true,
    },
  ];


  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-xl font-bold">
          Game Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!player && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <div className="text-yellow-400 text-sm text-center">
              🎮 Connect controller and create player to start playing
            </div>
          </div>
        )}

        {player && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
            <div className="text-green-400 text-sm text-center">
              ✅ Player ready! Switch to Memory Game to play and record results on-chain.
            </div>
          </div>
        )}

        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <div key={action.label} className="space-y-2">
              <Button
                onClick={action.onClick}
                disabled={!action.canExecute || isInitializing}
                className={`w-full h-14 bg-gradient-to-r ${action.color} hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isInitializing ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5 mr-3" />
                )}
                <div className="flex flex-col items-start flex-1">
                  <span className="font-semibold">{action.label}</span>
                  <span className="text-xs opacity-80">
                    {action.description}
                  </span>
                </div>
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
