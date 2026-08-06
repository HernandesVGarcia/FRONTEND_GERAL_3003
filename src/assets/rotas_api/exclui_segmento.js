/**
 * Rota: POST /exclui_segmento
 *
 * Para registrar na API (app.js):
 *   const rotaExcluiSegmento = require('./routes/exclui_segmento');
 *   app.use('/exclui_segmento', rotaExcluiSegmento);
 *
 * Port de exclui_sobra.vb — exclui segmento (sobra):
 * - Valida Caboxd e Caboxe = 'Z' (desconectado)
 * - DELETE FROM segmento e ids em transação
 *
 * Body: { id_meta: number, id_city: number }
 */
const util = require('util');
const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

router.post('/', login, async (req, res) => {
  console.log('🗑️ [EXCLUI-SEGMENTO] Excluindo segmento...');

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

    const segmentos = await queryAsync(
      'SELECT Caboxd, Caboxe, Tipo FROM tstmeta.segmento WHERE id_meta = ? AND id_city = ?',
      [id_meta, id_city],
    );

    if (!segmentos.length) {
      return res.status(404).send({
        success: false,
        error: 'Segmento não encontrado',
        message: `Nenhum segmento id_meta=${id_meta} na cidade ${id_city}`,
      });
    }

    const seg = segmentos[0];
    const caboxd = String(seg.Caboxd ?? '').trim().toUpperCase();
    const caboxe = String(seg.Caboxe ?? '').trim().toUpperCase();

    if (caboxe !== 'Z' || caboxd !== 'Z') {
      return res.status(400).send({
        success: false,
        error: 'Segmento Conectado, Desconecte o Cabo',
        message: 'Segmento Conectado, Desconecte o Cabo',
        caboxd: seg.Caboxd,
        caboxe: seg.Caboxe,
      });
    }

    await beginTransactionAsync();

    const resultadoSegmento = await queryAsync(
      'DELETE FROM tstmeta.segmento WHERE id_meta = ? AND id_city = ?',
      [id_meta, id_city],
    );

    const resultadoIds = await queryAsync(
      'DELETE FROM tstmeta.ids WHERE id_meta = ? AND id_city = ?',
      [id_meta, id_city],
    );

    await commitAsync();

    console.log(
      `✅ [EXCLUI-SEGMENTO] Segmento ${id_meta} excluído (segmento=${resultadoSegmento.affectedRows}, ids=${resultadoIds.affectedRows})`,
    );

    return res.status(200).send({
      success: true,
      message: 'Segmento excluído',
      id_meta,
      affectedRowsSegmento: resultadoSegmento.affectedRows,
      affectedRowsIds: resultadoIds.affectedRows,
      tipo: seg.Tipo ?? null,
    });
  } catch (error) {
    if (conn) {
      try {
        await util.promisify(conn.rollback).bind(conn)();
      } catch (rbErr) {
        console.error('[EXCLUI-SEGMENTO] Erro no rollback:', rbErr);
      }
    }
    console.error('❌ [EXCLUI-SEGMENTO] Erro:', error);
    return res.status(500).send({
      success: false,
      error: 'Erro ao excluir segmento',
      message: error.message,
    });
  } finally {
    if (conn) {
      conn.release();
    }
  }
});

module.exports = router;
