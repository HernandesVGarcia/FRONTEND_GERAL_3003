const util = require('util');
const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

router.post('/', login, async (req, res, next) => {
    console.log('🗺️ Plotando cliente cadastrado...');

    const {     
        ID_CLIENTE,
        SIGLA,
        id_city,
        id_condominio,
        LAT,
        LNG,
        STATUS,
        ID_PROJETISTA
    } = req.body;

    const GPON = 1;
    const Tipo_objeto = 'POP';
    const CONVENCIONAL = 0;
    const TAMANHO = 1; //tamanho=1 para cliente

    const temCoordenadas = LAT && LNG && LAT !== '' && LNG !== '' && LAT !== '0.0000000000000' && LNG !== '0.0000000000000';

    const getConnectionAsync = util.promisify(mysql.getConnection).bind(mysql);
    let conn;

    try {
        conn = await getConnectionAsync();
        const queryAsync = (sql, params) => new Promise((resolve, reject) => {
            conn.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
        });

        

        // Com coordenadas: transação
        const beginTransactionAsync = util.promisify(conn.beginTransaction).bind(conn);
        const commitAsync = util.promisify(conn.commit).bind(conn);
        const rollbackAsync = util.promisify(conn.rollback).bind(conn);

        await beginTransactionAsync();

        try {
            // 1️⃣ INSERT em tstmeta.ids (gera ID_META)
            const queryID = `INSERT INTO tstmeta.ids (Tipo_objeto, id_city, id_condominio) VALUES (?, ?, ?)`;
            const resultadoID = await queryAsync(queryID, [Tipo_objeto, id_city, id_condominio]);
            const ID_META = resultadoID.insertId;
            console.log('✅ ID_META gerado:', ID_META);

            const geometriaMapWinGIS = converterParaMapWinGIS(LAT, LNG);

            // 2️⃣ INSERT em tst.estações
            const queryEST = `UPDATE tst.estações SET ID_META = ? WHERE id_estacao = ?`;                 
                
            await queryAsync(queryEST, [ID_META, ID_CLIENTE]);
            console.log('✅ tst.estações atualizado com ID_META:', ID_META);

            // 3️⃣ INSERT em tstmeta.pop
            const queryPOP = `INSERT INTO tstmeta.pop 
                (sigla, id_visio, id_meta, id_city, id_condominio, Layer_PON, Layer_CONV, LAT, LNG, TAMANHO, STATUS, id_estacao, GEOMETRIA_LAT_LONG, projetista, data) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`;
            await queryAsync(
                queryPOP,
                [SIGLA, ID_META, ID_META, id_city, id_condominio, GPON, CONVENCIONAL, LAT, LNG, TAMANHO, STATUS, ID_CLIENTE, geometriaMapWinGIS, ID_PROJETISTA]
            );

            await commitAsync();
            console.log('✅ Cliente inserido com sucesso! ID_META:', ID_META);

            return res.status(200).send({
                success: true,
                message: 'Cliente plotado com sucesso',
                id_meta: ID_META,
                id_estacao: ID_CLIENTE
            });
        } catch (err) {
            await rollbackAsync();
            throw err;
        }
    } catch (error) {
        console.error('Erro ao plotar cliente:', error);
        if (res.headersSent) return;
        return res.status(500).send({ error: error.message || 'Erro ao processar requisição' });
    } finally {
        if (conn) conn.release();
    }
});

/**
 * Converte coordenadas do Google Maps para formato MapWinGIS
 * Formato: 1;lng|lat|
 */
function converterParaMapWinGIS(LATI, LONGI) {
    if (!LATI || LATI.length === 0) {
        return null;
    }
    const prefixoMapWinGIS = '1;';
    const geometria = `${LONGI}|${LATI}`;
    return `${prefixoMapWinGIS}${geometria}|`;
}

module.exports = router;
