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
}

export default DashboardHandlers;
