const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

/**
 * 🔧 Helper function para executar queries de forma mais limpa
 * @param {Object} conn - Conexão do MySQL
 * @param {string} query - Query SQL
 * @param {Array} params - Parâmetros da query
 * @returns {Promise} Promise com o resultado da query
 */
function executarQuery(conn, query, params) {
    return new Promise((resolve, reject) => {
        conn.query(query, params, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * ✅ Valida os dados de entrada antes de processar
 * @param {Object} body - Dados do request body
 * @throws {Error} Se algum campo obrigatório estiver faltando ou inválido
 */
function validarDadosEntrada(body) {
    const camposObrigatorios = ['ID_TIPO', 'NUMERO', 'LOCALIZACAO', 'TIPO', 'idCIDADES', 'USER', 'id_POLO', 'LAT', 'LNG'];
    const camposFaltando = camposObrigatorios.filter(campo => !body[campo] && body[campo] !== 0);
    
    if (camposFaltando.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${camposFaltando.join(', ')}`);
    }

    // Validar coordenadas
    if (isNaN(body.LAT) || isNaN(body.LNG)) {
        throw new Error('LAT e LNG devem ser números válidos');
    }

    // Validar idCIDADES
    if (isNaN(body.idCIDADES)) {
        throw new Error('idCIDADES deve ser um número válido');
    }

    // Validar id_condominio (se fornecido)
    if (body.id_condominio !== undefined && body.id_condominio !== null && isNaN(body.id_condominio)) {
        throw new Error('id_condominio deve ser um número válido');
    }

    // Validar id_POLO
    if (isNaN(body.id_POLO)) {
        throw new Error('id_POLO deve ser um número válido');
    }
}

/**
 * 🔄 Versão refatorada usando async/await
 * Esta versão elimina o "callback hell" e torna o código mais legível
 */
router.post('/', login, async (req, res, next) => {
    console.log('🗺️ Inserindo Caixa (versão async/await) ...');
    
    let conn;

    try {
        // ✅ Validar dados antes de iniciar qualquer operação
        validarDadosEntrada(req.body);

        // ✅ Validar geometria antes de iniciar transação
        const geometriaMapWinGIS = converterParaMapWinGIS(req.body.LAT, req.body.LNG);
        if (!geometriaMapWinGIS) {
            return res.status(400).send({ 
                error: 'Coordenadas inválidas para conversão',
                success: false 
            });
        }

        // ✅ Removido ID_META do body - será gerado automaticamente
        const {
            ID_TIPO,
            NUMERO,
            LOCALIZACAO,
            TIPO,
            OBSERVACAO,
            idCIDADES,
            USER,
            id_POLO,
            LAT,
            LNG,
            id_condominio,
        } = req.body;

        const GPON = 1;
        const Layer_PON = 1;
        const Layer_CONV = 0;
        const Tipo_objeto = 'CAIXA';
        // 🔹 Obter conexão do pool
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

        // 🔹 Iniciar transação
        await new Promise((resolve, reject) => {
            conn.beginTransaction((err) => {
                if (err) {
                    console.error('Erro ao iniciar transação:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        // 1️⃣ INSERT na tabela tstmeta.ids (gera o ID_META)
        const queryID = `INSERT INTO tstmeta.ids (Tipo_objeto, id_city, id_condominio) VALUES (?, ?, ?)`;
        
        const resultadoID = await executarQuery(conn, queryID, [Tipo_objeto, idCIDADES, id_condominio]);

        // ✅ Pegar o ID_META gerado
        const ID_META = resultadoID.insertId;
        console.log('✅ ID_META gerado:', ID_META);

        // 2️⃣ INSERT na tabela tst.caixa (usando o ID_META gerado)
        const queryCX = `INSERT INTO tst.caixa 
            (DATA, GPON, ID_TIPO, NUMERO, LOCALIZAÇAO, TIPO, USUARIO, OBSERVAÇÃO, idCIDADES, id_POLO, ID_META) 
            VALUES (curdate(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const resultadoCX = await executarQuery(conn, queryCX, 
            [GPON, ID_TIPO, NUMERO, LOCALIZACAO, TIPO, USER, OBSERVACAO, idCIDADES, id_POLO, ID_META]);

        // ✅ Pegar o idCaixa gerado
        const idCAIXA = resultadoCX.insertId;
        console.log('✅ idCAIXA gerado:', idCAIXA);

        // 3️⃣ INSERT na tabela tstmeta.caixa (usando o ID_META gerado)
        const queryMETACX = `INSERT INTO tstmeta.caixa 
            (NUMEROCX, GEOMETRIA_LAT_LONG, LAT, LONGI, DATA_ALTER, USER, Layer_PON, Layer_CONV, id_visio, ID_META, UNIQUEID, SHAPENAME, id_city) 
            VALUES (?, ?, ?, ?, CURdate(), ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await executarQuery(conn, queryMETACX,
            [NUMERO, geometriaMapWinGIS, LAT, LNG, USER, Layer_PON, Layer_CONV, ID_META, ID_META, ID_META, ID_META, idCIDADES]);

        // 4️⃣ Chamar stored procedure para criar estruturas internas da caixa
        const queryProcedure = `CALL tstmeta.cria_caixa(?, ?)`;
        
        try {
            await executarQuery(conn, queryProcedure, [ID_META, USER]);
            console.log('✅ Procedure cria_caixa executada com sucesso para ID_META:', ID_META);
        } catch (error) {
            console.error('Erro ao executar procedure cria_caixa:', {
                error: error.message,
                ID_META: ID_META,
                USER: USER,
                stack: error.stack
            });
            throw error;
        }

        /*
        ****************************************************************************
        // de 5 a 9 ESTRUTURA QUE PERMITIRA LIGAÇÃO DE CLIENTE SEM REPRESENTAR DROP
        ****************************************************************************
        */

        // 5️⃣ INSERT na tabela tstmeta.ids (gera o ID_META cabo caixa)
        const queryIDCabo = `INSERT INTO tstmeta.ids (Tipo_objeto, id_city, id_condominio) VALUES (?, ?, ?)`;
        const tipoOBJ = 'cabo';
        
        const resultadoIDCabo = await executarQuery(conn, queryIDCabo, [tipoOBJ, idCIDADES, id_condominio]);

        // ✅ Pegar o ID_META gerado
        const ID_METAcab = resultadoIDCabo.insertId;
        console.log('✅ ID_META cabo caixa gerado:', ID_METAcab);
        
        const id_visio_pb = 'cabo' + ID_METAcab + 'B';
        const id_visio_pa = 'cabo' + ID_METAcab + 'A';
        const id_visio_m = 'cabo' + ID_METAcab + 'M';
    
        // 6️⃣ INSERT na tabela tstmeta.cabopb (gera cabo virtual caixa)
        const queryIDPB = `INSERT INTO tstmeta.cabopb (id_city,CAPACIDADE,id_visio,ID_META,LAYER_PON,LAYER_CONV,VIRTUAL2) VALUES (?, 72, ?, ?, 1, 0, 1)`;
        await executarQuery(conn, queryIDPB, [idCIDADES, id_visio_pb, ID_METAcab]);

        // 7️⃣ INSERT na tabela tstmeta.cabopa (gera cabo virtual caixa)
        const queryIDPA = `INSERT INTO tstmeta.cabopa (id_city,CAPACIDADE,id_visio,ID_META,LAYER_PON,LAYER_CONV,VIRTUAL2) VALUES (?, 72, ?, ?, 1, 0, 1)`;
        await executarQuery(conn, queryIDPA, [idCIDADES, id_visio_pa, ID_METAcab]);

        // 8️⃣ INSERT na tabela tstmeta.cabom (gera cabo virtual caixa)
        const queryIDM = `INSERT INTO tstmeta.cabom (id_city,CAPACIDADE,id_visio,ID_META,LAYER_PON,LAYER_CONV,VIRTUAL2) VALUES (?, 72, ?, ?, 1, 0, 1)`;
        await executarQuery(conn, queryIDM, [idCIDADES, id_visio_m, ID_METAcab]);

        // 9️⃣ UPDATE na tabela tstmeta.caixa (escreve cabo virtual boca99 caixa)
        const queryBoca99 = `UPDATE tstmeta.caixa set BOCA99= ? WHERE ID_META = ?`;
        await executarQuery(conn, queryBoca99, [id_visio_pa, ID_META]);

        // 10 Chamar stored procedure para criar estruturas internas do cabo99 da caixa
        const queryProcedure99 = `CALL tstmeta.cria_cabo_99(?, ?)`;
        
        try {
            await executarQuery(conn, queryProcedure99, [ID_META, ID_METAcab]);
            console.log('✅ Procedure cria_cabo_99 executada com sucesso para ID_META_cabo:', ID_METAcab);
        } catch (error) {
            console.error('Erro ao executar procedure cria_cabo_99:', {
                error: error.message,
                ID_META: ID_META,
                ID_META_CABO: ID_METAcab,
                stack: error.stack
            });
            throw error;
        }






        // ✅ Commit da transação (caixa inserido com sucesso)
        await new Promise((resolve, reject) => {
            conn.commit((err) => {
                if (err) {
                    console.error('Erro ao fazer commit:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        //**********************************************************************************
        // ESTRUTURA CABO VIRTUAL PARA SPLITTER SPLITTER 11 a 16*/
        //********************************************************************************** */

        // 11 INSERT na tabela tstmeta.ids (gera o ID_META cabo caixa bocas 97 e 98)
        const queryIDCabo9798 = `INSERT INTO tstmeta.ids (Tipo_objeto, id_city, id_condominio) VALUES (?, ?, ?)`;
                
        const resultadoIDCabo9798 = await executarQuery(conn, queryIDCabo9798, [tipoOBJ, idCIDADES, id_condominio]);

        // ✅ Pegar o ID_META gerado
        const ID_METAcabSP = resultadoIDCabo9798.insertId;
        console.log('✅ ID_META cabo caixa gerado:', ID_METAcab);
        
        const id_visio_pb_sp = 'cabo' + ID_METAcabSP + 'B';
        const id_visio_pa_sp = 'cabo' + ID_METAcabSP + 'A';
        const id_visio_m_sp = 'cabo' + ID_METAcabSP + 'M';

        // 12 INSERT na tabela tstmeta.cabopb (gera cabo virtual caixa)
        const queryIDPB_sp = `INSERT INTO tstmeta.cabopb (id_city,CAPACIDADE,id_visio,ID_META,LAYER_PON,LAYER_CONV,VIRTUAL2) VALUES (?, 72, ?, ?, 1, 0, 1)`;
        await executarQuery(conn, queryIDPB_sp, [idCIDADES, id_visio_pb_sp, ID_METAcab]);

        // 13 INSERT na tabela tstmeta.cabopa (gera cabo virtual caixa)
        const queryIDPA_sp = `INSERT INTO tstmeta.cabopa (id_city,CAPACIDADE,id_visio,ID_META,LAYER_PON,LAYER_CONV,VIRTUAL2) VALUES (?, 72, ?, ?, 1, 0, 1)`;
        await executarQuery(conn, queryIDPA_sp, [idCIDADES, id_visio_pa_sp, ID_METAcab]);

        // 14 INSERT na tabela tstmeta.cabom (gera cabo virtual caixa)
        const queryIDM_sp = `INSERT INTO tstmeta.cabom (id_city,CAPACIDADE,id_visio,ID_META,LAYER_PON,LAYER_CONV,VIRTUAL2) VALUES (?, 72, ?, ?, 1, 0, 1)`;
        await executarQuery(conn, queryIDM_sp, [idCIDADES, id_visio_m_sp, ID_METAcab]);

        // 15 INSERT na tabela tstmeta.caboX_tX (gera cabo virtual caixa)
        const query_PA_T1 = `INSERT INTO caboa_t1 (IDMETA) VALUES (?) `;
        const query_PA_T2 = `INSERT INTO caboa_t2 (IDMETA) VALUES (?) `;
        const query_PA_T3 = `INSERT INTO caboa_t3 (IDMETA) VALUES (?) `;
        await executarQuery(conn, query_PA_T1, [ID_METAcabSP]);
        await executarQuery(conn, query_PA_T2, [ID_METAcabSP]);
        await executarQuery(conn, query_PA_T3, [ID_METAcabSP]);

        const query_PB_T1 = `INSERT INTO cabob_t1 (IDMETA) VALUES (?) `;
        const query_PB_T2 = `INSERT INTO cabob_t2 (IDMETA) VALUES (?) `;
        const query_PB_T3 = `INSERT INTO cabob_t3 (IDMETA) VALUES (?) `;
        await executarQuery(conn, query_PB_T1, [ID_METAcabSP]);
        await executarQuery(conn, query_PB_T2, [ID_METAcabSP]);
        await executarQuery(conn, query_PB_T3, [ID_METAcabSP]);


        // 16 UPDATE na tabela tstmeta.caixa (escreve cabo virtual boca97 e boca98 caixa)


        const queryBoca98 = `UPDATE tstmeta.caixa set BOCA98= ? WHERE ID_META = ?`;
        await executarQuery(conn, queryBoca98, [id_visio_pa_sp, ID_META]);
        const queryBoca97 = `UPDATE tstmeta.caixa set BOCA97= ? WHERE ID_META = ?`;
        await executarQuery(conn, queryBoca97, [id_visio_pb_sp, ID_META]);


        // 17 referenciando as pontas do cabos para splitter

        let CABOLABEL = '' ;
        let CABOLABELnum = '' ;
        let tabela_A ='';
        let tabela_B ='';
        let tabela_CX ='';

        let CAIXALABEL = '';
        let CAIXALABELnum= '';

        for (J=0; j<36; J++) {

         CABOLABEL = '=TST' + ID_META + '!PROP.BOCA98_' + J + '.VALUE' ;
         CABOLABELnum = '=TST' + ID_META + '!PROP.FN98_' + J + '.VALUE' ;

         if (J <= 12){ 
            tabela_A = 'caboa_t1';
            tabela_B = 'cabob_t1';
            tabela_CX = 'cxboca98_t1';
         }else if (J >= 13 && J <= 24) {
            tabela_A = 'caboa_t2';
            tabela_B = 'cabob_t2';
            tabela_CX = 'cxboca98_t2';
         } else if (J > 24) {
            tabela_A = 'caboa_t3';
            tabela_B = 'cabob_t3';
            tabela_CX = 'cxboca98_t3';
         }

            const queryFIBRA = `UPDATE tstmeta.${tabela_A} set FIBRA_${J}LABEL= ? WHERE ID_META = ?`;
            await executarQuery(conn, queryFIBRA, [CABOLABEL, ID_METAcabSP]);
            const queryFN = `UPDATE tstmeta.${tabela_A} set FN_${J}LABEL= ? WHERE ID_META = ?`;
            await executarQuery(conn, queryFN, [CABOLABELnum, ID_METAcabSP]);

        CAIXALABEL = '=cabo' +  ID_METAcabSP + "B!Prop.Fibra_" + J + '.VALUE'
        CAIXALABELnum = '=cabo' +  ID_METAcabSP + "B!Prop.FN_" + J + '.VALUE'

            const queryFcx = `UPDATE ${tabela_CX} SET F${J}L=? WHERE IDMETA = ?`
            await executarQuery(conn, queryFcx, [CAIXALABEL, ID_META]);
            const queryFNcx = `UPDATE ${tabela_CX} SET FN${J}L=? WHERE IDMETA = ?`
            await executarQuery(conn, queryFNcx, [CAIXALABELnum, ID_META]);
          
        
        }



        // 18 Criar referências cruzadas entre pontas A e B
        referenciarPontasCabo(conn, ID_METAcabSP, 36, (error) => {
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
        }
        )
                        

        

        // Liberar conexão
        conn.release();
        console.log('✅ Caixa criada com sucesso! ID_META:', ID_META);
        
        return res.status(200).send({
            success: true,
            message: 'Caixa criada com sucesso',
            id_meta: ID_META,
            id_caixa: idCAIXA
        });

    } catch (error) {
        // 🔴 Rollback em caso de erro
        if (conn) {
            try {
                await new Promise((resolve) => {
                    conn.rollback(() => {
                        conn.release();
                        console.log('🔄 Rollback executado');
                        resolve();
                    });
                });
            } catch (rollbackError) {
                console.error('Erro ao fazer rollback:', rollbackError);
                if (conn) conn.release();
            }
        }
        
        console.error('❌ Erro ao criar caixa:', error);
        
        // Retornar erro de validação com status 400
        if (error.message && (
            error.message.includes('Campos obrigatórios') || 
            error.message.includes('deve ser um número') ||
            error.message.includes('Coordenadas inválidas')
        )) {
            return res.status(400).send({ 
                error: error.message,
                success: false 
            });
        }
        
        // Retornar erro genérico com status 500
        return res.status(500).send({ 
            error: error.message || error,
            success: false 
        });
    }
});

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
}
    

/**
 * 🗺️ Converte coordenadas do Google Maps para formato MapWinGIS
 * Formato MapWinGIS para polyline: 1;lng|lat|.
 * 
 * @param {string} LATI - Latitude
 * @param {string} LONGI - Longitude
 * @returns {string} String no formato MapWinGIS ou null se inválido
 */
function converterParaMapWinGIS(LATI, LONGI) {
    if (!LATI || !LONGI || isNaN(LATI) || isNaN(LONGI)) {
        return null;
    }
    
    // Prefixo MapWinGIS para polyline
    const prefixoMapWinGIS = '1;';
    
    // Converter cada coordenada para o formato: lng|lat|
    const geometria = (`${LONGI}|${LATI}`);
    
    // Retornar string completa com prefixo e sufixo |
    return `${prefixoMapWinGIS}${geometria}|`;
}




module.exports = router;

