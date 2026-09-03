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
    const camposObrigatorios = ['CAPACIDADE', 'ID_META_CAIXA', 'NUMERO_CX', 'TIPO_SPLITTER', 'X', 'Y'];
    const camposFaltando = camposObrigatorios.filter(campo => !body[campo] && body[campo] !== 0);
    
    if (camposFaltando.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${camposFaltando.join(', ')}`);
    }

    // Validar coordenadas
    if (isNaN(body.X) || isNaN(body.Y)) {
        throw new Error('X e Y devem ser números válidos');
    }

    // Validar ID_META
    if (isNaN(body.ID_META_CAIXA)) {
        throw new Error('ID_META_CAIXA deve ser um número válido');
    }

    
    
}

/**
 * 🔄 Versão refatorada usando async/await
 * Esta versão elimina o "callback hell" e torna o código mais legível
 */
router.post('/', login, async (req, res, next) => {
    console.log('🗺️ Inserindo DIO (versão async/await) ...');
    
    let conn;

    try {
        // ✅ Validar dados antes de iniciar qualquer operação
        validarDadosEntrada(req.body);

        
        // ✅ Removido ID_META do body - será gerado automaticamente
        const {
            CAPACIDADE,
            ID_META_CAIXA,
            NUMERO_CX,
            LABEL,
            TIPO_SPLITTER,
            X,
            Y,
            id_city,
            id_condominio
            } = req.body;

              
        
        const Tipo_objeto = 'splitter';
        const Bandeja = 'ZERO';
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
        
        const resultadoID = await executarQuery(conn, queryID, [Tipo_objeto, id_city, id_condominio]);

        // ✅ Pegar o ID_META gerado
        const ID_META = resultadoID.insertId;
        console.log('✅ ID_META gerado:', ID_META);

              

        
        // 2 INSERT na tabela tstmeta.caixa (usando o ID_META gerado)
        const queryMETACX = `INSERT INTO tstmeta.splitter_e
            (CAPACIDADE, ID_META_CAIXA, NUMERO_CX, LABEL, TIPO_SPLITTER, X, Y) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        await executarQuery(conn, queryMETACX,
            [CAPACIDADE, ID_META_CAIXA, NUMERO_CX, LABEL, TIPO_SPLITTER, X, Y]);

            const tubos = getTubosParaCapacidade(CAPACIDADE);
            console.log('tubos:', tubos, ' tamanho:',tubos.length);

            for (let t=1; t<=tubos.length; t++) {
                const queryTUBO = `INSERT INTO tstmeta.splitter_t${t} (IDMETA) VALUES (?)`;
                await executarQuery(conn, queryTUBO, [ID_META_CAIXA]);
            }

                let fibra= '';

                for(let f=1; f<CAPACIDADE ; f++) {
                    let tub;
                    
                    if (f <= 16){ 
                        tub = 1;
                    }else if (f >= 17 && f <= 32) {
                        tub = 2;                        
                    }else if (f >= 33 && f <= 48) {
                        tub = 3;
                    }else if (f >= 49 && f <= 64) {
                        tub = 4;
                    }else if (f >= 65 && f <= 80) {
                        tub = 5;
                    }else if (f >= 81 && f <= 96) {
                        tub = 6; 
                    }else if (f >= 97 && f <= 112) {
                        tub = 7;
                    }else if (f >= 113 && f <= 128) {
                        tub = 8;
                    }else if (f >= 129 && f <= 144) {
                        tub = 9;
                    }else if (f >= 145 && f <= 160) {
                        tub = 10;
                    }else if (f >= 161 && f <= 176) {
                        tub = 11;
                    }else if (f >= 177 && f <= 192) {
                        tub = 12;
                    }else if (f >= 193 && f <= 208) {
                        tub = 13;
                    }else if (f >= 209 && f <= 224) {
                        tub = 14;
                    }else if (f >= 225 && f <= 240) {
                        tub = 15;
                    }else if (f >= 241 && f <= 256) {
                        tub = 16;
                    }
                    
                    fibra= 'splitter_e'+ ID_META_CAIXA + '_F' + f;
                    const queryUpdate =`UPDATE tstmeta.splitter_t${tub} SET F${f}L = ? where IDMETA= ?`;
                    await executarQuery(conn, queryUpdate, [fibra, ID_META_CAIXA]);
                }


                




        // ✅ Commit da transação (tudo foi inserido com sucesso)
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

        
        // Liberar conexão
        conn.release();
        console.log('✅ DIO criado com sucesso! ID_META:', ID_META);
        
        return res.status(200).send({
            success: true,
            message: 'DIO criado com sucesso',
            id_meta: ID_META
            
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
 * 🔌 Calcula quais tubos precisam ser populados baseado na capacidade do cabo
 * Cada tubo contém 12 fibras
 * @param {number} capacidade - Capacidade total do cabo em fibras
 * @returns {number[]} Array com os números dos tubos que precisam ser populados
 */
function getTubosParaCapacidade(capacidade) {
    const quantidadeTubos = Math.ceil(capacidade / 16);
    const tubos = [];
    
    // Sempre começa do tubo 1 até a quantidade necessária
    for (let i = 1; i <= quantidadeTubos; i++) {
        tubos.push(i);
    }
    
    return tubos;
}







module.exports = router;

