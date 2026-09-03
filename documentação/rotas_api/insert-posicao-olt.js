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
 * @throws {Error} mensagem inclui prefixo esperado pela rota HTTP 400.
 * @returns {{ idmeta_dio: number, fibra_dio: number, idmeta_pop: number }}
 */
function validarDadosEntrada(body) {
    const camposObrigatorios = ['idmeta_dio', 'fibra_dio', 'idmeta_pop'];
    const faltando = camposObrigatorios.filter(
        (campo) => body[campo] === undefined || body[campo] === null || body[campo] === '',
    );
    if (faltando.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${faltando.join(', ')}`);
    }

    const exigirInteiroPositivo = (valor, nomeCampo) => {
        const n = Number(valor);
        if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
            throw new Error(`Dados inválidos: ${nomeCampo} deve ser um inteiro positivo.`);
        }
        return n;
    };

    return {
        idmeta_dio: exigirInteiroPositivo(body.idmeta_dio, 'idmeta_dio'),
        fibra_dio: exigirInteiroPositivo(body.fibra_dio, 'fibra_dio'),
        idmeta_pop: exigirInteiroPositivo(body.idmeta_pop, 'idmeta_pop'),
    };
}

/**
 * 🔄 Versão refatorada usando async/await
 * Esta versão elimina o "callback hell" e torna o código mais legível
 * inseri portas_olt do tstmeta.pop e inclui registro inteiro em tstmeta.portas_olt.
 * campos id de tstmeta.portas_olt e id_pop que é o idmeta do cliente para limpar campo portas_olt dele.
 */
router.post('/', login, async (req, res, next) => {
    console.log('🗺️ incluindo posiçao OLT tabela portas_olt(versão async/await) ...');
    
    let conn;

    try {
        // ✅ Validar dados antes de iniciar qualquer operação (retorna números coercidos)
        const { idmeta_dio, fibra_dio, idmeta_pop } = validarDadosEntrada(req.body);

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

        // INSERT em tstmeta.portas_olt — insertId será gravado em tstmeta.pop.portas_olt (FK / id da linha inserida)
        const queryOLT = `INSERT INTO tstmeta.portas_olt (DIO, FIBER, POP) VALUES (?,?,?);`;
        
        const resultadoOLT = await executarQuery(conn, queryOLT, [idmeta_dio, fibra_dio, idmeta_pop]);

        const IDNum = Number(resultadoOLT.insertId);
        if (!Number.isFinite(IDNum) || IDNum <= 0 || !Number.isInteger(IDNum)) {
            throw new Error('Dados inválidos: insert em portas_olt não devolveu insertId válido.');
        }
        const ID = IDNum;

        const queryPOP = `UPDATE tstmeta.pop SET portas_olt=? WHERE ID_META=?`;

        await executarQuery(conn, queryPOP, [ID, idmeta_pop]);

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
        console.log('✅ inserido posição porta olt com sucesso! dio:', idmeta_dio);
        
        return res.status(200).send({
            success: true,
            message: 'Atualização da porta OLT e porta_olt cliente Concluida',
            portas_olt_id: ID,
            idmeta_dio,
            cliente: idmeta_pop,
            fibra: fibra_dio,
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
        
        console.error('❌ Erro ao atualizar PORTA OLT X CLIENTE:', error);
        
        // Retornar erro de validação com status 400
        if (
            error.message &&
            (error.message.includes('Campos obrigatórios') ||
                error.message.includes('Dados inválidos'))
        ) {
            return res.status(400).send({
                error: error.message,
                success: false,
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

