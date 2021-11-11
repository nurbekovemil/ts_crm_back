'use strict'

class DealHandlers {
   
   constructor (readonly db, readonly jwt) {
      this.db = db
      this.jwt = jwt
   }

   async createDeal (user_id, user_to, order_from, order_to) {
      const client = await this.db.connect()
      try {
         await client.query(`
            insert into deals (user_from, user_to, order_from, order_to, status) 
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

   async getDeals(user_id, status) {
      const client = await this.db.connect()
      try {
         const {rows} = await client.query(`
         select
         (select title from orders where user_id = user_from and id = order_from) as title_order_from,
         (select title from orders where user_id = user_to and id = order_to) as title_order_to,
         case when user_from = $1 then true else false end as own,
         user_from, user_to, order_from, order_to, deals.id,
         to_char("created_at", 'DD.MM.YYYY') as created_at,
         status,
         deal_status.title as status_title,
         deal_status.color as status_color
         from deals 
         inner join deal_status on status = deal_status.id
         where ${status == 2 ? '(status = 2 or status = 4)':'(status = 1 or status = 3)'} and (user_from = $1 or user_to = $1)
         order by created_at desc
         `, [user_id])
         return rows
      } catch (error) {
         return error
      } finally {
         client.release()
      }
   }
   
   async getDealById(deal_id, user_id){
      const client = await this.db.connect()
      try {
         const {rows} = await client.query(`
            select 
               d.*, 
               u_f.username as user_from_name,
               u_t.username as user_to_name,
               ds.title as status_title, 
               ds.color as status_color,
               o_f.order_type as order_type_from,
               o_t.order_type as order_type_to,
               case when d.user_from = $2 then true else false end as own
            from deals d 
               inner join deal_status ds 
               on ds.id = d.status 
               inner join users u_f
               on d.user_from = u_f.id 
               inner join users u_t
               on d.user_to = u_t.id
               inner join orders o_f
               on o_f.id = d.order_from
               inner join orders o_t
               on o_t.id = d.order_to
            where d.id = $1`, [deal_id, user_id])
         return rows[0]
      } catch (error) {
         return error
      } finally {
         client.release()
      }
   }

   async getDealOrders(order_from, order_to, user_id) {
      const client = await this.db.connect()
      try {
         let queryString = order_to ? `o.id = ${order_from} or o.id = ${order_to}` : `o.id = ${order_from}`
         const {rows} = await client.query(`
         select 
         o.* ,
            to_char(o.created_at, 'DD.MM.YYYY') as created_at,
            case when o.user_id = $1 then true else false end as own,
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
            where ${queryString}
            `, [user_id])
         return rows
      } catch (error) {
         return error
      } finally {
         client.release()
      }
   }

   async updateDealStatus(status, deal_id){
      const client = await this.db.connect()
      try {
         await client.query('update deals set status = $1 where id = $2', [status, deal_id])
         return {
            message: status == 2 || status == 1 ? 'Предложение принято!' : 'Предложение отклонен!'
         }
      } catch (error) {

         return error
      } finally{
         client.release()
      }
   }
}



export default DealHandlers