"use strict";

class ReportHandlers {
  constructor(readonly db) {
    this.db = db;
  }
  async getDealReports({ search_name, date_from, date_to, is_members }) {
    const client = await this.db.connect();
    try {
      let queryString = `
        select
        d.id,
        to_char(d.created_at, 'DD.MM.YYYY') as created_at,
        u_f.username as user_from_name,
        u_t.username as user_to_name,
        o.title as prod_title,
        o.price,
        o.amount,
        o_w.title as prod_weight,
        o.cost,
        o.code_tnved,
        o_c.symbol
        from deals d
        inner join orders o on o.id = d.order_from
        inner join users u_f on d.user_from = u_f.id
        inner join users u_t on d.user_to = u_t.id
        inner join order_weights o_w on o_w.id = o.weight
        inner join order_currencies o_c on o_c.id = o.currency 
        where d.status = 2 
        ${date_from ? ` and d.created_at >= '${date_from}'` : ""}
        ${date_to ? ` and d.created_at <= '${date_to}'` : ""}
        ${
          search_name.trim() != "" && is_members
            ? ` and u_f.username like '%${search_name}%' or u_t.username like '%${search_name}%'`
            : ""
        }
      `;
      const { rows } = await client.query(queryString);
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
}

export default ReportHandlers;
