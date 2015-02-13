pg= require("pg") ;

client1 = new pg.Client({
    user: "cgcgwtedcgbfkd",
    password: "nav_Q8SwSCX0DECQN8Lwk7Ofbe",
    database: "d20ki4isijkr05",
    port: 5432,
    host: "ec2-54-235-250-41.compute-1.amazonaws.com",
    ssl: true
}); 
//client1.onC
//client1.connect() 
user = {
  "name":        "jdoe",
  "email":       "jdoe@foobar.com",
  "user_id":     "foobar.com|0123456789",
  "nickname":    "jdoe",
  "picture":     "http://foobar.com/pictures/jdoe.png"
}

  pg.connect(
    "postgres://cgcgwtedcgbfkd:nav_Q8SwSCX0DECQN8Lwk7Ofbe@ec2-54-235-250-41.compute-1.amazonaws.com:5432/d20ki4isijkr05?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory"
    , function(err, client) {
      if( err ) console.log( err ) ; 
      //return ; 
     // console.log( "ok" ,  client)
        var query = client.query('SELECT * FROM users');
      //  console.log( "Query " , query ) ; 
        query.on('row', function(row) {
          console.log( row.mail)
          if( row.mail == user.email )
          console.log("oooouiii");
        });
      });
 
