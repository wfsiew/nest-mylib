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
  password: string;

  roles: Role[];

  static async fromRs(r, cli): Promise<User> {
    let o = new User();
    o.id = Number(r.id);
    o.username = r.username;
    o.password = r.password;

    await User.setRoles(o, cli);
    return o;
  }

  static async fromRsNoPwd(r, cli): Promise<User> {
    let o = new User();
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
    o.id = Number(r.id);
    o.isbn = r.isbn;
    o.title = r.title;
    o.author = r.author;
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

  static fromRs(r): BooksBorrow {
    let o = new BooksBorrow();
    o.id = Number(r.id);
    o.has_renew = r.has_renew;
    o.start_date = r.start_date;
    o.end_date = r.end_date;
    o.return_date = r.return_date;
    o.book_id = r.book_id;
    o.user_id = r.user_id;

    let b = Book.fromRs(r);
    b.id = o.book_id;
    o.book = b;
    return o;
  }
}
