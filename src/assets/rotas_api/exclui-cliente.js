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
 * Rota: /api/exclui_cliente
 * Função: Exclui cliente
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
    console.log('🗺️ [EXCLUI-cliente] Iniciando exclusão de Cliente...');
    
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
                    console.error('❌ [EXCLUI-cliente] Erro ao obter conexão:', error);
                    reject(error);
                } else {
                    resolve(connection);
                }
            });
        });

        let flagConectada = false;
        let flagCabos = false;

        // 🔍 Verificar se existe DIO vinculado à estação (tabela tstmeta.dio)
        try {
            const querydio = `SELECT id_meta FROM tstmeta.dio WHERE id_estacao = ?`;
            const resultadodio = await executarQuery(conn, querydio, [id_meta]);
            if (resultadodio.length > 0) {
                flagConectada = true;
                console.log(`⚠️ [EXCLUI-Cliente] Cliente ${id_meta} não pode ser excluída: existe DIO referenciado a ela`);
            }
        } catch (queryEntradaError) {
            console.warn('⚠️ [EXCLUI-Cliente] Erro ao verificar Dios no cliente:', queryEntradaError.message);
        }

        // ⚠️ Verificar se  está conectado  e retornar erro se estiver
        if (flagConectada) {
            conn.release();
            console.log(`⚠️ [EXCLUI-Cliente] Cliente ${id_meta} não pode ser excluída: existe DIO referenciado a ele`);
            return res.status(400).send({
                success: false,
                error: 'Cliente possui DIO referenciado a ele.',
                message: 'Existe DIO referenciado a esse Cliente',
                flagConectada: flagConectada,
                flagSplitter: false,
                totalSplitters: 0,
                motivo: 'Infraestrutura Dio'
            });
        }

        // 🔍 Verificar se existe Cabo conectado ao cliente 
        try {
            const queryCabo = `SELECT CONTA_CONEX, recurso_sp from tstmeta.pop WHERE ID_META = ?`;
            const resultadoCabo = await executarQuery(conn, queryCabo, [id_meta]);
            const row = resultadoCabo[0];
            if (row && ((row.CONTA_CONEX ?? 0) > 0 || (row.recurso_sp ?? 0) !== 0)) {
                flagCabos = true;
                console.log(`⚠️ [EXCLUI-Cliente] Cliente ${id_meta} não pode ser excluída: existe cabo ou recurso OLT referenciado`);
            }
        } catch (queryEntradaError) {
            console.warn('⚠️ [EXCLUI-Cliente] Erro ao verificar ,cliente conectado a cabo ou vinculado a olt', queryEntradaError.message);
        }

        // ⚠️ Verificar se existe Cabo conectado ao cliente
        if (flagCabos) {
            conn.release();
            console.log(`⚠️ [EXCLUI-Cliente] Cliente ${id_meta} não pode ser excluída: existe recurso referenciado a ele`);
            return res.status(400).send({
                success: false,
                error: 'Cliente possui cabo conectado a ele ou esta referenciado a olt.',
                message: 'Cliente possui cabo conectado a ele ou OLT referenciada, libere o recurso',
                flagConectada: flagConectada,
                flagSplitter: false,
                totalSplitters: 0,
                motivo: 'Infraestrutura Cabo ou OLT'
            });
        }



        // ✅ Se não estiver conectado, prossegue com a exclusão
        // 🔹 Iniciar transação para garantir atomicidade
        await new Promise((resolve, reject) => {
            conn.beginTransaction((err) => {
                if (err) {
                    console.error('❌ [EXCLUI-cliente] Erro ao iniciar transação:', err);
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
            console.warn(`⚠️ [EXCLUI-Cliente] Nenhum cliente encontrado em tstmeta.ids - ID: ${id_meta}`);
            return res.status(404).send({
                success: false,
                error: 'Cliente não encontrada',
                message: `Nenhuma cliente encontrado com id_meta ${id_meta}`
            });
        }

        console.log(`✅ [Cliente-Estação] Registro deletado de tstmeta.ids - ID: ${id_meta}`);

        // 2️⃣ Delete na tabela tst.estações
        const querytst = `DELETE FROM tst.estações WHERE ID_META = ?`;
        const resultadotst = await executarQuery(conn, querytst, [id_meta]);

        if (resultadotst.affectedRows > 0) {
            console.log(`✅ [EXCLUI-cliente] Registro deletado de tst.estações - ID: ${id_meta}`);
        } else {
            console.warn(`⚠️ [EXCLUI-cliente] Nenhum registro encontrado em tst.estações - ID: ${id_meta}`);
        }

        
        

        // ✅ Commit da transação
        await new Promise((resolve, reject) => {
            conn.commit((err) => {
                if (err) {
                    console.error('❌ [EXCLUI-Cliente] Erro ao fazer commit da transação:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        conn.release();
        transactionIniciada = false;
        
        console.log(`✅ [EXCLUI-Cliente] Transação concluída com sucesso - Cliente ${id_meta} deletado`);
        
        return res.status(200).send({
            success: true,
            message: 'Cliente deletado com sucesso',
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
                    console.error('❌ [EXCLUI-Cliente] Erro ao fazer rollback:', rollbackError);
                }
            }
            conn.release();
        }

        console.error('❌ [EXCLUI-Cliente] Erro:', error);
        
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
                error: 'Erro ao deletar Cliente de tstmeta.ids',
                details: error.message
            });
        } else if (error.message && error.message.includes('tst.estações')) {
            return res.status(500).send({
                success: false,
                error: 'Erro ao deletar Cliente de tst.estações',
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
                error: 'Erro ao processar exclusão de cliente',
                details: error.message
            });
        }
    }
});

module.exports = router;