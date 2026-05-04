/**
 * Rota: POST /extrai_cabo_entrada_sp
 * Ver comentário no topo das outras rotas em rotas_api (require mysql pool + login).
 * Body: { ENTRADA, ID_META_CAIXA } ou { response: [{ ENTRADA, ID_META_CAIXA }] }
 * Registrar no servidor: app.use('/extrai_cabo_entrada_sp', require('./rotas/extrai_cabo_entrada_sp'));
 */
const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

function tuboFromFibra(fibraNum) {
  const f = Number(fibraNum);
  if (f <= 12) return 1;
  if (f <= 24) return 2;
  if (f <= 36) return 3;
  if (f <= 48) return 4;
  if (f <= 60) return 5;
  if (f <= 72) return 6;
  if (f <= 84) return 7;
  if (f <= 96) return 8;
  if (f <= 108) return 9;
  if (f <= 120) return 10;
  if (f <= 132) return 11;
  return 12;
}

function parseEntradaPropLabel(entrada) {
  const s = String(entrada || '').trim();
  if (!s) return null;
  const m = /boca(\d+)_(\d+)/i.exec(s);
  if (!m) return null;
  const bocaNum = parseInt(m[1], 10);
  const fibra = parseInt(m[2], 10);
  const okBoca = Number.isFinite(bocaNum) &&
    ((bocaNum >= 1 && bocaNum <= 18) || bocaNum === 97 || bocaNum === 98);
  if (!okBoca) return null;
  if (!Number.isFinite(fibra) || fibra < 1 || fibra > 144) return null;
  return { bocaNum, fibra };
}

function assertCxbocaTableName(tabela) {
  const n = String(tabela || '').toLowerCase();
  if (!/^cxboca(\d+|97|98)_t([1-9]|1[0-2])$/.test(n)) {
    throw new Error('Tabela cxboca invalida: ' + tabela);
  }
  return n;
}

function parseFormulaCabo(valor) {
  const raw = String(valor == null ? '' : valor).trim();
  if (!raw) return { error: 'Celula vazia F{n}L' };
  const m =
    /^=cabo(\d+)([AaBb])[!]Prop\.Fibra_(\d+)\.(?:VALUE|Label)$/i.exec(raw) ||
    /^=cabo(\d+)([AaBb])[!]Prop\.Fibra_(\d+)$/i.exec(raw) ||
    /^=cabo(\d+)([AaBb])[!]PROP\.FIBRA_(\d+)$/i.exec(raw);
  if (!m) return { error: 'Formula cabo nao reconhecida: ' + raw.slice(0, 120) };
  const idMetaCabo = parseInt(m[1], 10);
  const letra = String(m[2]).toUpperCase();
  const fibraN = parseInt(m[3], 10);
  const prefix = letra === 'A' ? 'caboa' : 'cabob';
  const tubo = tuboFromFibra(fibraN);
  return {
    tabela_cabo: prefix + '_t' + tubo,
    id_meta_cabo: idMetaCabo,
    registro: 'FIBRA_' + fibraN + 'Label',
    ponta: letra,
    fibra: fibraN
  };
}


router.post('/', login, (req, res) => {
  let ENTRADA = req.body && req.body.ENTRADA;
  let ID_META_CAIXA = req.body && req.body.ID_META_CAIXA;
  if ((!ENTRADA || ID_META_CAIXA == null) && req.body && Array.isArray(req.body.response) && req.body.response.length > 0) {
    const row0 = req.body.response[0];
    if (row0) {
      if (ENTRADA == null) ENTRADA = row0.ENTRADA;
      if (ID_META_CAIXA == null) ID_META_CAIXA = row0.ID_META_CAIXA;
    }
  }
  if (!ENTRADA || ID_META_CAIXA == null || ID_META_CAIXA === '') {
    return res.status(400).json({ success: false, error: 'Obrigatorio ENTRADA e ID_META_CAIXA (ou response[0]).' });
  }
  const idMetaCaixa = parseInt(String(ID_META_CAIXA), 10);
  if (!Number.isFinite(idMetaCaixa) || idMetaCaixa <= 0) {
    return res.status(400).json({ success: false, error: 'ID_META_CAIXA invalido.' });
  }
  const parsed = parseEntradaPropLabel(ENTRADA);
  if (!parsed) {
    return res.status(400).json({ success: false, error: 'ENTRADA invalida.' });
  }
  const fibra = parsed.fibra;
  const tubo = tuboFromFibra(fibra);
  const tabelaCxboca = 'cxboca' + parsed.bocaNum + '_t' + tubo;
  let tabelaSql;
  try {
    tabelaSql = assertCxbocaTableName(tabelaCxboca);
  } catch (e) {
    return res.status(400).json({ success: false, error: String(e.message || e) });
  }
  const colunaL = 'F' + fibra + 'L';
  mysql.getConnection((errConn, conn) => {
    if (errConn) {
      console.error('[extrai_cabo_entrada_sp] conn', errConn);
      return res.status(500).json({ success: false, error: 'Erro BD.' });
    }
    conn.query(
      'SELECT ?? AS celula FROM tstmeta.?? WHERE IDMETA = ? LIMIT 1',
      [colunaL, tabelaSql, idMetaCaixa],
      (err, rows) => {
        conn.release();
        if (err) {
          console.error('[extrai_cabo_entrada_sp] SELECT', err);
          return res.status(500).json({ success: false, error: err.sqlMessage || String(err.message || err) });
        }
        const row = rows && rows[0];
        const valorCelula = row && row.celula != null ? String(row.celula) : '';
        const out = parseFormulaCabo(valorCelula);
        if (out.error) {
          return res.status(422).json({
            success: false,
            entrada: String(ENTRADA),
            id_meta_caixa: idMetaCaixa,
            tabela_cxboca: tabelaSql,
            coluna_lida: colunaL,
            valor_celula: valorCelula,
            error: out.error
          });
        }
        return res.json({
          success: true,
          entrada: String(ENTRADA),
          id_meta_caixa: idMetaCaixa,
          tabela_cxboca: tabelaSql,
          coluna_lida: colunaL,
          valor_celula: valorCelula,
          tabela_cabo: out.tabela_cabo,
          id_meta_cabo: out.id_meta_cabo,
          registro: out.registro,
          ponta: out.ponta
        });
      }
    );
  });
});

module.exports = router;

