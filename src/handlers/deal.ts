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
         // const {rows} = await client.query(`
         // select 
         //    d.*,
         //    json_agg(o_f.*) as order_from_arr,
         //    json_agg(o_t.*) as order_to_arr,
         //    ds.title as status_title,
         //    ds.color as status_color,
         //    case when d.user_from = $2 then true else false end as own
         // from deals d 
         //    inner join deal_status ds 
         //    on ds.id = d.status 
         //    inner join orders o_f
         //    on d.order_from = o_f.id
         //    inner join orders o_t
         //    on d.order_to = o_t.id
         // where d.id = $1
         //    group by d.id,
         //    ds.title,
         //    ds.color
         // `, [deal_id, user_id])
         const deal = await client.query(`
            select 
            d.*, 
            ds.title as status_title, 
            ds.color as status_color,
            case when d.user_from = $2 then true else false end as own
            from deals d 
            inner join deal_status ds 
            on ds.id = d.status 
            where d.id = $1`, [deal_id, user_id])
         const orders = await client.query(`
            select
            orders.*,
            o_t.title as order_type,
            o_c.title as category,
            o_d.title as delivery,
            o_p.title as payment,
            o_w.title as weight,
            case when orders.user_id = $2 then true else false end as own
            from orders 
            inner join order_types o_t
            on orders.order_type = o_t.id
            inner join deals d
            on d.id = $1
            inner join order_categories o_c
            on orders.category = o_c.id
            inner join order_deliveries o_d
            on orders.delivery = o_d.id
            inner join order_payments o_p
            on orders.payment = o_p.id
            inner join order_weights o_w
            on orders.weight = o_w.id
            where orders.id = d.order_from or orders.id = d.order_to 
            order by orders.created_at desc`, [deal_id, user_id])
         return {
            orders:orders.rows,
            deal:deal.rows[0]
         }
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