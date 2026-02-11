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
    console.log('executou update fusão');

    const {
        boca_origem,
        fibras_portubo_origem,
        tubo_origem,
        boca_destino,
        fibras_portubo_destino,
        tubo_destino,
        id_meta_caixa
    } = req.body;

    if (!id_meta_caixa) {
        console.log('ERRO: id_meta_caixa é obrigatório');
        return res.status(400).send({ error: 'Campo obrigatório: id_meta_caixa' });
    }
    if (!boca_origem || boca_origem < 1 || boca_origem > 18) {
        console.log('ERRO: Boca origem inválida:', boca_origem);
        return res.status(400).send({ error: 'boca_origem deve estar entre 1 e 18' });
    }
    if (!boca_destino || boca_destino < 1 || boca_destino > 18) {
        console.log('ERRO: Boca destino inválida:', boca_destino);
        return res.status(400).send({ error: 'boca_destino deve estar entre 1 e 18' });
    }

    const getConnectionAsync = util.promisify(mysql.getConnection).bind(mysql);
    let conn;

    try {
        conn = await getConnectionAsync();
        const queryAsync = (sql, params) => new Promise((resolve, reject) => {
            conn.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
        });
        const beginTransactionAsync = util.promisify(conn.beginTransaction).bind(conn);
        const commitAsync = util.promisify(conn.commit).bind(conn);
        const rollbackAsync = util.promisify(conn.rollback).bind(conn);

        const primeira_fibra_origem = (tubo_origem - 1) * fibras_portubo_origem + 1;
        const primeira_fibra_destino = (tubo_destino - 1) * fibras_portubo_destino + 1;
        const ultima_fibra_origem = tubo_origem * fibras_portubo_origem;
        const ultima_fibra_destino = tubo_destino * fibras_portubo_destino;

        const colunasOrigem = [];
        for (let i = primeira_fibra_origem; i <= ultima_fibra_origem; i++) colunasOrigem.push('F' + i);
        const colunasDestino = [];
        for (let i = primeira_fibra_destino; i <= ultima_fibra_destino; i++) colunasDestino.push('F' + i);

        // Checar todas as fibras do tubo na boca origem (agrupando por tabela: cada tabela = 12 fibras)
        const tInicioOrigem = indiceTabelaParaFibra(primeira_fibra_origem);
        const tFimOrigem = indiceTabelaParaFibra(ultima_fibra_origem);
        for (let T = tInicioOrigem; T <= tFimOrigem; T++) {
            const inicio = Math.max(primeira_fibra_origem, (T - 1) * 12 + 1);
            const fim = Math.min(ultima_fibra_origem, T * 12);
            const cols = [];
            for (let f = inicio; f <= fim; f++) cols.push('F' + f);
            const tabela = nomeTabela(boca_origem, inicio);
            const rowsOrigem = await queryAsync(`SELECT ${cols.join(', ')} FROM tstmeta.${tabela} WHERE IDMETA = ?`, [id_meta_caixa]);
            if (!rowsOrigem || rowsOrigem.length === 0) {
                console.log('Registro não encontrado na origem com o id_meta:', id_meta_caixa, 'tabela:', tabela);
                return res.status(404).send({ message: 'Registro não encontrado na origem com o ID fornecido' });
            }
            const rowOrigem = rowsOrigem[0];
            for (const col of cols) {
                const val = rowOrigem[col];
                if (!valorLivre(val)) {
                    const fibraNum = col.replace('F', '');
                    console.log(`Campo origem (${col}) já possui conexão:`, val);
                    return res.status(400).send({
                        error: 'Campo origem já possui conexão',
                        message: `A fibra ${fibraNum} da boca ${boca_origem} já está conectada. Valor atual: ${val}`,
                        boca: boca_origem,
                        campo: col,
                        valor_atual: val
                    });
                }
            }
        }

        // Checar todas as fibras do tubo na boca destino (agrupando por tabela)
        const tInicioDestino = indiceTabelaParaFibra(primeira_fibra_destino);
        const tFimDestino = indiceTabelaParaFibra(ultima_fibra_destino);
        for (let T = tInicioDestino; T <= tFimDestino; T++) {
            const inicio = Math.max(primeira_fibra_destino, (T - 1) * 12 + 1);
            const fim = Math.min(ultima_fibra_destino, T * 12);
            const cols = [];
            for (let f = inicio; f <= fim; f++) cols.push('F' + f);
            const tabela = nomeTabela(boca_destino, inicio);
            const rowsDestino = await queryAsync(`SELECT ${cols.join(', ')} FROM tstmeta.${tabela} WHERE IDMETA = ?`, [id_meta_caixa]);
            if (!rowsDestino || rowsDestino.length === 0) {
                console.log('Registro não encontrado no destino com o id_meta:', id_meta_caixa, 'tabela:', tabela);
                return res.status(404).send({ message: 'Registro não encontrado no destino com o ID fornecido' });
            }
            const rowDestino = rowsDestino[0];
            for (const col of cols) {
                const val = rowDestino[col];
                if (!valorLivre(val)) {
                    const fibraNum = col.replace('F', '');
                    console.log(`Campo destino (${col}) já possui conexão:`, val);
                    return res.status(400).send({
                        error: 'Campo destino já possui conexão',
                        message: `A fibra ${fibraNum} da boca ${boca_destino} já está conectada. Valor atual: ${val}`,
                        boca: boca_destino,
                        campo: col,
                        valor_atual: val
                    });
                }
            }
        }

        // Transação: UPDATE em todos os pares do tubo
        const numPares = Math.min(colunasOrigem.length, colunasDestino.length);
        await beginTransactionAsync();

        try {
            let soma_origem = 0;
            let soma_destino = 0;
            for (let k = 0; k < numPares; k++) {
                const i = primeira_fibra_origem + k;
                const j = primeira_fibra_destino + k;
                const conteudoDestino = `prop.boca${boca_destino}_${j}.label`;
                const conteudoOrigem = `prop.boca${boca_origem}_${i}.label`;

                const tabela_origem_i = nomeTabela(boca_origem, i);
                const query_origem = `UPDATE tstmeta.${tabela_origem_i} SET F${i} = ? WHERE IDMETA = ?`;
                const resultado_origem = await queryAsync(query_origem, [conteudoDestino, id_meta_caixa]);
                if (resultado_origem.affectedRows === 0) {
                    await rollbackAsync();
                    console.log('Nenhum registro encontrado na origem com o id_meta:', id_meta_caixa);
                    return res.status(404).send({ message: 'Nenhuma caixa encontrada na origem com o ID fornecido' });
                }
                soma_origem += resultado_origem.affectedRows;

                const tabela_destino_j = nomeTabela(boca_destino, j);
                const query_destino = `UPDATE tstmeta.${tabela_destino_j} SET F${j} = ? WHERE IDMETA = ?`;
                const resultado_destino = await queryAsync(query_destino, [conteudoOrigem, id_meta_caixa]);
                if (resultado_destino.affectedRows === 0) {
                    await rollbackAsync();
                    console.log('Nenhum registro encontrado no destino com o id_meta:', id_meta_caixa);
                    return res.status(404).send({ message: 'Nenhuma caixa encontrada no destino com o ID fornecido' });
                }
                soma_destino += resultado_destino.affectedRows;
            }

            await commitAsync();
            console.log(`Fusão do tubo realizada com sucesso. Pares: ${numPares}, Origem: ${soma_origem} registros, Destino: ${soma_destino} registros`);
            return res.status(200).send({
                response: { numPares, origem: soma_origem, destino: soma_destino },
                message: `Fusão por tubo concluída: ${numPares} pares de fibras atualizados`,
                affectedRows: { origem: soma_origem, destino: soma_destino }
            });
        } catch (err) {
            await rollbackAsync();
            throw err;
        }
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
