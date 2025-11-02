import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface } from "starknet";

export function setupWorld(provider: DojoProvider) {


	const build_game_spawnPlayer_calldata = (): DojoCall => {
		return {
			contractName: "game",
			entrypoint: "spawn_player",
			calldata: [],
		};
	};

	const game_spawnPlayer = async (snAccount: Account | AccountInterface) => {
		try {
			return await provider.execute(
				snAccount as any,
				build_game_spawnPlayer_calldata(),
				"full_starter_react",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};


	// record_result(level: u8, score: u64, lives_remaining: u8, won: bool)
	const build_game_recordResult_calldata = (
		level: number,
		score: bigint,
		livesRemaining: number,
		won: boolean
	): DojoCall => {
		return {
			contractName: "game",
			entrypoint: "record_result",
			calldata: [level, score, livesRemaining, won ? 1 : 0],
		};
	};

	const game_recordResult = async (
		snAccount: Account | AccountInterface,
		level: number,
		score: bigint,
		livesRemaining: number,
		won: boolean
	) => {
		try {
			return await provider.execute(
				snAccount as any,
				build_game_recordResult_calldata(level, score, livesRemaining, won),
				"full_starter_react",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};



	return {
		game: {
			spawnPlayer: game_spawnPlayer,
			buildSpawnPlayerCalldata: build_game_spawnPlayer_calldata,
			recordResult: game_recordResult,
			buildRecordResultCalldata: build_game_recordResult_calldata,
		},
	};
}