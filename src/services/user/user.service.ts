import { Injectable } from '@nestjs/common';
import { User } from 'src/models/model';
import { DbService } from 'src/services/db/db.service';
const bcrypt = require('bcrypt');
const saltRounds = 10;

@Injectable()
export class UserService {

  constructor(private dbService: DbService) {}

  async findById(id: number): Promise<User> | null {
    let cli;
    let o = null;

    try {
      cli = await this.dbService.connect();
      const res = await cli.query(`select * from "user" where id = $1 limit 1`, [id]);
      if (res.rowCount > 0) {
        o = await User.fromRs(res.rows[0], cli);
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

  async findByUsername(username: string): Promise<User> | null {
    let cli;
    let o = null;

    try {
      cli = await this.dbService.connect();
      const res = await cli.query(`select * from "user" where username = $1 limit 1`, [username]);
      if (res.rowCount > 0) {
        o = await User.fromRs(res.rows[0], cli);
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

  async save(o: User) {
    let cli;

    try {
      const pwd = await bcrypt.hash(o.password, saltRounds);
      cli = await this.dbService.connect();
      await cli.query('begin');
      const res = await cli.query(`insert into "user" (id, username, password) values(nextval('user_id_seq'),$1,$2) returning id as user_id`, [o.username, pwd]);

      for (let i = 0; i < o.roles.length; i++) {
        let r = o.roles[i];
        await cli.query(`insert into user_role (user_id, role_id) values($1, $2)`, [res.rows[0].user_id, r.id]);
      }

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

  async validateCredentials (user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }
}
