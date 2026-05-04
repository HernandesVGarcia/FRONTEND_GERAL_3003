const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

//******************atualizar coordenadas das bocas *************/
router.post('/', login, async (req, res, next) => {
    console.log('executou update ativação cliente');

    const { idmeta_cliente, idmeta_caixa, idmeta_splitter, saida_splitter } = req.body;

    // Validar campos obrigatórios
    if (!idmeta_cliente) {
        console.log('ERRO: idmeta_cliente é obrigatório');
        return res.status(400).send({
            error: 'Campo obrigatório: idmeta_cliente',
        });
    }

    if (!idmeta_caixa) {
        console.log('ERRO: idmeta_caixa é obrigatório');
        return res.status(400).send({
            error: 'Campo obrigatório: idmeta_caixa',
        });
    }

    if (!idmeta_splitter) {
        console.log('ERRO: idmeta_splitter é obrigatório');
        return res.status(400).send({
            error: 'Campo obrigatório: idmeta_splitter',
        });
    }

    if (!saida_splitter) {
        console.log('ERRO: saída_splitter é obrigatório');
        return res.status(400).send({
            error: 'Campo obrigatório: saída_splitter',
        });
    }

    let contador = 0;
    let status = 'inicio';
    /** Último tubo definido dentro do ciclo — usado no UPDATE boca99 fora do do. */
    let tubo = 1;

    let conn;

    try {
        conn = await new Promise((resolve, reject) => {
            mysql.getConnection((error, connection) => {
                if (error) {
                    console.error('Erro ao obter conexão:', error);
                    reject(error);
                } else {
                    resolve(connection);
                }
            });
        });

        do {
            contador++;

            if (contador <= 12) {
                tubo = 1;
            } else if (contador <= 24) {
                tubo = 2;
            } else if (contador <= 36) {
                tubo = 3;
            } else if (contador <= 48) {
                tubo = 4;
            } else if (contador <= 60) {
                tubo = 5;
            } else if (contador <= 72) {
                tubo = 6;
            }

            const querycontador = `SELECT F${contador} as FIBRA from cxboca99_t${tubo} where idmeta= ?`; // procura posição vaga na boca99 para realizar a conexao

            let resultado_boca99;

            try {
                resultado_boca99 = await new Promise((resolve, reject) => { // busca posição vaga nas tabelas cxboca99_tX onde X é o tubo
                    conn.query(querycontador, [idmeta_caixa], (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(rows);
                        }
                    });
                });
            } catch (error) {
                console.error('Erro na query (boca99):', error);
                return res.status(500).send({ error: error });
            }

            if (!resultado_boca99 || resultado_boca99.length === 0) {
                console.log('Nenhum registro encontrado com o IDMETA (boca99):', idmeta_caixa);
                return res.status(404).send({
                    message:
                        'Nenhum registro encontrado com o ID fornecido , idmeta_caixa: ' +
                        idmeta_caixa,
                });
            }

            const fibra = resultado_boca99[0].FIBRA;
            if (fibra != null && String(fibra).trim() === '=id()') {
                status = 'fim';
            }
        } while (status !== 'fim' && contador < 72);

        // obtem tubo da saida splitter para descobrir a tabela onde sera escrito a saida do splitter
        let tubo_sp = 1;
        if (saida_splitter <= 16) {
            tubo_sp = 1;
        }
        if (saida_splitter > 16) {
            tubo_sp = 2;
        }
        if (saida_splitter > 32) {
            tubo_sp = 3;
        }
        if (saida_splitter > 48) {
            tubo_sp = 4;
        }
        if (saida_splitter > 64) {
            tubo_sp = 5;
        }
        if (saida_splitter > 80) {
            tubo_sp = 6;
        }
        if (saida_splitter > 96) {
            tubo_sp = 7;
        }
        if (saida_splitter > 112) {
            tubo_sp = 8;
        }
        if (saida_splitter > 128) {
            tubo_sp = 9;
        }
        if (saida_splitter > 144) {
            tubo_sp = 10;
        }
        if (saida_splitter > 160) {
            tubo_sp = 11;
        }
        if (saida_splitter > 176) {
            tubo_sp = 12;
        }
        if (saida_splitter > 192) {
            tubo_sp = 13;
        }
        if (saida_splitter > 208) {
            tubo_sp = 14;
        }
        if (saida_splitter > 224) {
            tubo_sp = 15;
        }
        if (saida_splitter > 240) {
            tubo_sp = 16;
        }

        

        // le boca 99 para descobri o cabo utilizado para ligar a saida do splitter(boca99) pontaA do cabo  ao cliente pontaB do cabo
        const queryIdCabo =`select boca99 from caixa where id_meta = ?`;

        // escreve os id dos recursos que o cliente usara na tabela pop
        const query = `UPDATE tstmeta.pop SET recurso_caixa = ?, recurso_sp = ?, recurso_sp_saida = ? WHERE id_meta = ?`; //id_cliente

        // escreve na saida do splitter a boca99 da caixa
        const querysplitter = `UPDATE splitter_t${tubo_sp} set F${saida_splitter}= prop.boca99_${contador}.label where idmeta=?`; //id_splitter

        // escreve na boca99 da caixa a saida do splitter
        const queryBoca99 = `UPDATE cxboca99_t${tubo} set F${contador}=prop.splitter${idmeta_splitter}_${saida_splitter}.label where idmeta=?`; //id_caixa

        // escreve cliente na ponta do cabo virtual da boca99
        const queryCabo = `UPDATE cabob_t${tubo} SET FIBRA_${contador}LABEL=TST${idmeta_cliente}!PROP.ROW_5.LABEL WHERE idmeta=?`; //id_cabodaBoca99

        let resultado;
        try {
            await new Promise((resolve, reject) => {
                conn.query('START TRANSACTION', (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            resultado = await new Promise((resolve, reject) => { // escreve os id dos recursos que o cliente usara na tabela pop
                conn.query(
                    query,
                    [idmeta_caixa, idmeta_splitter, saida_splitter, idmeta_cliente],
                    (err, resultadoQuery) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(resultadoQuery);
                        }
                    }
                );
            });
        
        

        resultado_splitter = await new Promise((resolve, reject) => { // escreve a posição livre da boca99 a saida do splitter
            conn.query(querysplitter, [idmeta_splitter], (err, resultado) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(resultado);
                }
            });
        });
        

        resultado_boca99 = await new Promise((resolve, reject) => { // escreve a saida do splitter na posição livre da boca99
            conn.query(queryBoca99, [idmeta_caixa], (err, resultado) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(resultado);
                }
            });
        });


        resultado_id_cabo = await new Promise((resolve, reject) => { // le  cabo conectado na boca 99 expl: cabo185512A
            conn.query(queryIdCabo, [idmeta_caixa], (err, resultado) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(resultado);
                }
            });
        });

        const texto = String(resultado_id_cabo[0].boca99);
        const m = texto.match(/^cabo(\d+)[AB]$/i); // extraio apenas o id do cabo e a ponta ex: cabo185512A
        const idCaboStr = m[1];         
        const idmeta_cabo = parseInt(idCaboStr, 10); // converto para numero

        resultado_cabo = await new Promise((resolve, reject) => { // escreve cliente na ponta do cabo virtual da boca99
            conn.query(queryCabo, [idmeta_cabo], (err, resultado) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(resultado);
                }
            });
        });
            //commit da transação
            await new Promise((resolve, reject) => {
                conn.query('COMMIT', (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            return res.status(200).send({
                message: 'Cliente ativado com sucesso',
                recurso_caixa: idmeta_caixa,
                recurso_sp: idmeta_splitter,
                recurso_sp_saida: saida_splitter,
                cabo_virtual: idmeta_cabo
            });

    // rollback em caso de erro
    } catch (error) { // erro na query
        try {
            await new Promise((resolve, reject) => {
                conn.query('ROLLBACK', (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (_) {
            /* ignore rollback falha */
        }
        console.error('Erro na query:', error);
        return res.status(500).send({ error: error });
    }
        
    } catch (error) {
        console.error('Erro na rota update_cliente_ativacao:', error);
        return res.status(500).send({
            error: error.message || 'Erro ao processar ativação de cliente',
            details: error.message,
        });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
