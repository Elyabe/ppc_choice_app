
module.exports = {
     getRecords: function(query, callback) {   
        const pg = require('pg');        
        
        let pool = new pg.Pool({
                connectionString: process.env.DATABASE_URL,
            });
 
        pool.connect()
            .then( client => {
                
                client.query( query )
                    .then( result => {
                        client.release()
                        callback( result )
                    }) 
                    .catch(e => console.error(e.stack)) 
            })
            
        pool.end( ()=> {console.log('[OK] Request dabase accepted')}) 
  }
}