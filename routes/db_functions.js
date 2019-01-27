
module.exports = {
     getRecords: function(query, callback) {   
        const pg = require('pg');        
        
        let pool = new pg.Pool({
                connectionString: process.env.DATABASE_URL_POST,
            });
 
        pool.connect()
            .then( client => {
                
                client.query( query )
                    .then( result => {
                        client.release()
                        // console.log( result.rows )
                        callback( result )
                        // res.render('index', { title: 'Seus putos', cursos : result_curso } )
                        // res.render('pages/home_construcao', { title: 'Seus putos', data : result.rows } )
                        // res.send( result.rows )
                        // return result.rows;
                    }) 
                    .catch(e => console.error(e.stack)) 
                    .then(() => client.end(console.log('Conexao fechada')))
            })
            
        pool.end( ()=>{console.log("pool finalizado")} ) 
  }
}