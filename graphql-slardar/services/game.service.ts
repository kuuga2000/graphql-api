import db from '../_db.ts';

export class GameService {
  // Logic to find all games
  findAll() {
    return db.games;
  }

  // Logic to find one game with error handling
  findOne(id: string) {
    const game = db.games.find((g) => g.id === id);
    if (!game) {
      throw new Error(`Game with ID ${id} not found`);
    }
    return game;
  }

  // Logic for relationships
  getReviewsForGame(gameId: string) {
    return db.reviews.filter((r) => r.game_id === gameId);
  }
}
