import { Injectable } from '@nestjs/common';
import { Role } from 'src/models/model';
import { DbService } from 'src/services/db/db.service';

@Injectable()
export class RoleService {

  constructor(private dbService: DbService) {}

  async findById(id: number): Promise<Role> {
    let cli;
    let o = null;

    try {
      cli = await this.dbService.connect();
      const res = await cli.query(`select * from role where id = $1 limit 1`, [id]);
      if (res.rowCount > 0) {
        o = Role.fromRs(res.rows[0]);
      }
    } catch (error) {
      throw error;
    } finally {
      if (cli) {
        try {
          await cli.end();
        } catch (error) {
          
        }
      }
    }

    return o;
  }
}
