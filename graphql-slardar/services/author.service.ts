import db from '../_db.ts';

export class AuthorService {
  findAll() {
    return db.authors;
  }

  findOne(id: string) {
    return db.authors.find((a) => a.id === id);
  }

  // Get reviews written by a specific author
  getReviewsForAuthor(authorId: string) {
    return db.reviews.filter((r) => r.author_id === authorId);
  }
}
