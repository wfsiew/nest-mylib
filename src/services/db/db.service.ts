import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
const { Pool } = require('pg');

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {

  private pool;

  onModuleInit() {
    this.pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'libdb',
      password: 'postgres',
      port: 5432,
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async connect() {
    const cli = await this.pool.connect();
    return cli;
  }
}
