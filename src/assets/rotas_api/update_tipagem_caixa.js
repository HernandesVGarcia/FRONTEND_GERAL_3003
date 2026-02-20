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
    const camposObrigatorios = ['id_meta', 'ID_TIPO', 'NUMERO', 'LOCALIZACAO', 'TIPO'];
    const camposFaltando = camposObrigatorios.filter(campo => !body[campo] && body[campo] !== 0);
    
    if (camposFaltando.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${camposFaltando.join(', ')}`);
    }
}

        
    

/**
 * 🔄 Versão refatorada usando async/await
 * Esta versão elimina o "callback hell" e torna o código mais legível
 */
router.post('/', login, async (req, res, next) => {
    console.log('🗺️ Alterando Caixa (versão async/await) ...');
    
    let conn;

    try {
        // ✅ Validar dados antes de iniciar qualquer operação
        validarDadosEntrada(req.body);

        
        // ✅ id_meta vem do body para identificar a caixa a ser atualizada
        const {
            id_meta,
            ID_TIPO,
            NUMERO,
            LOCALIZACAO,
            TIPO,
            OBSERVACAO
                      
        } = req.body;

        
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

        
        // 1 INSERT na tabela tst.caixa (usando o ID_META gerado)
        /*const queryCX = `INSERT INTO tst.caixa 
            (DATA, GPON, ID_TIPO, NUMERO, LOCALIZAÇAO, TIPO, USUARIO, OBSERVAÇÃO, idCIDADES, id_POLO, ID_META) 
            VALUES (curdate(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;*/
        
        const queryCX = `UPDATE tst.caixa SET TIPO=?, NUMERO=?, LOCALIZAÇAO=?, ID_TIPO=?, OBSERVAÇÃO=?  WHERE ID_META= ? ` 

        const resultadoCX = await executarQuery(conn, queryCX, 
            [ TIPO, NUMERO, LOCALIZACAO, ID_TIPO, OBSERVACAO, id_meta]);

        
        // 2 INSERT na tabela tstmeta.caixa (usando o ID_META gerado)
        const queryMETACX = `UPDATE tstmeta.caixa SET ID_TIPO=?, NUMEROCX=? WHERE ID_META=?` 
            
        
        await executarQuery(conn, queryMETACX,
            [ID_TIPO, NUMERO, id_meta]);

        // Commit da transação
        await new Promise((resolve, reject) => {
            conn.commit((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        // Liberar conexão
        conn.release();
        console.log('✅ Caixa alterada com sucesso! ID_META:', id_meta);
        
        return res.status(200).send({
            success: true,
            message: 'Caixa alterada com sucesso',
            id_meta: id_meta
            
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
        
        console.error('❌ Erro ao alterar caixa:', error);
        
        // Retornar erro de validação com status 400
        if (error.message && (
            error.message.includes('Campos obrigatórios') || 
            error.message.includes('deve ser um número') 
            
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

 




module.exports = router;

