'use strict'

class OrderHandlers {
	constructor(readonly db, readonly jwt) {
		this.db = db;
		this.jwt = jwt;
	}

	async createOrder(type, payment, delivery, weight, category, description, title, price, amount, cost, user_id) {
		const client = await this.db.connect();
		try {
			await client.query(
				` insert into orders (order_type, payment, delivery, weight, category, description, title, price, amount, cost, status, user_id) 
					values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
				`,
				[type, payment, delivery, weight, category, description, title, price, amount, cost, 1, user_id]
			);
			return {
				message: "Заявка успешно создано!",
			};
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

	async getOrderByIdPrivate(user_id, order_id, role) {
		const client = await this.db.connect();
		try {
			const { rows } = await client.query(
				`select 
               o.*, 
               to_char("created_at", 'DD.MM.YYYY') as created_at,
               ot.title as order_type_title,
               case when o.user_id = $1 or $3 = 'ADMIN' then true else false end as own,
               os.title as status_title,
							 oc.title as category,
							 od.title as delivery,
							 op.title as payment,
							 ow.title as weight
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
               where o.id = $2`,
				[user_id, order_id, role]
			);
			return rows[0];
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
							 od.title as delivery,
							 op.title as payment,
							 ow.title as weight
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
               where o.id = $1`,
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
         where ${role == "ADMIN" ? " o.status = 1 or o.status = 2": "o.status = 2"}
         order by o.status = 1 desc, o.created_at desc`;
			const { rows } = await client.query(queryString, [id]);
			return rows;
		} catch (error) {
			return error;
		} finally {
			client.release();
		}
	}

	async getTemplates(id){
		const client = await this.db.connect();
		try {
			const {rows} = await client.query(`
			select
				o_f.*,
				json_agg(o_c.*) as order_categories,
				json_agg(o_t.*) as order_types,
				json_agg(o_d.*) as order_deliveries,
				json_agg(o_p.*) as order_payments,
				json_agg(o_w.*) as order_weights
			from order_fields o_f
			cross join order_categories o_c
			cross join order_types o_t
			cross join order_deliveries o_d
			cross join order_payments o_p
			cross join order_weights o_w
			where o_f.id = $1
			group by o_f.id
			`, [id])
			return rows[0]
		} catch (error) {
			return error
		} finally {
			client.release()
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
            ot.title as order_type
         from orders as o 
         inner join order_status as os 
         on os.id = o.status
         inner join order_types as ot
         on o.order_type = ot.id 
         where o.status = 2 and o.order_type = $1
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
					status === 2 || status === 1
						? "Заявка успешно принять!"
						: "Заявка отклонен!",
			};
		} catch (error) {
			return error;
		} finally {
			client.release();
		}
	}
}

export default OrderHandlers;
