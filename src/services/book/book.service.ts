import { Injectable } from '@nestjs/common';
import { Book, BooksBorrow } from 'src/models/model';
import { DbService } from 'src/services/db/db.service';

@Injectable()
export class BookService {

  constructor(private dbService: DbService) {}

  async count(): Promise<number> {
    let cli;
    let n = 0;

    try {
      cli = await this.dbService.connect();
      const res = await cli.query(`select count(id) from book`);
      const r = res.rows[0].count;
      n = Number(r);

    } catch (error) {
      throw error;
    } finally {
      if (cli) {
        cli.release();
      }
    }

    return n;
  }

  async findAll(offset: number, limit: number): Promise<Book[]> {
    let cli;
    let lx: Book[] = [];

    try {
      cli = await this.dbService.connect();
      const res = await cli.query(`select * from book order by title offset $1 limit $2`, [offset, limit]);
      for (let i = 0; i < res.rows.length; i++) {
        const r = res.rows[i];
        const o = Book.fromRs(r);
        lx.push(o);
      }

      for (let i = 0; i < lx.length; i++) {
        const o = lx[i];
        if (o.qty < 1) {
          const resx = await cli.query(`select end_date from books_borrow where book_id = $1 order by end_date limit 1`, [o.id]);
          if (resx.rowCount > 0) {
            o.return_date = resx.rows[0].end_date;
          }
        }
      }

    } catch (error) {
      throw error;
    } finally {
      if (cli) {
        cli.release();
      }
    }

    return lx;
  }

  async countCurrentBooksBorrowByUserId(user_id: number): Promise<number> {
    let cli;
    let n = 0;

    try {
      cli = await this.dbService.connect();
      const res = await cli.query(`select count(book_id) from books_borrow where user_id = $1 and return_date is NULL`, [user_id]);
      const r = res.rows[0].count;
      n = Number(r);

    } catch (error) {
      throw error;
    } finally {
      if (cli) {
        cli.release();
      }
    }

    return n;
  }

  async findAllCurrentBooksBorrowByUserId(user_id: number, offset: number, limit: number): Promise<BooksBorrow[]>  {
    let cli;
    let lx: BooksBorrow[] = [];

    try {
      cli = await this.dbService.connect();
      const res = await cli.query(`select bb.*, b.title, b.author, b.qty, b.isbn from books_borrow bb inner join book b on bb.book_id = b.id where bb.user_id = $1 and bb.return_date is NULL order by bb.start_date offset $2 limit $3`, [user_id, offset, limit]);
      for (let i = 0; i < res.rows.length; i++) {
        const r = res.rows[i];
        const o = BooksBorrow.fromRs(r);
        lx.push(o);
      }
      
    } catch (error) {
      throw error;
    } finally {
      if (cli) {
        cli.release();
      }
    }

    return lx;
  }

  async countHistoryBooksBorrowByUserId(user_id: number): Promise<number> {
    let cli;
    let n = 0;

    try {
      cli = await this.dbService.connect();
      const res = await cli.query(`select count(book_id) from books_borrow where user_id = $1 and return_date is not NULL`, [user_id]);
      const r = res.rows[0].count;
      n = Number(r);

    } catch (error) {
      throw error;
    } finally {
      if (cli) {
        cli.release();
      }
    }

    return n;
  }

  async findAllHistoryBooksBorrowByUserId(user_id: number, offset: number, limit: number): Promise<BooksBorrow[]>  {
    let cli;
    let lx: BooksBorrow[] = [];

    try {
      cli = await this.dbService.connect();
      const res = await cli.query(`select bb.*, b.* from books_borrow bb inner join book b on bb.book_id = b.id where bb.user_id = $1 and bb.return_date is not NULL order by bb.start_date offset $2 limit $3`, [user_id, offset, limit]);
      for (let i = 0; i < res.rows.length; i++) {
        const r = res.rows[i];
        const o = BooksBorrow.fromRs(r);
        lx.push(o);
      }
      
    } catch (error) {
      throw error;
    } finally {
      if (cli) {
        cli.release();
      }
    }

    return lx;
  }

  async isBookAvailable(id: number): Promise<boolean> {
    let cli;
    let b = false;

    try {
      cli = await this.dbService.connect();
      const res = await cli.query(`select * from book where id = $1 and qty > 0 limit 1`, [id]);
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

  async isBorrowLimitReached(user_id: number): Promise<boolean> {
    let cli;
    let b = false;

    try {
      cli = await this.dbService.connect();
      const res = await cli.query(`select count(user_id) from books_borrow where user_id = $1 and return_date is NULL`, [user_id]);
      const r = res.rows[0].count;
      let n = Number(r);
      if (n === 10) {
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

  async findByISBN(isbn: string): Promise<Book> | null {
    let cli;
    let o = null;

    try {
      cli = await this.dbService.connect();
      const res = await cli.query(`select * from book where isbn = $1 limit 1`, [isbn]);
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

  async renewBorrow(id: number, book_id: number, user_id: number) {
    let cli;

    try {
      cli = await this.dbService.connect();
      await cli.query(`update books_borrow set has_renew = true, end_date = end_date + INTERVAL '30 day' where id = $1 and book_id = $2 and user_id = $3 and return_date is NULL and has_renew is not true`, [id, book_id, user_id]);
      
    } catch (error) {
      throw error;
    } finally {
      if (cli) {
        cli.release();
      }
    }
  }
}
