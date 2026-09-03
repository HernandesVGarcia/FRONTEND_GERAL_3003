const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');


/**
 * Tubo DIO (diocN_tK / dio_tK) a partir do indice do conector na face (1..144).
 */
function tabelasPorFibraDio(fibraDio, numeroBandeja) {
    let tabela_DIO;
    let tabela_DIO_ENTRADA;
    if (fibraDio <= 12) {
        tabela_DIO = `dioc${numeroBandeja}_t1`;
        tabela_DIO_ENTRADA = 'dio_t1';
    } else if (fibraDio <= 24) {
        tabela_DIO = `dioc${numeroBandeja}_t2`;
        tabela_DIO_ENTRADA = 'dio_t2';
    } else if (fibraDio <= 36) {
        tabela_DIO = `dioc${numeroBandeja}_t3`;
        tabela_DIO_ENTRADA = 'dio_t3';
    } else if (fibraDio <= 48) {
        tabela_DIO = `dioc${numeroBandeja}_t4`;
        tabela_DIO_ENTRADA = 'dio_t4';
    } else if (fibraDio <= 60) {
        tabela_DIO = `dioc${numeroBandeja}_t5`;
        tabela_DIO_ENTRADA = 'dio_t5';
    } else if (fibraDio <= 72) {
        tabela_DIO = `dioc${numeroBandeja}_t6`;
        tabela_DIO_ENTRADA = 'dio_t6';
    } else if (fibraDio <= 84) {
        tabela_DIO = `dioc${numeroBandeja}_t7`;
        tabela_DIO_ENTRADA = 'dio_t7';
    } else if (fibraDio <= 96) {
        tabela_DIO = `dioc${numeroBandeja}_t8`;
        tabela_DIO_ENTRADA = 'dio_t8';
    } else if (fibraDio <= 108) {
        tabela_DIO = `dioc${numeroBandeja}_t9`;
        tabela_DIO_ENTRADA = 'dio_t9';
    } else if (fibraDio <= 120) {
        tabela_DIO = `dioc${numeroBandeja}_t10`;
        tabela_DIO_ENTRADA = 'dio_t10';
    } else if (fibraDio <= 132) {
        tabela_DIO = `dioc${numeroBandeja}_t11`;
        tabela_DIO_ENTRADA = 'dio_t11';
    } else {
        tabela_DIO = `dioc${numeroBandeja}_t12`;
        tabela_DIO_ENTRADA = 'dio_t12';
    }
    return { tabela_DIO, tabela_DIO_ENTRADA };
}
/**
 * Rota: /api/conexao_bandeja
 * Função: Conecta um cabo a uma bandeja de DIO
 * Método: POST
 * Middleware: login (autenticação obrigatória)
 * 
 * Body esperado:
 * {
 *   fibra_dio,
 *   fibra_cabo,
 *   numero_bandeja: "C1" | "C2" | ... | "C6",
 *   idmeta_dio: number,
 *   idmeta_cabo: number,
 *   Ponta_cabo: "A" | "B",
 *   Capacidade_cabo: 1 | 2 | 4 | 6 | 8 | 12 | 24 | 36 | 48 | 72 | 144
 * }
 */

router.post('/', login, (req, res, next) => {
    console.log('🔌 [CONEXAO_BANDEJA] Iniciando conexão de cabo à bandeja...');
    
    const {
        fibra_dio,
        fibra_cabo,
        numero_bandeja,
        idmeta_dio,
        idmeta_cabo,
        Ponta_cabo,
        Capacidade_cabo
    } = req.body;

    // Validação dos parâmetros obrigatórios
    if (!fibra_dio || !fibra_cabo || !numero_bandeja || !idmeta_dio || !idmeta_cabo || !Ponta_cabo || !Capacidade_cabo) {
        return res.status(400).send({
            success: false,
            error: 'Todos os parâmetros são obrigatórios: numero_bandeja, idmeta_dio, idmeta_cabo, Ponta_cabo, Capacidade_cabo'
        });
    }

    // Validar numero_boca (c1 até c6)
    const bandejaMatch = numero_bandeja.match(/^C(\d+)$/);
    if (!bandejaMatch) {
        return res.status(400).send({
            success: false,
            error: 'numero_bandeja deve estar no formato "C1" até "C6"'
        });
    }

    const numeroBandeja = parseInt(bandejaMatch[1]);
    if (numeroBandeja < 1 || numeroBandeja > 6) {
        return res.status(400).send({
            success: false,
            error: 'numero_bandeja deve ser entre "C1" e "C6"'
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
    
    // Nome da bandeja no banco (C1, C2, etc.)
    const nomeBandeja = `C${numeroBandeja}`;
    
    // Valor para atualizar na bandeja (cabo{idmeta_cabo}A ou cabo{idmeta_cabo}B)
    const valorBandeja = `cabo${idmeta_cabo}${Ponta_cabo}`;

    mysql.getConnection((error, conn) => {
        if (error) {
            console.error('❌ [CONEXAO_BANDEJA] Erro ao obter conexão:', error);
            return res.status(500).send({
                success: false,
                error: 'Erro de conexão com banco de dados'
            });
        }

        // Iniciar transação
        conn.beginTransaction((err) => {
            if (err) {
                conn.release();
                console.error('❌ [CONEXAO_BANDEJA] Erro ao iniciar transação:', err);
                return res.status(500).send({
                    success: false,
                    error: 'Erro ao iniciar transação'
                });
            }

            // 🆕 PRIMEIRO: Ler campos C1-C6 e CAPACIDADE do DIO ANTES de atualizar
            const queryDioInfo = `SELECT C1, C2, C3, C4, C5, C6, CAPACIDADE FROM tstmeta.dio WHERE ID_META = ?`;
            
            conn.query(queryDioInfo, [idmeta_dio], (error, resultadoDio) => {
                if (error) {
                    return conn.rollback(() => {
                        conn.release();
                        console.error('❌ [CONEXAO_BANDEJA] Erro ao buscar informações do DIO:', error);
                        return res.status(500).send({
                            success: false,
                            error: 'Erro ao buscar informações do DIO',
                            details: error.message
                        });
                    });
                }

                if (!resultadoDio || resultadoDio.length === 0) {
                    return conn.rollback(() => {
                        conn.release();
                        console.error(`❌ [CONEXAO_BANDEJA] DIO ${idmeta_dio} não encontrado`);
                        return res.status(404).send({
                            success: false,
                            error: `DIO ${idmeta_dio} não encontrado`
                        });
                    });
                }

                const dioInfo = resultadoDio[0];
                
                // Converter capacidade do DIO para número (pode vir como string do banco)
                const capacidadeDio = Number(dioInfo.CAPACIDADE) || parseInt(dioInfo.CAPACIDADE, 10) || 0;
                
                                            

                

                    const fNumDio = parseInt(String(fibra_dio), 10);
                    const maxFibrasDio = capacidadeDio > 0 ? capacidadeDio : 144;
                    if (!Number.isFinite(fNumDio) || fNumDio < 1 || fNumDio > maxFibrasDio) {
                        return conn.rollback(() => {
                            conn.release();
                            return res.status(400).send({
                                success: false,
                                error: `fibra_dio inválida ou fora da capacidade do DIO (1..${maxFibrasDio})`
                            });
                        });
                    }

                    const { tabela_DIO, tabela_DIO_ENTRADA } = tabelasPorFibraDio(fNumDio, numeroBandeja);
                    const colEntradaFibra = `F${fNumDio}`;

                    conn.query(
                        `SELECT ?? AS entrada_f FROM tstmeta.?? WHERE IDMETA = ?`,
                        [colEntradaFibra, tabela_DIO_ENTRADA, idmeta_dio],
                        (errEntrada, rowsEntrada) => {
                            if (errEntrada) {
                                return conn.rollback(() => {
                                    conn.release();
                                    console.error('❌ [CONEXAO_BANDEJA] Erro ao verificar entrada DIO:', errEntrada);
                                    return res.status(500).send({
                                        success: false,
                                        error: 'Erro ao verificar posição na entrada do DIO',
                                        details: errEntrada.message
                                    });
                                });
                            }

                            const valorEntrada = rowsEntrada && rowsEntrada[0] ? rowsEntrada[0].entrada_f : null;
                            const entradaOcupada =
                                valorEntrada != null && String(valorEntrada).trim() !== '';

                            if (entradaOcupada) {
                                return conn.rollback(() => {
                                    conn.release();
                                    console.warn(
                                        `⚠️ [CONEXAO_BANDEJA] Entrada ${colEntradaFibra} em ${tabela_DIO_ENTRADA} já ocupada (DIO ${idmeta_dio})`
                                    );
                                    return res.status(409).send({
                                        success: false,
                                        error: `A posição DIO ${colEntradaFibra} (${tabela_DIO_ENTRADA}) já está em uso. Libere antes de fundir.`,
                                        details: {
                                            valor_atual: String(valorEntrada),
                                            coluna: colEntradaFibra,
                                            tabela_entrada: tabela_DIO_ENTRADA
                                        }
                                    });
                                });
                            }

                            const deveExecutarUpdateEntrada = true;

                            let processarFibras = () => {
                            const promises = [];

                            let tabela_A, tabela_B;
                            if (fibra_cabo <= 12) {
                                tabela_A = 'caboa_t1';
                                tabela_B = 'cabob_t1';
                            } else if (fibra_cabo <= 24) {
                                tabela_A = 'caboa_t2';
                                tabela_B = 'cabob_t2';
                            } else if (fibra_cabo <= 36) {
                                tabela_A = 'caboa_t3';
                                tabela_B = 'cabob_t3';
                            } else if (fibra_cabo <= 48) {
                                tabela_A = 'caboa_t4';
                                tabela_B = 'cabob_t4';
                            } else if (fibra_cabo <= 60) {
                                tabela_A = 'caboa_t5';
                                tabela_B = 'cabob_t5';
                            } else if (fibra_cabo <= 72) {
                                tabela_A = 'caboa_t6';
                                tabela_B = 'cabob_t6';
                            } else if (fibra_cabo <= 84) {
                                tabela_A = 'caboa_t7';
                                tabela_B = 'cabob_t7';
                            } else if (fibra_cabo <= 96) {
                                tabela_A = 'caboa_t8';
                                tabela_B = 'cabob_t8';
                            } else if (fibra_cabo <= 108) {
                                tabela_A = 'caboa_t9';
                                tabela_B = 'cabob_t9';
                            } else if (fibra_cabo <= 120) {
                                tabela_A = 'caboa_t10';
                                tabela_B = 'cabob_t10';
                            } else if (fibra_cabo <= 132) {
                                tabela_A = 'caboa_t11';
                                tabela_B = 'cabob_t11';
                            } else {
                                tabela_A = 'caboa_t12';
                                tabela_B = 'cabob_t12';
                            }



                           

                            // Labels para o cabo (referência à caixa)
                            const CABOLABEL = `=DIO${idmeta_dio}!PROP.ROW_5.LABEL`;
                            const CABOLABELnum = `${fibra_dio}`;

                            //const CABOLABELnum = `=DIO${idmeta_dio}!PROP.FN${numeroBandeja}_${J}.VALUE`;

                            // Labels para a dio (referência ao cabo)
                            const DIOLABEL = `=cabo${idmeta_cabo}${Ponta_cabo}!Prop.Fibra_${fibra_cabo}.VALUE`;
                            const DIOLABELnum = `=cabo${idmeta_cabo}${Ponta_cabo}!Prop.FN_${fibra_cabo}.VALUE`;

                            // Escolher tabela do cabo baseado na ponta
                            const tabelaCabo = Ponta_cabo === 'A' ? tabela_A : tabela_B;

                            // Atualizar labels no cabo
                            const updateCaboLabelQuery = `UPDATE tstmeta.?? SET FIBRA_${fibra_cabo}LABEL = ? WHERE IDMETA = ?`;
                            const updateCaboLabelNumQuery = `UPDATE tstmeta.?? SET FN_${fibra_cabo}LABEL = ? WHERE IDMETA = ?`;

                            // Atualizar labels no DIO
                            const updateDioLabelQuery = `UPDATE tstmeta.?? SET F${fibra_dio}L = ? WHERE IDMETA = ?`;
                            const updateDioLabelNumQuery = `UPDATE tstmeta.?? SET FN${fibra_dio}L = ? WHERE IDMETA = ?`;

                            

                            const fibraCaboNum = parseInt(String(fibra_cabo), 10);
                            //const updateEntradaBandeja = `UPDATE tstmeta.?? SET F${fNumDio} = ?, FN${fNumDio} = ? WHERE IDMETA = ?`
                            const updateEntradaBandeja = `UPDATE tstmeta.?? set F${fibra_dio}=?, FN${fibra_dio}=${fibra_cabo} WHERE IDMETA=?`


                            // Criar promises para todas as atualizações
                            promises.push(
                                new Promise((resolve, reject) => {
                                    conn.query(updateCaboLabelQuery, [tabelaCabo, CABOLABEL, idmeta_cabo], (err) => {
                                        if (err) reject(err);
                                        else resolve();
                                    });
                                }),
                                new Promise((resolve, reject) => {
                                    conn.query(updateCaboLabelNumQuery, [tabelaCabo, CABOLABELnum, idmeta_cabo], (err) => {
                                        if (err) reject(err);
                                        else resolve();
                                    });
                                }),
                                new Promise((resolve, reject) => {
                                    conn.query(updateDioLabelQuery, [tabela_DIO, DIOLABEL, idmeta_dio], (err) => {
                                        if (err) reject(err);
                                        else resolve();
                                    });
                                }),
                                new Promise((resolve, reject) => {
                                    conn.query(updateDioLabelNumQuery, [tabela_DIO, DIOLABELnum, idmeta_dio], (err) => {
                                        if (err) reject(err);
                                        else resolve();
                                    });
                                }),
                                
                            );

                            // 🆕 MODIFICADO: esta promise só será executada se as condições forem atendidas
                            // (Capacidade_cabo === Capacidade_dio E todas as bandejas C1-C6 = 'ZERO')
                            if (deveExecutarUpdateEntrada) {
                                promises.push(
                                    new Promise((resolve, reject) => {
                                        conn.query(updateEntradaBandeja, [tabela_DIO_ENTRADA, tabela_DIO, idmeta_dio], (err) => {
                                            if (err) reject(err);
                                            else resolve();
                                        });
                                    })
                                );
                            }
                        //}

                            // Executar todas as atualizações em paralelo
                            Promise.all(promises)
                                .then(() => {
                                    // 3️⃣ Commit da transação
                                    conn.commit((err) => {
                                        if (err) {
                                            return conn.rollback(() => {
                                                conn.release();
                                                console.error('❌ [CONEXAO_BANDEJA] Erro ao fazer commit:', err);
                                                return res.status(500).send({
                                                    success: false,
                                                    error: 'Erro ao finalizar transação',
                                                    details: err.message
                                                });
                                            });
                                        }

                                        conn.release();
                                        console.log(`✅ [CONEXAO_BANDEJA] Conexão realizada com sucesso!`);
                                        return res.status(200).send({
                                            success: true,
                                            message: `Cabo ${idmeta_cabo} (Ponta ${Ponta_cabo}) conectado na ${nomeBandeja} do DIO ${idmeta_dio}`,
                                            idmeta_dio: idmeta_dio,
                                            idmeta_cabo: idmeta_cabo,
                                            numero_bandeja: numeroBandeja,
                                            ponta_cabo: Ponta_cabo,
                                            capacidade: Capacidade_cabo,
                                            fibras_processadas: "1"
                                        });
                                    });
                                })
                                .catch((error) => {
                                    return conn.rollback(() => {
                                        conn.release();
                                        console.error('❌ [CONEXAO_BANDEJA] Erro ao processar fibras:', error);
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
            });
        });
    });


module.exports = router;
