const util = require('util');
const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

function valorLivre(val) {
    return val === '=id()' || val == null || val === '';
}

/** Índice da tabela (1-12) conforme o intervalo da fibra: _t1=1-12, _t2=13-24, ... _t12=133-144. */
function indiceTabelaParaFibra(fibra) {
    if (fibra <= 12) return 1;
    if (fibra >= 13 && fibra <= 24) return 2;
    if (fibra >= 25 && fibra <= 36) return 3;
    if (fibra >= 37 && fibra <= 48) return 4;
    if (fibra >= 49 && fibra <= 60) return 5;
    if (fibra >= 61 && fibra <= 72) return 6;
    if (fibra >= 73 && fibra <= 84) return 7;
    if (fibra >= 85 && fibra <= 96) return 8;
    if (fibra >= 97 && fibra <= 108) return 9;
    if (fibra >= 109 && fibra <= 120) return 10;
    if (fibra >= 121 && fibra <= 132) return 11;
    if (fibra >= 133 && fibra <= 144) return 12;
    return Math.ceil(fibra / 12);
}

function nomeTabela(boca, fibra) {
    return 'cxboca' + boca + '_t' + indiceTabelaParaFibra(fibra);
}

router.post('/', login, async (req, res, next) => {
    console.log('executou le tubo');

    const {
        boca,
        fibras_portubo,
        tubo,
        id_meta_caixa
    } = req.body;

    if (!id_meta_caixa) {
        console.log('ERRO: id_meta_caixa é obrigatório');
        return res.status(400).send({ error: 'Campo obrigatório: id_meta_caixa' });
    }
    if (!boca || boca < 1 || boca > 18) {
        console.log('ERRO: Boca inválida:', boca);
        return res.status(400).send({ error: 'boca deve estar entre 1 e 18' });
    }
    

    const getConnectionAsync = util.promisify(mysql.getConnection).bind(mysql);
    let conn;

    try {
        conn = await getConnectionAsync();
        const queryAsync = (sql, params) => new Promise((resolve, reject) => {
            conn.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
        });
        //const beginTransactionAsync = util.promisify(conn.beginTransaction).bind(conn);
        //const commitAsync = util.promisify(conn.commit).bind(conn);
        //const rollbackAsync = util.promisify(conn.rollback).bind(conn);

        const primeira_fibra = (tubo - 1) * fibras_portubo + 1;
        const ultima_fibra = tubo * fibras_portubo;
        

        const colunas = [];
        for (let i = primeira_fibra; i <= ultima_fibra; i++) colunas.push('F' + i);
        
        // Checar todas as fibras do tubo na boca origem (agrupando por tabela: cada tabela = 12 fibras)
        const tInicio = indiceTabelaParaFibra(primeira_fibra);
        const tFim = indiceTabelaParaFibra(ultima_fibra);
        for (let T = tInicio; T <= tFim; T++) {
            const inicio = Math.max(primeira_fibra, (T - 1) * 12 + 1);
            const fim = Math.min(ultima_fibra, T * 12);
            const cols = [];
            for (let f = inicio; f <= fim; f++) cols.push('F' + f);
            const tabela = nomeTabela(boca, inicio);
            const rows = await queryAsync(`SELECT ${cols.join(', ')} FROM tstmeta.${tabela} WHERE IDMETA = ?`, [id_meta_caixa]);
            if (!rows || rows.length === 0) {
                console.log('Registro não encontrado  com o id_meta:', id_meta_caixa, 'tabela:', tabela);
                return res.status(404).send({ message: 'Registro não encontrado  com o ID fornecido' });
            }
            const row = rows[0];
            for (const col of cols) {
                const val = row[col];
                if (!valorLivre(val)) {
                    const fibraNum = col.replace('F', '');
                    console.log(`Campo (${col}) já possui conexão:`, val);
                    return res.status(200).send({
                        error: 'Tubo já possui conexão',
                        message: `A fibra ${fibraNum} da boca ${boca} já está conectada. Valor atual: ${val}`,
                        boca: boca,
                        campo: col,
                        valor_atual: val
                    });
                }


            }
        }

        return res.status(200).send({ message: 'tubo livre' });
        
    } catch (error) {
        console.error('Erro na fusão por tubos:', error);
        if (res.headersSent) return;
        return res.status(500).send({
            error: error.message || 'Erro ao processar fusão por tubos',
            details: error.message
        });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
