"use strict";

class CatalogHandlers {
	constructor(readonly db) {
		this.db = db;
	}
	async getTnvedCategories(page) {
		const client = await this.db.connect();
		try {
         let limit = 10;
         let offset = limit*page
			//   const queryString = `where ${parent == undefined?  `COALESCE(tnved.parent, '') = ''` : `tnved.parent = ${parent}`}`
			const { rows } = await client.query(`
         SELECT 
            tnved_lang.id, 
            tnved.parent,
            tnved_lang.title as name
         FROM tnved 
         inner join tnved_lang on tnved.id = tnved_lang.id
         where ${page <= 1 ? `tnved_lang.id < '${limit}'`: `tnved_lang.id >= '${offset-limit}' and tnved_lang.id < '${offset==100?'99':offset}'` }
         order by tnved.id asc
         `);
         if(rows.length > 0){
            const idMapping = rows.reduce((acc, el, i) => {
               acc[el.id] = i;
               return acc;
            }, {});
             let root = [];
             rows.forEach(el => {
               // Handle the root element
               if (el.parent === "") {
                 root.push(el);
                 return;
               }
               // Use our mapping to locate the parent element in our data array
               const parentEl = rows[idMapping[el.parent]];
               // Add our current el to its parent's `children` array
               parentEl.children = [...(parentEl.children || []), el];
             });
            return root
         }
		} catch (error) {
			return error;
		} finally {
			client.release();
		}
	}
}

export default CatalogHandlers;
