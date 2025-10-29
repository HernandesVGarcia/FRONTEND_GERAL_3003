const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

//******************atualizar coordenadas das bocas *************/
router.post('/', login, (req, res, next) => {
   // const { boca, ID_META, X, Y } = req.body;
    console.log('executou update');

  
    
    const { Tipo_objeto, id_city, id_condominio } = req.body;
    
  
    
    
    mysql.getConnection((error, conn) => {
        if (error) { 
            console.error('Erro ao obter conexão:', error);
            return res.status(500).send({ error: error });
        }

        
        
        // Query SQL dinâmica
        //const query = `UPDATE tstmeta.splitter_e SET X = ?, Y = ? WHERE IDMETA = ?`;

        const query = `INSERT INTO tstmeta.ids (Tipo_objeto,id_city,id_condominio) VALUES (?,?,?)`;
               
       /* console.log(`Query: ${query}`);*/

        try {
            conn.query(
                query,
                [Tipo_objeto, id_city, id_condominio],
                (error, resultado, fields) => {
                    // Sempre liberar a conexão
                    conn.release();

                    if (error) {
                        console.error('Erro na query:', error);
                        return res.status(500).send({ error: error });
                    }

                    // Verificar se algum registro foi afetado
                    if (resultado.affectedRows === 0) {
                        console.log('Nenhum registro inserido:');
                        return res.status(404).send({ 
                            message: 'Inconsistencia nos dados' 
                        });
                    }

                    
                    
                    return res.status(200).send({ 
                        response: resultado,
                        message: `Objeto idmeta inserido com sucesso`,
                        affectedRows: resultado.affectedRows
                    });
                }
            );
        } catch (error) {
            // Garantir que a conexão seja liberada mesmo em caso de erro na execução
            conn.release();
            console.error('Erro na execução:', error);
            return res.status(500).send({ error: error });
        }
    });
});

module.exports = router;