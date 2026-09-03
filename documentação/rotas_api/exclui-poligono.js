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
    const camposObrigatorios = ['id_meta', 'id_city'];
    const camposFaltando = camposObrigatorios.filter(campo => !body[campo] && body[campo] !== 0);
    
    if (camposFaltando.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${camposFaltando.join(', ')}`);
    }

       
    
}

/**
 * 🔄 Versão refatorada usando async/await
 * Esta versão elimina o "callback hell" e torna o código mais legível
 * exclui poligono através da tabela tstmeta.id.
  */
router.post('/', login, async (req, res, next) => {
    console.log('🗺️ excluindo Poligono (versão async/await) ...');
    
    let conn;

    try {
        // ✅ Validar dados antes de iniciar qualquer operação
        validarDadosEntrada(req.body);

        

        // ✅ Removido ID_META do body - será gerado automaticamente
        const {
            id_meta,
            id_city                         
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

                      

        
        
        const queryOLT = `DELETE from tstmeta.ids where id_meta= ? and id_city= ?`;
        
        await executarQuery(conn, queryOLT, [id_meta, id_city]);

            
        
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
        console.log('✅ excluido poligono com sucesso! ID:', id_meta);
        
        return res.status(200).send({
            success: true,
            message: 'Excluido Poligono',
            id_meta: id_meta,
            id_city: id_city
            
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
        
        console.error('❌ Erro ao excluir poligono:', error);
        
        // Retornar erro de validação com status 400
        if (error.message && (
            error.message.includes('Campos obrigatórios') 
            
            
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

