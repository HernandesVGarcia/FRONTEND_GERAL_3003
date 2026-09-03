/**
 * Rota: POST /update_libera_segmento
 *
 * Para registrar na API (app.js):
 *   const rotaUpdateLiberaSegmento = require('./routes/update_libera_segmento');
 *   app.use('/update_libera_segmento', rotaUpdateLiberaSegmento);
 *
 * Port de libera_sobra.vb — libera sobra (segmento):
 * - Limpa FIBRA_L/FN_L LABEL nos cabos conectados (Caboxd / Caboxe)
 * - Seta Caboxd e Caboxe para 'Z' no segmento
 *
 * Body: { id_meta: number, id_city: number }
 */
const util = require('util');
const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

const TUBOS_PERMITIDOS = new Set([
  'caboa_t1', 'cabob_t1', 'caboa_t2', 'cabob_t2', 'caboa_t3', 'cabob_t3',
  'caboa_t4', 'cabob_t4', 'caboa_t5', 'cabob_t5', 'caboa_t6', 'cabob_t6',
  'caboa_t7', 'cabob_t7', 'caboa_t8', 'cabob_t8', 'caboa_t9', 'cabob_t9',
  'caboa_t10', 'cabob_t10', 'caboa_t11', 'cabob_t11', 'caboa_t12', 'cabob_t12',
]);

function parseCaboRef(caboRef) {
  const ref = String(caboRef ?? '').trim();
  if (!ref || ref.toUpperCase() === 'Z') {
    return null;
  }
  const ponta = ref.slice(-1).toUpperCase();
  if (ponta !== 'A' && ponta !== 'B') {
    return null;
  }
  const idCabo = ref.slice(4, -1);
  if (!idCabo || !/^\d+$/.test(idCabo)) {
    return null;
  }
  return { idCabo, ponta };
}

function getTabelasPorFibra(L) {
  let tubo = 1;
  if (L > 12) tubo = 2;
  if (L > 24) tubo = 3;
  if (L > 36) tubo = 4;
  if (L > 48) tubo = 5;
  if (L > 60) tubo = 6;
  if (L > 72) tubo = 7;
  if (L > 84) tubo = 8;
  if (L > 96) tubo = 9;
  if (L > 108) tubo = 10;
  if (L > 120) tubo = 11;
  if (L > 132) tubo = 12;
  return {
    caboa: `caboa_t${tubo}`,
    cabob: `cabob_t${tubo}`,
  };
}

function tabelaPorPonta(L, ponta) {
  const { caboa, cabob } = getTabelasPorFibra(L);
  const tabela = ponta === 'A' ? caboa : cabob;
  if (!TUBOS_PERMITIDOS.has(tabela)) {
    throw new Error(`Tabela não permitida: ${tabela}`);
  }
  return tabela;
}

async function limparConexoesCabo(queryAsync, caboRef) {
  const parsed = parseCaboRef(caboRef);
  if (!parsed) {
    return false;
  }

  const rows = await queryAsync(
    'SELECT capacidade FROM tstmeta.cabopa WHERE id_meta = ?',
    [parsed.idCabo],
  );
  if (!rows.length) {
    throw new Error(`Cabo ${parsed.idCabo} não encontrado em cabopa`);
  }

  const capacidade = Number(rows[0].capacidade);
  if (!Number.isFinite(capacidade) || capacidade < 1) {
    throw new Error(`Capacidade inválida para cabo ${parsed.idCabo}`);
  }

  for (let L = 1; L <= capacidade; L++) {
    const tabela = tabelaPorPonta(L, parsed.ponta);
    await queryAsync(
      `UPDATE tstmeta.${tabela} SET FIBRA_${L}LABEL = ?, FN_${L}LABEL = ? WHERE IDMETA = ?`,
      ['', '', parsed.idCabo],
    );
  }

  return true;
}

router.post('/', login, async (req, res) => {
  console.log('🔓 [UPDATE-LIBERA-SEGMENTO] Liberando sobra...');

  const { id_meta, id_city } = req.body;

  if (id_meta == null || id_city == null) {
    return res.status(400).send({
      success: false,
      error: 'id_meta e id_city são obrigatórios',
    });
  }

  const getConnectionAsync = util.promisify(mysql.getConnection).bind(mysql);
  let conn;

  try {
    conn = await getConnectionAsync();
    const queryAsync = (sql, params) =>
      new Promise((resolve, reject) => {
        conn.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
      });
    const beginTransactionAsync = util.promisify(conn.beginTransaction).bind(conn);
    const commitAsync = util.promisify(conn.commit).bind(conn);
    const rollbackAsync = util.promisify(conn.rollback).bind(conn);

    await beginTransactionAsync();

    const segmentos = await queryAsync(
      'SELECT Caboxd, Caboxe, Tipo FROM tstmeta.segmento WHERE id_meta = ? AND id_city = ?',
      [id_meta, id_city],
    );

    if (!segmentos.length) {
      await rollbackAsync();
      return res.status(404).send({
        success: false,
        error: 'Segmento não encontrado',
        message: `Nenhum segmento id_meta=${id_meta} na cidade ${id_city}`,
      });
    }

    const seg = segmentos[0];
    let caboxdLiberado = false;
    let caboxeLiberado = false;

    const caboxd = String(seg.Caboxd ?? '').trim();
    const caboxe = String(seg.Caboxe ?? '').trim();

    if (caboxd.toUpperCase() !== 'Z') {
      await limparConexoesCabo(queryAsync, caboxd);
      await queryAsync(
        'UPDATE tstmeta.segmento SET Caboxd = ? WHERE id_meta = ? AND id_city = ?',
        ['Z', id_meta, id_city],
      );
      caboxdLiberado = true;
    }

    if (caboxe.toUpperCase() !== 'Z') {
      await limparConexoesCabo(queryAsync, caboxe);
      await queryAsync(
        'UPDATE tstmeta.segmento SET Caboxe = ? WHERE id_meta = ? AND id_city = ?',
        ['Z', id_meta, id_city],
      );
      caboxeLiberado = true;
    }

    await commitAsync();

    console.log(`✅ [UPDATE-LIBERA-SEGMENTO] Sobra ${id_meta} liberada (D=${caboxdLiberado}, E=${caboxeLiberado})`);

    return res.status(200).send({
      success: true,
      message: 'Sobra liberada do cabo',
      id_meta,
      caboxd_liberado: caboxdLiberado,
      caboxe_liberado: caboxeLiberado,
      tipo: seg.Tipo ?? null,
    });
  } catch (error) {
    if (conn) {
      try {
        await util.promisify(conn.rollback).bind(conn)();
      } catch (rbErr) {
        console.error('[UPDATE-LIBERA-SEGMENTO] Erro no rollback:', rbErr);
      }
    }
    console.error('❌ [UPDATE-LIBERA-SEGMENTO] Erro:', error);
    return res.status(500).send({
      success: false,
      error: 'Erro ao liberar segmento',
      message: error.message,
    });
  } finally {
    if (conn) {
      conn.release();
    }
  }
});

module.exports = router;
