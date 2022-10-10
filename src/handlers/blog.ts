"use strict";
const fs = require("fs");
const path = require("path");
class BlogHandlers {
  constructor(readonly db) {
    this.db = db;
  }

  async createBlog({ id }, { title, description }, { blogs }) {
    const client = await this.db.connect();
    try {
      console.log(blogs);
      const { rows } = await client.query(
        `
        insert into blogs (title, description, user_id) values ($1, $2, $3) returning id
      `,
        [title, description, id]
      );
      blogs != undefined &&
        (await blogs.map(
          async ({ path }) =>
            await client.query(
              "insert into blog_files (blog_id, path) values ($1, $2)",
              [rows[0].id, path]
            )
        ));
      return {
        message: "Опубликовано!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
  async getBlogById({ id }) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `
      select
      b.title,
      b.description,
      to_char(b.created_at, 'YYYY-MM-DD, HH24:MI') as created_at,
      jsonb_agg(distinct bf.*) as images
      from blogs b
      left join blog_files bf on bf.blog_id = b.id
      where b.id = $1
      group by b.title, b.description, b.created_at
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
  async getBlogList() {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(`
      select
      b.id,
      b.title,
      b.description,
      u.username,
      to_char(b.created_at, 'YYYY-MM-DD, HH24:MI') as created_at
      from blogs b
      inner join users u on u.id = b.user_id
      order by b.created_at desc
      `);
      return rows;
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
  async deleteBlogById({ id }) {
    const client = await this.db.connect();
    try {
      const { rows } = await client.query(
        `
        delete from blog_files where blog_id = $1 returning path
      `,
        [id]
      );
      rows.map(({ path }) => {
        fs.unlink(path, function (err) {
          if (err) throw err;
        });
      });
      await client.query(
        `
        delete from blogs where id = $1
      `,
        [id]
      );
      return {
        message: "Публикация удален!",
      };
    } catch (error) {
      return error;
    } finally {
      client.release();
    }
  }
}

export default BlogHandlers;
