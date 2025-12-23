const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

/**
 * Rota: /api/conexao_boca
 * Função: Conecta um cabo a uma boca de caixa (baseado no VB6 CONECTA_BOCA1)
 * Método: POST
 * Middleware: login (autenticação obrigatória)
 * 
 * Body esperado:
 * {
 *   numero_boca: "boca1" | "boca2" | ... | "boca18",
 *   idmeta_caixa: number,
 *   idmeta_cabo: number,
 *   Ponta_cabo: "A" | "B",
 *   Capacidade_cabo: 1 | 2 | 4 | 6 | 8 | 12 | 24 | 36 | 48 | 72 | 144
 * }
 */

router.post('/', login, (req, res, next) => {
    console.log('🔌 [DESCONEXAO_BOCA] Iniciando desconexão de cabo à boca...');
    
    const {
        numero_boca,
        idmeta_caixa,
        idmeta_cabo,
        Ponta_cabo,
        Capacidade_cabo
    } = req.body;

    // Validação dos parâmetros obrigatórios
    if (!numero_boca || !idmeta_caixa || !idmeta_cabo || !Ponta_cabo || !Capacidade_cabo) {
        return res.status(400).send({
            success: false,
            error: 'Todos os parâmetros são obrigatórios: numero_boca, idmeta_caixa, idmeta_cabo, Ponta_cabo, Capacidade_cabo'
        });
    }

    // Validar numero_boca (boca1 até boca18)
    const bocaMatch = numero_boca.match(/^boca(\d+)$/);
    if (!bocaMatch) {
        return res.status(400).send({
            success: false,
            error: 'numero_boca deve estar no formato "boca1" até "boca18"'
        });
    }

    const numeroBoca = parseInt(bocaMatch[1]);
    if (numeroBoca < 1 || numeroBoca > 18) {
        return res.status(400).send({
            success: false,
            error: 'numero_boca deve ser entre "boca1" e "boca18"'
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

    // Converter Ponta_cabo para formato do VB6 (cabopa ou cabopb)
    const pontaCaboVB6 = Ponta_cabo === 'A' ? 'cabopa' : 'cabopb';
    
    // Nome da boca no banco (BOCA1, BOCA2, etc.)
    const nomeBoca = `BOCA${numeroBoca}`;
    
    // Nome do campo ESTRUT (ESTRUT01, ESTRUT02, etc.) - acompanha o número da boca
    const nomeEstrut = `ESTRUT${String(numeroBoca).padStart(2, '0')}`;
    
    // Valor para atualizar na boca (cabo{idmeta_cabo}A ou cabo{idmeta_cabo}B)
    const valorBoca = `cabo${idmeta_cabo}${Ponta_cabo}`;

    mysql.getConnection((error, conn) => {
        if (error) {
            console.error('❌ [DESCONEXAO_BOCA] Erro ao obter conexão:', error);
            return res.status(500).send({
                success: false,
                error: 'Erro de desconexão com banco de dados'
            });
        }

        // Verificar se o cabo está realmente conectado antes de desconectar
        let consultaPontaLivre;
        if (Ponta_cabo === 'A') {
            consultaPontaLivre = `SELECT fibra_1label FROM caboa_t1 WHERE idmeta = ?`;
        } else {
            consultaPontaLivre = `SELECT fibra_1label FROM cabob_t1 WHERE idmeta = ?`;
        }

        conn.query(consultaPontaLivre, [idmeta_cabo], (error, resultado) => {
            if (error) {
                conn.release();
                console.error('❌ [DESCONEXAO_BOCA] Erro ao verificar conexão do cabo:', error);
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
                console.log(`ℹ️ [DESCONEXAO_BOCA] Cabo ${idmeta_cabo} (Ponta ${Ponta_cabo}) já está desconectado`);
                return res.status(200).send({
                    success: true,
                    message: `Cabo ${idmeta_cabo} (Ponta ${Ponta_cabo}) já está desconectado. Nenhuma ação necessária.`,
                    idmeta_cabo: idmeta_cabo,
                    ponta_cabo: Ponta_cabo,
                    ja_desconectado: true
                });
            }

            // Se chegou aqui, o cabo está conectado, então pode continuar com a desconexão
            console.log(`✅ [DESCONEXAO_BOCA] Cabo ${idmeta_cabo} (Ponta ${Ponta_cabo}) está conectado. Prosseguindo com desconexão...`);

            // Iniciar transação
            conn.beginTransaction((err) => {
                if (err) {
                    conn.release();
                    console.error('❌ [CONEXAO_BOCA] Erro ao iniciar transação:', err);
                    return res.status(500).send({
                        success: false,
                        error: 'Erro ao iniciar transação'
                    });
                }

            // 1️⃣ Verificar se estrutura já está criada (pode pular se ESTRUTXX = 'OK')
            // O campo ESTRUT varia de 01 a 18, acompanhando o número da boca
            const checkEstruturaQuery = `SELECT ?? as estrutura FROM tstmeta.caixa WHERE ID_META = ?`;
            
            conn.query(checkEstruturaQuery, [nomeEstrut, idmeta_caixa], (error, resultado) => {
                if (error) {
                    return conn.rollback(() => {
                        conn.release();
                        console.error('❌ [CONEXAO_BOCA] Erro ao verificar estrutura:', error);
                        return res.status(500).send({
                            success: false,
                            error: 'Erro ao verificar estrutura da caixa',
                            details: error.message
                        });
                    });
                }

                const estruturaOK = resultado.length > 0 && resultado[0].estrutura === 'OK';
                
                if (estruturaOK) {
                    console.log(`✅ [CONEXAO_BOCA] Estrutura ${nomeEstrut} já criada, pulando criação...`);
                }

                // 2️⃣ Atualizar a boca na tabela caixa
                const updateBocaQuery = `UPDATE tstmeta.caixa SET ?? = ? WHERE ID_META = ?`;
                
                conn.query(updateBocaQuery, [nomeBoca, valorBoca, idmeta_caixa], (error, resultado) => {
                    if (error) {
                        return conn.rollback(() => {
                            conn.release();
                            console.error('❌ [DESCONEXAO_BOCA] Erro ao atualizar boca:', error);
                            return res.status(500).send({
                                success: false,
                                error: 'Erro ao atualizar boca na caixa',
                                details: error.message
                            });
                        });
                    }

                    console.log(`✅ [DESCONEXAO_BOCA] Boca ${nomeBoca} atualizada: ${valorBoca}`);

                    // 3️⃣ Processar cada fibra (1 até Capacidade_cabo)
                    let processarFibras = () => {
                        const promises = [];
                        
                        for (let J = 1; J <= Capacidade_cabo; J++) {
                            // Determinar qual tabela usar baseado no número da fibra
                            let tabela_A, tabela_B, tabela_CX;
                            
                            if (J <= 12) {
                                tabela_A = 'caboa_t1';
                                tabela_B = 'cabob_t1';
                                tabela_CX = `cxboca${numeroBoca}_t1`;
                            } else if (J <= 24) {
                                tabela_A = 'caboa_t2';
                                tabela_B = 'cabob_t2';
                                tabela_CX = `cxboca${numeroBoca}_t2`;
                            } else if (J <= 36) {
                                tabela_A = 'caboa_t3';
                                tabela_B = 'cabob_t3';
                                tabela_CX = `cxboca${numeroBoca}_t3`;
                            } else if (J <= 48) {
                                tabela_A = 'caboa_t4';
                                tabela_B = 'cabob_t4';
                                tabela_CX = `cxboca${numeroBoca}_t4`;
                            } else if (J <= 60) {
                                tabela_A = 'caboa_t5';
                                tabela_B = 'cabob_t5';
                                tabela_CX = `cxboca${numeroBoca}_t5`;
                            } else if (J <= 72) {
                                tabela_A = 'caboa_t6';
                                tabela_B = 'cabob_t6';
                                tabela_CX = `cxboca${numeroBoca}_t6`;
                            } else if (J <= 84) {
                                tabela_A = 'caboa_t7';
                                tabela_B = 'cabob_t7';
                                tabela_CX = `cxboca${numeroBoca}_t7`;
                            } else if (J <= 96) {
                                tabela_A = 'caboa_t8';
                                tabela_B = 'cabob_t8';
                                tabela_CX = `cxboca${numeroBoca}_t8`;
                            } else if (J <= 108) {
                                tabela_A = 'caboa_t9';
                                tabela_B = 'cabob_t9';
                                tabela_CX = `cxboca${numeroBoca}_t9`;
                            } else if (J <= 120) {
                                tabela_A = 'caboa_t10';
                                tabela_B = 'cabob_t10';
                                tabela_CX = `cxboca${numeroBoca}_t10`;
                            } else if (J <= 132) {
                                tabela_A = 'caboa_t11';
                                tabela_B = 'cabob_t11';
                                tabela_CX = `cxboca${numeroBoca}_t11`;
                            } else {
                                tabela_A = 'caboa_t12';
                                tabela_B = 'cabob_t12';
                                tabela_CX = `cxboca${numeroBoca}_t12`;
                            }

                            
                            //const geoPonta= ``;



                            // Labels para o cabo (referência à caixa)
                            //const CABOLABEL = `=TST${idmeta_caixa}!PROP.${nomeBoca}_${J}.VALUE`;
                            //const CABOLABELnum = `=TST${idmeta_caixa}!PROP.FN${numeroBoca}_${J}.VALUE`;

                            // Labels para a caixa (referência ao cabo)
                            //const CAIXALABEL = `=cabo${idmeta_cabo}${Ponta_cabo}!Prop.Fibra_${J}.VALUE`;
                            //const CAIXALABELnum = `=cabo${idmeta_cabo}${Ponta_cabo}!Prop.FN_${J}.VALUE`;

                            // Escolher tabela do cabo baseado na ponta
                            const tabelaCabo = Ponta_cabo === 'A' ? tabela_A : tabela_B;

                            // Atualizar labels no cabo
                            const updateCaboLabelQuery = `UPDATE tstmeta.?? SET FIBRA_${J}LABEL = '' WHERE IDMETA = ?`;
                            const updateCaboLabelNumQuery = `UPDATE tstmeta.?? SET FN_${J}LABEL = '' WHERE IDMETA = ?`;

                            // Atualizar labels na caixa
                            const updateCaixaLabelQuery = `UPDATE tstmeta.?? SET F${J}L = '=id()' WHERE IDMETA = ?`;
                            const updateCaixaLabelNumQuery = `UPDATE tstmeta.?? SET FN${J}L = '' WHERE IDMETA = ?`;

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
                                    conn.query(updateCaixaLabelQuery, [tabela_CX, idmeta_caixa], (err) => {
                                        if (err) reject(err);
                                        else resolve();
                                    });
                                }),
                                new Promise((resolve, reject) => {
                                    conn.query(updateCaixaLabelNumQuery, [tabela_CX, idmeta_caixa], (err) => {
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
                                // 4️⃣ Atualizar ESTRUTXX = 'OK' se ainda não estiver
                                // O campo ESTRUT varia de 01 a 18, acompanhando o número da boca
                                if (!estruturaOK) {
                                    const updateEstruturaQuery = `UPDATE tstmeta.caixa SET ?? = 'OK' WHERE ID_META = ?`;
                                    
                                    conn.query(updateEstruturaQuery, [nomeEstrut, idmeta_caixa], (error) => {
                                        if (error) {
                                            return conn.rollback(() => {
                                                conn.release();
                                                console.error(`❌ [DESCONEXAO_BOCA] Erro ao atualizar ${nomeEstrut}:`, error);
                                                return res.status(500).send({
                                                    success: false,
                                                    error: `Erro ao atualizar estrutura ${nomeEstrut}`,
                                                    details: error.message
                                                });
                                            });
                                        }

                                        console.log(`✅ [DESCONEXAO_BOCA] Estrutura ${nomeEstrut} atualizada para 'OK'`);

                                        // 5️⃣ Salvar log (opcional - implementar função SALVA_LOGS se necessário)
                                        // SALVA_LOGS(15, idmeta_caixa, `conectou ${nomeBoca} CX${numeroCaixa}`);

                                        // 6️⃣ Commit da transação
                                        conn.commit((err) => {
                                            if (err) {
                                                return conn.rollback(() => {
                                                    conn.release();
                                                    console.error('❌ [DESCONEXAO_BOCA] Erro ao fazer commit:', err);
                                                    return res.status(500).send({
                                                        success: false,
                                                        error: 'Erro ao finalizar transação',
                                                        details: err.message
                                                    });
                                                });
                                            }

                                            conn.release();
                                            console.log(`✅ [DESCONEXAO_BOCA] Dsconexão realizada com sucesso!`);
                                            return res.status(200).send({
                                                success: true,
                                                message: `Cabo ${idmeta_cabo} (Ponta ${Ponta_cabo}) desconectado na ${nomeBoca} da caixa ${idmeta_caixa}`,
                                                idmeta_caixa: idmeta_caixa,
                                                idmeta_cabo: idmeta_cabo,
                                                numero_boca: numeroBoca,
                                                ponta_cabo: Ponta_cabo,
                                                capacidade: Capacidade_cabo,
                                                fibras_processadas: Capacidade_cabo,
                                                estrutura_atualizada: nomeEstrut
                                            });
                                        });
                                    });

                                } else {
                                    // Se estrutura já estava OK, apenas fazer commit
                                    conn.commit((err) => {
                                        if (err) {
                                            return conn.rollback(() => {
                                                conn.release();
                                                console.error('❌ [DESCONEXAO_BOCA] Erro ao fazer commit:', err);
                                                return res.status(500).send({
                                                    success: false,
                                                    error: 'Erro ao finalizar transação',
                                                    details: err.message
                                                });
                                            });
                                        }

                                        conn.release();
                                        console.log(`✅ [DESCONEXAO_BOCA] desconexão realizada com sucesso!`);
                                        return res.status(200).send({
                                            success: true,
                                            message: `Cabo ${idmeta_cabo} (Ponta ${Ponta_cabo}) desconectado na ${nomeBoca} da caixa ${idmeta_caixa}`,
                                            idmeta_caixa: idmeta_caixa,
                                            idmeta_cabo: idmeta_cabo,
                                            numero_boca: numeroBoca,
                                            ponta_cabo: Ponta_cabo,
                                            capacidade: Capacidade_cabo,
                                            fibras_processadas: Capacidade_cabo,
                                            estrutura_ja_existia: true
                                        });
                                    }
                                    );
                                }
                            }
                        )
                            .catch((error) => {
                                return conn.rollback(() => {
                                    conn.release();
                                    console.error('❌ [DESCONEXAO_BOCA] Erro ao processar fibras:', error);
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
            });
            }); // Fecha conn.beginTransaction
        }); // Fecha conn.query
    });
});

module.exports = router;

