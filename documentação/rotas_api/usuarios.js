const express = require ('express');
const router =  express.Router();
const mysql = require ('../mysql').pool;
const bcrypt = require ('bcrypt');
const jwt = require ('jsonwebtoken');
//const envkey= require ('../nodemon.json').env;

const saltRounds = 10;

router.post('/cadastro',(req,res,next) => {

    bcrypt.hash(req.body.senha, saltRounds, (errBcrypt, hash) => {
        if (errBcrypt) {
            return res.status(500).send({ error: errBcrypt });
        }

        mysql.getConnection((err, conn) => {
            if (err) { return res.status(500).send({error: err})}

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
        })
    });
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

            const usuario = results[0];
            conn.release();

            bcrypt.compare(req.body.senha, usuario.senha, (err, result) => {
                if (err) {
                    return res.status(410).send({mensagem: 'Falha na autenticação' })
                }
                if (!result) {
                    return res.status(401).send({ mensagem: 'Falha na autenticação' });
                }

                mysql.getConnection((error2, conn2) => {
                    if (error2) {
                        return res.status(500).send({ error: error2 });
                    }

                   const updateQuery = `
                   UPDATE usuarios_api 
                   SET online = 1, last_seen = NOW() 
                   WHERE id_usuario = ?
               `;
               
               conn2.query(updateQuery, [usuario.id_usuario], (updateError) => {
                   conn2.release();
                   
                   if (updateError) {
                       console.error('Erro ao marcar usuário online:', updateError);
                   }
                   
                   const token = jwt.sign({
                       id_usuario: usuario.id_usuario,
                       chave: usuario.chave
                   }, 
                   process.env.JWT_KEY, 
                   {expiresIn: "365d"});
                   
                   return res.status(200).send({
                       mensagem: 'Autenticado com sucesso',
                        token:token,
                        polo: usuario.polo,
                        lat: usuario.lat,
                        lng: usuario.lng,
                        ceo_layer:usuario.ceo_layer,
                        cto_layer:usuario.cto_layer,
                        clientes_layer:usuario.clientes_layer,
                        menu_on:usuario.menu_ON,
                        cabos_layer:usuario.cabos_layer,
                        IDUSER:usuario.IDUSER
                     });
                 });
                });
            });
        
          });
    });
});






module.exports=router;

