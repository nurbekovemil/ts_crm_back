'use strict'

class OrderHandlers {
	constructor(readonly db, readonly jwt) {
		this.db = db;
		this.jwt = jwt;
	}

	async createOrder({type, payment, delivery, weight, category, description, title, price, amount, cost},{id},files) {
		const client = await this.db.connect();
		try {
			const {rows} = await client.query(
				` insert into orders (order_type, payment, delivery, weight, category, description, title, price, amount, cost, status, user_id) 
					values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id, order_type
				`,
				[type, payment, delivery, weight, category, description, title, price, amount, cost, 1, id]
			);

			return rows[0]
				
		} catch (error) {
			return error;
		} finally {
			client.release();
		}
	}

	async createImage (files, id) {
		const client = await this.db.connect();
		try {
			files.map(item => {
				let path = `/${item.destination}/${item.filename}`
				client.query('insert into path_images (order_id, path) values ($1, $2)', [id, path])
			})
		} catch (error) {
			return error
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

	async getOrderByIdPrivate(user_id, order_id) {
		const client = await this.db.connect();
		try {
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
												inner join path_images as img
												on o.id = img.order_id
											 where o.id = $2
								 GROUP BY o.id, ot.title, os.title,
											 oc.title,
											 oc.id,
											 od.title ,
											 od.id ,
											 op.title ,
											 op.id ,
											 ow.title,
											 ow.id `,
				[user_id, order_id]
			);
			return rows
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
							 inner join path_images as img
							 on o.id = img.order_id
               where o.id = $1
							 group by 
							 o.id, 
               ot.title,
               os.title,
							 oc.title,
							 oc.id,
							 od.title,
							 op.title,
							 ow.title
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

	async getOptions(option){
		const client = await this.db.connect();
		try {
			const {rows} = await client.query(`select * from ${option}`)
			return rows
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
				ot.title as order_type,
				jsonb_agg(img.*) as images
				from orders as o 
				inner join order_status as os 
				on os.id = o.status
				inner join order_types as ot
				on o.order_type = ot.id 
				inner join path_images as img
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
				ot.title
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
