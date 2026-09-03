const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

const TABELA_POSTES_REGEX = /^[a-zA-Z0-9_]+$/;
const TABELA_POSTES_PADRAO = 'postes_parana';
const LIMITE_POSTES_EXTENT = 5000;

function parseNumero(raw, fieldName) {
    const value = Number.parseFloat(String(raw));
    if (!Number.isFinite(value)) {
        return { error: fieldName };
    }
    return { value };
}

function isPostesIndefinido(valor) {
    const texto = String(valor ?? '').trim();
    return texto === '' || texto.toLowerCase() === 'indefinido';
}

function parseCsvTabelas(raw) {
    const texto = String(raw ?? '').trim();
    if (isPostesIndefinido(texto)) {
        return [];
    }

    const tabelas = [];
    const visto = new Set();

    texto.split(',').forEach((parte) => {
        const nome = parte.trim();
        if (!nome || isPostesIndefinido(nome) || visto.has(nome)) {
            return;
        }
        visto.add(nome);
        tabelas.push(nome);
    });

    return tabelas;
}

function resolverTabelasPostes(body) {
    if (Array.isArray(body?.POSTES_TABELAS) && body.POSTES_TABELAS.length > 0) {
        const tabelas = [];
        const visto = new Set();

        body.POSTES_TABELAS.forEach((item) => {
            const nome = String(item ?? '').trim();
            if (!nome || isPostesIndefinido(nome) || visto.has(nome)) {
                return;
            }
            visto.add(nome);
            tabelas.push(nome);
        });

        if (tabelas.length > 0) {
            return { value: tabelas };
        }
    }

    const postesRaw = body?.POSTES;
    if (postesRaw === undefined || postesRaw === null || String(postesRaw).trim() === '') {
        return { error: 'POSTES' };
    }

    const tabelas = parseCsvTabelas(postesRaw);
    if (tabelas.length === 0) {
        return { value: [TABELA_POSTES_PADRAO] };
    }

    return { value: tabelas };
}

function validarNomeTabela(nome) {
    return TABELA_POSTES_REGEX.test(nome);
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

async function buscarPostesTabela(conn, tabelaPostes, extent, limite) {
    const queryPostes = `
        SELECT NUM_SEQ_GEO, LATITUDE, LONGITUDE, SITUACAO, ? AS ORIGEM
        FROM tstmeta.${tabelaPostes}
        WHERE LATITUDE BETWEEN ? AND ?
          AND LONGITUDE BETWEEN ? AND ?
        LIMIT ${limite}
    `;

    return executarQuery(conn, queryPostes, [
        tabelaPostes,
        extent.latMin,
        extent.latMax,
        extent.longMin,
        extent.longMax,
    ]);
}

router.post('/', login, async (req, res) => {
    const tabelasResolvida = resolverTabelasPostes(req.body);
    if (tabelasResolvida.error) {
        return res.status(400).send({
            error: {
                code: 'BAD_REQUEST',
                message: 'Parâmetro POSTES ou POSTES_TABELAS é obrigatório.',
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

    const tabelasPostes = tabelasResolvida.value;

    for (const tabelaPostes of tabelasPostes) {
        if (!validarNomeTabela(tabelaPostes)) {
            return res.status(422).send({
                error: {
                    code: 'UNPROCESSABLE',
                    message: `Nome de tabela de postes inválido: ${tabelaPostes}`,
                },
            });
        }
    }

    let conn;

    try {
        conn = await obterConexao();

        const extent = {
            latMin: latMin.value,
            latMax: latMax.value,
            longMin: longMin.value,
            longMax: longMax.value,
        };

        const resultados = await Promise.all(
            tabelasPostes.map((tabela) =>
                buscarPostesTabela(conn, tabela, extent, LIMITE_POSTES_EXTENT),
            ),
        );

        const response = resultados.flat();

        return res.status(200).send({
            response: Array.isArray(response) ? response : [],
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
