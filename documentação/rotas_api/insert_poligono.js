const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

/**
 * @param {Object} conn - Conexão do MySQL
 * @param {string} query - Query SQL
 * @param {Array} params - Parâmetros da query
 * @returns {Promise}
 */
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

/**
 * Centro do polígono para campos LAT/LNG (sistema legado): média aritmética dos vértices,
 * igual ao cálculo usado no mapa Angular (`centroPoligonoPontos`).
 * Valores são strings numéricas (ex.: "-23.32680300") — adequado quando `tstmeta.poligono_at.LAT` / `LNG` são VARCHAR.
 *
 * @param {Array<{ lat: number, lng: number }>} coords
 * @returns {{ LAT: string, LNG: string }}
 */
function centroPorMediaDosVertices(coords) {
    let sumLat = 0;
    let sumLng = 0;
    const n = coords.length;
    for (const p of coords) {
        sumLat += p.lat;
        sumLng += p.lng;
    }
    const lat = sumLat / n;
    const lng = sumLng / n;
    return {
        LAT: lat.toFixed(8),
        LNG: lng.toFixed(8),
    };
}

/**
 * Interpreta GOOGLE_LATLNG (array ou string JSON). Gravação na BD como string JSON (como insert_cabo).
 *
 * @returns {{ id_city: number, Label: string, tipo: string, googleLatLngString: string, coords: Array<{ lat: number, lng: number }>, LAT: string, LNG: string }}
 */
function validarDadosEntrada(body) {
    const camposObrigatorios = ['id_city', 'Label', 'tipo', 'GOOGLE_LATLNG'];
    const faltando = camposObrigatorios.filter((campo) => {
        const v = body[campo];
        return v === undefined || v === null || v === '';
    });
    if (faltando.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${faltando.join(', ')}`);
    }

    const id_cityNum = Number(body.id_city);
    if (!Number.isFinite(id_cityNum) || !Number.isInteger(id_cityNum) || id_cityNum <= 0) {
        throw new Error('Dados inválidos: id_city deve ser um inteiro positivo.');
    }

    const Label = String(body.Label).trim();
    const tipo = String(body.tipo).trim();
    if (!Label) {
        throw new Error('Dados inválidos: Label não pode ser vazio.');
    }

    const raw = body.GOOGLE_LATLNG;
    /** @type {unknown} */
    let parsed;
    if (typeof raw === 'string') {
        try {
            parsed = JSON.parse(raw);
        } catch {
            throw new Error('Dados inválidos: GOOGLE_LATLNG deve ser um JSON válido quando enviado como string.');
        }
    } else {
        parsed = raw;
    }

    if (!Array.isArray(parsed)) {
        throw new Error('Dados inválidos: GOOGLE_LATLNG deve ser um array de pontos { lat, lng }.');
    }

    /** @type {Array<{ lat: number, lng: number }>} */
    const coords = [];
    for (let i = 0; i < parsed.length; i++) {
        const p = parsed[i];
        if (p == null || typeof p !== 'object') {
            throw new Error(`Dados inválidos: vértice ${i} não é um objeto.`);
        }
        const lat = Number(p.lat);
        const lng = Number(p.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            throw new Error(`Dados inválidos: vértice ${i} deve ter lat e lng numéricos.`);
        }
        coords.push({ lat, lng });
    }

    if (coords.length < 3) {
        throw new Error('Dados inválidos: um polígono exige pelo menos 3 vértices.');
    }

    const { LAT, LNG } = centroPorMediaDosVertices(coords);

    return {
        id_city: id_cityNum,
        Label,
        tipo,
        googleLatLngString: JSON.stringify(coords),
        coords,
        LAT,
        LNG,
    };
}

/**
 * O mapa Google fecha o polígono apenas na geometria visual.
 * Para MapWinGIS / legado, o anel em GEOMETRIA_LAT_LONG normalmente deve ter
 * último vértice igual ao primeiro — sem alterar GOOGLE_LATLNG na BD.
 *
 * @param {Array<{ lat: number, lng: number }>} coords
 * @returns {Array<{ lng: number, lat: number }>}
 */
function coordenadasComAnelExplicitoParaMapWinGIS(coords) {
    if (!coords || coords.length < 3) {
        return (coords || []).map((c) => ({ lng: c.lng, lat: c.lat }));
    }
    const primeiro = coords[0];
    const ultimo = coords[coords.length - 1];
    const eps = 1e-8;
    const jaFechado =
        Math.abs(primeiro.lat - ultimo.lat) < eps && Math.abs(primeiro.lng - ultimo.lng) < eps;
    const comoLngLat = coords.map((c) => ({ lng: c.lng, lat: c.lat }));
    if (jaFechado) {
        return comoLngLat;
    }
    return [...comoLngLat, { lng: primeiro.lng, lat: primeiro.lat }];
}

/**
 * Mesma convenção que insert_cabo (confirmada igual para polígonos): 5;0;lng|lat|...
 *
 * @param {Array<{ lng: number, lat: number }>} coordenadas
 * @returns {string|null}
 */
function converterParaMapWinGIS(coordenadas) {
    if (!coordenadas || !Array.isArray(coordenadas) || coordenadas.length === 0) {
        return null;
    }
    const coordenadasFormatadas = coordenadas.map((c) => `${c.lng}|${c.lat}`).join('|');
    return `5;0;${coordenadasFormatadas}|`;
}

router.post('/', login, async (req, res) => {
    console.log('🗺️ incluindo Poligono (versão async/await) ...');

    let conn;

    try {
        const dados = validarDadosEntrada(req.body);
        const coordsMw = coordenadasComAnelExplicitoParaMapWinGIS(dados.coords);
        const geometriaMapWinGIS = converterParaMapWinGIS(coordsMw);
        if (!geometriaMapWinGIS) {
            throw new Error('Dados inválidos: não foi possível gerar GEOMETRIA_LAT_LONG (MapWinGIS).');
        }

        conn = await new Promise((resolve, reject) => {
            mysql.getConnection((error, connection) => {
                if (error) {
                    console.error('Erro ao obter conexão:', error);
                    reject(error);
                } else {
                    resolve(connection);
                }
            });
        });

        await new Promise((resolve, reject) => {
            conn.beginTransaction((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        const queryID = `INSERT INTO tstmeta.ids (Tipo_objeto, id_city, id_condominio) VALUES ('poligono_at',?,'0');`;
        const resultadoID = await executarQuery(conn, queryID, [dados.id_city]);

        const IDNum = Number(resultadoID.insertId);
        if (!Number.isFinite(IDNum) || IDNum <= 0 || !Number.isInteger(IDNum)) {
            throw new Error('Dados inválidos: insert em ids não devolveu insertId válido.');
        }
        const ID = IDNum;

        // LAT/LNG: VARCHAR na BD — `dados.LAT` / `dados.LNG` já vêm como string (toFixed).
        const queryPoli =
            `INSERT INTO tstmeta.poligono_at (id_meta, id_city, Label, tipo, GOOGLE_LATLNG, GEOMETRIA_LAT_LONG, LAT, LNG) VALUES (?,?,?,?,?,?,?,?)`;

        await executarQuery(conn, queryPoli, [
            ID,
            dados.id_city,
            dados.Label,
            dados.tipo,
            dados.googleLatLngString,
            geometriaMapWinGIS,
            dados.LAT,
            dados.LNG,
        ]);

        await new Promise((resolve, reject) => {
            conn.commit((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        conn.release();
        conn = null;
        console.log('✅ inserido POLIGONO com sucesso! id:', ID);

        return res.status(200).send({
            success: true,
            message: 'Inserido Poligono',
            tipo: dados.tipo,
            id_meta: ID,
            idmeta_poligono: ID,
            nome: dados.Label,
        });
    } catch (error) {
        if (conn) {
            try {
                await new Promise((resolve) => {
                    conn.rollback(() => {
                        resolve();
                    });
                });
            } catch (rollbackErr) {
                console.error('Erro no rollback:', rollbackErr);
            } finally {
                try {
                    conn.release();
                } catch (releaseErr) {
                    console.error('Erro ao liberar conexão:', releaseErr);
                }
                conn = null;
            }
            console.log('🔄 Rollback executado (se transação ativa)');
        }

        console.error('❌ Erro ao inserir POLIGONO:', error);

        const msg = error && error.message ? String(error.message) : String(error);
        if (
            msg.includes('Campos obrigatórios') ||
            msg.includes('Dados inválidos') ||
            msg.includes('JSON válido')
        ) {
            return res.status(400).send({ error: msg, success: false });
        }
        return res.status(500).send({ error: msg, success: false });
    }
});

module.exports = router;
