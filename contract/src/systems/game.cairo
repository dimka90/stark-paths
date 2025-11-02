// Interface definition
#[starknet::interface]
pub trait IGame<T> {
    // --------- Memory Game methods ---------
    fn spawn_player(ref self: T);
    fn record_result(ref self: T, level: u8, score: u64, lives_remaining: u8, won: bool);
}

#[dojo::contract]
pub mod game {
    // Local import
    use super::{IGame};

    // Store import
    use full_starter_react::store::{StoreTrait};

    // Constant import
    use full_starter_react::constants;

    // Models import
    use full_starter_react::models::player::{PlayerAssert};

    // Dojo Imports
    #[allow(unused_imports)]
    use dojo::model::{ModelStorage};
    #[allow(unused_imports)]
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use dojo::event::EventStorage;

    use starknet::{ContractAddress};

    #[storage]
    struct Storage {}

    #[derive(Drop, starknet::Event)]
    struct PlayerSpawnedPayload {
        owner: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct GameResultRecordedPayload {
        owner: ContractAddress,
        level: u8,
        score: u64,
        lives_remaining: u8,
        won: bool,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PlayerSpawned: PlayerSpawnedPayload,
        GameResultRecorded: GameResultRecordedPayload,
    }

    // Constructor
    fn dojo_init(ref self: ContractState) {}

    // Implementation of the interface methods
    #[abi(embed_v0)]
    impl GameImpl of IGame<ContractState> {
        
        // Method to create a new player
        fn spawn_player(ref self: ContractState) {
            let mut world = self.world(@"full_starter_react");
            let store = StoreTrait::new(world);

            // Create new player
            store.create_player();

            // Emit event
            self.emit(Event::PlayerSpawned(PlayerSpawnedPayload{ owner: store.get_caller_address() }));
        }

        // Record outcome of a Path Memory game round
        fn record_result(ref self: ContractState, level: u8, score: u64, lives_remaining: u8, won: bool) {
            let mut world = self.world(@"full_starter_react");
            let store = StoreTrait::new(world);
            store.record_result(level, score, lives_remaining, won);

            // Emit event
            self.emit(Event::GameResultRecorded(GameResultRecordedPayload{ owner: store.get_caller_address(), level: level, score: score, lives_remaining: lives_remaining, won: won }));
        }

    }
}