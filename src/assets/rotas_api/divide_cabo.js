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

/**
 * Mapeamento tubo -> GRUPO (offset de fibras: t1=0, t2=12, t3=24...)
 */
function getGrupoPorTubo(t) {
    return (t - 1) * 12;
}

/**
 * Referencia pontas A e B do cabo (cruzamento interno).
 * Necessário para os algoritmos de conexão funcionarem.
 * Baseado em insert_cabo.js referenciarPontasCabo.
 * caboa_tX: Ponta A referencia Ponta B (FIBRA_i, FN_i)
 * cabob_tX: Ponta B referencia Ponta A (FIBRA_i, FN_i)
 */
async function referenciarPontasCabo(conn, id_meta, capacidade) {
    console.log(`🔗 [DIVIDE-CABO] Criando referências cruzadas para cabo ${id_meta} (${capacidade}F)`);
    let posicaoTubo = 1;
    let posicaoFIBRAINI = 1;
    let posicaoFIBRAFIM;
    if (capacidade === 1) posicaoFIBRAFIM = 1;
    else if (capacidade === 2) posicaoFIBRAFIM = 2;
    else if (capacidade === 4) posicaoFIBRAFIM = 4;
    else if (capacidade === 6) posicaoFIBRAFIM = 6;
    else if (capacidade === 8) posicaoFIBRAFIM = 8;
    else posicaoFIBRAFIM = 12;
    const NOME_PONTAa = `cabo${id_meta}A`;
    const NOME_PONTAb = `cabo${id_meta}B`;
    while (posicaoFIBRAINI <= capacidade) {
        for (let i = posicaoFIBRAINI; i <= posicaoFIBRAFIM && i <= capacidade; i++) {
            await executarQuery(conn, `UPDATE tstmeta.caboa_t${posicaoTubo} SET FIBRA_${i} = ?, FN_${i} = ? WHERE IDMETA = ?`, [
                `=${NOME_PONTAb}!Prop.Fibra_${i}.Label`,
                `=${NOME_PONTAb}!Prop.FN_${i}.Label`,
                id_meta
            ]);
            await executarQuery(conn, `UPDATE tstmeta.cabob_t${posicaoTubo} SET FIBRA_${i} = ?, FN_${i} = ? WHERE IDMETA = ?`, [
                `=${NOME_PONTAa}!Prop.Fibra_${i}.Label`,
                `=${NOME_PONTAa}!Prop.FN_${i}.Label`,
                id_meta
            ]);
        }
        posicaoTubo++;
        posicaoFIBRAINI = posicaoFIBRAFIM + 1;
        posicaoFIBRAFIM = posicaoFIBRAFIM + 12;
        if (capacidade === 18 && posicaoTubo < 3) posicaoFIBRAFIM = 18;
    }
    console.log('✅ [DIVIDE-CABO] Referências cruzadas criadas');
}

/**
 * COPIA_REGISTRO: Copia dados da ponta B do cabo original para ponta B do cabo novo.
 * Depois limpa a ponta B do cabo original (agora é o ponto de corte, sem conexões).
 * VB6: COPIA_REGISTRO_PONTAbvelha_PONTABnova
 */
async function copiaRegistroPontaB(conn, idmeta_velho, idmeta_novo, tubo, grupo) {
    const cols = [];
    for (let i = 1; i <= 12; i++) {
        const f = i + grupo;
        cols.push(`FIBRA_${f}LABEL`, `FN_${f}LABEL`);
    }
    const colsStr = cols.join(',');
    const insertQuery = `
        INSERT INTO tstmeta.cabob_t${tubo} (${colsStr}, IDMETA)
        SELECT ${colsStr}, ? AS IDMETA
        FROM tstmeta.cabob_t${tubo}
        WHERE IDMETA = ?
    `;
    const insertResult = await executarQuery(conn, insertQuery, [idmeta_novo, idmeta_velho]);
    if (insertResult.affectedRows === 0) {
        await executarQuery(conn, `INSERT INTO tstmeta.cabob_t${tubo} (IDMETA) VALUES (?)`, [idmeta_novo]);
    } else {
        const setClause = cols.map(c => `${c} = ''`).join(', ');
        await executarQuery(conn, `UPDATE tstmeta.cabob_t${tubo} SET ${setClause} WHERE IDMETA = ?`, [idmeta_velho]);
    }
}

/**
 * LIMPA_PONTA_B_ORIGINAL: Atualiza referências em caixa, DIO ou outro cabo.
 * Os objetos conectados na ponta B do cabo antigo passam a apontar para o cabo novo.
 * VB6: LIMPA_PONTA_B_ORIGINAL
 */
async function limpaPontaBOriginal(conn, idmeta_velho, idmeta_novo, capacidade, id_city) {
    const caboTabela = 'tstmeta.cabob_t1';
    const rows = await executarQuery(conn, `SELECT FIBRA_1LABEL FROM ${caboTabela} WHERE IDMETA = ?`, [idmeta_novo]);
    if (!rows || rows.length === 0) return;
    const fibra1 = (rows[0].FIBRA_1LABEL || '').trim();
    if (!fibra1 || fibra1 === ' ') return;

    const CABO_ORIG = `cabo${idmeta_velho}B`;
    const CABO_NOVO = `cabo${idmeta_novo}B`;

    // Caixa: FIBRA_1LABEL ex: "=TST333254!PROP.BOCA2_1.VALUE"
    if (fibra1.includes('PROP.BOCA')) {
        const matchBoca = fibra1.match(/!PROP\.([^.]+)/);
        const matchId = fibra1.match(/TST(\d+)/);
        if (matchBoca && matchId) {
            let BOCA = matchBoca[1]; // ex: BOCA1_1
            BOCA = BOCA.replace(/_\d+$/, ''); // coluna na caixa é BOCA1, BOCA2, etc.
            const ID_Caixa = matchId[1];
            await executarQuery(conn, `UPDATE tstmeta.caixa SET \`${BOCA}\` = ? WHERE ID_META = ?`, [CABO_NOVO, ID_Caixa]);
            await replaceIdCaboNaBoca(conn, BOCA, ID_Caixa, idmeta_velho, idmeta_novo, capacidade);
        }
        return;
    }

    // DIO: FIBRA_1LABEL contém "DIO" - ex: "DIO402916!PROP.ROW_5.LABEL"
    if (fibra1.includes('DIO')) {
        const matchDio = fibra1.match(/DIO(\d+)/);
        if (matchDio) {
            const id_DIO = matchDio[1];
            const sets = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']
                .map(c => `${c} = REPLACE(IFNULL(${c},''), ?, ?)`)
                .join(', ');
            const params = [];
            for (let i = 0; i < 6; i++) { params.push(CABO_ORIG, CABO_NOVO); }
            params.push(id_DIO);
            await executarQuery(conn, `UPDATE tstmeta.DIO SET ${sets} WHERE ID_META = ?`, params);
        }
        return;
    }

    // Outro cabo: FIBRA_1LABEL contém "cabo"
    if (fibra1.toLowerCase().includes('cabo')) {
        const matchCabo = fibra1.match(/cabo(\d+)([AB])/i);
        if (matchCabo) {
            const ID_CABO = matchCabo[1];
            const CAB_ponta = matchCabo[2].toUpperCase();
            await replaceIdCaboNoCabo(conn, CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, capacidade);
            const CABO_SOBRA = `cabo${ID_CABO}${CAB_ponta}`;

            // Segmento
            const segRows = await executarQuery(conn,
                `SELECT id_meta FROM tstmeta.segmento WHERE (Caboxe = ? OR Caboxd = ?) AND id_city = ?`,
                [CABO_SOBRA, CABO_SOBRA, id_city]
            );
            if (segRows && segRows.length > 0) {
                for (const r of segRows) {
                    await executarQuery(conn, `UPDATE tstmeta.segmento SET Caboxe = REPLACE(Caboxe, ?, ?) WHERE id_meta = ?`, [CABO_ORIG, CABO_NOVO, r.id_meta]);
                    await executarQuery(conn, `UPDATE tstmeta.segmento SET Caboxd = REPLACE(Caboxd, ?, ?) WHERE id_meta = ?`, [CABO_ORIG, CABO_NOVO, r.id_meta]);
                }
            }

            // Condomínio (VB6 filtra por id_city)
            const condRows = await executarQuery(conn,
                `SELECT id_meta FROM tstmeta.condominio WHERE id_city = ? AND (ENTRADAX1 = ? OR ENTRADAX2 = ? OR ENTRADAX3 = ? OR ENTRADAX4 = ? OR ENTRADAX5 = ? OR ENTRADAX6 = ? OR ENTRADAX7 = ? OR ENTRADAX8 = ?)`,
                [id_city, CABO_SOBRA, CABO_SOBRA, CABO_SOBRA, CABO_SOBRA, CABO_SOBRA, CABO_SOBRA, CABO_SOBRA, CABO_SOBRA]
            );
            if (condRows && condRows.length > 0) {
                const cols = ['CABOX1', 'CABOX2', 'CABOX3', 'CABOX4', 'CABOX5', 'CABOX6', 'CABOX7', 'CABOX8'];
                for (const r of condRows) {
                    for (const col of cols) {
                        await executarQuery(conn, `UPDATE tstmeta.condominio SET ${col} = REPLACE(${col}, ?, ?) WHERE id_meta = ?`, [CABO_ORIG, CABO_NOVO, r.id_meta]);
                    }
                }
            }
        }
    }
}

/**
 * Replace_IDCABO_naBOCA: Substitui referência ao cabo nas tabelas de conexão da caixa (cxbocaN_tX)
 * VB6: cx & LCase(BOCA) & "_" & tubo -> ex: cxboca_1_t1
 */
async function replaceIdCaboNaBoca(conn, BOCA, idmeta_caixa, idmeta_velho, idmeta_novo, capacidade) {
    const CABO_ORIG = `cabo${idmeta_velho}B`;
    const CABO_NOVO = `cabo${idmeta_novo}B`;
    const tubosGrupos = [
        { cap: 12, grupo: 0, tubo: 't1' }, { cap: 24, grupo: 12, tubo: 't2' }, { cap: 36, grupo: 24, tubo: 't3' },
        { cap: 48, grupo: 36, tubo: 't4' }, { cap: 60, grupo: 48, tubo: 't5' }, { cap: 72, grupo: 60, tubo: 't6' },
        { cap: 84, grupo: 72, tubo: 't7' }, { cap: 96, grupo: 84, tubo: 't8' }, { cap: 108, grupo: 96, tubo: 't9' },
        { cap: 120, grupo: 108, tubo: 't10' }, { cap: 132, grupo: 120, tubo: 't11' }, { cap: 144, grupo: 132, tubo: 't12' }
    ];
    const bocaLower = BOCA.toLowerCase().replace(/\./g, '_');
    for (const tg of tubosGrupos) {
        if (capacidade <= tg.cap && tg.grupo > 0) break;
        const tabela = `cx${bocaLower}_${tg.tubo}`;
        const sets = [];
        const params = [];
        for (let i = 1; i <= 12; i++) {
            const f = i + tg.grupo;
            sets.push(`F${f}L = REPLACE(IFNULL(F${f}L,''), ?, ?)`);
            sets.push(`FN${f}L = REPLACE(IFNULL(FN${f}L,''), ?, ?)`);
            params.push(CABO_ORIG, CABO_NOVO, CABO_ORIG, CABO_NOVO);
        }
        try {
            await executarQuery(conn, `UPDATE tstmeta.${tabela} SET ${sets.join(', ')} WHERE IDMETA = ?`, [...params, idmeta_caixa]);
        } catch (e) {
            if (!e.message || !e.message.includes("doesn't exist")) console.warn(`[DIVIDE-CABO] Tabela ${tabela} pode não existir:`, e.message);
        }
    }
}

/**
 * Replace_IDCABO_noCABO: Substitui referência ao cabo em caboa_t/cabob_t do cabo destino
 */
async function replaceIdCaboNoCabo(conn, cabo_ponta, idmeta_cabo, idmeta_velho, idmeta_novo, capacidade) {
    const CABO_ORIG = `cabo${idmeta_velho}B`;
    const CABO_NOVO = `cabo${idmeta_novo}B`;
    const tabelaBase = cabo_ponta === 'A' ? 'caboa_t' : 'cabob_t';
    const tubosGrupos = [
        { cap: 12, grupo: 0 }, { cap: 24, grupo: 12 }, { cap: 36, grupo: 24 }, { cap: 48, grupo: 36 },
        { cap: 60, grupo: 48 }, { cap: 72, grupo: 60 }, { cap: 84, grupo: 72 }, { cap: 96, grupo: 84 },
        { cap: 108, grupo: 96 }, { cap: 120, grupo: 108 }, { cap: 132, grupo: 120 }, { cap: 144, grupo: 132 }
    ];
    for (const tg of tubosGrupos) {
        if (capacidade <= tg.cap && tg.grupo > 0) break;
        const t = (tg.grupo / 12) + 1;
        const tabela = tabelaBase + t;
        const sets = [];
        const params = [];
        for (let i = 1; i <= 12; i++) {
            const f = i + tg.grupo;
            sets.push(`FIBRA_${f}LABEL = REPLACE(FIBRA_${f}LABEL, ?, ?)`);
            sets.push(`FN_${f}LABEL = REPLACE(FN_${f}LABEL, ?, ?)`);
            params.push(CABO_ORIG, CABO_NOVO, CABO_ORIG, CABO_NOVO);
        }
        try {
            await executarQuery(conn, `UPDATE tstmeta.${tabela} SET ${sets.join(', ')} WHERE IDMETA = ?`, [...params, idmeta_cabo]);
        } catch (e) {
            if (!e.message || !e.message.includes("doesn't exist")) console.warn(`[DIVIDE-CABO] Tabela ${tabela}:`, e.message);
        }
    }
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

        // 7️⃣ INSERT caboa_t (ponta A) e COPIA_REGISTRO para cabob_t (ponta B)
        const tubos = getTubosParaCapacidade(capacidade);
        for (const t of tubos) {
            await executarQuery(conn, `INSERT INTO tstmeta.caboa_t${t} (IDMETA) VALUES (?)`, [id_meta_novo]);
            const grupo = getGrupoPorTubo(t);
            await copiaRegistroPontaB(conn, id_meta_original, id_meta_novo, t, grupo);
        }
        console.log(`✅ [DIVIDE-CABO] Tubos e conexões ponta B copiados: ${tubos.join(', ')}`);

        // 8️⃣ Referenciar pontas A e B (cruzamento interno - necessário para algoritmos de conexão)
        await referenciarPontasCabo(conn, id_meta_novo, Number(capacidade) || 12);

        // 9️⃣ LIMPA_PONTA_B_ORIGINAL: Atualiza referências em caixa/DIO/cabo conectados
        await limpaPontaBOriginal(conn, id_meta_original, id_meta_novo, Number(capacidade) || 12, id_city);
        console.log('✅ [DIVIDE-CABO] Referências atualizadas (caixa/DIO/cabo)');

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
