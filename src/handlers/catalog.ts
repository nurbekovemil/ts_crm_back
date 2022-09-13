"use strict";

class CatalogHandlers {
  constructor(readonly db) {
    this.db = db;
  }
  async getTnvedCategories(page) {
    const client = await this.db.connect();
    try {
      let limit = 10;
      let offset = limit * page;
      //   const queryString = `where ${parent == undefined?  `COALESCE(tnved.parent, '') = ''` : `tnved.parent = ${parent}`}`
      const { rows } = await client.query(`
         SELECT 
         tnved_lang.id, 
         tnved.parent,
         tnved_lang.title as name
         FROM tnved 
         inner join tnved_lang on tnved.id = tnved_lang.id
         where ${
           page <= 1
             ? `tnved_lang.id < '${limit}'`
             : `tnved_lang.id >= '${offset - limit}' and tnved_lang.id < '${
                 offset == 100 ? "99" : offset
               }'`
         }
         order by tnved.id asc
         `);
      if (rows.length > 0) {
        const idMapping = rows.reduce((acc, el, i) => {
          acc[el.id] = i;
          return acc;
        }, {});
        let root = [];
        rows.forEach((el) => {
          // Handle the root element
          if (el.parent === "") {
            root.push(el);
            return;
          }
          // Use our mapping to locate the parent element in our data array
          const parentEl = rows[idMapping[el.parent]];
          // Add our current el to its parent's `children` array
          parentEl.children = [...(parentEl.children || []), el];
        });
        return root;
      }
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getCategories() {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(`
      select oc.id, oc.title, count(o.*) as orders from order_categories oc
      left join orders o on o.category = oc.id and o.status = 2
      where oc.id in (1, 2, 6, 4)
      group by oc.title, oc.id
      `);
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getCategoryOrders({ id }) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `
        select 
        o.id, 
        o.title, 
        o.price,
        jsonb_agg(pi.*) as images,
		oc.symbol as currency_symbol
        from orders o 
        left join path_images pi on pi.order_id = o.id
		inner join order_currencies oc
		on oc.id = o.currency
        where o.category = $1 and o.status = 2
        group by o.id, oc.symbol
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

  async latestorders({ order_ids }) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `
        select 
        o.id, 
        o.title,
        o.status, 
        o.price,
        oc.symbol as currency_symbol,
        jsonb_agg(pi.*) as images  
        from orders o 
        left join path_images pi on pi.order_id = o.id 
        inner join order_currencies oc on o.currency = oc.id
        where o.id = any(array[${order_ids}]) and o.status = 2 
        group by o.id, oc.symbol
      `
      );
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getOrderTnved({ search }) {
    const client = await this.db.connect();
    try {
      // const queryString = `select t.id, tl.title from tnved t
      // inner join tnved_lang tl on tl.id = t.id and tl.lang = 'ru'
      // where tl.title like '%${
      //   search && search.split(" ").join("_").toUpperCase()
      // }%' or tl.id like '%${search}%' order by t.id asc`;

      const queryString = `
      select 
      tl.id, 
      tl.title 
      from tnved_lang tl
      where ${
        !isNaN(Number(search))
          ? `tl.id like '%${search}%'`
          : `tl.title like '%${
              search && search.split(" ").join("_").toUpperCase()
            }%'`
      } order by tl.id asc`;

      const { rows } = await client.query(queryString);
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
  async getCatalogByTable({ table }) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(`
        select *, false as isedit from ${table} order by id desc
      `);
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
  async updateCatalogItem({ table, data }) {
    const client = await this.db.connect();
    try {
      const queryString =
        table == "order_currencies"
          ? `title = '${data.title}', code = '${data.code}', symbol = '${data.symbol}'`
          : `title = '${data.title}'`;
      await client.query(`
        update ${table} set ${queryString} where id = ${data.id}
      `);
      return {
        message: "Данные успешно обновлены!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async deleteCatalogItem({ table, id }) {
    const client = await this.db.connect();
    try {
      await client.query(`
        delete from ${table} where id = ${id}
      `);
      return {
        message: "Данные успешно удалены!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async createCatalogItem({ table, data }) {
    const client = await this.db.connect();
    try {
      const queryString =
        table == "order_currencies"
          ? `(title, code, symbol) values ('${data.title}', '${data.code}', '${data.symbol}')`
          : `(title) values ('${data.title}')`;
      await client.query(`
        insert into ${table} ${queryString}
      `);
      return {
        message: "Данные успешно добавлены!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
}

export default CatalogHandlers;
