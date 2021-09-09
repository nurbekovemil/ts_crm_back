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
         const order = await client.query(`insert into orders (order_type, title, status, price, amount, cost,  user_id) values ($1, $2, $3, $4, $5, $6, $7)`, 
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

   async getAllOrderList (type, user_id){
      const client = await this.db.connect()
      try {
         const orders = await client.query(`
            select 
               o.id, 
               o.title, 
               os.title as status, 
               o.date 
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

   async getOrderById (user_id, order_id) {
      const client = await this.db.connect()
      try {
         const {rows} = await client.query(`
            select 
               O.*, 
               OT.title as order_type_title,
               case when O.user_id = $1 then 'true' else 'false' end as own
               from orders as O 
               inner join order_types as OT
               on O.order_type = OT.id 
               where O.id = $2`, [user_id, order_id])
         return rows[0]
      } catch (error) {
         return error
      } finally {
         client.release() 
      }
   }
   
}

export default OrderHandlers