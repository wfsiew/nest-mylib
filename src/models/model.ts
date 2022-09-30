import { Exclude } from "class-transformer";

export class Role {
  id: number;
  name: string;

  static fromRs(r): Role {
    let o = new Role();
    o.id = Number(r.id);
    o.name = r.name;
    return o;
  }
}

export class User {
  id: number;
  username: string;

  @Exclude()
  password: string;

  roles: Role[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  static async fromRs(r, cli): Promise<User> {
    let o = new User(r);
    o.id = Number(r.id);
    // o.username = r.username;
    // o.password = r.password;

    await User.setRoles(o, cli);
    return o;
  }

  static async fromRsNoPwd(r, cli): Promise<User> {
    let o = new User(r);
    o.id = Number(r.id);
    o.username = r.username;

    await User.setRoles(o, cli);
    return o;
  }

  private static async setRoles(o: User, cli) {
    let lx: Role[] = [];
    const res = await cli.query(`select ur.user_id, ur.role_id, r.id, r.name from user_role ur inner join role r on ur.role_id = r.id where ur.user_id = $1`, [o.id]);
    res.rows.forEach(rx => {
      const role = Role.fromRs(rx);
      lx.push(role);
    });
    o.roles = lx;
  }
}

export class Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  qty: number;
  return_date?: string;

  static fromRs(r): Book {
    let o = new Book();
    o = { ...r };
    o.id = Number(r.id);
    o.qty = Number(r.qty);
    return o;
  }
}

export class BooksBorrow {
  id: number;
  has_renew: boolean;
  start_date: string;
  end_date: string;
  return_date?: string;
  book_id: number;
  user_id: number;
  book: Book;
  user: User;

  static fromRs(r): BooksBorrow {
    let o = new BooksBorrow();
    o = { ...r };
    o.id = Number(r.id);
    o.book_id = Number(r.book_id);
    o.user_id = Number(r.user_id);

    let b = Book.fromRs(r);
    b.id = o.book_id;
    o.book = b;

    let u = new User({});
    u.id = o.user_id;
    u.username = r.username;
    o.user = u;
    return o;
  }
}
