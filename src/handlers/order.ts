"use strict";
const fs = require("fs");
const path = require("path");
class OrderHandlers {
  constructor(readonly db, readonly jwt) {
    this.db = db;
    this.jwt = jwt;
  }

  async createOrder(
    {
      type,
      payment,
      delivery,
      currency,
      weight,
      category,
      description,
      title,
      price,
      amount,
      cost,
      nds,
      gost,
      warranty,
      packing_form,
      special_conditions,
      country,
      lot,
      code_tnved,
      product_lacation,
    },
    { id }
  ) {
    const client = await this.db.connect();

    try {
      const { rows } = await client.query(
        ` insert into orders (
					order_type, 
					payment, 
					delivery, 
          currency,
					weight, 
					category, 
					description, 
					title, 
					price, 
					amount, 
					cost, 
					status, 
					nds,
					gost,
					warranty,
					packing_form,
					special_conditions,
					country,
					lot,
					code_tnved,
					product_lacation,
					user_id
					) 
					values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,$14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING id, order_type
				`,
        [
          type,
          payment,
          delivery,
          currency,
          weight,
          category,
          description,
          title,
          price,
          amount,
          cost,
          1,
          nds,
          gost,
          warranty,
          packing_form,
          special_conditions,
          country,
          lot,
          code_tnved,
          product_lacation,
          id,
        ]
      );
      return rows[0];
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async updateOrderById(
    {
      category,
      type,
      delivery,
      payment,
      weight,
      title,
      gost,
      warranty,
      packing_form,
      country,
      special_conditions,
      code_tnved,
      lot,
      product_lacation,
      description,
      price,
      amount,
      cost,
      currency,
    },
    order_id
  ) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `update orders set 
          category = $1,
          order_type = $2,
          delivery = $3,
          payment = $4,
          weight = $5,
          title = $6,
          gost = $7,
          warranty = $8,
          packing_form = $9,
          country = $10,
          special_conditions = $11,
          code_tnved = $12,
          lot = $13,
          product_lacation = $14,
          description = $15,
          price = $16,
          amount = $17,
          cost = $18,
          currency = $19
          where id = $20
				`,
        [
          category,
          type,
          delivery,
          payment,
          weight,
          title,
          gost,
          warranty,
          packing_form,
          country,
          special_conditions,
          code_tnved,
          lot,
          product_lacation,
          description,
          price,
          amount,
          cost,
          currency,
          order_id,
        ]
      );
      return {
        message: "???????????? ?????????????? ??????????????????!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async createImage(files, id) {
    const client = await this.db.connect();
    try {
      const queryString =
        "insert into path_images (order_id, path) values ($1, $2)";
      if (!files.length) {
        let default_path = "static/images/default.png";
        return client.query(queryString, [id, default_path]);
      }
      files.map((item) => {
        let path = `${item.destination}/${item.filename}`;
        client.query(queryString, [id, path]);
      });
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getMyOrderList(type, user_id) {
    const client = await this.db.connect();
    try {
      const orders = await client.query(
        `
            select 
               o.id, 
               o.title, 
               o.status as status_id,
               os.title as status,
               os.color as status_color, 
               to_char("created_at", 'DD.MM.YYYY') as created_at
               from orders as o 
               inner join order_status as os 
               on os.id = o.status
               where order_type = $1 and user_id = $2`,
        [type, user_id]
      );
      return orders.rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getOrderByIdPrivate(user_id, order_id) {
    const client = await this.db.connect();
    try {
      console.log("--------", order_id, user_id);
      const { rows } = await client.query(
        `select 
				              o.* ,
											 to_char(o.created_at, 'DD.MM.YYYY') as created_at,
											 case when o.user_id = $1 then true else false end as own,
											 ot.title as order_type_title,
											 
											 os.title as status_title,
											 oc.title as category,
											 oc.id as category_id,
				
											 od.title as delivery,
											 od.id as delivery_id,
											 
											 op.title as payment,
											 op.id as payment_id,
											 
											 ow.title as weight,
											 ow.id as weight_id,
                       u.username,
                       cu.title as currency,
                       cu.id as currency_id,
                       cu.symbol as currency_symbol,
                       jsonb_agg(img.*) as images
											 
											 from orders as o
				
												inner join order_types as ot
												on o.order_type = ot.id 
												inner join order_status as os
												on o.status = os.id
												inner join order_categories as oc
												on o.category = oc.id
												inner join order_deliveries as od
												on o.delivery = od.id
												inner join order_payments as op
												on o.payment = op.id
												inner join order_weights as ow
												on o.weight = ow.id
												left join path_images as img
												on o.id = img.order_id
                        inner join users as u
												on o.user_id = u.id
                        inner join order_currencies as cu
												on o.currency = cu.id
								where o.id = $2
								GROUP BY o.id, ot.title, os.title,
								oc.title,
											 oc.id,
											 od.title ,
											 od.id ,
											 op.title ,
											 op.id ,
											 ow.title,
											 ow.id,
                       u.id,
                       cu.id
                       `,
        [user_id, order_id]
      );
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getOrderByIdPublic(id) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `select 
               o.*, 
               to_char("created_at", 'DD.MM.YYYY') as created_at,
               ot.title as order_type_title,
               os.title as status_title,
							 oc.title as category,
							 oc.id as category_id,
							 od.title as delivery,
							 op.title as payment,
							 ow.title as weight,
               cur.symbol as currency_symbol,
							 jsonb_agg(img.*) as images
               from orders as o
               inner join order_types as ot
               on o.order_type = ot.id 
               inner join order_status as os
               on o.status = os.id
							 inner join order_categories as oc
               on o.category = oc.id
							 inner join order_deliveries as od
               on o.delivery = od.id
							 inner join order_payments as op
               on o.payment = op.id
							 inner join order_weights as ow
               on o.weight = ow.id
							 left join path_images as img
							 on o.id = img.order_id
               inner join order_currencies cur on cur.id = o.currency
               where o.id = $1
							 group by 
							 o.id, 
               ot.title,
               os.title,
							 oc.title,
							 oc.id,
							 od.title,
							 op.title,
							 ow.title,
               cur.symbol
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

  async getAllOrderList(role, id) {
    const client = await this.db.connect();
    try {
      let queryString = `
         select 
            o.id,
            o.title,
            case when o.user_id = $1 then true else false end as own,
            to_char("created_at", 'DD.MM.YYYY') as created_at,
            o.status as status_code,
            o.price,
            o.amount,
            o.cost,
            os.title as status,
            os.color as status_color,
            ot.title as order_type
         from orders as o 
         inner join order_status as os 
         on os.id = o.status
         inner join order_types as ot
         on o.order_type = ot.id 
         where ${
           role == "ADMIN" ? " o.status = 1 or o.status = 2" : "o.status = 2"
         }
         order by o.status = 1 desc, o.created_at desc`;
      const { rows } = await client.query(queryString, [id]);
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getOptions(option) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(`select * from ${option}`);
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getOrderListHomePage(type) {
    const client = await this.db.connect();
    try {
      let queryString = `
				select 
				o.id,
				o.title,
				to_char(o.created_at, 'DD.MM.YYYY') as created_at,
				o.status as status_code,
				o.price,
				o.amount,
				o.cost,
				os.title as status,
				os.color as status_color,
				ot.title as order_type,
        oc.symbol as currency_symbol,
				jsonb_agg(img.*) as images
				from orders as o 
				inner join order_status as os 
				on os.id = o.status
				inner join order_types as ot
				on o.order_type = ot.id 
        inner join order_currencies oc on o.currency = oc.id
				left join path_images as img
				on o.id = img.order_id
				where o.status = 2 and o.order_type = $1
				group by 
				o.id,
				o.title,
				o.status,
				o.price,
				o.amount,
				o.cost,
				os.title,
				os.color,
				ot.title,
        oc.symbol
				order by o.status = 1 desc, o.created_at desc`;
      const { rows } = await client.query(queryString, [type]);
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async updateOrderStatus(order_id, status) {
    const client = await this.db.connect();
    try {
      await client.query("update orders set status = $2 where id = $1", [
        order_id,
        status,
      ]);

      return {
        message:
          status == 2 || status == 1
            ? "???????????? ?????????????? ??????????????!"
            : status == 4 && "???????????? ????????????????!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async deleteOrder(order_id) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `
      select o.id from orders o inner join deals d on d.order_from = o.id or d.order_to = o.id where o.id = $1`,
        [order_id]
      );
      if (rows.length > 0) {
        throw new Error(`???????????? ???????? ?? ?????????????????????? ?????? ?? ????????????!`);
      }
      await client.query("delete from orders where id = $1", [order_id]);
      await this.deleteOrderImages(order_id);
      return {
        message: "???????????? ?????????????? ????????????!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
  async deleteOrderImages(order_id) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `select * from path_images where order_id = $1`,
        [order_id]
      );
      if (rows.length > 0) {
        await client.query("delete from path_images where order_id = $1", [
          order_id,
        ]);
        rows.map((img) => {
          fs.unlink(img.path, function (err) {
            if (err) throw err;
          });
        });
      }
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
  async deleteImage(id) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `delete from path_images where id = $1 returning path`,
        [id]
      );
      if (rows.length > 0) {
        rows.map((img) => {
          fs.unlink(img.path, function (err) {
            if (err) throw err;
          });
        });
      }
      return {
        message: "?????????????????????? ?????????????? ????????????!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
  async updateOrderImage(order_id) {}
}

export default OrderHandlers;
