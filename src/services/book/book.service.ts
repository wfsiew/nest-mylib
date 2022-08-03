import { Injectable } from '@nestjs/common';
import { Book, BooksBorrow } from 'src/models/model';
import { DbService } from 'src/services/db/db.service';

@Injectable()
export class BookService {

  constructor(private dbService: DbService) {}

  async isBookAvailable(id: number) {
    let cli;
    let b = false;

    try {
      cli = await this.dbService.connect();
      const res = await cli.query(`select * from book b where b.id = $1 and b.qty > 0 limit 1`, [id]);
      if (res.rowCount > 0) {
        b = true;
      }

    } catch (error) {
      throw error;
    } finally {
      if (cli) {
        cli.release();
      }
    }

    return b;
  }

  async findByTitle(title: string): Promise<Book> | null {
    let cli;
    let o = null;

    try {
      cli = await this.dbService.connect();
      const res = await cli.query(`select * from book where lower(title) = lower($1) limit 1`, [title]);
      if (res.rowCount > 0) {
        o = await Book.fromRs(res.rows[0]);
      }

    } catch (error) {
      throw error;
    } finally {
      if (cli) {
        cli.release();
      }
    }

    return o;
  }

  async returnBorrow(book_id: number, user_id: number) {
    let cli;

    try {
      cli = await this.dbService.connect();
      await cli.query('begin');
      await cli.query(`update books_borrow set return_date = now() where book_id = $1 and user_id = $2`, [book_id, user_id]);
      await cli.query(`update book set qty = qty + 1 where id = $1`, [book_id]);
      await cli.query('commit');

    } catch (error) {
      if (cli) {
        try {
          await cli.query('rollback');
        } catch (error) {
          
        }
      }

      throw error;
    } finally {
      if (cli) {
        cli.release();
      }
    }
  }

  async registerBorrow(book_id: number, user_id: number) {
    let cli;

    try {
      cli = await this.dbService.connect();
      await cli.query('begin');
      await cli.query(`insert into books_borrow (has_renew, start_date, end_date, book_id, user_id) values(false, now(), now() + INTERVAL '30 day', $1, $2)`, [book_id, user_id]);
      await cli.query(`update book set qty = qty - 1 where id = $1`, [book_id]);
      await cli.query('commit');

    } catch (error) {
      if (cli) {
        try {
          await cli.query('rollback');
        } catch (error) {
          
        }
      }

      throw error;
    } finally {
      if (cli) {
        cli.release();
      }
    }
  }
}
