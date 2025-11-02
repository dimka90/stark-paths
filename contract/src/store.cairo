// Starknet imports
use starknet::{ContractAddress, get_caller_address, get_block_timestamp};

// Dojo imports
use dojo::world::WorldStorage;
use dojo::model::ModelStorage;

// Models imports
use full_starter_react::models::player::{Player, PlayerTrait};

// Store struct
#[derive(Copy, Drop)]
pub struct Store {
    world: WorldStorage,
}

//Implementation of the `StoreTrait` trait for the `Store` struct
#[generate_trait]
pub impl StoreImpl of StoreTrait {
    fn new(world: WorldStorage) -> Store {
        Store { world: world }
    }

    // --------- Getters ---------
    fn read_player_from_address(self: Store, player_address: ContractAddress) -> Player {
        self.world.read_model(player_address)
    }

    fn get_caller_address(self: Store) -> ContractAddress {
        get_caller_address()
    }

    fn read_player(self: Store) -> Player {
        let player_address = get_caller_address();
        self.world.read_model(player_address)
    }

    // --------- Setters ---------
    fn write_player(mut self: Store, player: @Player) {
        self.world.write_model(player)
    }
    
    // --------- New entities ---------
    fn create_player(mut self: Store) {
        let caller = get_caller_address();

        // Create new minimal player
        let new_player = PlayerTrait::new(caller);

        self.world.write_model(@new_player);
    }


    // --------- Memory Game Result Tracking ---------
    fn record_result(mut self: Store, level: u8, score: u64, lives_remaining: u8, won: bool) {
        let mut player = self.read_player();
        player.record_result(level, score, lives_remaining, won);
        self.world.write_model(@player);
    }
    
}