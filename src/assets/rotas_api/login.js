const express = require ('express');
const router =  express.Router();
const mysql = require ('../mysql').pool;
const bcrypt = require ('bcrypt');
const jwt = require ('jsonwebtoken');
//const envkey= require ('../nodemon.json').env;

const saltRounds = 10;

router.post('/cadastro',(req,res,next) => {
    
    mysql.getConnection((err, conn) => {
        if (err) { return res.status(500).send({error: error})}

        bcrypt.hash(req.body.senha,saltRounds,(errBcrypt,hash) => {
            if (errBcrypt) {return res.status(500).send ({error:errBcrypt})}

            conn.query('insert into usuarios_api (chave,senha) Values (?,?)',
                [req.body.chave,hash],
                (error, results) => {
                    conn.release();

                    if (error) {return res.status(500).send({ error: error})}

                    response = {mensagem: 'Usuario criado com sucesso',
                        usuarioCriado: {
                            id_usuario: results.insertId,
                            chave: req.body.chave
                            
                            
                        }
                        }
                    return res.status(201).send(response) ;                       
                    })
                    
                
                
                }            

            )
        })
    });

router.post('/login',(req,res,next) => {


    mysql.getConnection((error,conn) => {
        if (error) { return res.status(500).send({error:error})}

        const query ='select * from usuarios_api where chave = ?' ;

        conn.query(query,[req.body.chave],(error,results,fields) => {
            if (error) {
                conn.release();
                return res.status(500).send({error: error}); 
            }

            if (results.length <1) {
                conn.release();
                return res.status(401).send({mensagem: 'Falha na autenticação'})
            }
            bcrypt.compare(req.body.senha,results[0].senha,(err,result) => {
                if (err) {
                    conn.release(); //inserido em 16/07/25
                    return res.status(410).send({mensagem: 'Falha na autenticação' })
                }
                if (result) {

                   // Marcar usuário como online no login
                   const updateQuery = `
                   UPDATE usuarios_api 
                   SET online = 1, last_seen = NOW() 
                   WHERE id_usuario = ?
               `;
               
               conn.query(updateQuery, [results[0].id_usuario], (updateError) => {
                   conn.release();
                   
                   if (updateError) {
                       console.error('Erro ao marcar usuário online:', updateError);
                   }
                   
                   const token = jwt.sign({
                       id_usuario: results[0].id_usuario,
                       chave: results[0].chave
                   }, 
                   process.env.JWT_KEY, 
                   {expiresIn: "365d"});
                   
                   return res.status(200).send({
                       mensagem: 'Autenticado com sucesso',
                        token:token,
                        polo: results[0].polo,
                        lat: results[0].lat,
                        lng: results[0].lng,
                        ceo_layer:results[0].ceo_layer,
                        cto_layer:results[0].cto_layer,
                        clientes_layer:results[0].clientes_layer,
                        menu_on:results[0].menu_ON,
                        cabos_layer:results[0].cabos_layer,
                        IDUSER:results[0].IDUSER
                        
                     });
                 })  
                }else{
                return res.status(401).send({mensagem:'Falha na autenticação'})
                }
            });
        
          });
    });
});






module.exports=router;

