const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

//******************consulta cidades *************/
router.post('/', login, (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            console.error('Erro ao obter conexão:', error);
            return res.status(500).send({ error: error });
        }

        try {
            if (!req.body.POLO) {
                conn.release();
                return res.status(400).send({
                    message: 'O parâmetro POLO é obrigatório e não pode ser vazio'
                });
            }

            const perfilField = `perfil${req.body.POLO}`;

            console.log(`Consultando cidades para o polo: ${req.body.POLO}, campo: ${perfilField}`);

            const query = `SELECT IDCIDADES, CIDADE,
                COALESCE(NULLIF(TRIM(POSTES), ''), 'Indefinido') AS POSTES
                FROM TST.cidades WHERE ${perfilField} = 1`;

            conn.query(query, (error, resultado, fields) => {
                conn.release();

                if (error) {
                    console.error('Erro na consulta:', error);
                    return res.status(500).send({ error: error });
                }

                if (resultado.length === 0) {
                    return res.status(404).send({
                        message: 'Nenhuma cidade encontrada para este polo'
                    });
                }

                return res.status(200).send({ response: resultado });
            });
        } catch (error) {
            conn.release();
            console.error('Erro na execução:', error);
            return res.status(500).send({ error: error });
        }
    });
});

module.exports = router;
