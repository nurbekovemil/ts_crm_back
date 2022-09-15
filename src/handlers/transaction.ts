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
      const { rows } = await client.query(queryString, [
        transaction_type,
        user_from,
        user_to,
        amount,
        status,
      ]);
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
  async getMyTransactionList({ id }) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(`
        select 
        
        from transactions t
        where 
      `);
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
      `);
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
}

export default TransactionHandlers;
