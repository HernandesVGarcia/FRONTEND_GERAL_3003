const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

/**
 * 🔧 Helper function para executar queries de forma mais limpa
 * @param {Object} conn - Conexão do MySQL
 * @param {string} query - Query SQL
 * @param {Array} params - Parâmetros da query
 * @returns {Promise} Promise com o resultado da query
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
 * Rota: /api/exclui_estacao
 * Função:  estação
 * Método: POST
 * Middleware: login (autenticação obrigatória)
 * 
 * 🔄 Versão refatorada usando async/await
 * Esta versão elimina o "callback hell" e torna o código mais legível
 * 
 * Body esperado:
 * {
 *   id_meta: number,
 *   id_city: number,
 * }
 */

router.post('/', login, async (req, res, next) => {
    console.log('🗺️ [EXCLUI-estação] Iniciando exclusão Estação...');
    
    let conn;
    let transactionIniciada = false;

    try {
        // ✅ Recebe os parâmetros do body
        const {
            id_meta,
            id_city
        } = req.body;

        // Validação dos parâmetros obrigatórios
        if (!id_meta) {
            return res.status(400).send({
                success: false,
                error: 'id_meta é obrigatório'
            });
        }

        // Validação dos parâmetros obrigatórios
        if (!id_city) {
            return res.status(400).send({
                success: false,
                error: 'id_city é obrigatório'
            });
        }

       
        // 🔹 Obter conexão do pool
        conn = await new Promise((resolve, reject) => {
            mysql.getConnection((error, connection) => {
                if (error) {
                    console.error('❌ [EXCLUI-estação] Erro ao obter conexão:', error);
                    reject(error);
                } else {
                    resolve(connection);
                }
            });
        });

        let flagConectada = false;

        // 🔍 Verificar se existe DIO vinculado à estação (tabela tstmeta.dio)
        try {
            const querydio = `SELECT id_meta FROM tstmeta.dio WHERE id_estacao = ?`;
            const resultadodio = await executarQuery(conn, querydio, [id_meta]);
            if (resultadodio.length > 0) {
                flagConectada = true;
                console.log(`⚠️ [EXCLUI-Estação] Estação ${id_meta} não pode ser excluída: existe DIO referenciado a ela`);
            }
        } catch (queryEntradaError) {
            console.warn('⚠️ [EXCLUI-Estação] Erro ao verificar Dios na estação:', queryEntradaError.message);
        }

        // ⚠️ Verificar se splitter está conectado (saídas ou entrada) e retornar erro se estiver
        if (flagConectada) {
            conn.release();
            console.log(`⚠️ [EXCLUI-Estacao] Estação ${id_meta} não pode ser excluída: existe DIO referenciado a ela`);
            return res.status(400).send({
                success: false,
                error: 'Estação possui DIO referenciado a ela.',
                message: 'Existe DIO referenciado a essa Estação',
                flagConectada: flagConectada,
                flagSplitter: false,
                totalSplitters: 0,
                motivo: 'Infraestrutura Dio'
            });
        }

        // ✅ Se não estiver conectado, prossegue com a exclusão
        // 🔹 Iniciar transação para garantir atomicidade
        await new Promise((resolve, reject) => {
            conn.beginTransaction((err) => {
                if (err) {
                    console.error('❌ [EXCLUI-Estação] Erro ao iniciar transação:', err);
                    reject(err);
                } else {
                    transactionIniciada = true;
                    resolve();
                }
            });
        });

        // 1️⃣ Delete na tabela tstmeta.ids
        const queryID = `DELETE FROM tstmeta.ids WHERE id_meta = ? AND id_city = ?`;
        
        const resultadoID = await executarQuery(conn, queryID, [id_meta, id_city]);

        // Verificar se realmente deletou algo
        if (resultadoID.affectedRows === 0) {
            await new Promise((resolve) => {
                conn.rollback(() => {
                    resolve();
                });
            });
            conn.release();
            console.warn(`⚠️ [EXCLUI-Estação] Nenhum pop encontrado em tstmeta.ids - ID: ${id_meta}`);
            return res.status(404).send({
                success: false,
                error: 'Estação não encontrada',
                message: `Nenhuma estação encontrado com id_meta ${id_meta}`
            });
        }

        console.log(`✅ [EXCLUI-Estação] Registro deletado de tstmeta.ids - ID: ${id_meta}`);

        // 2️⃣ Delete na tabela tst.estações
        const querytst = `DELETE FROM tst.estações WHERE ID_META = ?`;
        const resultadotst = await executarQuery(conn, querytst, [id_meta]);

        if (resultadotst.affectedRows > 0) {
            console.log(`✅ [EXCLUI-Estação] Registro deletado de tst.estações - ID: ${id_meta}`);
        } else {
            console.warn(`⚠️ [EXCLUI-Estação] Nenhum registro encontrado em tst.estações - ID: ${id_meta}`);
        }

        
        

        // ✅ Commit da transação
        await new Promise((resolve, reject) => {
            conn.commit((err) => {
                if (err) {
                    console.error('❌ [EXCLUI-Estação] Erro ao fazer commit da transação:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        conn.release();
        transactionIniciada = false;
        
        console.log(`✅ [EXCLUI-Estação] Transação concluída com sucesso - Estação ${id_meta} deletada`);
        
        return res.status(200).send({
            success: true,
            message: 'Estação deletada com sucesso',
            id_meta: id_meta,
            id_city: id_city,
            affectedRowsIds: resultadoID.affectedRows,
            affectedRowstst: resultadotst.affectedRows
        });

    } catch (error) {
        // Tratamento de erros centralizado
        if (conn) {
            if (transactionIniciada) {
                try {
                    await new Promise((resolve) => {
                        conn.rollback(() => {
                            resolve();
                        });
                    });
                } catch (rollbackError) {
                    console.error('❌ [EXCLUI-Estação] Erro ao fazer rollback:', rollbackError);
                }
            }
            conn.release();
        }

        console.error('❌ [EXCLUI-Estação] Erro:', error);
        
        // Retornar erro apropriado baseado no tipo
        if (error.message && error.message.includes('conexão')) {
            return res.status(500).send({
                success: false,
                error: 'Erro de conexão com banco de dados',
                details: error.message
            });
        } else if (error.message && error.message.includes('transação')) {
            return res.status(500).send({
                success: false,
                error: 'Erro ao iniciar transação',
                details: error.message
            });
        
        } else if (error.message && error.message.includes('tstmeta.ids')) {
            return res.status(500).send({
                success: false,
                error: 'Erro ao deletar Estação de tstmeta.ids',
                details: error.message
            });
        } else if (error.message && error.message.includes('tst.estações')) {
            return res.status(500).send({
                success: false,
                error: 'Erro ao deletar Estação de tst.estações',
                details: error.message
            });
        } else if (error.message && error.message.includes('commit')) {
            return res.status(500).send({
                success: false,
                error: 'Erro ao confirmar exclusão',
                details: error.message
            });
        } else {
            return res.status(500).send({
                success: false,
                error: 'Erro ao processar exclusão da estação',
                details: error.message
            });
        }
    }
});

module.exports = router;