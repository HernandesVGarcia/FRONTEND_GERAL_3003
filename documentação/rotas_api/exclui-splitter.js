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
 * Rota: /api/exclui_splitter
 * Função: Exclui uma splitter de caixa de emenda.
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
 *   id_condominio: number,
 *   capacidade: number
 * }
 */

router.post('/', login, async (req, res, next) => {
    console.log('🗺️ [EXCLUI-splitter] Iniciando exclusão de splitter...');
    
    let conn;
    let transactionIniciada = false;

    try {
        // ✅ Recebe os parâmetros do body
        const {
            id_meta,
            id_meta_cx,
            id_city,
            id_condominio,
            capacidade
        } = req.body;

        // Validação dos parâmetros obrigatórios
        if (!id_meta) {
            return res.status(400).send({
                success: false,
                error: 'id_meta é obrigatório'
            });
        }

        // Validação da capacidade
        if (!capacidade || isNaN(capacidade) || capacidade <= 0) {
            return res.status(400).send({
                success: false,
                error: 'capacidade é obrigatória e deve ser um número positivo'
            });
        }

        // 🔹 Obter conexão do pool
        conn = await new Promise((resolve, reject) => {
            mysql.getConnection((error, connection) => {
                if (error) {
                    console.error('❌ [EXCLUI-splitter] Erro ao obter conexão:', error);
                    reject(error);
                } else {
                    resolve(connection);
                }
            });
        });

        // 🔍 Verificar se há conexões nas fibras
        // Calcular número de tabelas a verificar (arredondar para cima)
        const numTabelas = Math.ceil(capacidade / 16);
        
        // Verificar cada tabela
        let flagConectada = false;
        for (let tabela = 1; tabela <= numTabelas; tabela++) {
            // Calcular range de fibras para esta tabela
            const fibraInicio = (tabela - 1) * 16 + 1;
            // Para a última tabela, verificar apenas até a capacidade total
            // Para outras tabelas, sempre verificar as 16 fibras completas
            const fibraFim = Math.min(tabela * 16, capacidade);
            
            // Construir lista de campos dinamicamente
            const campos = [];
            for (let f = fibraInicio; f <= fibraFim; f++) {
                campos.push(`F${f}`);
            }
            const camposStr = campos.join(', ');
            
            const queryBocas = `SELECT ${camposStr} FROM tstmeta.splitter_t${tabela} WHERE IDMETA = ?`;
            
            try {
                const resultadoBocas = await executarQuery(conn, queryBocas, [id_meta]);
                
                if (resultadoBocas.length > 0) {
                    const bocas = resultadoBocas[0];
                    for (let f = fibraInicio; f <= fibraFim; f++) {
                        const bocaKey = `F${f}`;
                        const valorBoca = bocas[bocaKey];
                        // Verificar se fibra está conectada (não vazia, não ' ', não null)
                        if (valorBoca && valorBoca.trim() !== '' && valorBoca.trim() !== '=id()') {
                            flagConectada = true;
                            console.log(`⚠️ [EXCLUI-SPLITTER] Splitter conectado na tabela splitter_t${tabela}, fibra F${f}: ${valorBoca}`);
                            break;
                        }
                    }
                    if (flagConectada) break; // Sair do loop externo se encontrou conexão
                }
            } catch (queryError) {
                // Se a tabela não existir ou houver erro na query, logar e continuar
                // (pode acontecer se a capacidade for menor que o esperado)
                console.warn(`⚠️ [EXCLUI-SPLITTER] Erro ao verificar tabela splitter_t${tabela}:`, queryError.message);
                // Não interromper o processo, apenas logar o erro
            }
        }

        // 🔍 Verificar se a ENTRADA do splitter está livre (tabela splitter_e)
        // Quando livre, ENTRADA é '' (ou null ou '=id()')
        try {
            const queryEntrada = `SELECT ENTRADA FROM tstmeta.splitter_e WHERE IDMETA = ?`;
            const resultadoEntrada = await executarQuery(conn, queryEntrada, [id_meta]);
            if (resultadoEntrada.length > 0) {
                const valorEntrada = resultadoEntrada[0].ENTRADA;
                const entradaLivre = valorEntrada === '' || valorEntrada === null || valorEntrada === '=id()' || (typeof valorEntrada === 'string' && valorEntrada.trim() === '');
                if (!entradaLivre) {
                    flagConectada = true;
                    console.log(`⚠️ [EXCLUI-SPLITTER] Splitter ${id_meta} não pode ser excluído: entrada conectada (valor: ${valorEntrada})`);
                }
            }
        } catch (queryEntradaError) {
            console.warn('⚠️ [EXCLUI-SPLITTER] Erro ao verificar ENTRADA em splitter_e:', queryEntradaError.message);
        }

        // ⚠️ Verificar se splitter está conectado (saídas ou entrada) e retornar erro se estiver
        if (flagConectada) {
            conn.release();
            console.log(`⚠️ [EXCLUI-splitter] Splitter ${id_meta} não pode ser excluído: esta conectado`);
            return res.status(400).send({
                success: false,
                error: 'Splitter conectado! Desconecte as fibras (entrada e saídas) antes de excluir.',
                message: 'Splitter possui entrada ou fibras de saída conectadas. Desconecte antes de excluir.',
                flagConectada: flagConectada,
                flagSplitter: false,
                totalSplitters: 0,
                motivo: 'conectado'
            });
        }

        // ✅ Se não estiver conectado, prossegue com a exclusão
        // 🔹 Iniciar transação para garantir atomicidade
        await new Promise((resolve, reject) => {
            conn.beginTransaction((err) => {
                if (err) {
                    console.error('❌ [EXCLUI-splitter] Erro ao iniciar transação:', err);
                    reject(err);
                } else {
                    transactionIniciada = true;
                    resolve();
                }
            });
        });

        // 1️⃣ Delete na tabela tstmeta.ids
        const queryID = `DELETE FROM tstmeta.ids WHERE id_meta = ? AND id_city = ? AND id_condominio = ?`;
        
        const resultadoID = await executarQuery(conn, queryID, [id_meta, id_city, id_condominio]);

        // Verificar se realmente deletou algo
        if (resultadoID.affectedRows === 0) {
            await new Promise((resolve) => {
                conn.rollback(() => {
                    resolve();
                });
            });
            conn.release();
            console.warn(`⚠️ [EXCLUI-splitter] Nenhum splitter encontrado em tstmeta.ids - ID: ${id_meta}`);
            return res.status(404).send({
                success: false,
                error: 'Splitter não encontrado',
                message: `Nenhum Splitter encontrado com id_meta ${id_meta}`
            });
        }

        console.log(`✅ [EXCLUI-Splitter] Registro deletado de tstmeta.ids - ID: ${id_meta}`);

        // 2️⃣ Delete na tabela tstmeta.splitter_e
        const querySplitterE = `DELETE FROM tstmeta.splitter_e WHERE IDMETA = ?`;
        const resultadoSplitterE = await executarQuery(conn, querySplitterE, [id_meta]);

        if (resultadoSplitterE.affectedRows > 0) {
            console.log(`✅ [EXCLUI-Splitter] Registro deletado de tstmeta.splitter_e - ID: ${id_meta}`);
        } else {
            console.warn(`⚠️ [EXCLUI-Splitter] Nenhum registro encontrado em tstmeta.splitter_e - ID: ${id_meta}`);
        }

        // 3 decrementa contador splitter na tabela tstmeta.caixa
        const querySubContador = `UPDATE tstmeta.caixa set conta_splitter=conta_splitter - 1 where ID_META = ?`;
        const resultadoContador = await executarQuery(conn, querySubContador, [id_meta_cx]);

        if (resultadoContador.affectedRows > 0) {
            console.log(`✅ [EXCLUI-Splitter] contador splitter decrementado de tstmeta.caixa - ID: ${id_meta_cx}`);
        } else {
            console.warn(`⚠️ [EXCLUI-Splitter] Nenhum registro decrementado tstmeta.caixa - ID: ${id_meta_cx}`);
        }

        // ✅ Commit da transação
        await new Promise((resolve, reject) => {
            conn.commit((err) => {
                if (err) {
                    console.error('❌ [EXCLUI-Splitter] Erro ao fazer commit da transação:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        conn.release();
        transactionIniciada = false;
        
        console.log(`✅ [EXCLUI-Splitter] Transação concluída com sucesso - Splitter ${id_meta} deletado`);
        
        return res.status(200).send({
            success: true,
            message: 'Splitter deletado com sucesso',
            id_meta: id_meta,
            id_city: id_city,
            affectedRowsIds: resultadoID.affectedRows,
            affectedRowsSplitterE: resultadoSplitterE.affectedRows
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
                    console.error('❌ [EXCLUI-Splitter] Erro ao fazer rollback:', rollbackError);
                }
            }
            conn.release();
        }

        console.error('❌ [EXCLUI-splitter] Erro:', error);
        
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
        } else if (error.message && (error.message.includes('splitter_t') || error.message.includes('tabela'))) {
            return res.status(500).send({
                success: false,
                error: 'Erro ao verificar conexões nas tabelas do splitter',
                details: error.message
            });
        } else if (error.message && error.message.includes('tstmeta.ids')) {
            return res.status(500).send({
                success: false,
                error: 'Erro ao deletar splitter de tstmeta.ids',
                details: error.message
            });
        } else if (error.message && error.message.includes('splitter_e')) {
            return res.status(500).send({
                success: false,
                error: 'Erro ao deletar splitter de tstmeta.splitter_e',
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
                error: 'Erro ao processar exclusão do splitter',
                details: error.message
            });
        }
    }
});

module.exports = router;