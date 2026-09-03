const util = require('util');
const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

/**
 * Encontra a primeira boca livre (valor =id() ou null ou '') na caixa.
 * Retorna o número da fibra/boca (1-36).
 */
async function testaBoca97(conn, id_meta_caixa) {
    const queryAsync = (sql, params) => new Promise((resolve, reject) => {
        conn.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
    for (let fibraBoca = 1; fibraBoca <= 36; fibraBoca++) {
        let tabela_boca97;

        if (fibraBoca <= 12) tabela_boca97 = 'cxboca97_t1';
        else if (fibraBoca <= 24) tabela_boca97 = 'cxboca97_t2';
        else tabela_boca97 = 'cxboca97_t3';

        const query_consultabBoca = `SELECT f${fibraBoca} AS valor FROM tstmeta.${tabela_boca97} WHERE IDMETA = ?`;
        const rows = await queryAsync(query_consultabBoca, [id_meta_caixa]);
        if (!rows || rows.length === 0) continue;
        const valor = rows[0].valor;
        if (valor === '=id()' || valor === null || valor === '') return fibraBoca;
    }
    throw new Error('Nenhuma boca livre encontrada');
}

//******************atualizar fusão saída splitter -> entrada splitter *************/
router.post('/', login, async (req, res, next) => {
    console.log('executou update fusão');

    const {
        id_meta_splitterS,
        saida_splitter,
        id_meta_splitterE,
        id_meta_caixa
    } = req.body;

    // Validar campos obrigatórios
    if (!id_meta_splitterS) {
        console.log('ERRO: id_meta_splitterS é obrigatório');
        return res.status(400).send({
            error: 'Campo obrigatório: id_meta_splitterS'
        });
    }
    if (!id_meta_splitterE) {
        console.log('ERRO: id_meta_splitterE é obrigatório');
        return res.status(400).send({
            error: 'Campo obrigatório: id_meta_splitterE'
        });
    }
    if (!id_meta_caixa) {
        console.log('ERRO: id_meta_caixa é obrigatório');
        return res.status(400).send({
            error: 'Campo obrigatório: id_meta_caixa'
        });
    }
    if (!saida_splitter || saida_splitter < 1 || saida_splitter > 256) {
        console.log('ERRO: saida_splitter inválida:', saida_splitter);
        return res.status(400).send({
            error: 'saida_splitter deve estar entre 1 e 256'
        });
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

        const campo_splitterS = 'F' + saida_splitter;
        const campo_splitterE = 'ENTRADA';

        let tabela_splitterS;
        let tabela_boca97;
        let tabela_boca98;

        const fibra_Boca = await testaBoca97(conn, id_meta_caixa);

        const conteudoCampo_splitterS = `prop.boca97_${fibra_Boca}.label`;
        const conteudoCampo_splitterE = `prop.boca98_${fibra_Boca}.label`;
        const conteudoCampo_boca97 = `prop.splitter_${id_meta_splitterS}_${saida_splitter}.label`;
        const conteudoCampo_boca98 = `prop.splitter_e${id_meta_splitterE}.label`;

        if (fibra_Boca <= 12) {
            tabela_boca97 = 'cxboca97_t1';
            tabela_boca98 = 'cxboca98_t1';
        } else if (fibra_Boca >= 13 && fibra_Boca <= 24) {
            tabela_boca97 = 'cxboca97_t2';
            tabela_boca98 = 'cxboca98_t2';
        } else {
            tabela_boca97 = 'cxboca97_t3';
            tabela_boca98 = 'cxboca98_t3';
        }

        if (saida_splitter <= 16) {
            tabela_splitterS = 'splitter_t1';
        } else if (saida_splitter <= 32) {
            tabela_splitterS = 'splitter_t2';
        } else if (saida_splitter <= 48) {
            tabela_splitterS = 'splitter_t3';
        } else if (saida_splitter <= 64) {
            tabela_splitterS = 'splitter_t4';
        } else if (saida_splitter <= 80) {
            tabela_splitterS = 'splitter_t5';
        } else if (saida_splitter <= 96) {
            tabela_splitterS = 'splitter_t6';
        } else if (saida_splitter <= 112) {
            tabela_splitterS = 'splitter_t7';
        } else if (saida_splitter <= 128) {
            tabela_splitterS = 'splitter_t8';
        } else if (saida_splitter <= 144) {
            tabela_splitterS = 'splitter_t9';
        } else if (saida_splitter <= 160) {
            tabela_splitterS = 'splitter_t10';
        } else if (saida_splitter <= 176) {
            tabela_splitterS = 'splitter_t11';
        } else if (saida_splitter <= 192) {
            tabela_splitterS = 'splitter_t12';
        } else if (saida_splitter <= 208) {
            tabela_splitterS = 'splitter_t13';
        } else if (saida_splitter <= 224) {
            tabela_splitterS = 'splitter_t14';
        } else if (saida_splitter <= 240) {
            tabela_splitterS = 'splitter_t15';
        } else {
            tabela_splitterS = 'splitter_t16';
        }

        const tabela_splitterE = 'splitter_e';
        const campo_label_splitterS = `F${saida_splitter}`;
        const campo_label_splitterE = 'ENTRADA';

        const query_check_splitterS = `SELECT ?? AS valor FROM tstmeta.?? WHERE IDMETA = ?`;
        const query_check_splitterE = `SELECT ?? AS valor FROM tstmeta.?? WHERE IDMETA = ?`;

        const resultado_splitterS = await queryAsync(query_check_splitterS, [campo_label_splitterS, tabela_splitterS, id_meta_splitterS]);
        if (!resultado_splitterS || resultado_splitterS.length === 0) {
            console.log('Registro não encontrado na splitterS com o id_meta:', id_meta_splitterS);
            return res.status(404).send({
                message: 'Registro não encontrado no SplitterS com o ID fornecido'
            });
        }

        const valor_splitterS = resultado_splitterS[0].valor;
        const splitterS_livre = valor_splitterS === '=id()' || valor_splitterS === null || valor_splitterS === '';
        if (!splitterS_livre) {
            console.log(`Campo splitterS (${campo_label_splitterS}) já possui conexão:`, valor_splitterS);
            return res.status(400).send({
                error: 'Campo cabo já possui conexão',
                message: `A fibra ${saida_splitter} do Splitter ${id_meta_splitterS} já está conectada. Valor atual: ${valor_splitterS}`,
                campo: campo_label_splitterS,
                valor_atual: valor_splitterS
            });
        }

        const resultado_splitterE = await queryAsync(query_check_splitterE, [campo_label_splitterE, tabela_splitterE, id_meta_splitterE]);
        if (!resultado_splitterE || resultado_splitterE.length === 0) {
            console.log('Registro não encontrado no splitterE com o id_meta:', id_meta_splitterE);
            return res.status(404).send({
                message: 'Registro não encontrado no splitterE com o ID fornecido'
            });
        }

        const valor_splitterE = resultado_splitterE[0].valor;
        const splitterE_livre = valor_splitterE === '=id()' || valor_splitterE === null || valor_splitterE === '';
        if (!splitterE_livre) {
            console.log(`Campo splitterE (${campo_label_splitterE}) já possui conexão:`, valor_splitterE);
            return res.status(400).send({
                error: 'Campo splitterE já possui conexão',
                message: `A ${campo_splitterE} do splitter ${id_meta_splitterE} já está conectada. Valor atual: ${valor_splitterE}`,
                campo: campo_label_splitterE,
                valor_atual: valor_splitterE
            });
        }

        let transactionStarted = false;
        await beginTransactionAsync();
        transactionStarted = true;

        try {
            const query_update_splitterS = `UPDATE tstmeta.${tabela_splitterS} SET ${campo_splitterS} = ? WHERE IDMETA = ?`;
            const resultUpdateS = await queryAsync(query_update_splitterS, [conteudoCampo_splitterS, id_meta_splitterS]);
            if (resultUpdateS.affectedRows === 0) {
                await rollbackAsync();
                console.log('Nenhum splitter encontrado com o id_meta:', id_meta_splitterS);
                return res.status(404).send({
                    message: 'Nenhuma splitter encontrada com o ID fornecido'
                });
            }

            const query_update_splitterE = `UPDATE tstmeta.${tabela_splitterE} SET ${campo_splitterE} = ? WHERE IDMETA = ?`;
            const resultUpdateE = await queryAsync(query_update_splitterE, [conteudoCampo_splitterE, id_meta_splitterE]);
            if (resultUpdateE.affectedRows === 0) {
                await rollbackAsync();
                console.log('Nenhum Splitter encontrado com o id_meta:', id_meta_splitterE);
                return res.status(404).send({
                    message: 'Nenhum Splitter encontrado com o ID fornecido'
                });
            }


            const query_update_boca97 = `UPDATE tstmeta.${tabela_boca97} SET ${campo_boca97} = ? WHERE IDMETA = ?`;
            const resultUpdateBoca97 = await queryAsync(query_update_boca97, [conteudoCampo_boca97, id_meta_caixa]);
            if (resultUpdateBoca97.affectedRows === 0) {
                await rollbackAsync();
                console.log('Nenhum Boca 97 encontrado com o id_meta:', id_meta_caixa);
                return res.status(404).send({
                    message: 'Nenhum Boca 97 encontrado com o ID fornecido'
                });
            }

            const query_update_boca98 = `UPDATE tstmeta.${tabela_boca98} SET ${campo_boca98} = ? WHERE IDMETA = ?`;
            const resultUpdateBoca98 = await queryAsync(query_update_boca98, [conteudoCampo_boca98, id_meta_caixa]);
            if (resultUpdateBoca98.affectedRows === 0) {
                await rollbackAsync();
                console.log('Nenhum Boca 98 encontrado com o id_meta:', id_meta_caixa);
                return res.status(404).send({
                    message: 'Nenhum Boca 98 encontrado com o ID fornecido'
                });
            }

            await commitAsync();
            console.log(`Fusão realizada com sucesso. Origem: ${resultUpdateS.affectedRows} registros, Destino: ${resultUpdateE.affectedRows} registros`);
            return res.status(200).send({
                response: {
                    origem: resultUpdateS,
                    destino: resultUpdateE
                },
                message: `Fusão ${conteudoCampo_splitterS} com ${conteudoCampo_splitterE} atualizadas com sucesso`,
                affectedRows: {
                    origem: resultUpdateS.affectedRows,
                    destino: resultUpdateE.affectedRows
                }
            });
        } catch (err) {
            if (transactionStarted) await rollbackAsync();
            throw err;
        }
    } catch (err) {
        console.error('Erro na rota update_fusao_SaidaEntradaSP:', err);
        return res.status(500).send({
            error: err.message || 'Erro ao processar fusão saída-entrada splitter',
            details: err.message
        });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
