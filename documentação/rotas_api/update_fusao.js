const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

//******************atualizar coordenadas das bocas *************/
router.post('/', login, (req, res, next) => {
   
    console.log('executou update fusão');

    
    
    const { 
        boca_origem,
        fibra_origem,
        boca_destino,
        fibra_destino,
        id_meta_caixa
    } = req.body;
    
   

    // Validar campos obrigatórios
    if (!id_meta_caixa) {
        console.log('ERRO: id_meta_caixa é obrigatório');
        return res.status(400).send({ 
            error: 'Campo obrigatório: id_meta_caixa' 
        });
    }

    // Validar se a boca está no range válido (1-18)
    if (!boca_origem || boca_origem < 1 || boca_origem > 18) {
        console.log('ERRO: Boca origem inválida:', boca_origem);    
        return res.status(400).send({ 
            error: 'boca_origem deve estar entre 1 e 18' 
        });
    }

    // Validar se a boca está no range válido (1-18)
    if (!boca_destino || boca_destino < 1 || boca_destino > 18) {
        console.log('ERRO: Boca destino inválida:', boca_destino);    
        return res.status(400).send({ 
            error: 'boca_destino deve estar entre 1 e 18' 
        });
    }

    // Validar fibra_origem (range 1-144)
    if (!fibra_origem || fibra_origem < 1 || fibra_origem > 144) {
        console.log('ERRO: Fibra origem inválida:', fibra_origem);
        return res.status(400).send({ 
            error: 'fibra_origem deve estar entre 1 e 144' 
        });
    }

    // Validar fibra_destino (range 1-144)
    if (!fibra_destino || fibra_destino < 1 || fibra_destino > 144) {
        console.log('ERRO: Fibra destino inválida:', fibra_destino);
        return res.status(400).send({ 
            error: 'fibra_destino deve estar entre 1 e 144' 
        });
    }
    
    mysql.getConnection((error, conn) => {
        if (error) { 
            console.error('Erro ao obter conexão:', error);
            return res.status(500).send({ error: error });
        }

        // Construir a query dinâmica baseada no número da boca
        const conteudoCampo_origem = `prop.boca${boca_origem}_${fibra_origem}.label`;
        const conteudoCampo_destino = `prop.boca${boca_destino}_${fibra_destino}.label`;
        const campo_origem = `F` + fibra_origem;
        const campo_destino = `F` + fibra_destino;
        
        // Declarar variáveis para tabelas
        let tabela_origem;
        let tabela_destino;
        
        if (fibra_origem <= 12) {
            tabela_origem = 'cxboca' + boca_origem + '_t1';
        } else if (fibra_origem >= 13 && fibra_origem <= 24) {
            tabela_origem = 'cxboca' + boca_origem + '_t2';
        } else if (fibra_origem >= 25 && fibra_origem <= 36) {
            tabela_origem = 'cxboca' + boca_origem + '_t3'; 
        } else if (fibra_origem >= 37 && fibra_origem <= 48) {
            tabela_origem = 'cxboca' + boca_origem + '_t4';
        } else if (fibra_origem >= 49 && fibra_origem <= 60) {
            tabela_origem = 'cxboca' + boca_origem + '_t5';
        } else if (fibra_origem >= 61 && fibra_origem <= 72) {
            tabela_origem = 'cxboca' + boca_origem + '_t6';
        } else if (fibra_origem >= 73 && fibra_origem <= 84) {
            tabela_origem = 'cxboca' + boca_origem + '_t7';
        } else if (fibra_origem >= 85 && fibra_origem <= 96) {
            tabela_origem = 'cxboca' + boca_origem + '_t8'; 
        } else if (fibra_origem >= 97 && fibra_origem <= 108) {
            tabela_origem = 'cxboca' + boca_origem + '_t9';
        } else if (fibra_origem >= 109 && fibra_origem <= 120) {
            tabela_origem = 'cxboca' + boca_origem + '_t10';
        } else if (fibra_origem >= 121 && fibra_origem <= 132) {
            tabela_origem = 'cxboca' + boca_origem + '_t11';
        } else if (fibra_origem >= 133 && fibra_origem <= 144) {
            tabela_origem = 'cxboca' + boca_origem + '_t12';
        }
        
        if (fibra_destino <= 12) {
            tabela_destino = 'cxboca' + boca_destino + '_t1';
        } else if (fibra_destino >= 13 && fibra_destino <= 24) {
            tabela_destino = 'cxboca' + boca_destino + '_t2';
        } else if (fibra_destino >= 25 && fibra_destino <= 36) {
            tabela_destino = 'cxboca' + boca_destino + '_t3'; 
        } else if (fibra_destino >= 37 && fibra_destino <= 48) {
            tabela_destino = 'cxboca' + boca_destino + '_t4';
        } else if (fibra_destino >= 49 && fibra_destino <= 60) {
            tabela_destino = 'cxboca' + boca_destino + '_t5';
        } else if (fibra_destino >= 61 && fibra_destino <= 72) {
            tabela_destino = 'cxboca' + boca_destino + '_t6';
        } else if (fibra_destino >= 73 && fibra_destino <= 84) {
            tabela_destino = 'cxboca' + boca_destino + '_t7';
        } else if (fibra_destino >= 85 && fibra_destino <= 96) {
            tabela_destino = 'cxboca' + boca_destino + '_t8';
        } else if (fibra_destino >= 97 && fibra_destino <= 108) {
            tabela_destino = 'cxboca' + boca_destino + '_t9';
        } else if (fibra_destino >= 109 && fibra_destino <= 120) {
            tabela_destino = 'cxboca' + boca_destino + '_t10';
        } else if (fibra_destino >= 121 && fibra_destino <= 132) {
            tabela_destino = 'cxboca' + boca_destino + '_t11';
        } else if (fibra_destino >= 133 && fibra_destino <= 144) {
            tabela_destino = 'cxboca' + boca_destino + '_t12';
        }
        
        // Campos de label para verificação (F1L, F2L, etc.)
        const campo_label_origem = `F${fibra_origem}L`;
        const campo_label_destino = `F${fibra_destino}L`;
        
        // Verificar se os campos estão livres antes de iniciar a transação
        const query_check_origem = `SELECT ?? as valor FROM tstmeta.?? WHERE ID_META = ?`;
        const query_check_destino = `SELECT ?? as valor FROM tstmeta.?? WHERE ID_META = ?`;
        
        // Verificar campo origem
        conn.query(
            query_check_origem,
            [campo_label_origem, tabela_origem, id_meta_caixa],
            (error, resultado_origem) => {
                if (error) {
                    conn.release();
                    console.error('Erro ao verificar campo origem:', error);
                    return res.status(500).send({ 
                        error: 'Erro ao verificar campo origem',
                        details: error.message 
                    });
                }
                
                if (!resultado_origem || resultado_origem.length === 0) {
                    conn.release();
                    console.log('Registro não encontrado na origem com o id_meta:', id_meta_caixa);
                    return res.status(404).send({ 
                        message: 'Registro não encontrado na origem com o ID fornecido' 
                    });
                }
                
                const valor_origem = resultado_origem[0].valor;
                const origem_livre = valor_origem === '=id()' || valor_origem === null || valor_origem === '';
                
                if (!origem_livre) {
                    conn.release();
                    console.log(`Campo origem (${campo_label_origem}) já possui conexão:`, valor_origem);
                    return res.status(400).send({ 
                        error: 'Campo origem já possui conexão',
                        message: `A fibra ${fibra_origem} da boca ${boca_origem} já está conectada. Valor atual: ${valor_origem}`,
                        campo: campo_label_origem,
                        valor_atual: valor_origem
                    });
                }
                
                // Verificar campo destino
                conn.query(
                    query_check_destino,
                    [campo_label_destino, tabela_destino, id_meta_caixa],
                    (error, resultado_destino) => {
                        if (error) {
                            conn.release();
                            console.error('Erro ao verificar campo destino:', error);
                            return res.status(500).send({ 
                                error: 'Erro ao verificar campo destino',
                                details: error.message 
                            });
                        }
                        
                        if (!resultado_destino || resultado_destino.length === 0) {
                            conn.release();
                            console.log('Registro não encontrado no destino com o id_meta:', id_meta_caixa);
                            return res.status(404).send({ 
                                message: 'Registro não encontrado no destino com o ID fornecido' 
                            });
                        }
                        
                        const valor_destino = resultado_destino[0].valor;
                        const destino_livre = valor_destino === '=id()' || valor_destino === null || valor_destino === '';
                        
                        if (!destino_livre) {
                            conn.release();
                            console.log(`Campo destino (${campo_label_destino}) já possui conexão:`, valor_destino);
                            return res.status(400).send({ 
                                error: 'Campo destino já possui conexão',
                                message: `A fibra ${fibra_destino} da boca ${boca_destino} já está conectada. Valor atual: ${valor_destino}`,
                                campo: campo_label_destino,
                                valor_atual: valor_destino
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
                            const query_origem = `UPDATE tstmeta.${tabela_origem} SET ${campo_origem} = ? WHERE ID_META = ?`;
                            
                            conn.query(
                                query_origem,
                                [campo_destino, id_meta_caixa],
                                (error, resultado_origem) => {
                                    if (error) {
                                        return conn.rollback(() => {
                                            conn.release();
                                            console.error('Erro na query origem:', error);
                                            return res.status(500).send({ 
                                                error: 'Erro ao atualizar tabela origem',
                                                details: error.message 
                                            });
                                        });
                                    }

                                    // Verificar se algum registro foi afetado na origem
                                    if (resultado_origem.affectedRows === 0) {
                                        return conn.rollback(() => {
                                            conn.release();
                                            console.log('Nenhum registro encontrado na origem com o id_meta:', id_meta_caixa);
                                            return res.status(404).send({ 
                                                message: 'Nenhuma caixa encontrada na origem com o ID fornecido' 
                                            });
                                        });
                                    }

                                    // Query SQL dinâmica tabela destino
                                    const query_destino = `UPDATE tstmeta.${tabela_destino} SET ${campo_destino} = ? WHERE ID_META = ?`;
                                    
                                    conn.query(
                                        query_destino,
                                        [campo_origem, id_meta_caixa],
                                        (error, resultado_destino) => {
                                            if (error) {
                                                return conn.rollback(() => {
                                                    conn.release();
                                                    console.error('Erro na query destino:', error);
                                                    return res.status(500).send({ 
                                                        error: 'Erro ao atualizar tabela destino',
                                                        details: error.message 
                                                    });
                                                });
                                            }

                                            // Verificar se algum registro foi afetado no destino
                                            if (resultado_destino.affectedRows === 0) {
                                                return conn.rollback(() => {
                                                    conn.release();
                                                    console.log('Nenhum registro encontrado no destino com o id_meta:', id_meta_caixa);
                                                    return res.status(404).send({ 
                                                        message: 'Nenhuma caixa encontrada no destino com o ID fornecido' 
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
                                                
                                                console.log(`Fusão realizada com sucesso. Origem: ${resultado_origem.affectedRows} registros, Destino: ${resultado_destino.affectedRows} registros`);
                                                
                                                return res.status(200).send({ 
                                                    response: {
                                                        origem: resultado_origem,
                                                        destino: resultado_destino
                                                    },
                                                    message: `Fusão ${conteudoCampo_origem} com ${conteudoCampo_destino} atualizadas com sucesso`,
                                                    affectedRows: {
                                                        origem: resultado_origem.affectedRows,
                                                        destino: resultado_destino.affectedRows
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