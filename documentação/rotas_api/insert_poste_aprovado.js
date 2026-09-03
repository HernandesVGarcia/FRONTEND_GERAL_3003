const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

function executarQuery(conn, query, params) {
    return new Promise((resolve, reject) => {
        conn.query(query, params, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

function obterConexao() {
    return new Promise((resolve, reject) => {
        mysql.getConnection((error, connection) => {
            if (error) {
                console.error('Erro ao obter conexão:', error);
                reject(error);
            } else {
                resolve(connection);
            }
        });
    });
}

function validarDadosEntrada(body) {
    const idCity = body.id_city;
    const numSeqGeo = body.NUM_SEQ_GEO;
    const origem = body.ORIGEM;
    const lati = body.LATI ?? body.LAT;
    const longi = body.LONGI ?? body.LONG ?? body.LNG;

    if (idCity === undefined || idCity === null || idCity === '') {
        throw new Error('Campo obrigatório faltando: id_city');
    }
    if (numSeqGeo === undefined || numSeqGeo === null || numSeqGeo === '') {
        throw new Error('Campo obrigatório faltando: NUM_SEQ_GEO');
    }
    if (origem === undefined || origem === null || String(origem).trim() === '') {
        throw new Error('Campo obrigatório faltando: ORIGEM');
    }
    if (lati === undefined || lati === null || lati === '' || Number.isNaN(Number(lati))) {
        throw new Error('Campo obrigatório inválido: LAT ou LATI');
    }
    if (longi === undefined || longi === null || longi === '' || Number.isNaN(Number(longi))) {
        throw new Error('Campo obrigatório inválido: LONG, LONGI ou LNG');
    }
    if (Number.isNaN(Number(idCity))) {
        throw new Error('id_city deve ser numérico');
    }
    if (Number.isNaN(Number(numSeqGeo))) {
        throw new Error('NUM_SEQ_GEO deve ser numérico');
    }

    return {
        id_city: Number(idCity),
        NUM_SEQ_GEO: Number(numSeqGeo),
        obs: body.obs != null && String(body.obs).trim() !== '' ? String(body.obs) : '-',
        LATI: Number(lati),
        LONGI: Number(longi),
        ORIGEM: String(origem).trim(),
    };
}

router.post('/', login, async (req, res) => {
    console.log('executou insert poste aprovado (async/await)');

    let conn;

    try {
        const dados = validarDadosEntrada(req.body);
        conn = await obterConexao();

        const query = `
            INSERT INTO tstmeta.postes_aprovados_parana
                (id_city, NUM_SEQ_GEO, obs, LATI, LONGI, ORIGEM)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const resultado = await executarQuery(conn, query, [
            dados.id_city,
            dados.NUM_SEQ_GEO,
            dados.obs,
            dados.LATI,
            dados.LONGI,
            dados.ORIGEM,
        ]);

        if (!resultado.affectedRows) {
            return res.status(404).send({
                success: false,
                message: 'Nenhum registro inserido',
            });
        }

        const insertId = resultado.insertId;
        console.log(`Poste aprovado inserido: ID ${insertId}, NUM_SEQ_GEO ${dados.NUM_SEQ_GEO}`);

        return res.status(200).send({
            success: true,
            insertId,
            NUM_SEQ_GEO: dados.NUM_SEQ_GEO,
            message: 'Poste aprovado inserido com sucesso',
            affectedRows: resultado.affectedRows,
        });
    } catch (error) {
        console.error('Erro ao inserir poste aprovado:', error);

        if (error.message && (
            error.message.includes('Campo obrigatório') ||
            error.message.includes('deve ser numérico')
        )) {
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).send({
            success: false,
            error: error.message || error,
        });
    } finally {
        if (conn) {
            conn.release();
        }
    }
});

module.exports = router;
