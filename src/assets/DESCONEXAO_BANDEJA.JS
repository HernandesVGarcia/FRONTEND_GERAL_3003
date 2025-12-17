const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

/**
 * Rota: /api/desconexao_bandeja
 * Função: Desconecta um cabo de uma bandeja de DIO
 * Método: POST
 * Middleware: login (autenticação obrigatória)
 * 
 * Body esperado:
 * {
 *   idmeta_dio: number,
 *   idmeta_cabo: number,
 *   Ponta_cabo: "A" | "B",
 *   Capacidade_cabo: 1 | 2 | 4 | 6 | 8 | 12 | 24 | 36 | 48 | 72 | 144
 * }
 * 
 * Nota: A bandeja é detectada automaticamente buscando em C1-C6 da tabela DIO
 * pelo padrão "cabo{idmeta_cabo}{Ponta_cabo}" (ex: "cabo130154A")
 */

router.post('/', login, (req, res, next) => {
    console.log('🔌 [DESCONEXAO_BANDEJA] Iniciando desconexão de cabo da bandeja...');
    
    const {
        idmeta_dio,
        idmeta_cabo,
        Ponta_cabo,
        Capacidade_cabo
    } = req.body;

    // Validação dos parâmetros obrigatórios (numero_bandeja removido)
    if (!idmeta_dio || !idmeta_cabo || !Ponta_cabo || !Capacidade_cabo) {
        return res.status(400).send({
            success: false,
            error: 'Todos os parâmetros são obrigatórios: idmeta_dio, idmeta_cabo, Ponta_cabo, Capacidade_cabo'
        });
    }

    // Validar Ponta_cabo
    if (Ponta_cabo !== 'A' && Ponta_cabo !== 'B') {
        return res.status(400).send({
            success: false,
            error: 'Ponta_cabo deve ser "A" ou "B"'
        });
    }

    // Validar Capacidade_cabo
    const capacidadesValidas = [1, 2, 4, 6, 8, 12, 24, 36, 48, 72, 144];
    if (!capacidadesValidas.includes(Capacidade_cabo)) {
        return res.status(400).send({
            success: false,
            error: `Capacidade_cabo deve ser um dos valores: ${capacidadesValidas.join(', ')}`
        });
    }

    // Construir padrão do cabo para buscar (ex: "cabo130154A")
    const padraoCabo = `cabo${idmeta_cabo}${Ponta_cabo}`;

    mysql.getConnection((error, conn) => {
        if (error) {
            console.error('❌ [DESCONEXAO_BANDEJA] Erro ao obter conexão:', error);
            return res.status(500).send({
                success: false,
                error: 'Erro de conexão com banco de dados'
            });
        }

        // 1️⃣ Buscar em qual bandeja o cabo está conectado (C1 a C6)
        const buscaBandejaQuery = `SELECT C1, C2, C3, C4, C5, C6 FROM tstmeta.DIO WHERE ID_META = ?`;
        
        conn.query(buscaBandejaQuery, [idmeta_dio], (error, resultado) => {
            if (error) {
                conn.release();
                console.error('❌ [DESCONEXAO_BANDEJA] Erro ao buscar bandeja:', error);
                return res.status(500).send({
                    success: false,
                    error: 'Erro ao buscar bandeja do DIO',
                    details: error.message
                });
            }

            if (!resultado || resultado.length === 0) {
                conn.release();
                console.error(`❌ [DESCONEXAO_BANDEJA] DIO ${idmeta_dio} não encontrado`);
                return res.status(404).send({
                    success: false,
                    error: `DIO ${idmeta_dio} não encontrado`
                });
            }

            const dio = resultado[0];
            let numeroBandeja = null;
            let nomeBandeja = null;

            // Buscar em qual bandeja (C1 a C6) o cabo está conectado
            for (let i = 1; i <= 6; i++) {
                const campoBandeja = `C${i}`;
                const valorBandeja = dio[campoBandeja];
                
                // Verificar se o valor contém o padrão do cabo
                if (valorBandeja && typeof valorBandeja === 'string' && valorBandeja.includes(padraoCabo)) {
                    numeroBandeja = i;
                    nomeBandeja = campoBandeja;
                    console.log(`✅ [DESCONEXAO_BANDEJA] Cabo encontrado na bandeja ${nomeBandeja}`);
                    break;
                }
            }

            if (!numeroBandeja) {
                conn.release();
                console.error(`❌ [DESCONEXAO_BANDEJA] Cabo ${padraoCabo} não encontrado em nenhuma bandeja do DIO ${idmeta_dio}`);
                return res.status(404).send({
                    success: false,
                    error: `Cabo ${idmeta_cabo} (Ponta ${Ponta_cabo}) não está conectado em nenhuma bandeja do DIO ${idmeta_dio}`
                });
            }

            // Verificar se o cabo está realmente conectado antes de desconectar
            let consultaPontaLivre;
            if (Ponta_cabo === 'A') {
                consultaPontaLivre = `SELECT fibra_1label FROM tstmeta.caboa_t1 WHERE idmeta = ?`;
            } else {
                consultaPontaLivre = `SELECT fibra_1label FROM tstmeta.cabob_t1 WHERE idmeta = ?`;
            }

            conn.query(consultaPontaLivre, [idmeta_cabo], (error, resultado) => {
            if (error) {
                conn.release();
                console.error('❌ [DESCONEXAO_BANDEJA] Erro ao verificar conexão do cabo:', error);
                return res.status(500).send({
                    success: false,
                    error: 'Erro ao verificar se o cabo está conectado',
                    details: error.message
                });
            }

            // Verificar se o cabo está realmente conectado
            // Se fibra_1label estiver vazio ou null, o cabo já está desconectado
            const fibraLabel = resultado.length > 0 ? resultado[0].fibra_1label : null;
            const estaVazio = !fibraLabel || fibraLabel === '' || fibraLabel.trim() === '';

            if (estaVazio) {
                conn.release();
                console.log(`ℹ️ [DESCONEXAO_BANDEJA] Cabo ${idmeta_cabo} (Ponta ${Ponta_cabo}) já está desconectado`);
                return res.status(200).send({
                    success: true,
                    message: `Cabo ${idmeta_cabo} (Ponta ${Ponta_cabo}) já está desconectado. Nenhuma ação necessária.`,
                    idmeta_cabo: idmeta_cabo,
                    ponta_cabo: Ponta_cabo,
                    ja_desconectado: true
                });
            }

            // Se chegou aqui, o cabo está conectado, então pode continuar com a desconexão
            console.log(`✅ [DESCONEXAO_BANDEJA] Cabo ${idmeta_cabo} (Ponta ${Ponta_cabo}) está conectado na bandeja ${nomeBandeja}. Prosseguindo com desconexão...`);

            // Valor para atualizar na bandeja (espaço vazio para desconectar)
            const valorBandeja = ' ';

            // Iniciar transação
            conn.beginTransaction((err) => {
                if (err) {
                    conn.release();
                    console.error('❌ [DESCONEXAO_BANDEJA] Erro ao iniciar transação:', err);
                    return res.status(500).send({
                        success: false,
                        error: 'Erro ao iniciar transação'
                    });
                }

                // 1️⃣ Atualizar a bandeja na tabela dio
                const updateBandejaQuery = `UPDATE tstmeta.dio SET ?? = ? WHERE ID_META = ?`;
                
                conn.query(updateBandejaQuery, [nomeBandeja, valorBandeja, idmeta_dio], (error, resultado) => {
                    if (error) {
                        return conn.rollback(() => {
                            conn.release();
                            console.error('❌ [DESCONEXAO_BANDEJA] Erro ao atualizar bandeja:', error);
                            return res.status(500).send({
                                success: false,
                                error: 'Erro ao atualizar bandeja no DIO',
                                details: error.message
                            });
                        });
                    }

                    console.log(`✅ [DESCONEXAO_BANDEJA] Bandeja ${nomeBandeja} atualizada: ${valorBandeja}`);

                    // 2️⃣ Processar cada fibra (1 até Capacidade_cabo)
                    let processarFibras = () => {
                        const promises = [];
                        
                        for (let J = 1; J <= Capacidade_cabo; J++) {
                            // Determinar qual tabela usar baseado no número da fibra
                            let tabela_A, tabela_B, tabela_DIO;
                            
                            if (J <= 12) {
                                tabela_A = 'caboa_t1';
                                tabela_B = 'cabob_t1';
                                tabela_DIO = `dioc${numeroBandeja}_t1`;
                            } else if (J <= 24) {
                                tabela_A = 'caboa_t2';
                                tabela_B = 'cabob_t2';
                                tabela_DIO = `dioc${numeroBandeja}_t2`;
                            } else if (J <= 36) {
                                tabela_A = 'caboa_t3';
                                tabela_B = 'cabob_t3';
                                tabela_DIO = `dioc${numeroBandeja}_t3`;
                            } else if (J <= 48) {
                                tabela_A = 'caboa_t4';
                                tabela_B = 'cabob_t4';
                                tabela_DIO = `dioc${numeroBandeja}_t4`;
                            } else if (J <= 60) {
                                tabela_A = 'caboa_t5';
                                tabela_B = 'cabob_t5';
                                tabela_DIO = `dioc${numeroBandeja}_t5`;
                            } else if (J <= 72) {
                                tabela_A = 'caboa_t6';
                                tabela_B = 'cabob_t6';
                                tabela_DIO = `dioc${numeroBandeja}_t6`;
                            } else if (J <= 84) {
                                tabela_A = 'caboa_t7';
                                tabela_B = 'cabob_t7';
                                tabela_DIO = `dioc${numeroBandeja}_t7`;
                            } else if (J <= 96) {
                                tabela_A = 'caboa_t8';
                                tabela_B = 'cabob_t8';
                                tabela_DIO = `dioc${numeroBandeja}_t8`;
                            } else if (J <= 108) {
                                tabela_A = 'caboa_t9';
                                tabela_B = 'cabob_t9';
                                tabela_DIO = `dioc${numeroBandeja}_t9`;
                            } else if (J <= 120) {
                                tabela_A = 'caboa_t10';
                                tabela_B = 'cabob_t10';
                                tabela_DIO = `dioc${numeroBandeja}_t10`;
                            } else if (J <= 132) {
                                tabela_A = 'caboa_t11';
                                tabela_B = 'cabob_t11';
                                tabela_DIO = `dioc${numeroBandeja}_t11`;
                            } else {
                                tabela_A = 'caboa_t12';
                                tabela_B = 'cabob_t12';
                                tabela_DIO = `dioc${numeroBandeja}_t12`;
                            }

                            
                            

                            // Escolher tabela do cabo baseado na ponta
                            const tabelaCabo = Ponta_cabo === 'A' ? tabela_A : tabela_B;

                            // Atualizar labels no cabo
                            const updateCaboLabelQuery = `UPDATE tstmeta.?? SET FIBRA_${J}LABEL = '' WHERE IDMETA = ?`;
                            const updateCaboLabelNumQuery = `UPDATE tstmeta.?? SET FN_${J}LABEL = '' WHERE IDMETA = ?`;

                            // Atualizar labels no DIO
                            const updateDioLabelQuery = `UPDATE tstmeta.?? SET F${J}L = '=id()' WHERE IDMETA = ?`;
                            const updateDioLabelNumQuery = `UPDATE tstmeta.?? SET FN${J}L = '' WHERE IDMETA = ?`;

                            let updateCaboBeginEnd='';

                            if (Ponta_cabo==='A') { updateCaboBeginEnd= `UPDATE tstmeta.cabopa set beginx='', beginy='' where id_meta=?`} else {
                                 updateCaboBeginEnd= `UPDATE tstmeta.cabopb set endx='', endy='' where id_meta=?`     
                            }



                            // Criar promises para todas as atualizações
                            promises.push(
                                new Promise((resolve, reject) => {
                                    conn.query(updateCaboLabelQuery, [tabelaCabo, idmeta_cabo], (err) => {
                                        if (err) reject(err);
                                        else resolve();
                                    });
                                }),
                                new Promise((resolve, reject) => {
                                    conn.query(updateCaboLabelNumQuery, [tabelaCabo, idmeta_cabo], (err) => {
                                        if (err) reject(err);
                                        else resolve();
                                    });
                                }),
                                new Promise((resolve, reject) => {
                                    conn.query(updateDioLabelQuery, [tabela_DIO, idmeta_dio], (err) => {
                                        if (err) reject(err);
                                        else resolve();
                                    });
                                }),
                                new Promise((resolve, reject) => {
                                    conn.query(updateDioLabelNumQuery, [tabela_DIO, idmeta_dio], (err) => {
                                        if (err) reject(err);
                                        else resolve();
                                    });
                                }),
                                new Promise((resolve, reject) => {
                                    conn.query(updateCaboBeginEnd, [idmeta_cabo], (err) => {
                                        if (err) reject(err);
                                        else resolve();
                                    });
                                })

                            );
                        }

                        // Executar todas as atualizações em paralelo
                        Promise.all(promises)
                            .then(() => {
                                // 3️⃣ Commit da transação (DIOs não possuem campo estrutura)
                                conn.commit((err) => {
                                    if (err) {
                                        return conn.rollback(() => {
                                            conn.release();
                                            console.error('❌ [DESCONEXAO_BANDEJA] Erro ao fazer commit:', err);
                                            return res.status(500).send({
                                                success: false,
                                                error: 'Erro ao finalizar transação',
                                                details: err.message
                                            });
                                        });
                                    }

                                    conn.release();
                                    console.log(`✅ [DESCONEXAO_BANDEJA] Desconexão realizada com sucesso!`);
                                    return res.status(200).send({
                                        success: true,
                                        message: `Cabo ${idmeta_cabo} (Ponta ${Ponta_cabo}) desconectado da bandeja ${nomeBandeja} do DIO ${idmeta_dio}`,
                                        idmeta_dio: idmeta_dio,
                                        idmeta_cabo: idmeta_cabo,
                                        numero_bandeja: numeroBandeja,
                                        ponta_cabo: Ponta_cabo,
                                        capacidade: Capacidade_cabo,
                                        fibras_processadas: Capacidade_cabo
                                    });
                                });
                            })
                            .catch((error) => {
                                return conn.rollback(() => {
                                    conn.release();
                                    console.error('❌ [DESCONEXAO_BANDEJA] Erro ao processar fibras:', error);
                                    return res.status(500).send({
                                        success: false,
                                        error: 'Erro ao processar fibras',
                                        details: error.message
                                    });
                                });
                            });
                    };

                    // Iniciar processamento das fibras
                    processarFibras();
                });
            }); // Fecha conn.beginTransaction
            }); // Fecha conn.query (verificação de conexão)
        }); // Fecha conn.query (busca de bandeja)
    }); // Fecha mysql.getConnection
});

module.exports = router;

