"use strict";

class TenderHandlers {
  constructor(readonly db) {
    this.db = db;
  }

  async createTender(
    { title, type, category, city, deadline, description },
    { tenders },
    { id }
  ) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `insert into tenders (title, user_id, type, category, city, deadline, description) values ($1,$2,$3,$4,$5,$6,$7) returning id`,
        [title, id, type, category, city, deadline, description]
      );
      tenders != undefined &&
        (await tenders.map(
          async ({ path }) =>
            await client.query(
              "insert into tender_files (tender_id, path) values ($1, $2)",
              [rows[0].id, path]
            )
        ));
      return {
        message: "Объявление добавлено!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getTenderList({ id, role }) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `
        select 
        t.id,
        t.title,
        to_char(t.deadline, 'YYYY-MM-D') as deadline,
        to_char(t.created_at, 'YYYY-MM-DD, HH24:MI') as created_at,
        c.title as category_title,
        tt.title as type_title,
        tc.title as city_title
        from tenders t
        inner join tender_categories c on c.id = t.category
        inner join tender_types tt on tt.id = t.type
        inner join tender_cities tc on tc.id = t.city
        ${role == "TENDER" ? `where t.user_id = ${id}` : ""}
        order by t.created_at desc
      `
      );
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
  async getTenderAllList() {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `
        select 
        t.id,
        t.title,
        to_char(t.deadline, 'YYYY-MM-D') as deadline,
        to_char(t.created_at, 'YYYY-MM-DD, HH24:MI') as created_at,
        c.title as category_title,
        tt.title as type_title,
        tc.title as city_title,
		    u.info
        from tenders t
        inner join tender_categories c on c.id = t.category
        inner join tender_types tt on tt.id = t.type
        inner join tender_cities tc on tc.id = t.city
		    inner join users u on u.id = t.user_id
        order by t.created_at desc
      `
      );
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getTenderById({ id }) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `
        select 
        t.id,
        t.title,
        to_char(t.deadline, 'YYYY-MM-DD') as deadline,
        to_char(t.created_at, 'YYYY-MM-DD, HH24:MI') as created_at,
        t.description,
        c.title as category_title,
        jsonb_agg(distinct tf.*) as tender_files,
        tt.title as type_title,
        tc.title as city_title,
        u.info
        from tenders t
        inner join tender_categories c on c.id = t.category
        inner join tender_types tt on tt.id = t.type
        inner join tender_cities tc on tc.id = t.city
        inner join users u on u.id = t.user_id
        left join tender_files tf on tf.tender_id = t.id
        where t.id = $1
        group by t.id, t.title, c.title, tt.title, tc.title, u.info
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
}

export default TenderHandlers;
