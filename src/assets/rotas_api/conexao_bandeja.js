const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

/**
 * Rota: /api/conexao_bandeja
 * Função: Conecta um cabo a uma bandeja de DIO
 * Método: POST
 * Middleware: login (autenticação obrigatória)
 * 
 * Body esperado:
 * {
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
        numero_bandeja,
        idmeta_dio,
        idmeta_cabo,
        Ponta_cabo,
        Capacidade_cabo
    } = req.body;

    // Validação dos parâmetros obrigatórios
    if (!numero_bandeja || !idmeta_dio || !idmeta_cabo || !Ponta_cabo || !Capacidade_cabo) {
        return res.status(400).send({
            success: false,
            error: 'Todos os parâmetros são obrigatórios: numero_bandeja, idmeta_dio, idmeta_cabo, Ponta_cabo, Capacidade_cabo'
        });
    }

    // Validar numero_boca (boca1 até boca18)
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

            // 1️⃣ Atualizar a bandeja na tabela DIO
            const updateBandejaQuery = `UPDATE tstmeta.dio SET ?? = ? WHERE ID_META = ?`;
                
            conn.query(updateBandejaQuery, [nomeBandeja, valorBandeja, idmeta_dio], (error, resultado) => {
                if (error) {
                    return conn.rollback(() => {
                        conn.release();
                        console.error('❌ [CONEXAO_BANDEJA] Erro ao atualizar bandeja:', error);
                        return res.status(500).send({
                            success: false,
                            error: 'Erro ao atualizar bandeja no dio',
                            details: error.message
                        });
                    });
                }

                console.log(`✅ [CONEXAO_BANDEJA] Bandeja ${nomeBandeja} atualizada: ${valorBandeja}`);

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

                            //campos beginx e beginy / endx e endy
                            //const beginx= `PAR(PNT(TST${idmeta_dio}!Connections.X${numeroBandeja};PAR(PNT(TST${idmeta_dio}!Connections.Y${numeroBoca}`;
                            //const beginy= `PAR(PNT(TST${idmeta_dio}!Connections.X${numeroBandeja};PAR(PNT(TST${idmeta_dio}!Connections.Y${numeroBoca}`;
                            //const endx= `PAR(PNT(TST${idmeta_dio}!Connections.X${numeroBandeja};PAR(PNT(TST${idmeta_dio}!Connections.Y${numeroBoca}`;
                            //const endy= `PAR(PNT(TST${idmeta_dio}!Connections.X${numeroBandeja};PAR(PNT(TST${idmeta_dio}!Connections.Y${numeroBoca}`;
                            const geoPonta= `PAR(PNT(TST${idmeta_dio}!Connections.X${numeroBandeja};PAR(PNT(TST${idmeta_dio}!Connections.Y${numeroBandeja}`;



                            // Labels para o cabo (referência à caixa)
                            const CABOLABEL = `=TST${idmeta_dio}!PROP.${nomeBandeja}_${J}.VALUE`;
                            const CABOLABELnum = `=TST${idmeta_dio}!PROP.FN${numeroBandeja}_${J}.VALUE`;

                            // Labels para a caixa (referência ao cabo)
                            const DIOLABEL = `=cabo${idmeta_cabo}${Ponta_cabo}!Prop.Fibra_${J}.VALUE`;
                            const DIOLABELnum = `=cabo${idmeta_cabo}${Ponta_cabo}!Prop.FN_${J}.VALUE`;

                            // Escolher tabela do cabo baseado na ponta
                            const tabelaCabo = Ponta_cabo === 'A' ? tabela_A : tabela_B;

                            // Atualizar labels no cabo
                            const updateCaboLabelQuery = `UPDATE tstmeta.?? SET FIBRA_${J}LABEL = ? WHERE IDMETA = ?`;
                            const updateCaboLabelNumQuery = `UPDATE tstmeta.?? SET FN_${J}LABEL = ? WHERE IDMETA = ?`;

                            // Atualizar labels no DIO
                            const updateDioLabelQuery = `UPDATE tstmeta.?? SET F${J}L = ? WHERE IDMETA = ?`;
                            const updateDioLabelNumQuery = `UPDATE tstmeta.?? SET FN${J}L = ? WHERE IDMETA = ?`;

                            let updateCaboBeginEnd='';

                            if (Ponta_cabo==='A') { updateCaboBeginEnd= `UPDATE tstmeta.cabopa set beginx=?, beginy=? where id_meta=?`} else {
                                 updateCaboBeginEnd= `UPDATE tstmeta.cabopb set endx=?, endy=? where id_meta=?`     
                            }



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
                                new Promise((resolve, reject) => {
                                    conn.query(updateCaboBeginEnd, [geoPonta, geoPonta, idmeta_cabo], (err) => {
                                        if (err) reject(err);
                                        else resolve();
                                    });
                                })

                            );
                        }

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
                                        fibras_processadas: Capacidade_cabo
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

module.exports = router;

