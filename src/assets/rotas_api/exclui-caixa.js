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
                          FROM tstmeta.caixa WHERE idmeta = ?`;
        
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

            // 🔍 Verificar se há splitter
            const queryChecaSplitter = `SELECT conta_splitter FROM tstmeta.caixa WHERE idmeta = ?`;
            
            conn.query(queryChecaSplitter, [id_meta], (error, resultadoSplitter) => {
                if (error) {
                    conn.release();
                    console.error('❌ [EXCLUI-CAIXA] Erro ao verificar contador de splitter:', error);
                    return res.status(500).send({
                        success: false,
                        error: 'Erro ao verificar contador de splitter'
                    });
                }

                const flagSplitter = resultadoSplitter.length > 0 && 
                                     resultadoSplitter[0].conta_splitter > 0;

                // ⚠️ Se estiver conectada OU tiver splitter, impedir exclusão
                if (flagConectada || flagSplitter) {
                    conn.release();
                    console.log(`⚠️ [EXCLUI-CAIXA] Caixa ${id_meta} não pode ser excluída:`);
                    console.log(`   - Conectada: ${flagConectada}`);
                    console.log(`   - Splitter: ${flagSplitter}`);
                    return res.status(400).send({
                        success: false,
                        error: 'Caixa conectada ou com splitter! Desconecte os cabos e remova os splitters antes de excluir.',
                        message: 'Caixa conectada ou com splitter! Desconecte os cabos e remova os splitters antes de excluir.',
                        flagConectada: flagConectada,
                        flagSplitter: flagSplitter
                    });
                }

                // ✅ Se não estiver conectada e não tiver splitter, prossegue com a exclusão
                // 1️⃣ Delete na tabela tstmeta.ids (gera o ID_META)
                const queryID = `DELETE FROM tstmeta.ids WHERE id_meta = ? AND id_city = ? AND id_condominio = ?`;
                
                conn.query(
                    queryID,
                    [id_meta, id_city, id_condominio],
                    (error, resultadoID) => {
                        conn.release(); // Libera a conexão
                        
                        if (error) {
                            console.error('❌ [EXCLUI-CAIXA] Erro ao deletar caixa:', id_meta, 'de tstmeta.ids:', error);
                            return res.status(500).send({
                                success: false,
                                error: 'Erro ao deletar caixa',
                                details: error.message
                            });
                        }

                        // Verificar se realmente deletou algo
                        if (resultadoID.affectedRows === 0) {
                            console.warn(`⚠️ [EXCLUI-CAIXA] Nenhuma caixa encontrada para deletar - ID: ${id_meta}`);
                            return res.status(404).send({
                                success: false,
                                error: 'Caixa não encontrada',
                                message: `Nenhuma caixa encontrada com id_meta ${id_meta}`
                            });
                        }

                        console.log(`✅ [EXCLUI-CAIXA] Caixa deletada com sucesso - ID: ${id_meta}`);
                        return res.status(200).send({
                            success: true,
                            message: 'Caixa deletada com sucesso',
                            id_meta: id_meta,
                            id_city: id_city,
                            affectedRows: resultadoID.affectedRows
                        });
                    }
                );
            });
        });
    });
});

module.exports = router;
