/**
 * Rota: POST /divide_cabo
 *
 * Para registrar na API (app.js ou index.js):
 *   const divideCabo = require('./routes/divide_cabo');
 *   app.use('/divide_cabo', divideCabo);
 *
 * Divide um cabo em dois no vértice clicado.
 * Parte 1: mantém id_meta original, encurta geometria.
 * Parte 2: cria novo cabo com novo id_meta.
 * Tudo em uma única transação para atomicidade.
 *
 * Body: {
 *   id_meta_original: number,
 *   GOOGLE_LATLNG_parte1: [{lat, lng}, ...],
 *   GOOGLE_LATLNG_parte2: [{lat, lng}, ...]
 * }
 */
const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

function executarQuery(conn, query, params) {
    return new Promise((resolve, reject) => {
        conn.query(query, params, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
}

/**
 * Converte coordenadas Google Maps para formato MapWinGIS
 * Formato: 23;0;lng|lat|0.000000|0.000000|...
 */
function converterParaMapWinGIS(coordenadas) {
    if (!coordenadas || !Array.isArray(coordenadas) || coordenadas.length === 0) {
        return null;
    }
    const prefixoMapWinGIS = '23;0;';
    const coordenadasFormatadas = coordenadas
        .map(coord => `${coord.lng}|${coord.lat}|0.000000|0.000000`)
        .join('|');
    return `${prefixoMapWinGIS}${coordenadasFormatadas}|`;
}

/**
 * Calcula comprimento aproximado em metros (Haversine entre pontos consecutivos)
 */
function calcularComprimentoMetros(coordenadas) {
    if (!coordenadas || coordenadas.length < 2) return 0;
    const R = 6371000; // raio da Terra em metros
    let total = 0;
    for (let i = 0; i < coordenadas.length - 1; i++) {
        const lat1 = coordenadas[i].lat * Math.PI / 180;
        const lat2 = coordenadas[i + 1].lat * Math.PI / 180;
        const dLat = (coordenadas[i + 1].lat - coordenadas[i].lat) * Math.PI / 180;
        const dLng = (coordenadas[i + 1].lng - coordenadas[i].lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        total += R * c;
    }
    return Math.round(total);
}

/**
 * Retorna lista de tubos (caboa_t/cabob_t) conforme capacidade
 * VB6: 1,2,4,6->t1; >12->t2; >24->t3; etc.
 */
function getTubosParaCapacidade(capacidade) {
    const tubos = [1];
    if (capacidade > 12) tubos.push(2);
    if (capacidade > 24) tubos.push(3);
    if (capacidade > 36) tubos.push(4);
    if (capacidade > 48) tubos.push(5);
    if (capacidade > 60) tubos.push(6);
    if (capacidade > 72) tubos.push(7);
    if (capacidade > 84) tubos.push(8);
    if (capacidade > 96) tubos.push(9);
    if (capacidade > 108) tubos.push(10);
    if (capacidade > 120) tubos.push(11);
    if (capacidade > 132) tubos.push(12);
    return tubos;
}

router.post('/', login, async (req, res) => {
    console.log('✂️ [DIVIDE-CABO] Iniciando divisão de cabo...');

    const { id_meta_original, GOOGLE_LATLNG_parte1, GOOGLE_LATLNG_parte2 } = req.body;

    if (!id_meta_original) {
        return res.status(400).send({
            error: 'id_meta_original é obrigatório',
            success: false
        });
    }
    if (!GOOGLE_LATLNG_parte1 || !Array.isArray(GOOGLE_LATLNG_parte1) || GOOGLE_LATLNG_parte1.length < 2) {
        return res.status(400).send({
            error: 'GOOGLE_LATLNG_parte1 inválido (mín. 2 pontos)',
            success: false
        });
    }
    if (!GOOGLE_LATLNG_parte2 || !Array.isArray(GOOGLE_LATLNG_parte2) || GOOGLE_LATLNG_parte2.length < 2) {
        return res.status(400).send({
            error: 'GOOGLE_LATLNG_parte2 inválido (mín. 2 pontos)',
            success: false
        });
    }

    let conn;

    try {
        conn = await new Promise((resolve, reject) => {
            mysql.getConnection((error, connection) => {
                if (error) reject(error);
                else resolve(connection);
            });
        });

        await new Promise((resolve, reject) => {
            conn.beginTransaction((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // 1️⃣ Buscar dados do cabo original (cabopa, cabopb, cabom)
        const queryOriginal = `
            SELECT pa.capacidade, pa.codigo, pa.Label_cabo, pa.id_city, pa.id_condominio,
                   pa.GEO_PINX_B_LATLONG, pa.GEO_PINY_B_LATLONG,
                   pb.BeginX, pb.BeginY, pb.EndX, pb.EndY,
                   m.tubo
            FROM tstmeta.cabopa pa
            JOIN tstmeta.cabopb pb ON pa.id_meta = pb.id_meta
            JOIN tstmeta.cabom m ON pa.id_meta = m.id_meta
            WHERE pa.id_meta = ?
        `;
        const originais = await executarQuery(conn, queryOriginal, [id_meta_original]);
        if (!originais || originais.length === 0) {
            throw new Error(`Cabo id_meta ${id_meta_original} não encontrado`);
        }
        const orig = originais[0];

        const capacidade = orig.capacidade || 12;
        const codigo = orig.codigo || '';
        const label_cabo = orig.Label_cabo || `Cabo ${id_meta_original}`;
        const id_city = orig.id_city;
        const id_condominio = orig.id_condominio || 0;
        const tubo = orig.tubo || '';

        // BeginX/Y, EndX/Y do cabopb original (ponta B - para o cabo novo)
        const beginX_PB = orig.BeginX != null ? String(orig.BeginX).replace(',', '.') : '0 mm';
        const beginY_PB = orig.BeginY != null ? String(orig.BeginY).replace(',', '.') : '0 mm';
        const endX_PB = orig.EndX != null ? String(orig.EndX).replace(',', '.') : '0 mm';
        const endY_PB = orig.EndY != null ? String(orig.EndY).replace(',', '.') : '0 mm';
        const geoPinX_B = orig.GEO_PINX_B_LATLONG != null ? String(orig.GEO_PINX_B_LATLONG).replace(',', '.') : '0';
        const geoPinY_B = orig.GEO_PINY_B_LATLONG != null ? String(orig.GEO_PINY_B_LATLONG).replace(',', '.') : '0';

        // 2️⃣ UPDATE cabopa original (parte 1)
        const geometriaParte1 = converterParaMapWinGIS(GOOGLE_LATLNG_parte1);
        const lengthParte1 = calcularComprimentoMetros(GOOGLE_LATLNG_parte1);
        const googleLatLngParte1 = JSON.stringify(GOOGLE_LATLNG_parte1);

        const queryUpdateCabopa = `
            UPDATE tstmeta.cabopa
            SET GEOMETRIA_LAT_LONG = ?, GOOGLE_LATLNG = ?, length = ?
            WHERE id_meta = ?
        `;
        const resultUpdate = await executarQuery(conn, queryUpdateCabopa, [
            geometriaParte1,
            googleLatLngParte1,
            lengthParte1,
            id_meta_original
        ]);
        if (resultUpdate.affectedRows === 0) {
            throw new Error(`Falha ao atualizar cabopa ${id_meta_original}`);
        }
        console.log('✅ [DIVIDE-CABO] Cabo original atualizado (parte 1)');

        // 3️⃣ INSERT ids para novo ID_META
        const queryIds = `INSERT INTO tstmeta.ids (Tipo_objeto, id_city, id_condominio) VALUES ('cabo', ?, ?)`;
        const resultIds = await executarQuery(conn, queryIds, [id_city, id_condominio]);
        const id_meta_novo = resultIds.insertId;
        console.log('✅ [DIVIDE-CABO] Novo ID_META:', id_meta_novo);

        const id_visio_A = `cabo${id_meta_novo}A`;
        const id_visio_B = `cabo${id_meta_novo}B`;
        const id_visio_M = `cabo${id_meta_novo}M`;
        const Layer_PON = 1;
        const Layer_CONV = 0;
        const VIRTUAL2 = 0;

        const geometriaParte2 = converterParaMapWinGIS(GOOGLE_LATLNG_parte2);
        const lengthParte2 = calcularComprimentoMetros(GOOGLE_LATLNG_parte2);
        const googleLatLngParte2 = JSON.stringify(GOOGLE_LATLNG_parte2);

        // 4️⃣ INSERT cabopa (cabo novo - parte 2)
        const queryCabopaNovo = `
            INSERT INTO tstmeta.cabopa
            (id_visio, id_meta, id_city, id_condominio, capacidade, Codigo, Label_cabo, VIRTUAL2,
             length, Layer_PON, Layer_CONV, GOOGLE_LATLNG, GEOMETRIA_LAT_LONG,
             GEO_PINX_B_LATLONG, GEO_PINY_B_LATLONG, BeginX, BeginY, EndX, EndY)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '0 mm', '0 mm', '0 mm', '0 mm')
        `;
        await executarQuery(conn, queryCabopaNovo, [
            id_visio_A, id_meta_novo, id_city, id_condominio, capacidade, codigo, label_cabo, VIRTUAL2,
            lengthParte2, Layer_PON, Layer_CONV, googleLatLngParte2, geometriaParte2,
            geoPinX_B, geoPinY_B
        ]);

        // 5️⃣ INSERT cabopb (cabo novo - herda BeginX/Y, EndX/Y do original)
        const queryCabopbNovo = `
            INSERT INTO tstmeta.cabopb
            (id_visio, id_meta, id_city, id_condominio, capacidade, Codigo, Label_cabo, VIRTUAL2,
             Layer_PON, Layer_CONV, BeginX, BeginY, EndX, EndY)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await executarQuery(conn, queryCabopbNovo, [
            id_visio_B, id_meta_novo, id_city, id_condominio, capacidade, codigo, label_cabo, VIRTUAL2,
            Layer_PON, Layer_CONV, beginX_PB, beginY_PB, endX_PB, endY_PB
        ]);

        // 6️⃣ INSERT cabom
        const queryCabomNovo = `
            INSERT INTO tstmeta.cabom
            (id_visio, id_meta, id_city, id_condominio, capacidade, tubo, Codigo, VIRTUAL2, Layer_PON, Layer_CONV)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await executarQuery(conn, queryCabomNovo, [
            id_visio_M, id_meta_novo, id_city, id_condominio, capacidade, tubo, codigo, VIRTUAL2, Layer_PON, Layer_CONV
        ]);

        // 7️⃣ INSERT caboa_t/cabob_t conforme capacidade
        const tubos = getTubosParaCapacidade(capacidade);
        for (const t of tubos) {
            await executarQuery(conn, `INSERT INTO tstmeta.caboa_t${t} (IDMETA) VALUES (?)`, [id_meta_novo]);
            await executarQuery(conn, `INSERT INTO tstmeta.cabob_t${t} (IDMETA) VALUES (?)`, [id_meta_novo]);
        }
        console.log(`✅ [DIVIDE-CABO] Tubos inseridos: ${tubos.join(', ')}`);

        await new Promise((resolve, reject) => {
            conn.commit((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        conn.release();

        console.log(`✅ [DIVIDE-CABO] Cabo dividido com sucesso. Original: ${id_meta_original}, Novo: ${id_meta_novo}`);
        return res.status(200).send({
            success: true,
            id_meta_original,
            id_meta_novo,
            message: 'Cabo dividido com sucesso',
            length_parte1: lengthParte1,
            length_parte2: lengthParte2
        });

    } catch (error) {
        if (conn) {
            await new Promise((resolve) => {
                conn.rollback(() => {
                    conn.release();
                    resolve();
                });
            });
        }
        console.error('❌ [DIVIDE-CABO] Erro:', error);
        return res.status(500).send({
            success: false,
            error: error.message || 'Erro ao dividir cabo'
        });
    }
});

module.exports = router;
