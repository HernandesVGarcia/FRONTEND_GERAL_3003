const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

//******************atualizar coordenadas das bocas *************/
router.post('/', login, (req, res, next) => {
   
    console.log('executou update fusão');

    
    
    const { 
        id_meta_splitter,
        saida_splitter,
        boca,
        fibra,
        id_meta_caixa
    } = req.body;
    
   

    // Validar campos obrigatórios
    if (!id_meta_caixa) {
        console.log('ERRO: id_meta_caixa é obrigatório');
        return res.status(400).send({ 
            error: 'Campo obrigatório: id_meta_caixa' 
        });
    }

    // Validar campos obrigatórios
    if (!id_meta_splitter) {
        console.log('ERRO: id_meta_caixa é obrigatório');
        return res.status(400).send({ 
            error: 'Campo obrigatório: id_meta_splitter' 
        });
    }

    // Validar se a boca está no range válido (1-18)
    if (!boca || boca < 1 || boca > 18) {
        console.log('ERRO: Boca origem inválida:', boca);    
        return res.status(400).send({ 
            error: 'boca_origem deve estar entre 1 e 18' 
        });
    }

    
    // Validar fibra_origem (range 1-144)
    if (!fibra || fibra < 1 || fibra > 144) {
        console.log('ERRO: Fibra cabo inválida:', fibra);
        return res.status(400).send({ 
            error: 'fibra_origem deve estar entre 1 e 144' 
        });
    }

    // Validar fibra_destino (range 1-144)
    if (!saida_splitter || saida_splitter < 1 || saida_splitter > 256) {
        console.log('ERRO: Numero da Saida Splitter inválida:', saida_splitter);
        return res.status(400).send({ 
            error: 'Saida Splitter deve estar entre 1 e 256' 
        });
    }
    
    mysql.getConnection((error, conn) => {
        if (error) { 
            console.error('Erro ao obter conexão:', error);
            return res.status(500).send({ error: error });
        }

        // Construir a query dinâmica baseada no número da boca
        const conteudoCampo_splitter = `prop.boca${boca}_${fibra}.label`;
        const conteudoCampo_cabo = `prop.splitter${id_meta_splitter}_${saida_splitter}.label`;
        const campo_cabo = `F` + fibra;
        const campo_splitter = `F` + saida_splitter;
        
        // Declarar variáveis para tabelas
        let tabela_cabo;
        let tabela_splitter;
        
        if (fibra <= 12) {
            tabela_cabo = 'cxboca' + boca + '_t1';
        } else if (fibra >= 13 && fibra <= 24) {
            tabela_cabo = 'cxboca' + boca + '_t2';
        } else if (fibra >= 25 && fibra <= 36) {
            tabela_cabo = 'cxboca' + boca + '_t3'; 
        } else if (fibra >= 37 && fibra <= 48) {
            tabela_cabo = 'cxboca' + boca + '_t4';
        } else if (fibra >= 49 && fibra <= 60) {
            tabela_cabo = 'cxboca' + boca + '_t5';
        } else if (fibra >= 61 && fibra <= 72) {
            tabela_cabo = 'cxboca' + boca + '_t6';
        } else if (fibra >= 73 && fibra <= 84) {
            tabela_cabo = 'cxboca' + boca + '_t7';
        } else if (fibra >= 85 && fibra <= 96) {
            tabela_cabo = 'cxboca' + boca + '_t8'; 
        } else if (fibra >= 97 && fibra <= 108) {
            tabela_cabo = 'cxboca' + boca + '_t9';
        } else if (fibra >= 109 && fibra <= 120) {
            tabela_cabo = 'cxboca' + boca + '_t10';
        } else if (fibra >= 121 && fibra <= 132) {
            tabela_cabo = 'cxboca' + boca + '_t11';
        } else if (fibra >= 133 && fibra <= 144) {
            tabela_cabo = 'cxboca' + boca + '_t12';
        }
        

        if (saida_splitter <= 16) {
            tabela_splitter = 'splitter_t1';
        } else if (saida_splitter >= 16 && saida_splitter <= 32) {
            tabela_splitter = 'splitter_t2';
        } else if (saida_splitter >= 33 && saida_splitter <= 48) {
            tabela_splitter = 'splitter_t3'; 
        } else if (saida_splitter >= 49 && saida_splitter <= 64) {
            tabela_splitter = 'splitter_t4';
        } else if (saida_splitter >= 65 && saida_splitter <= 80) {
            tabela_splitter = 'splitter_t5';
        } else if (saida_splitter >= 81 && saida_splitter <= 96) {
            tabela_splitter = 'splitter_t6';
        } else if (saida_splitter >= 97 && saida_splitter <= 112) {
            tabela_splitter = 'splitter_t7';
        } else if (saida_splitter >= 113 && saida_splitter <= 128) {
            tabela_splitter = 'splitter_t8';
        } else if (saida_splitter >= 129 && saida_splitter <= 144) {
            tabela_splitter = 'splitter_t9';
        } else if (saida_splitter >= 145 && saida_splitter <= 160) {
            tabela_splitter = 'splitter_t10';
        } else if (saida_splitter >= 161 && saida_splitter <= 176) {
            tabela_splitter = 'splitter_t11';
        } else if (saida_splitter >= 177 && saida_splitter <= 192) {
            tabela_splitter = 'splitter_t12';
        } else if (saida_splitter >= 193 && saida_splitter <= 208) {
            tabela_splitter = 'splitter_t13';
        } else if (saida_splitter >= 209 && saida_splitter <= 224) {
            tabela_splitter = 'splitter_t14';
        } else if (saida_splitter >= 225 && saida_splitter <= 240) {
            tabela_splitter = 'splitter_t15';
        } else if (saida_splitter >= 241 && saida_splitter <= 256) {
            tabela_splitter = 'splitter_t16';
        }
        
        // Campos de label para verificação (F1L, F2L, etc.)
        const campo_label_cabo = `F${fibra}`;
        const campo_label_splitter = `F${saida_splitter}`;
        
        // Verificar se os campos estão livres antes de iniciar a transação
        const query_check_cabo = `SELECT ?? as valor FROM tstmeta.?? WHERE IDMETA = ?`;
        const query_check_splitter = `SELECT ?? as valor FROM tstmeta.?? WHERE IDMETA = ?`;
        
        // Verificar campo cabo na boca caixa
        conn.query(
            query_check_cabo,
            [campo_label_cabo, tabela_cabo, id_meta_caixa],
            (error, resultado_cabo) => {
                if (error) {
                    conn.release();
                    console.error('Erro ao verificar campo cabo:', error);
                    return res.status(500).send({ 
                        error: 'Erro ao verificar campo cabo',
                        details: error.message 
                    });
                }
                
                if (!resultado_cabo || resultado_cabo.length === 0) {
                    conn.release();
                    console.log('Registro não encontrado na origem com o id_meta:', id_meta_caixa);
                    return res.status(404).send({ 
                        message: 'Registro não encontrado na origem com o ID fornecido' 
                    });
                }
                
                const valor_cabo = resultado_cabo[0].valor;
                const cabo_livre = valor_cabo === '=id()' || valor_cabo === null || valor_cabo === '';
                
                if (!cabo_livre) {
                    conn.release();
                    console.log(`Campo cabo (${campo_label_cabo}) já possui conexão:`, valor_cabo);
                    return res.status(400).send({ 
                        error: 'Campo cabo já possui conexão',
                        message: `A fibra ${fibra} da boca ${boca} já está conectada. Valor atual: ${valor_cabo}`,
                        campo: campo_label_cabo,
                        valor_atual: valor_cabo
                    });
                }
                
                // Verificar campo splitter
                conn.query(
                    query_check_splitter,
                    [campo_label_splitter, tabela_splitter, id_meta_splitter],
                    (error, resultado_splitter) => {
                        if (error) {
                            conn.release();
                            console.error('Erro ao verificar campo splitter:', error);
                            return res.status(500).send({ 
                                error: 'Erro ao verificar campo splitter',
                                details: error.message 
                            });
                        }
                        
                        if (!resultado_splitter || resultado_splitter.length === 0) {
                            conn.release();
                            console.log('Registro não encontrado no splitter com o id_meta:', id_meta_splitter);
                            return res.status(404).send({ 
                                message: 'Registro não encontrado no splitter com o ID fornecido' 
                            });
                        }
                        
                        const valor_splitter = resultado_splitter[0].valor;
                        const splitter_livre = valor_splitter === '=id()' || valor_splitter === null || valor_splitter === '';
                        
                        if (!splitter_livre) {
                            conn.release();
                            console.log(`Campo splitter (${campo_label_splitter}) já possui conexão:`, valor_splitter);
                            return res.status(400).send({ 
                                error: 'Campo splitter já possui conexão',
                                message: `A saida ${fibra_splitter} do splitter ${id_meta_splitter} já está conectada. Valor atual: ${valor_splitter}`,
                                campo: campo_label_splitter,
                                valor_atual: valor_splitter
                            });
                        }
                        
                        // Ambos os campos estão livres, prosseguir com a transação
                        // Iniciar transação
                        conn.beginTransaction((err) => {
                            if (err) {
                                conn.release();
                                console.error('Erro ao iniciar transação:', err);
                                return res.status(500).send({ 
                                    error: 'Erro ao iniciar transação',
                                    details: err.message 
                                });
                            }

                            // Query SQL dinâmica tabela origem
                            const query_cabo = `UPDATE tstmeta.${tabela_cabo} SET ${campo_cabo} = ? WHERE IDMETA = ?`;
                            
                            conn.query(
                                query_cabo,
                                [conteudoCampo_cabo, id_meta_caixa],
                                (error, resultado_cabo) => {
                                    if (error) {
                                        return conn.rollback(() => {
                                            conn.release();
                                            console.error('Erro na query cabo:', error);
                                            return res.status(500).send({ 
                                                error: 'Erro ao atualizar tabela cabo',
                                                details: error.message 
                                            });
                                        });
                                    }

                                    // Verificar se algum registro foi afetado na origem
                                    if (resultado_cabo.affectedRows === 0) {
                                        return conn.rollback(() => {
                                            conn.release();
                                            console.log('Nenhum registro encontrado de cabo com caixa com o id_meta:', id_meta_caixa);
                                            return res.status(404).send({ 
                                                message: 'Nenhuma caixa encontrada na origem com o ID fornecido' 
                                            });
                                        });
                                    }

                                    // Query SQL dinâmica tabela splitter
                                    const query_destino = `UPDATE tstmeta.${tabela_splitter} SET ${campo_splitter} = ? WHERE IDMETA = ?`;
                                    
                                    conn.query(
                                        query_destino,
                                        [conteudoCampo_splitter, id_meta_splitter],
                                        (error, resultado_splitter) => {
                                            if (error) {
                                                return conn.rollback(() => {
                                                    conn.release();
                                                    console.error('Erro na query splitter:', error);
                                                    return res.status(500).send({ 
                                                        error: 'Erro ao atualizar tabela splitter',
                                                        details: error.message 
                                                    });
                                                });
                                            }

                                            // Verificar se algum registro foi afetado no destino
                                            if (resultado_splitter.affectedRows === 0) {
                                                return conn.rollback(() => {
                                                    conn.release();
                                                    console.log('Nenhum registro encontrado no splitter com o id_meta:', id_meta_splitter);
                                                    return res.status(404).send({ 
                                                        message: 'Nenhuma splitter encontrado com o ID fornecido' 
                                                    });
                                                });
                                            }

                                            // Commit da transação
                                            conn.commit((err) => {
                                                if (err) {
                                                    return conn.rollback(() => {
                                                        conn.release();
                                                        console.error('Erro ao fazer commit:', err);
                                                        return res.status(500).send({ 
                                                            error: 'Erro ao finalizar transação',
                                                            details: err.message 
                                                        });
                                                    });
                                                }

                                                conn.release();
                                                
                                                console.log(`Fusão realizada com sucesso. Cabo: ${resultado_cabo.affectedRows} registros, Destino: ${resultado_splitter.affectedRows} registros`);
                                                
                                                return res.status(200).send({ 
                                                    response: {
                                                        origem: resultado_cabo,
                                                        destino: resultado_splitter
                                                    },
                                                    message: `Fusão ${conteudoCampo_cabo} com ${conteudoCampo_splitter} atualizadas com sucesso`,
                                                    affectedRows: {
                                                        origem: resultado_cabo.affectedRows,
                                                        destino: resultado_splitter.affectedRows
                                                    }
                                                });
                                            });
                                        }
                                    );
                                }
                            );
                        });
                    }
                );
            }
        );





    });
});

module.exports = router;