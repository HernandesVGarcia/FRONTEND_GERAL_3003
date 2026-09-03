const express = require ('express');
const router =  express.Router();
const mysql = require ('../mysql').pool;
const login = require ('../middleware/login');







//******************consulta caixa *************/
router.post('/',login,(req, res, next) => {
     const cx =req.body

    mysql.getConnection((error,conn) =>{
        if (error) { return res.status(500).send ({ error: error})}
        conn.query ( 'SELECT tstmeta.caixa.id_meta,numero,LAT,LONGI, tstmeta.caixa.ID_TIPO FROM caixa, TSTMETA.caixa where idCIDADES = ? AND tstmeta.caixa.ID_TIPO>9 and tstmeta.caixa.conta_splitter>0 and tstmeta.caixa.id_meta=tst.caixa.id_meta;',
                [req.body.idCIDADES],
                (error,resultado,fields) => {
                conn.release();    
                if (error) { return res.status(500).send({error:error}) }
                //conn.release();
                return res.status(200).send({response: resultado})
            }
        
        )
    })

    
        
    });
       







module.exports = router;