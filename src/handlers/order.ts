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
      product_location,
      delivery_date,
      payment_date,
      marking,
      quality,
      is_auction,
      auction_date_start,
      auction_date_end,
      auction_time_start,
      auction_time_end,
    },
    { id }
  ) {
    const client = await this.db.connect();

    try {
      const { rows } = await client.query(
        `insert into orders (
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
					product_location,
            delivery_date,
            payment_date,
            marking,
            quality,
            is_auction,
            auction_date_start,
            auction_date_end,
            auction_time_start,
            auction_time_end,
					user_id
					) 
					values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,$14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27,$28,$29,$30,$31) RETURNING id, order_type
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
          product_location,
          delivery_date,
          payment_date,
          marking,
          quality,
          is_auction,
          auction_date_start != "" && auction_date_start != "null"
            ? auction_date_start
            : "2000-01-01",
          auction_date_end != "" && auction_date_end != "null"
            ? auction_date_end
            : "2000-01-01",
          auction_time_start != "" && auction_time_start != "null"
            ? auction_time_start
            : "01:00:00",
          auction_time_end != "" && auction_time_end != "null"
            ? auction_time_end
            : "01:00:00",
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
      product_location,
      description,
      price,
      amount,
      cost,
      currency,
      delivery_date,
      payment_date,
      marking,
      quality,
      is_auction,
      auction_date_start,
      auction_date_end,
      auction_time_start,
      auction_time_end,
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
          product_location = $14,
          description = $15,
          price = $16,
          amount = $17,
          cost = $18,
          currency = $19,
          delivery_date = $20,
          payment_date = $21,
          marking = $22,
          quality = $23,
          is_auction = $24,
          auction_date_start = $25,
          auction_date_end = $26,
          auction_time_start = $27,
          auction_time_end = $28
          where id = $29
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
          product_location,
          description,
          price,
          amount,
          cost,
          currency,
          delivery_date,
          payment_date,
          marking,
          quality,
          is_auction,
          auction_date_start,
          auction_date_end,
          auction_time_start,
          auction_time_end,
          order_id,
        ]
      );
      return {
        message: "Данные успешно обновлены!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async createImage({ images, certificate }, id) {
    const client = await this.db.connect();
    try {
      const queryStringOrderPath =
        "insert into path_images (order_id, path) values ($1, $2)";
      const queryStringOrderCertificatePath =
        "insert into order_certificates (order_id, path) values ($1, $2)";
      if (images.length > 0) {
        images.map(({ path }) => {
          client.query(queryStringOrderPath, [id, path]);
        });
      }
      if (certificate.length > 0) {
        certificate.map(({ path }) => {
          client.query(queryStringOrderCertificatePath, [id, path]);
        });
      }
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getMyOrderList(type, limit, offset, user_id) {
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
               where order_type = $1 and user_id = $2
               limit $3 offset $4
               `,
        [type, user_id, limit, offset]
      );
      const order_type_count = await client.query(
        "select count(*) from orders where order_type = $1 and user_id = $2",
        [type, user_id]
      );
      return {
        rows: orders.rows,
        count: order_type_count.rows[0].count,
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }

  async getOrderByIdPrivate(user_id, order_id) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `select 
				              o.* ,
											 to_char(o.created_at, 'YYYY-MM-DD') as created_at,
											 o.delivery_date,
											 o.payment_date,
											 case when o.user_id = $1 then true else false end as own,
                       
                      case when 
                        (current_date BETWEEN auction_date_start AND auction_date_end) 
                        and 
                        (now()::time(0) between auction_time_start and auction_time_end) then true 
                        else false end as auction,

                      to_char(o.auction_date_start, 'YYYY-MM-DD') as auction_date_start,
                      to_char(o.auction_date_end, 'YYYY-MM-DD') as auction_date_end,
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
                       jsonb_agg(img.*) as images,
                       jsonb_agg(o_cert.*) as cert
											 
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
                        left join order_certificates o_cert
												on o_cert.order_id = o.id
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
               to_char("created_at", 'YYYY-MM-DD') as created_at,
               o.delivery_date,
							 o.payment_date,
               case when 
                (current_date BETWEEN auction_date_start AND auction_date_end) 
                and 
                (now()::time(0) between auction_time_start and auction_time_end) then true 
                else false end as auction,
               to_char(o.auction_date_start, 'YYYY-MM-DD') as auction_date_start,
               to_char(o.auction_date_end, 'YYYY-MM-DD') as auction_date_end,
               ot.title as order_type_title,
               os.title as status_title,
							 oc.title as category,
							 oc.id as category_id,
							 od.title as delivery,
							 op.title as payment,
							 ow.title as weight,
               cur.symbol as currency_symbol,
							 jsonb_agg(img.*) as images,
               jsonb_agg(o_cert.*) as cert
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
               left join order_certificates o_cert
               on o_cert.order_id = o.id
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

  async getAllOrderList(role, id, limit, offset, type) {
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
            o.user_id,
            os.title as status,
            os.color as status_color,
            ot.title as order_type,
            oc.symbol,
            u.username,
            w.title as weight_title
         from orders as o 
            inner join order_status as os 
            on os.id = o.status
            inner join order_types as ot
            on o.order_type = ot.id 
            inner join order_currencies oc
            on oc.id = o.currency
            inner join users as u
            on o.user_id = u.id
            inner join order_weights as w
            on o.weight = w.id
         where ${
           role == "ADMIN" ? " o.status in (1,2,4,7)" : "o.status = 2"
         } and o.order_type = $4
         order by o.status = 1 desc, o.created_at desc
         limit $2 offset $3
         `;
      const { rows } = await client.query(queryString, [
        id,
        limit,
        offset,
        type,
      ]);
      const order_count = await client.query(`
         select count(*) from orders where ${
           role == "ADMIN" ? " status = 1 or status = 2" : "status = 2"
         }
      `);
      return {
        rows,
        count: order_count.rows[0].count,
      };
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

  async getOrderListHomePage(type, limit) {
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
				order by o.status = 1 desc, o.created_at desc
        limit $2
        `;
      const { rows } = await client.query(queryString, [type, limit]);
      return { rows };
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
      let message =
        status == 1 || status == 2 || status == 8
          ? "Заявка принять!"
          : status == 4
          ? "Заявка отклонен!"
          : "Статус заявки успешно изменен!";
      return {
        message,
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
      await this.deleteOrderImages(order_id);
      const { rows } = await client.query(
        `
          select o.id from orders o inner join deals d on d.order_from = o.id or d.order_to = o.id where o.id = $1`,
        [order_id]
      );
      if (rows.length > 0) {
        throw new Error(`Заявка есть в предложении или в сделке!`);
      }
      await client.query("delete from orders where id = $1", [order_id]);
      return {
        message: "Заявка успешно удален!",
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
      const images = await client.query(
        `select * from path_images where order_id = $1`,
        [order_id]
      );
      const certificates = await client.query(
        `select * from order_certificates where order_id = $1`,
        [order_id]
      );
      if (images.rows.length > 0) {
        await client.query("delete from path_images where order_id = $1", [
          order_id,
        ]);
        images.rows.map((img) => {
          fs.unlink(img.path, function (err) {
            if (err) throw err;
          });
        });
      }
      if (certificates.rows.length > 0) {
        await client.query(
          "delete from order_certificates where order_id = $1",
          [order_id]
        );
        certificates.rows.map((img) => {
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
        message: "Изображение успешно удален!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
  async updateOrderImage(order_id) {}

  async copyOrder(order_id) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `
        INSERT INTO orders( 
          order_type, title, description, status, 
          cost, amount, user_id, price, 
          category, delivery, payment, weight, delivery_date,
         nds, gost, warranty, packing_form, special_conditions, country,
         product_location, code_tnved, lot, currency, marking, payment_date, quality, auction_date_start, auction_date_end,
         auction_time_start, auction_time_end, is_auction
       )
       SELECT order_type, title, description, '1', 
          cost, amount, user_id, price, 
          category, delivery, payment, weight, delivery_date,
         nds, gost, warranty, packing_form, special_conditions, country,
         product_location, code_tnved, lot, currency, marking, payment_date, quality, auction_date_start, auction_date_end,
         auction_time_start, auction_time_end, is_auction
       
       FROM orders WHERE id=$1;
        `,
        [order_id]
      );
      return {
        message: "Успешно дублирован!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
}

export default OrderHandlers;
