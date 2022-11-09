import * as bcrypt from "bcrypt";

class UserHandlers {
  constructor(readonly db, readonly jwt) {
    this.db = db;
    this.jwt = jwt;
  }

  async userLogin(username, password) {
    const client = await this.db.connect();
    try {
      const user = await client.query(
        `
        select 
        u.*, 
        r.role as user_role,
        uc.count
        from users u 
        inner join roles r on r.id = u.role 
        inner join user_accounts uc on uc.user_id = u.id
        where u.username = $1`,
        [username]
      );
      if (user.rowCount == 0) {
        throw new Error(`Пользователь ${username} не найден!`);
      }
      if (user.rows[0].status == 1 || user.rows[0].status == 3) {
        throw new Error(
          `Пользователь ${username} заблокирован или в обработке! Обратитесь к администратору!`
        );
      }
      const comparePassword: boolean = await bcrypt.compare(
        password,
        user.rows[0].password
      );
      if (!comparePassword) {
        throw new Error("Не верный пароль");
      }
      const userMenu = await client.query(
        "select * from menus where $1 = any(role) order by id asc",
        [user.rows[0].role]
      );
      await client.query(
        "update users set last_visit = current_timestamp where username = $1",
        [username]
      );
      const token = await this.jwt.sign({
        id: user.rows[0].id,
        role: user.rows[0].user_role,
      });
      return {
        user: {
          username: user.rows[0].username,
          role: user.rows[0].user_role,
          count: user.rows[0].count,
        },
        menus: userMenu.rows,
        token,
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async userCreate(username, password, type, role) {
    const client = await this.db.connect();
    try {
      const user = await client.query(
        "select username from users where username = $1",
        [username]
      );

      if (user.rowCount > 0) {
        throw new Error(`Пользователь ${username} уже существует!`);
      }
      const hashPassword: string = await bcrypt.hash(password, 5);
      const { rows } = await client.query(
        "select template from user_types where id = $1",
        [type]
      );

      const user_type = JSON.stringify(
        rows[0].template.map((f) => {
          if (f.group == "data_for_access") {
            f.items[0].value = username;
            f.items[1].value = password;
          }
          return f;
        })
      );
      const user_id = await client.query(
        "insert into users (username, password, role, status, type, info) values ($1, $2, $3, $4, $5, $6) returning id",
        [username, hashPassword, role, 2, type, user_type]
      );
      await client.query(
        "insert into user_accounts (user_id, count, currency, symbol)values($1, 0.00, 'сом', 'сом')",
        [user_id.rows[0].id]
      );
      return {
        message: `Пользователь ${username} успешно создан!`,
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async userRegistration(user_data) {
    const client = await this.db.connect();
    try {
      const { user_type, data } = user_data;
      const role = user_type == 3 ? 4 : 2;
      const { rows } = await client.query(
        "insert into users (role, status, type, info) values ($1, $2, $3, $4) returning id",
        [role, 1, user_type, data]
      );
      await client.query(
        "insert into user_accounts (user_id, count, currency, symbol)values($1, 0.00, 'сом', 'сом')",
        [rows[0].id]
      );
      return {
        message: "Регистрация прошло успешно, ваши данные обрабатывается!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async userGetMe(id) {
    const client = await this.db.connect();
    try {
      const user = await client.query(
        `
            select 
               u.*, r.role as user_role,
               uc.count
            from users u 
            inner join roles r 
            on r.id = u.role 
            inner join user_accounts uc on uc.user_id = u.id
            where u.id = $1`,
        [id]
      );
      if (user.rowCount == 0) {
        throw new Error("Произошла ошибка при получении данных пользователя!");
      }
      const userMenu = await client.query(
        "select * from menus where $1 = any(role) order by id asc",
        [user.rows[0].role]
      );
      await client.query(
        "update users set last_visit = current_timestamp where id = $1",
        [id]
      );
      return {
        user: {
          username: user.rows[0].username,
          role: user.rows[0].user_role,
          count: user.rows[0].count,
        },
        menus: userMenu.rows,
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async userUpdate(id, username, password) {
    const client = await this.db.connect();
    try {
      if (!password) {
        await client.query(
          "update users set username = $1 where id = $2",
          [username, id],
          (err) => {
            if (err) {
              throw new Error("Ошибка при обновлении");
            }
          }
        );
        return { message: "Данные успешно обновлены!" };
      }
      const hashPassword = await bcrypt.hash(password, 5);
      await client.query(
        "update users set username = $1, password = $2 where id = $3",
        [username, hashPassword, id],
        (err) => {
          if (err) {
            throw new Error("Ошибка при обновлении");
          }
        }
      );
      return { message: "Данные успешно обновлены!" };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async userDelete(id) {
    const client = await this.db.connect();
    try {
      await client.query(
        "delete from user_accounts where user_id = $1",
        [id],
        (err) => {
          if (err) {
            throw new Error("Ошибка при удалении счета пользователя!");
          }
        }
      );
      await client.query(
        "delete from transactions where user_from = $1 or user_to = $1",
        [id],
        (err) => {
          if (err) {
            throw new Error("Ошибка при удалении транзакции пользователя!");
          }
        }
      );
      await client.query("delete from users where id = $1", [id], (err) => {
        if (err) {
          throw new Error("Ошибка при удалении пользователя!");
        }
      });
      return {
        message: "Пользовател успешно удален!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async userGetAllList(limit, offset, user_id) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `
            select 
              u.id, 
              u.username,
              to_char(u.last_visit, 'DD.MM.YYYY, HH24:MI:SS') as last_visit,
              r.role,
              r.title as role_title,
              us.title as status_title,
              us.color as status_color,
              count(o.id) as orders,
              ut.title as user_type,
							case when u.id = $3 then true else false end as own
            from users u
              inner join roles r on u.role = r.id
              left join orders o on u.id = o.user_id
              inner join user_status us on u.status = us.id
              left join user_types ut on u.type = ut.id
            group by u.id, r.id, us.id, ut.id
              order by r.role = 'ADMIN' desc
              limit $1 offset $2`,
        [limit, offset, user_id]
      );
      const user_count = await client.query("select count(*) from users");
      return {
        users: rows,
        user_count: user_count.rows[0].count,
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getUserRegisterTemplate(type) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        "select * from user_types where id = $1",
        [type]
      );
      return rows[0];
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getUserById(user_id, me_id) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `
        select 
        u.id,
        u.username, 
        u.info,
        u.status,
        ut.title as user_type,
        ut.id as type,
        us.title as status_title,
        us.color as status_color,
        uc.count,
        uc.symbol,
        case when u.id = $2 then true else false end as me,
        count(distinct o.id) as user_orders,
        count(distinct d.id) as user_deals,
        count(distinct ofr.id) as user_offers
        from users u 
        left join orders o on o.user_id = u.id
        left join deals d on (u.id = d.user_from or u.id = d.user_to) and d.status = 2
        left join deals ofr on (u.id = ofr.user_from or u.id = ofr.user_to) and ofr.status = 1
        left join user_types ut on ut.id = u.type
		    inner join user_status us on u.status = us.id
        inner join user_accounts uc on uc.user_id = u.id
        where u.id = $1
        group by u.id, us.id, ut.title, ut.id, uc.count, uc.symbol`,
        [user_id, me_id]
      );
      return rows[0];
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async updateUserStatus(data) {
    const client = await this.db.connect();
    try {
      const user = await client.query(
        "select username from users where username = $1",
        [data.login]
      );
      if (user.rowCount > 0) {
        throw new Error(`Пользователь ${data.login} уже существует!`);
      }
      if (data.login && data.login != "") {
        const hashPassword: string = await bcrypt.hash(data.password, 5);
        const login_access = JSON.stringify({
          id: "data_for_access",
          items: [
            {
              type: "input",
              field: "login",
              title: "Логин",
              value: data.login,
              required: false,
            },
            {
              type: "input",
              field: "password",
              title: "Пароль",
              value: data.password,
              required: false,
            },
          ],
          title: "Данные для доступа к электронной системе торгов",
        });
        const { rows } = await client.query(
          "update users set username = $1, password = $2, status = $3, info = info|| $5::jsonb where id = $4",
          [data.login, hashPassword, data.status, data.user_id, login_access]
        );
      } else {
        await client.query("update users set status = $1 where id = $2", [
          data.status,
          data.user_id,
        ]);
      }
      let message =
        data.status == 2
          ? "Пользлватель успешно принять!"
          : data.status == 4
          ? "Пользователь отклонен!"
          : data.status == 3 && "Пользователь заблокирован!";
      return {
        message,
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async updateUserData({ id, info, login, password }) {
    const client = await this.db.connect();
    try {
      const hashPassword: string = await bcrypt.hash(password, 5);
      await client.query(
        "update users set info = $1, username = $3, password = $4 where id = $2",
        [info, id, login, hashPassword]
      );

      return {
        message: `Данные успешно обновлен!`,
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
}

export default UserHandlers;
