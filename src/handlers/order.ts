'use strict'
import * as bcrypt from 'bcrypt'

class OrderHandlers {
   
   constructor (readonly db, readonly jwt) {
      this.db = db
      this.jwt = jwt
   }

   async createOrder (order_type,  title,price, amount, cost, user_id){
      const client = await this.db.connect()
      try {
         await client.query(`insert into orders (order_type, title, status, price, amount, cost,  user_id) values ($1, $2, $3, $4, $5, $6, $7)`, 
            [order_type, title, 1, price, amount, cost, user_id])
         return {
            message: 'Заявка успешно создано!'
         }
      } catch (error) {
         return error
      } finally {
         client.release() 
      }
   }

   async getMyOrderList (type, user_id){
      const client = await this.db.connect()
      try {
         const orders = await client.query(`
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
            [type, user_id])
         return orders.rows
      } catch (error) {
         return error
      } finally {
         client.release() 
      }
   }

   async getOrderById (user_id, order_id, role) {
      const client = await this.db.connect()
      try {
         const {rows} = await client.query(`
            select 
               o.*, 
               to_char("created_at", 'DD.MM.YYYY') as created_at,
               ot.title as order_type_title,
               case when o.user_id = $1 or $3 = 'ADMIN' then true else false end as own,
               os.title as status_title,
               os.color as status_color
               from orders as o
               inner join order_types as ot
               on o.order_type = ot.id 
               inner join order_status as os
               on o.status = os.id
               where o.id = $2`, [user_id, order_id, role])
         return rows[0]
      } catch (error) {
         return error
      } finally {
         client.release() 
      }
   }

   async getAllOrderList (role, id){
      const client = await this.db.connect()
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
         ${role == 'ADMIN' ? 'where o.status = 1 or o.status = 2':'where o.status = 2'}
         order by o.status = 1 desc, o.created_at desc`
         const {rows} = await client.query(queryString, [id])
         return rows
      } catch (error) {
         return error
      } finally {
         client.release() 
      }
   }

   async sendOfferOrder (user_id, user_to, order_from, order_to) {
      const client = await this.db.connect()
      try {
         await client.query(`
            insert into offers (user_from, user_to, order_from, order_to, status) 
            values($1, $2, $3, $4, $5)`, 
            [user_id, user_to, order_from, order_to, 1])
         return {
            message: 'Предложение успешно отправлен!'
         }
      } catch (error) {
         return error
      } finally{
         client.release()
      }
   }

   async getOffers(user_id) {
      const client = await this.db.connect()
      try {
         const {rows} = await client.query(`
            select
            (select title from orders where user_id = user_from and id = order_from) as title_order_from,
            (select title from orders where user_id = user_to and id = order_to) as title_order_to,
            case when user_from = $1 then true else false end as own,
            *
            from offers
            where user_from = $1 or user_to = $1
         `, [user_id])
         return rows
      } catch (error) {
         return error
      } finally {
         client.release()
      }
   }
   
   async updateOrderStatus(order_id, status) {
      const client = await this.db.connect()
      try {
         await client.query('update orders set status = $2 where id = $1', [order_id, status])
         return {
            message: status === 2 || status === 1 ? 'Заявка успешно принять!':'Заявка отклонен!'
         }
      } catch (error) {
         return error
      } finally {
         client.release()
      }
   }
}

export default OrderHandlers