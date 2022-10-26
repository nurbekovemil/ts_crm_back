"use strict";

class DashboardHandlers {
  constructor(readonly db) {
    this.db = db;
  }
  async getTableRowCounts(table) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(`select count(*) from ${table}`);
      return rows[0];
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getInProcessingOffers({ id }) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `
      select
      o.title,
      d.id,
      d.order_from,
      to_char(d.created_at, 'YYYY-MM-DD, HH24:MI') as created_at
      from deals d
      inner join orders o on o.id = d.order_to
      where d.user_to = $1 and d.status = 1
      `,
        [id]
      );
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
}

export default DashboardHandlers;
