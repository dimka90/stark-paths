// Starknet import
use starknet::ContractAddress;
use core::num::traits::zero::Zero;

// Constants imports
use full_starter_react::constants;

// Model
#[derive(Copy, Drop, Serde, IntrospectPacked, Debug)]
#[dojo::model]
pub struct Player {
    #[key]
    pub owner: ContractAddress,
    // On-chain memory game stats
    pub games_played: u32,
    pub wins: u32,
    pub losses: u32,
    pub best_level: u8,
    pub last_score: u64,
    pub total_points: u64,
}

// Traits Implementations
#[generate_trait]
pub impl PlayerImpl of PlayerTrait {
    fn new(owner: ContractAddress) -> Player {
        Player {
            owner: owner,
            games_played: 0,
            wins: 0,
            losses: 0,
            best_level: 0,
            last_score: 0,
            total_points: 0,
        }
    }

    fn record_result(ref self: Player, level: u8, score: u64, lives_remaining: u8, won: bool) {
        self.games_played += 1;
        if won { self.wins += 1; } else { self.losses += 1; }
        if level > self.best_level { self.best_level = level; }
        self.last_score = score;

        // Simple points formula: level*100 + lives*50 + (won? 200 : 0)
        let mut points: u64 = 0;
        points += (level.into()) * 100;
        points += (lives_remaining.into()) * 50;
        if won { points += 200; }
        self.total_points += points;
    }
}

#[generate_trait]
pub impl PlayerAssert of AssertTrait {
    #[inline(always)]
    fn assert_exists(self: Player) {
        assert(self.is_non_zero(), 'Player: Does not exist');
    }

    #[inline(always)]
    fn assert_not_exists(self: Player) {
        assert(self.is_zero(), 'Player: Already exist');
    }
}

pub impl ZeroablePlayerTrait of Zero<Player> {
    #[inline(always)]
    fn zero() -> Player {
        Player {
            owner: constants::ZERO_ADDRESS(),
            games_played: 0,
            wins: 0,
            losses: 0,
            best_level: 0,
            last_score: 0,
            total_points: 0,
        }
    }

    #[inline(always)]
    fn is_zero(self: @Player) -> bool {
       *self.owner == constants::ZERO_ADDRESS()
    }

    #[inline(always)]
    fn is_non_zero(self: @Player) -> bool {
        !self.is_zero()
    }
}