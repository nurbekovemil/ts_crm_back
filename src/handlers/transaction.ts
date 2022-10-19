"use strict";

class TransactionHandlers {
  constructor(readonly db) {
    this.db = db;
  }
  async createTransaction({
    transaction_type,
    user_from,
    user_to,
    amount,
    status,
  }) {
    const client = await this.db.connect();
    try {
      let queryString = `
        insert into transactions (type, user_from, user_to, amount, status) values ($1, $2, $3, $4, $5)
      `;
      await client.query(queryString, [
        transaction_type,
        user_from,
        user_to,
        amount,
        status,
      ]);
      return {
        message: "Транзакция в обработке!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
  // async getMyTransactionList({ id }) {
  //   const client = await this.db.connect();
  //   try {
  //     const { rows } = await client.query(`
  //       select

  //       from transactions t
  //       where
  //     `);
  //   } catch (error) {
  //     return error;
  //   } finally {
  //     client.release();
  //   }
  // }

  async getTransactionById({ id }) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `
        select
        t.*,
        to_char(t.created_at, 'YYYY-MM-DD, HH24:MI') as created_at,
        tt.title as type_title,
        ts.title as status_title,
        uf.username as user_from_name,
        ut.username as user_to_name
        from transactions t
        inner join transaction_types tt on t.type = tt.id
        inner join transaction_status ts on t.status = ts.id
        inner join users uf on t.user_from = uf.id
        inner join users ut on t.user_to = ut.id
        where t.id = $1
      `,
        [id]
      );
      return rows[0];
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getUserAccounts() {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(`
      select
      u_c.account,
      u_c.user_id,
      u_c.count,
      u_c.symbol,
	    u.username
      from user_accounts u_c
      inner join users u on u.id = u_c.user_id
	  inner join roles r on r.id = u.role
	  where r.role = 'USER'
      `);
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
  async getAllTransactionList(
    { id, role },
    { date_from, date_to, page, limit }
  ) {
    const client = await this.db.connect();
    try {
      limit = limit || 10;
      page = page || 1;
      let offset = page * limit - limit;
      const queryString = `
      select 
      t.*,
      to_char(t.created_at, 'YYYY-MM-DD, HH24:MI') as created_at,
      uf.username as user_from_name,
      ut.username as user_to_name,
      tt.title as type_title,
      ts.title as status_title,
      ts.color as status_color
      from transactions t
      inner join users uf on uf.id = t.user_from
      inner join users ut on ut.id = t.user_to
      inner join transaction_types tt on tt.id = t.type
      inner join transaction_status ts on ts.id = t.status
      ${role == "USER" ? `where t.user_from = ${id} or t.user_to = ${id}` : ""}
      ${date_from ? ` and t.created_at >= '${date_from}'` : ""}
      ${date_to ? ` and t.created_at <= '${date_to}'` : ""}
      limit ${limit} offset ${offset}
      `;
      const { rows } = await client.query(queryString);
      const count = await client.query("select count(*) from transactions");
      return {
        list: rows,
        count: count.rows[0].count,
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
  async updateTransactionStatus({ id, status }, { role }) {
    const client = await this.db.connect();
    try {
      // получаем транзакцию по id
      const { rows } = await client.query(
        "select * from transactions where id = $1",
        [id]
      );
      const { user_from, user_to, amount, type } = rows[0];

      const getUser = async (user_id) => {
        let { rows } = await client.query(
          ` select uc.*, u.username, r.role
            from user_accounts uc
            inner join users u on u.id = uc.user_id
            inner join roles r on r.id = u.role
            where uc.user_id = $1`,
          [user_id]
        );
        return rows[0];
      };

      // получаем данные пользователей
      const userfrom = await getUser(user_from);

      const updateUserAccounts = async (user_id, action, total) =>
        await client.query(
          `update user_accounts set count = count ${action} '${total}' where user_id = ${user_id}`
        );

      if ((status == 2 && type == 3) || (status == 2 && type == 1)) {
        if (userfrom.role == "USER" && userfrom.count < amount && type == 3) {
          throw new Error(
            `${userfrom.username} недостаточно средств для перевода!`
          );
        }
        type == 3 && (await updateUserAccounts(user_from, "-", amount));
        await updateUserAccounts(user_to, "+", amount);
      }
      if (status == 2 && type == 2) {
        await updateUserAccounts(user_to, "-", amount);
      }
      await client.query(`update transactions set status = $1 where id = $2`, [
        status,
        id,
      ]);
      return {
        message: status == 3 ? "Перевод отклонен!" : "Перевод принять!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
}

export default TransactionHandlers;
