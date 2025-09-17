const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

/**
 * Rota: /api/query_conex
 * Função: Executa consultas SQL dinâmicas baseadas no módulo VB6 LE_CONEX
 * Método: POST
 * Middleware: login (autenticação obrigatória)
 */

router.post('/', login, (req, res, next) => {
    const { query, params } = req.body;

    // Validação dos parâmetros obrigatórios
    if (!query) {
        return res.status(400).send({ 
            success: false, 
            error: 'Query SQL é obrigatória' 
        });
    }

    if (!params || typeof params !== 'object') {
        return res.status(400).send({ 
            success: false, 
            error: 'Parâmetros são obrigatórios e devem ser um objeto' 
        });
    }

    // Processar query com parâmetros
    let processedQuery = query;
    const queryParams = [];

    // Substituir placeholders {PARAM} pelos valores reais
    Object.keys(params).forEach(key => {
        const placeholder = `{${key}}`;
        const value = params[key];
        
        if (processedQuery.includes(placeholder)) {
            if (typeof value === 'string') {
                // Para strings, usar placeholder do MySQL
                processedQuery = processedQuery.replace(new RegExp(placeholder, 'g'), '?');
                queryParams.push(value);
            } else {
                // Para números, substituir diretamente
                processedQuery = processedQuery.replace(new RegExp(placeholder, 'g'), value.toString());
            }
        }
    });

    // Adicionar prefixo tstmeta. para todas as tabelas (exceto se já tiver)
    console.log('Antes da regex FROM:', processedQuery);
    processedQuery = processedQuery.replace(/\bFROM\s+([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*|[a-zA-Z_][a-zA-Z0-9_]*)\b/gi, (match, tableName) => {
        console.log('Regex FROM capturou:', match, 'tableName:', tableName);
        // Se a tabela já tem prefixo de banco (contém .), não adicionar tstmeta.
        if (!tableName.includes('.')) {
            const result = `FROM tstmeta.${tableName}`;
            console.log('Regex FROM result:', result);
            return result;
        }
        return match;
    });
    console.log('Depois da regex FROM:', processedQuery);

    processedQuery = processedQuery.replace(/\bJOIN\s+([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*|[a-zA-Z_][a-zA-Z0-9_]*)\b/gi, (match, tableName) => {
        // Se a tabela já tem prefixo de banco (contém .), não adicionar tstmeta.
        if (!tableName.includes('.')) {
            return `JOIN tstmeta.${tableName}`;
        }
        return match;
    });

    console.log('Query original:', query);
    console.log('Query processada:', processedQuery);
    console.log('Parâmetros:', queryParams);

    mysql.getConnection((error, conn) => {
        if (error) { 
            return res.status(500).send({ 
                success: false, 
                error: 'Erro de conexão com banco de dados' 
            });
        }

        conn.query(processedQuery, queryParams, (error, resultado, fields) => {
            conn.release();
            
            if (error) { 
                console.error('Erro na execução da query:', error);
                return res.status(500).send({ 
                    success: false, 
                    error: 'Erro na execução da consulta SQL',
                    details: error.message 
                });
            }

            return res.status(200).send({
                success: true,
                data: resultado,
                query: processedQuery,
                params: queryParams
            });
        });
    });
});

/**
 * Rota específica para buscar IDMETA por nome visual
 * Baseada na consulta: SELECT ID_META from {TABELACABO} where id_VISIO = '{NOMECABO}'
 */
router.post('/idmeta-visual', login, (req, res, next) => {
    const { tabelaCabo, nomeCabo } = req.body;

    if (!tabelaCabo || !nomeCabo) {
        return res.status(400).send({ 
            success: false, 
            error: 'tabelaCabo e nomeCabo são obrigatórios' 
        });
    }

    const query = 'SELECT ID_META FROM tstmeta.?? WHERE id_VISIO = ?';
    const params = [tabelaCabo, nomeCabo];

    mysql.getConnection((error, conn) => {
        if (error) { 
            return res.status(500).send({ 
                success: false, 
                error: 'Erro de conexão com banco de dados' 
            });
        }

        conn.query(query, params, (error, resultado, fields) => {
            conn.release();
            
            if (error) { 
                console.error('Erro na busca de IDMETA:', error);
                return res.status(500).send({ 
                    success: false, 
                    error: 'Erro na busca de IDMETA',
                    details: error.message 
                });
            }

            const idmeta = resultado.length > 0 ? resultado[0].ID_META : null;
            
            return res.status(200).send({
                success: true,
                idmeta: idmeta,
                found: idmeta !== null
            });
        });
    });
});

/**
 * Rota específica para buscar registro por IDMETA
 * Baseada na consulta: SELECT {regist} as registro from {TABELA} where idmeta = {idmeta}
 */
router.post('/registro-idmeta', login, (req, res, next) => {
    const { tabela, idmeta, registro } = req.body;

    if (!tabela || !idmeta || !registro) {
        return res.status(400).send({ 
            success: false, 
            error: 'tabela, idmeta e registro são obrigatórios' 
        });
    }

    // Para tabelas principais (dio, cabopa, cabopb), usar id_meta (minúsculo com underscore)
    // Para tabelas de conexão (dio_tX, caboa_tX, cxbocaX_tX, etc.), usar IDMETA (maiúsculo sem underscore)
    const campoIdmeta = (tabela === 'dio' || tabela === 'cabopa' || tabela === 'cabopb') 
                        ? 'id_meta' : 'IDMETA';
    
    const query = `SELECT ?? as registro FROM tstmeta.?? WHERE ?? = ?`;
    const params = [registro, tabela, campoIdmeta, idmeta];

    mysql.getConnection((error, conn) => {
        if (error) { 
            return res.status(500).send({ 
                success: false, 
                error: 'Erro de conexão com banco de dados' 
            });
        }

        conn.query(query, params, (error, resultado, fields) => {
            conn.release();
            
            if (error) { 
                console.log(`[ERRO] Query: ${query}`);
                console.log(`[ERRO] Params:`, params);
                console.error('Erro na busca de registro:', error);
                return res.status(500).send({ 
                    success: false, 
                    error: 'Erro na busca de registro',
                    details: error.message 
                });
            }

            const valor = resultado.length > 0 ? resultado[0].registro : null;
            
            return res.status(200).send({
                success: true,
                valor: valor,
                found: valor !== null
            });
        });
    });
});

/**
 * Rota específica para buscar fibra conectada
 * Baseada na consulta: SELECT FN{FIBER} as fiber from {TABELA} where idmeta = {idmeta}
 */
router.post('/fiber-connected', login, (req, res, next) => {
    const { tabela, idmeta, fiber } = req.body;

    if (!tabela || !idmeta || !fiber) {
        return res.status(400).send({ 
            success: false, 
            error: 'tabela, idmeta e fiber são obrigatórios' 
        });
    }

    const campoFiber = `FN${fiber}`;
    
    // Para tabelas principais (dio, cabopa, cabopb), usar id_meta (minúsculo com underscore)
    // Para tabelas de conexão (dio_tX, caboa_tX, cxbocaX_tX, etc.), usar IDMETA (maiúsculo sem underscore)
    const campoIdmeta = (tabela === 'dio' || tabela === 'cabopa' || tabela === 'cabopb') 
                        ? 'id_meta' : 'IDMETA';
    
    const query = `SELECT ?? as fiber FROM tstmeta.?? WHERE ?? = ?`;
    const params = [campoFiber, tabela, campoIdmeta, idmeta];

    mysql.getConnection((error, conn) => {
        if (error) { 
            return res.status(500).send({ 
                success: false, 
                error: 'Erro de conexão com banco de dados' 
            });
        }

        conn.query(query, params, (error, resultado, fields) => {
            conn.release();
            
            if (error) { 
                console.error('Erro na busca de fibra conectada:', error);
                return res.status(500).send({ 
                    success: false, 
                    error: 'Erro na busca de fibra conectada',
                    details: error.message 
                });
            }

            const fiberValue = resultado.length > 0 ? resultado[0].fiber : null;
            
            return res.status(200).send({
                success: true,
                fiber: fiberValue,
                found: fiberValue !== null
            });
        });
    });
});

module.exports = router;
