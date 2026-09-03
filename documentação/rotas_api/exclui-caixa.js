const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

/**
 * Rota: /api/exclui_caixa
 * Função: Exclui uma caixa do banco de dados
 * Método: POST
 * Middleware: login (autenticação obrigatória)
 * 
 * Body esperado:
 * {
 *   id_meta: number,
 *   id_city: number,
 *   id_condominio: number
 * }
 */

router.post('/', login, (req, res, next) => {
    console.log('🗺️ [EXCLUI-CAIXA] Iniciando exclusão de caixa...');
    
    // ✅ Recebe os parâmetros do body
    const {
        id_meta,
        id_city,
        id_condominio
    } = req.body;

    // Validação dos parâmetros obrigatórios
    if (!id_meta) {
        return res.status(400).send({
            success: false,
            error: 'id_meta é obrigatório'
        });
    }

    mysql.getConnection((error, conn) => {
        if (error) {
            console.error('❌ [EXCLUI-CAIXA] Erro ao obter conexão:', error);
            return res.status(500).send({
                success: false,
                error: 'Erro de conexão com banco de dados'
            });
        }

        // 🔍 Verificar se há conexões nas bocas (BOCA1 até BOCA18)
        let queryBocas = `SELECT BOCA1, BOCA2, BOCA3, BOCA4, BOCA5, BOCA6, BOCA7, BOCA8, BOCA9, 
                                 BOCA10, BOCA11, BOCA12, BOCA13, BOCA14, BOCA15, BOCA16, BOCA17, BOCA18 
                          FROM tstmeta.caixa WHERE ID_META = ?`;
        
        conn.query(queryBocas, [id_meta], (error, resultadoBocas) => {
            if (error) {
                conn.release();
                console.error('❌ [EXCLUI-CAIXA] Erro ao verificar bocas:', error);
                return res.status(500).send({
                    success: false,
                    error: 'Erro ao verificar conexões nas bocas'
                });
            }

            // Verificar se alguma boca está conectada
            let flagConectada = false;
            if (resultadoBocas.length > 0) {
                const bocas = resultadoBocas[0];
                for (let i = 1; i <= 18; i++) {
                    const bocaKey = `BOCA${i}`;
                    const valorBoca = bocas[bocaKey];
                    // Verificar se boca está conectada (não vazia, não ' ', não null)
                    if (valorBoca && valorBoca.trim() !== '' && valorBoca.trim() !== ' ') {
                        flagConectada = true;
                        console.log(`⚠️ [EXCLUI-CAIXA] BOCA${i} está conectada: ${valorBoca}`);
                        break;
                    }
                }
            }

            // 🔍 Verificar se há splitter na tabela splitter_e
            const queryChecaSplitter = `SELECT COUNT(*) as total FROM tstmeta.splitter_e WHERE id_meta_caixa = ?`;
            
            conn.query(queryChecaSplitter, [id_meta], (error, resultadoSplitter) => {
                if (error) {
                    conn.release();
                    console.error('❌ [EXCLUI-CAIXA] Erro ao verificar splitter:', error);
                    return res.status(500).send({
                        success: false,
                        error: 'Erro ao verificar splitter'
                    });
                }

                const flagSplitter = resultadoSplitter.length > 0 && 
                                     resultadoSplitter[0].total > 0;
                const totalSplitters = resultadoSplitter[0]?.total || 0;

                // ⚠️ Verificar cada caso específico e retornar mensagem apropriada
                if (flagConectada && flagSplitter) {
                    // Caso 1: Ambos (cabo conectado E splitter)
                    conn.release();
                    console.log(`⚠️ [EXCLUI-CAIXA] Caixa ${id_meta} não pode ser excluída:`);
                    console.log(`   - Conectada: ${flagConectada}`);
                    console.log(`   - Splitter: ${flagSplitter} (total: ${totalSplitters})`);
                    return res.status(400).send({
                        success: false,
                        error: 'Caixa com cabos conectados e splitters! Desconecte os cabos e remova os splitters antes de excluir.',
                        message: `Caixa possui cabos conectados e ${totalSplitters} splitter(s). Desconecte os cabos e remova os splitters antes de excluir.`,
                        flagConectada: flagConectada,
                        flagSplitter: flagSplitter,
                        totalSplitters: totalSplitters,
                        motivo: 'cabos_conectados_e_splitters'
                    });
                } else if (flagConectada) {
                    // Caso 2: Apenas cabo conectado
                    conn.release();
                    console.log(`⚠️ [EXCLUI-CAIXA] Caixa ${id_meta} não pode ser excluída: possui cabos conectados`);
                    return res.status(400).send({
                        success: false,
                        error: 'Caixa com cabos conectados! Desconecte os cabos antes de excluir.',
                        message: 'Caixa possui cabos conectados. Desconecte todos os cabos antes de excluir.',
                        flagConectada: flagConectada,
                        flagSplitter: false,
                        totalSplitters: 0,
                        motivo: 'cabos_conectados'
                    });
                } else if (flagSplitter) {
                    // Caso 3: Apenas splitter
                    conn.release();
                    console.log(`⚠️ [EXCLUI-CAIXA] Caixa ${id_meta} não pode ser excluída: possui ${totalSplitters} splitter(s)`);
                    return res.status(400).send({
                        success: false,
                        error: 'Caixa com splitters! Remova os splitters antes de excluir.',
                        message: `Caixa possui ${totalSplitters} splitter(s). Remova todos os splitters antes de excluir.`,
                        flagConectada: false,
                        flagSplitter: flagSplitter,
                        totalSplitters: totalSplitters,
                        motivo: 'splitters'
                    });
                }

                // ✅ Se não estiver conectada e não tiver splitter, prossegue com a exclusão
                // Iniciar transação para garantir atomicidade
                conn.beginTransaction((error) => {
                    if (error) {
                        conn.release();
                        console.error('❌ [EXCLUI-CAIXA] Erro ao iniciar transação:', error);
                        return res.status(500).send({
                            success: false,
                            error: 'Erro ao iniciar transação',
                            details: error.message
                        });
                    }

                    // 🔍 0️⃣ Ler BOCA97 e BOCA99 da caixa para excluir os cabos internos
                    const queryBocasInternas = `SELECT BOCA97, BOCA99 FROM tstmeta.caixa WHERE ID_META = ?`;
                    
                    conn.query(queryBocasInternas, [id_meta], (error, resultadoBocasInternas) => {
                        if (error) {
                            return conn.rollback(() => {
                                conn.release();
                                console.error('❌ [EXCLUI-CAIXA] Erro ao ler BOCA97/BOCA99:', error);
                                return res.status(500).send({
                                    success: false,
                                    error: 'Erro ao ler bocas internas da caixa',
                                    details: error.message
                                });
                            });
                        }

                        // Função auxiliar para extrair id_meta do formato "cabo{id_meta}A" ou "cabo{id_meta}B"
                        const extrairIdMetaCabo = (valorBoca) => {
                            if (!valorBoca || typeof valorBoca !== 'string') {
                                return null;
                            }
                            // Formato: "cabo185512A" ou "cabo189510B"
                            // Extrair número entre "cabo" e a letra final (A ou B)
                            const match = valorBoca.match(/^cabo(\d+)[AB]$/);
                            return match ? parseInt(match[1], 10) : null;
                        };

                        // Array para armazenar os id_meta dos cabos a serem excluídos
                        const idMetasCabos = [];

                        if (resultadoBocasInternas.length > 0) {
                            const bocas = resultadoBocasInternas[0];
                            
                            // Extrair id_meta do cabo da BOCA99 (sempre termina com 'A')
                            if (bocas.BOCA99) {
                                const idMetaCabo99 = extrairIdMetaCabo(bocas.BOCA99);
                                if (idMetaCabo99) {
                                    idMetasCabos.push(idMetaCabo99);
                                    console.log(`🔍 [EXCLUI-CAIXA] Cabo da BOCA99 encontrado: ${bocas.BOCA99} → id_meta: ${idMetaCabo99}`);
                                } else {
                                    console.warn(`⚠️ [EXCLUI-CAIXA] Formato inválido na BOCA99: ${bocas.BOCA99}`);
                                }
                            }

                            // Extrair id_meta do cabo da BOCA97 (sempre termina com 'B')
                            if (bocas.BOCA97) {
                                const idMetaCabo97 = extrairIdMetaCabo(bocas.BOCA97);
                                if (idMetaCabo97) {
                                    idMetasCabos.push(idMetaCabo97);
                                    console.log(`🔍 [EXCLUI-CAIXA] Cabo da BOCA97 encontrado: ${bocas.BOCA97} → id_meta: ${idMetaCabo97}`);
                                } else {
                                    console.warn(`⚠️ [EXCLUI-CAIXA] Formato inválido na BOCA97: ${bocas.BOCA97}`);
                                }
                            }
                        }

                        // Função recursiva para excluir os cabos sequencialmente
                        const excluirCaboPorIndice = (indice) => {
                            if (indice >= idMetasCabos.length) {
                                // Todos os cabos foram excluídos, prosseguir com exclusão da caixa
                                console.log(`✅ [EXCLUI-CAIXA] Todos os cabos internos excluídos. Prosseguindo com exclusão da caixa...`);
                                
                                // 1️⃣ Delete na tabela tstmeta.ids (gera o ID_META)
                                const queryID = `DELETE FROM tstmeta.ids WHERE id_meta = ? AND id_city = ? AND id_condominio = ?`;
                                
                                conn.query(queryID, [id_meta, id_city, id_condominio], (error, resultadoID) => {
                                    if (error) {
                                        return conn.rollback(() => {
                                            conn.release();
                                            console.error('❌ [EXCLUI-CAIXA] Erro ao deletar de tstmeta.ids:', error);
                                            return res.status(500).send({
                                                success: false,
                                                error: 'Erro ao deletar caixa de tstmeta.ids',
                                                details: error.message
                                            });
                                        });
                                    }

                                    // Verificar se realmente deletou algo
                                    if (resultadoID.affectedRows === 0) {
                                        return conn.rollback(() => {
                                            conn.release();
                                            console.warn(`⚠️ [EXCLUI-CAIXA] Nenhuma caixa encontrada em tstmeta.ids - ID: ${id_meta}`);
                                            return res.status(404).send({
                                                success: false,
                                                error: 'Caixa não encontrada',
                                                message: `Nenhuma caixa encontrada com id_meta ${id_meta}`
                                            });
                                        });
                                    }

                                    console.log(`✅ [EXCLUI-CAIXA] Registro deletado de tstmeta.ids - ID: ${id_meta}`);

                                    // 2️⃣ Delete na tabela tst.caixa
                                    const queryCaixa = `DELETE FROM tst.caixa WHERE ID_META = ?`;
                                    
                                    conn.query(queryCaixa, [id_meta], (error, resultadoCaixa) => {
                                        if (error) {
                                            return conn.rollback(() => {
                                                conn.release();
                                                console.error('❌ [EXCLUI-CAIXA] Erro ao deletar de tst.caixa:', error);
                                                return res.status(500).send({
                                                    success: false,
                                                    error: 'Erro ao deletar caixa de tst.caixa',
                                                    details: error.message
                                                });
                                            });
                                        }

                                        // Verificar se realmente deletou algo
                                        if (resultadoCaixa.affectedRows === 0) {
                                            return conn.rollback(() => {
                                                conn.release();
                                                console.warn(`⚠️ [EXCLUI-CAIXA] Nenhuma caixa encontrada em tst.caixa - ID: ${id_meta}`);
                                                return res.status(404).send({
                                                    success: false,
                                                    error: 'Caixa não encontrada na tabela caixa',
                                                    message: `Nenhuma caixa encontrada com id_meta ${id_meta} na tabela caixa`
                                                });
                                            });
                                        }

                                        // ✅ Commit da transação
                                        conn.commit((error) => {
                                            if (error) {
                                                return conn.rollback(() => {
                                                    conn.release();
                                                    console.error('❌ [EXCLUI-CAIXA] Erro ao fazer commit da transação:', error);
                                                    return res.status(500).send({
                                                        success: false,
                                                        error: 'Erro ao confirmar exclusão',
                                                        details: error.message
                                                    });
                                                });
                                            }

                                            conn.release();
                                            console.log(`✅ [EXCLUI-CAIXA] Registro deletado de tst.caixa - ID: ${id_meta}`);
                                            console.log(`✅ [EXCLUI-CAIXA] Transação concluída com sucesso - Caixa ${id_meta} deletada`);
                                            
                                            return res.status(200).send({
                                                success: true,
                                                message: 'Caixa deletada com sucesso',
                                                id_meta: id_meta,
                                                id_city: id_city,
                                                affectedRowsIds: resultadoID.affectedRows,
                                                affectedRowsCaixa: resultadoCaixa.affectedRows,
                                                cabosExcluidos: idMetasCabos.length
                                            });
                                        });
                                    });
                                });
                                return;
                            }

                            // Excluir o cabo atual
                            const idMetaCabo = idMetasCabos[indice];
                            const queryExcluirCabo = `DELETE FROM tstmeta.ids WHERE id_meta = ? AND id_city = ?`;
                            
                            conn.query(queryExcluirCabo, [idMetaCabo, id_city], (error, resultadoCabo) => {
                                if (error) {
                                    return conn.rollback(() => {
                                        conn.release();
                                        console.error(`❌ [EXCLUI-CAIXA] Erro ao excluir cabo ${idMetaCabo}:`, error);
                                        return res.status(500).send({
                                            success: false,
                                            error: `Erro ao excluir cabo interno (id_meta: ${idMetaCabo})`,
                                            details: error.message
                                        });
                                    });
                                }

                                if (resultadoCabo.affectedRows > 0) {
                                    console.log(`✅ [EXCLUI-CAIXA] Cabo interno excluído: id_meta ${idMetaCabo}`);
                                } else {
                                    console.warn(`⚠️ [EXCLUI-CAIXA] Cabo interno não encontrado: id_meta ${idMetaCabo}`);
                                }

                                // Excluir próximo cabo (recursão)
                                excluirCaboPorIndice(indice + 1);
                            });
                        };

                        // Iniciar exclusão dos cabos (ou pular se não houver cabos)
                        if (idMetasCabos.length === 0) {
                            console.log('ℹ️ [EXCLUI-CAIXA] Nenhum cabo interno encontrado nas BOCA97/BOCA99. Prosseguindo com exclusão da caixa...');
                            excluirCaboPorIndice(0); // Vai direto para exclusão da caixa
                        } else {
                            console.log(`🔍 [EXCLUI-CAIXA] Iniciando exclusão de ${idMetasCabos.length} cabo(s) interno(s)...`);
                            excluirCaboPorIndice(0);
                        }
                    });
                });
            });
        });
    });
});

module.exports = router;
