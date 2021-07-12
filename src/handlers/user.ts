'use strict'
import * as bcrypt from 'bcrypt'

class UserHandlers {
   
   constructor (readonly db, readonly jwt) {
      this.db = db
      this.jwt = jwt
   }

   async userLogin(username, password){
      const client = await this.db.connect()
      try {
         const user = await client.query('select * from users where username = $1', [username])
         if(user.rowCount == 0) {
            throw new Error(`Пользователь ${username} не найден!`)
         }
         const comparePassword: boolean = await bcrypt.compare(password, user.rows[0].password)
         if(!comparePassword){
            throw new Error('Не верный пароль')
         }
         const token = await this.jwt.sign({id: user.rows[0].id})
         return {
            username: user.rows[0].username, 
            token
         }
      } catch (error) {
         return error
      }
   }

   async userCreate(username, password){
      const client = this.db.connect()
      try {
         const user = await client.query('select username from users where username = $1', [username])
         if(user.rowCount > 0) {
            throw new Error(`Пользователь ${username} уже существует!`)
         }
         const hashPassword: string = await bcrypt.hash(password, 5)
         await client.query('insert into users (username, password) values ($1, $2)', [username, hashPassword])
         return {
            message: `Пользователь ${username} успешно создан!`
         }
      } catch (error) {
         return error
      }
   }

   async userGetMe (id) {
      const client = await this.db.connect()
      try {
         const user = await client.query('select * from users where id = $1', [id])
         if(user.rowCount == 0) {
            throw new Error('Произошла ошибка при получении данных пользователя!')
         }
         const userMenu = await client.query('select * from menus where $1 = any(role)', [user.rows[0].role])
         return {
            user:{
               username: user.rows[0].username,
               role: user.rows[0].role
            },
            menus:userMenu.rows
         }
      } catch (error) {
         return error
      }
   }

   async userUpdate(id, username, password){
      const client = this.db.connect()
      try {

         const hashPassword = bcrypt.hash(password, 5)
         await client.query('update users set username = $1, password = $2 where id = $3', [username, hashPassword, id], (err) => {
            if(err){
               throw new Error('Ошибка при обновлении')
            }
         })
         return {message: 'Данные успешно обновлены!'}
      } catch (error) {
         return error
      }
   }

   async userDelete(id){
      const client = this.db.connect()
      try {
         await client.query('delete from users where id = $1', [id], (err) => {
            if(err) {
               throw new Error('Ошибка при удалении!')
            }
         })
         return {message: 'Пользовател успешно удален!'}
      } catch (error) {
         return error
      }
   }

   async userGetAllList(limit, offset){
      const client = await this.db.connect()
      try {
         const {rows} = await client.query('select id, username from users limit $1 offset $2', [limit, offset])
         return rows
      } catch (error) {
         return error
      }
   }

}

export default UserHandlers