const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

const TABELA_POSTES_REGEX = /^[a-zA-Z0-9_]+$/;
const TABELA_POSTES_PADRAO = 'postes_parana';

function parseNumero(raw, fieldName) {
    const value = Number.parseFloat(String(raw));
    if (!Number.isFinite(value)) {
        return { error: fieldName };
    }
    return { value };
}

function parsePostes(raw) {
    if (raw === undefined || raw === null || String(raw).trim() === '') {
        return { error: 'POSTES' };
    }
    return { value: String(raw).trim() };
}

function executarQuery(conn, query, params) {
    return new Promise((resolve, reject) => {
        conn.query(query, params, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(result);
        });
    });
}

function obterConexao() {
    return new Promise((resolve, reject) => {
        mysql.getConnection((error, connection) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(connection);
        });
    });
}

function isPostesIndefinido(valor) {
    const texto = String(valor ?? '').trim();
    return texto === '' || texto.toLowerCase() === 'indefinido';
}

function resolverTabelaPostes(valor) {
    const texto = String(valor ?? '').trim();
    if (isPostesIndefinido(texto)) {
        return TABELA_POSTES_PADRAO;
    }
    return texto;
}

router.post('/', login, async (req, res) => {
    const postes = parsePostes(req.body?.POSTES);
    if (postes.error) {
        return res.status(400).send({
            error: {
                code: 'BAD_REQUEST',
                message: 'Parâmetro POSTES é obrigatório.',
            },
        });
    }

    const latMax = parseNumero(req.body?.LAT_MAX, 'LAT_MAX');
    if (latMax.error) {
        return res.status(400).send({
            error: {
                code: 'BAD_REQUEST',
                message: 'Parâmetro LAT_MAX é obrigatório e deve ser numérico.',
            },
        });
    }

    const latMin = parseNumero(req.body?.LAT_MIN, 'LAT_MIN');
    if (latMin.error) {
        return res.status(400).send({
            error: {
                code: 'BAD_REQUEST',
                message: 'Parâmetro LAT_MIN é obrigatório e deve ser numérico.',
            },
        });
    }

    const longMax = parseNumero(req.body?.LONG_MAX, 'LONG_MAX');
    if (longMax.error) {
        return res.status(400).send({
            error: {
                code: 'BAD_REQUEST',
                message: 'Parâmetro LONG_MAX é obrigatório e deve ser numérico.',
            },
        });
    }

    const longMin = parseNumero(req.body?.LONG_MIN, 'LONG_MIN');
    if (longMin.error) {
        return res.status(400).send({
            error: {
                code: 'BAD_REQUEST',
                message: 'Parâmetro LONG_MIN é obrigatório e deve ser numérico.',
            },
        });
    }

    const tabelaPostes = resolverTabelaPostes(postes.value);

    if (!TABELA_POSTES_REGEX.test(tabelaPostes)) {
        return res.status(422).send({
            error: {
                code: 'UNPROCESSABLE',
                message: 'Nome de tabela de postes inválido.',
            },
        });
    }

    let conn;

    try {
        conn = await obterConexao();

        const queryPostes = `
            SELECT NUM_SEQ_GEO, LATITUDE, LONGITUDE, SITUACAO
            FROM tstmeta.${tabelaPostes}
            WHERE LATITUDE BETWEEN ? AND ?
              AND LONGITUDE BETWEEN ? AND ?
        `;

        const resultado = await executarQuery(conn, queryPostes, [
            latMin.value,
            latMax.value,
            longMin.value,
            longMax.value,
        ]);

        return res.status(200).send({
            response: Array.isArray(resultado) ? resultado : [],
        });
    } catch (error) {
        console.error('Erro na rota postes_coordenadas:', error);
        return res.status(500).send({
            error: {
                code: 'DB_QUERY',
                message: error.message || 'Erro ao buscar postes da concessionária.',
            },
        });
    } finally {
        if (conn) {
            conn.release();
        }
    }
});

module.exports = router;
