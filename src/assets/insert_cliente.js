const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

router.post('/', login, (req, res, next) => {
    console.log('🗺️ Executando inserção de clientes...');
    
    // ✅ Removido ID_META do body - será gerado automaticamente
    const {
        CONTRATO_GPON,
        CNPJ,
        SIGLA,
        ENDEREÇO,
        NUMERO,
        COMPLEMENTO,
        BAIRRO,
        CEP,
        TELEFONE,
        id_city,
        id_condominio,
        OBS,
        LAT,
        LNG,
        TAMANHO,
        STATUS,
        POP_ESTACAO
    } = req.body;

    const GPON = 1;
    const Tipo_objeto = 'pop';
    const CONVENCIONAL = 0;

    // ✅ Verificar se as coordenadas existem
    const temCoordenadas = LAT && LNG && LAT !== '' && LNG !== '';

    mysql.getConnection((error, conn) => {
        if (error) { 
            console.error('Erro ao obter conexão:', error);
            return res.status(500).send({ error: error });
        }

        if (!temCoordenadas) {
            // ✅ Sem coordenadas: inserir apenas em tst.estações com ID_META = NULL
            console.log('⚠️ Sem coordenadas - inserindo apenas em tst.estações');
            
            const queryEST = `INSERT INTO tst.estações 
                (ID_META, CONTRATO_GPON, CNPJ, SIGLA, ENDEREÇO, NUMERO, COMPLEMENTO, BAIRRO, CEP, TELEFONE, M, OBS, POP_ESTACAO) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            conn.query(
                queryEST,
                [null, CONTRATO_GPON, CNPJ, SIGLA, ENDEREÇO, NUMERO, COMPLEMENTO, BAIRRO, CEP, TELEFONE, id_city, OBS, POP_ESTACAO],
                (error, resultadoEST) => {
                    conn.release();
                    
                    if (error) {
                        console.error('Erro ao inserir em tst.estações:', error);
                        return res.status(500).send({ error: error });
                    }

                    console.log('✅ Cliente inserido em tst.estações (sem coordenadas)');
                    
                    return res.status(200).send({
                        success: true,
                        message: 'Cliente inserido com sucesso (sem coordenadas)',
                        id_estacao: resultadoEST.insertId
                    });
                }
            );
        } else {
            // ✅ Com coordenadas: executar todas as queries em transação
            conn.beginTransaction((err) => {
                if (err) {
                    conn.release();
                    console.error('Erro ao iniciar transação:', err);
                    return res.status(500).send({ error: err });
                }

                // 1️⃣ INSERT na tabela tstmeta.ids (gera o ID_META)
                const queryID = `INSERT INTO tstmeta.ids (Tipo_objeto, id_city, id_condominio) VALUES (?, ?, ?)`;
                
                conn.query(
                    queryID,
                    [Tipo_objeto, id_city, id_condominio],
                    (error, resultadoID) => {
                        if (error) {
                            return conn.rollback(() => {
                                conn.release();
                                console.error('Erro ao inserir em tstmeta.ids:', error);
                                return res.status(500).send({ error: error });
                            });
                        }

                        // ✅ Pegar o ID_META gerado
                        const ID_META = resultadoID.insertId;
                        console.log('✅ ID_META gerado:', ID_META);

                        // 2️⃣ INSERT na tabela tst.estações (usando o ID_META gerado)
                        const queryEST = `INSERT INTO tst.estações 
                            (ID_META, CONTRATO_GPON, CNPJ, SIGLA, ENDEREÇO, NUMERO, COMPLEMENTO, BAIRRO, CEP, TELEFONE, M, OBS, POP_ESTACAO) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                        
                        conn.query(
                            queryEST,
                            [ID_META, CONTRATO_GPON, CNPJ, SIGLA, ENDEREÇO, NUMERO, COMPLEMENTO, BAIRRO, CEP, TELEFONE, id_city, OBS, POP_ESTACAO],
                            (error, resultadoEST) => {
                                if (error) {
                                    return conn.rollback(() => {
                                        conn.release();
                                        console.error('Erro ao inserir em tst.estações:', error);
                                        return res.status(500).send({ error: error });
                                    });
                                }

                                // ✅ Pegar o id_estacao gerado
                                const id_estacao = resultadoEST.insertId;
                                console.log('✅ id_estacao gerado:', id_estacao);

                                // 3️⃣ INSERT na tabela tstmeta.pop (usando o ID_META gerado)
                                const queryPOP = `INSERT INTO tstmeta.pop 
                                    (sigla, id_visio, id_meta, id_city, id_condominio, Layer_PON, Layer_CONV, LAT, LNG, TAMANHO, STATUS, id_estacao) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                                
                                conn.query(
                                    queryPOP,
                                    [SIGLA, ID_META, ID_META, id_city, id_condominio, GPON, CONVENCIONAL, LAT, LNG, TAMANHO, STATUS, id_estacao],
                                    (error, resultadoPOP) => {
                                        if (error) {
                                            return conn.rollback(() => {
                                                conn.release();
                                                console.error('Erro ao inserir em tstmeta.pop:', error);
                                                return res.status(500).send({ error: error });
                                            });
                                        }

                                        // ✅ Commit da transação (tudo foi inserido com sucesso)
                                        conn.commit((err) => {
                                            if (err) {
                                                return conn.rollback(() => {
                                                    conn.release();
                                                    console.error('Erro ao fazer commit:', err);
                                                    return res.status(500).send({ error: err });
                                                });
                                            }

                                            conn.release();
                                            console.log('✅ Cliente inserido com sucesso! ID_META:', ID_META);
                                            
                                            return res.status(200).send({
                                                success: true,
                                                message: 'Cliente inserido com sucesso',
                                                id_meta: ID_META,
                                                id_estacao: id_estacao
                                            });
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            });
        }
    });
});

module.exports = router;