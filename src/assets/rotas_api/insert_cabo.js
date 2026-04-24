const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

router.post('/', login, (req, res, next) => {
    console.log('🗺️ Executando inserção de cabo...');
    
    const {
        id_meta,
        id_city,
        id_condominio,
        capacidade,
        Codigo,
        tubo,
        Label_cabo,
        VIRTUAL2,
        length,
        GOOGLE_LATLNG
    } = req.body;

    // 🆕 Converter array para JSON string
    const googleLatLngString = GOOGLE_LATLNG ? JSON.stringify(GOOGLE_LATLNG) : null;

     // 🆕 Converter para formato MapWinGIS (para o campo GEOMETRIA_LAT_LONG)
     const geometriaMapWinGIS = converterParaMapWinGIS(GOOGLE_LATLNG);
    
    
    const id_visiopa = `cabo${id_meta}A`;
    const id_visiopb = `cabo${id_meta}B`; 
    const id_visiom = `cabo${id_meta}M`;
    const Layer_PON = 1;
    const Layer_CONV =0;
    
    mysql.getConnection((error, conn) => {
        if (error) { 
            console.error('Erro ao obter conexão:', error);
            return res.status(500).send({ error: error });
        }

        // 🆕 Iniciar transação
        conn.beginTransaction((err) => {
            if (err) {
                conn.release();
                console.error('Erro ao iniciar transação:', err);
                return res.status(500).send({ error: err });
            }

            // 1️⃣ INSERT na tabela cabopa (ponta A)
            const queryCabopa = `INSERT INTO tstmeta.cabopa 
                (id_visio, id_meta, id_city, id_condominio, capacidade, Codigo, Label_cabo, VIRTUAL2, length, Layer_PON, Layer_CONV,GOOGLE_LATLNG,GEOMETRIA_LAT_LONG) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            conn.query(
                queryCabopa,
                [id_visiopa, id_meta, id_city, id_condominio, capacidade, Codigo, Label_cabo, VIRTUAL2, length, Layer_PON, Layer_CONV,googleLatLngString,geometriaMapWinGIS],
                (error, resultadoCabopa) => {
                    if (error) {
                        return conn.rollback(() => {
                            conn.release();
                            console.error('Erro ao inserir em cabopa:', error);
                            return res.status(500).send({ error: error });
                        });
                    }

                    // 2️⃣ INSERT na tabela cabopb (ponta B)
                    const queryCabopb = `INSERT INTO tstmeta.cabopb 
                        (id_visio, id_meta, id_city, id_condominio, capacidade, Codigo, Label_cabo, VIRTUAL2, Layer_PON, Layer_CONV, BeginX, BeginY, EndX, EndY) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '0 mm', '0 mm', '0 mm', '0 mm')`;
                    
                    conn.query(
                        queryCabopb,
                        [id_visiopb, id_meta, id_city, id_condominio, capacidade, Codigo, Label_cabo, VIRTUAL2, Layer_PON, Layer_CONV],
                        (error, resultadoCabopb) => {
                            if (error) {
                                return conn.rollback(() => {
                                    conn.release();
                                    console.error('Erro ao inserir em cabopb:', error);
                                    return res.status(500).send({ error: error });
                                });
                            }

                            // 3️⃣ INSERT na tabela cabom
                            // ⚠️ AJUSTE: Verifique quais campos a tabela cabom precisa
                            const queryCabom = `INSERT INTO tstmeta.cabom 
                                (id_visio, id_meta, id_city, id_condominio, capacidade, tubo, Codigo, VIRTUAL2, Layer_PON, Layer_CONV) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                            
                            conn.query(
                                queryCabom,
                                [id_visiom, id_meta, id_city, id_condominio, capacidade, tubo, Codigo, VIRTUAL2, Layer_PON, Layer_CONV],
                                (error, resultadoCabom) => {
                                    if (error) {
                                        return conn.rollback(() => {
                                            conn.release();
                                            console.error('Erro ao inserir em cabom:', error);
                                            return res.status(500).send({ error: error });
                                        });
                                    }

                                    // 4️⃣ Inserir nas tabelas de tubos (caboa_tX e cabob_tX)
                                    const tubos = getTubosParaCapacidade(capacidade);
                                    console.log(`🔌 Inserindo em ${tubos.length} tubo(s) para capacidade ${capacidade}F`);
                                    
                                    // Função recursiva para inserir sequencialmente em cada tubo
                                    const inserirTubos = (indexTubo) => {
                                        if (indexTubo >= tubos.length) {
                                            // ✅ Todos os tubos foram inseridos
                                            
                                            // 🆕 5️⃣ Criar referências cruzadas entre pontas A e B
                                            referenciarPontasCabo(conn, id_meta, capacidade, (error) => {
                                                if (error) {
                                                    return conn.rollback(() => {
                                                        conn.release();
                                                        console.error('Erro ao criar referências cruzadas:', error);
                                                        return res.status(500).send({ 
                                                            error: error,
                                                            message: 'Erro ao criar referências cruzadas'
                                                        });
                                                    });
                                                }
                                                
                                                // ✅ Referências criadas - fazer commit
                                                conn.commit((err) => {
                                                    if (err) {
                                                        return conn.rollback(() => {
                                                            conn.release();
                                                            console.error('Erro ao fazer commit:', err);
                                                            return res.status(500).send({ error: err });
                                                        });
                                                    }
                                                    
                                                    conn.release();
                                                    
                                                    console.log(`✅ Cabo inserido com sucesso!`);
                                                    console.log(`   - cabopa: ${resultadoCabopa.affectedRows} linha(s)`);
                                                    console.log(`   - cabopb: ${resultadoCabopb.affectedRows} linha(s)`);
                                                    console.log(`   - cabom: ${resultadoCabom.affectedRows} linha(s)`);
                                                    console.log(`   - tubos: ${tubos.length} tubo(s) inserido(s)`);
                                                    console.log(`   - referências: criadas com sucesso`);
                                                    
                                                    return res.status(200).send({ 
                                                        success: true,
                                                        id_meta: id_meta,
                                                        message: `Cabo id_meta ${id_meta} inserido com sucesso em todas as tabelas`,
                                                        tubosInseridos: tubos,
                                                        affectedRows: {
                                                            cabopa: resultadoCabopa.affectedRows,
                                                            cabopb: resultadoCabopb.affectedRows,
                                                            cabom: resultadoCabom.affectedRows,
                                                            tubos: tubos.length * 2 // caboa_tX + cabob_tX para cada tubo
                                                        }
                                                    });
                                                });
                                            });
                                            return;
                                        }
                                        
                                        const numeroTubo = tubos[indexTubo];
                                        
                                        // INSERT em caboa_t{numeroTubo}
                                        const queryCaboa = `INSERT INTO tstmeta.caboa_t${numeroTubo} (IDMETA) VALUES (?)`;
                                        
                                        conn.query(queryCaboa, [id_meta], (error, resultadoCaboa) => {
                                            if (error) {
                                                return conn.rollback(() => {
                                                    conn.release();
                                                    console.error(`❌ Erro ao inserir em caboa_t${numeroTubo}:`, error);
                                                    return res.status(500).send({ 
                                                        error: error,
                                                        message: `Erro ao inserir em caboa_t${numeroTubo}`
                                                    });
                                                });
                                            }
                                            
                                            // INSERT em cabob_t{numeroTubo}
                                            const queryCabob = `INSERT INTO tstmeta.cabob_t${numeroTubo} (IDMETA) VALUES (?)`;
                                            
                                            conn.query(queryCabob, [id_meta], (error, resultadoCabob) => {
                                                if (error) {
                                                    return conn.rollback(() => {
                                                        conn.release();
                                                        console.error(`❌ Erro ao inserir em cabob_t${numeroTubo}:`, error);
                                                        return res.status(500).send({ 
                                                            error: error,
                                                            message: `Erro ao inserir em cabob_t${numeroTubo}`
                                                        });
                                                    });
                                                }
                                                
                                                console.log(`✅ Tubo ${numeroTubo} inserido com sucesso (caboa_t${numeroTubo} e cabob_t${numeroTubo})`);
                                                
                                                // Chamar recursivamente para o próximo tubo
                                                inserirTubos(indexTubo + 1);
                                            });
                                        });
                                    };
                                    
                                    // Iniciar inserção dos tubos
                                    inserirTubos(0);
                                }
                            );
                        }
                    );
                }
            );
        });
    });
});


/**
 * 🔌 Calcula quais tubos precisam ser populados baseado na capacidade do cabo
 * Cada tubo contém 12 fibras
 * @param {number} capacidade - Capacidade total do cabo em fibras
 * @returns {number[]} Array com os números dos tubos que precisam ser populados
 */
function getTubosParaCapacidade(capacidade) {
    const quantidadeTubos = Math.ceil(capacidade / 12);
    const tubos = [];
    
    // Sempre começa do tubo 1 até a quantidade necessária
    for (let i = 1; i <= quantidadeTubos; i++) {
        tubos.push(i);
    }
    
    return tubos;
}


/**
 * 🗺️ Converte coordenadas do Google Maps para formato MapWinGIS
 * Formato MapWinGIS para polyline: 23;0;lng|lat|0.000000|0.000000|...
 * 
 * @param {Array} coordenadas - Array de objetos {lng, lat} do Google Maps
 * @returns {string} String no formato MapWinGIS ou null se inválido
 */
function converterParaMapWinGIS(coordenadas) {
    if (!coordenadas || !Array.isArray(coordenadas) || coordenadas.length === 0) {
        return null;
    }
    
    // Prefixo MapWinGIS para polyline
    const prefixoMapWinGIS = '23;0;';
    
    // Converter cada coordenada para o formato: lng|lat|0.000000|0.000000
    const coordenadasFormatadas = coordenadas
        .map(coord => `${coord.lng}|${coord.lat}|0.000000|0.000000`)
        .join('|');
    
    // Retornar string completa com prefixo e sufixo |
    return `${prefixoMapWinGIS}${coordenadasFormatadas}|`;
}

/**
 * 🔗 Cria referências cruzadas entre pontas A e B do cabo
 * Permite que o algoritmo de trace navegue entre as pontas
 * 
 * @param {object} conn - Conexão MySQL ativa
 * @param {number} id_meta - ID do cabo
 * @param {number} capacidade - Capacidade total do cabo
 * @param {function} callback - Callback (error) => void
 */
function referenciarPontasCabo(conn, id_meta, capacidade, callback) {
    console.log(`🔗 Criando referências cruzadas para cabo ${id_meta} (${capacidade}F)`);
    
    let posicaoTubo = 1;
    let posicaoFIBRAINI = 1;
    let posicaoFIBRAFIM;
    
    // Definir quantas fibras por tubo inicial
    if (capacidade === 1) posicaoFIBRAFIM = 1;
    else if (capacidade === 2) posicaoFIBRAFIM = 2;
    else if (capacidade === 4) posicaoFIBRAFIM = 4;
    else if (capacidade === 6) posicaoFIBRAFIM = 6;
    else if (capacidade === 8) posicaoFIBRAFIM = 8;
    else posicaoFIBRAFIM = 12; // > 8 fibras
    
    const NOME_PONTAa = `cabo${id_meta}A`;
    const NOME_PONTAb = `cabo${id_meta}B`;
    
    // Array para armazenar todas as queries de UPDATE
    const queries = [];
    
    // Loop pelos tubos
    while (posicaoFIBRAINI <= capacidade) {
        // Para cada fibra no tubo atual
        for (let i = posicaoFIBRAINI; i <= posicaoFIBRAFIM && i <= capacidade; i++) {
            // UPDATE caboa_tX: Ponta A referencia Ponta B
            queries.push({
                sql: `UPDATE tstmeta.caboa_t${posicaoTubo} SET FIBRA_${i} = ?, FN_${i} = ? WHERE IDMETA = ?`,
                params: [
                    `=${NOME_PONTAb}!Prop.Fibra_${i}.Label`,
                    `=${NOME_PONTAb}!Prop.FN_${i}.Label`,
                    id_meta
                ]
            });
            
            // UPDATE cabob_tX: Ponta B referencia Ponta A
            queries.push({
                sql: `UPDATE tstmeta.cabob_t${posicaoTubo} SET FIBRA_${i} = ?, FN_${i} = ? WHERE IDMETA = ?`,
                params: [
                    `=${NOME_PONTAa}!Prop.Fibra_${i}.Label`,
                    `=${NOME_PONTAa}!Prop.FN_${i}.Label`,
                    id_meta
                ]
            });
        }
        
        // Avançar para o próximo tubo
        posicaoTubo++;
        posicaoFIBRAINI = posicaoFIBRAFIM + 1;
        posicaoFIBRAFIM = posicaoFIBRAFIM + 12;
        
        // Tratamento especial para cabo de 18F
        if (capacidade === 18 && posicaoTubo < 3) {
            posicaoFIBRAFIM = 18;
        }
    }
    
    // Executar todas as queries sequencialmente
    executarQueriesSequenciais(conn, queries, 0, callback);
}

/**
 * 🔄 Executa queries sequencialmente (recursivo)
 * 
 * @param {object} conn - Conexão MySQL ativa
 * @param {Array} queries - Array de queries {sql, params}
 * @param {number} index - Índice atual
 * @param {function} callback - Callback (error) => void
 */
function executarQueriesSequenciais(conn, queries, index, callback) {
    if (index >= queries.length) {
        console.log(`✅ Todas as referências cruzadas criadas (${queries.length} updates)`);
        return callback(null);
    }
    
    const query = queries[index];
    
    conn.query(query.sql, query.params, (error) => {
        if (error) {
            console.error(`❌ Erro ao executar query ${index + 1}:`, error);
            return callback(error);
        }
        
        // Próxima query
        executarQueriesSequenciais(conn, queries, index + 1, callback);
    });
}




module.exports = router;