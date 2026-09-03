const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

/**
 * Rota: /api/tipos/:tipo
 * Função: Retorna os tipos de objetos (caixa, splitter, rack, equipamento, poste, conector)
 * Método: GET
 * Middleware: login (autenticação obrigatória)
 * 
 * Parâmetros de rota:
 * - tipo: 'caixa' | 'splitter' | 'rack' | 'equipamento' | 'poste' | 'conector'
 * 
 * Resposta:
 * {
 *   success: true,
 *   tipo: 'caixa',
 *   count: 13,
 *   data: [
 *     { id_tipocaixa: 1, tipocaixa: 'FOSC' },
 *     ...
 *   ]
 * }
 */

// Mapeamento de tipos para tabelas
const tipoConfig = {
    'caixa': {
        tabela: 'tipo_caixa'
    },
    'splitter': {
        tabela: 'tipo_splitter'
    },
    'rack': {
        tabela: 'tipo_rack'
    },
    'equipamento': {
        tabela: 'tipo_equipamento'
    },
    'poste': {
        tabela: 'tipo_poste'
    },
    'conector': {
        tabela: 'tipo_conector'
    }
};

router.get('/:tipo', login, (req, res, next) => {
    const tipo = req.params.tipo.toLowerCase();
    
    console.log(`📋 [TIPOS] Buscando tipos de: ${tipo}`);
    
    // Validar se o tipo é suportado
    if (!tipoConfig[tipo]) {
        return res.status(400).send({
            success: false,
            error: `Tipo '${tipo}' não é suportado. Tipos disponíveis: ${Object.keys(tipoConfig).join(', ')}`
        });
    }
    
    const config = tipoConfig[tipo];
    const query = `SELECT * FROM ${config.tabela}`;
    
    mysql.getConnection((error, conn) => {
        if (error) {
            console.error(`❌ [TIPOS] Erro ao obter conexão:`, error);
            return res.status(500).send({
                success: false,
                error: 'Erro de conexão com banco de dados'
            });
        }
        
        conn.query(query, (error, resultados) => {
            conn.release();
            
            if (error) {
                console.error(`❌ [TIPOS] Erro ao buscar tipos de ${tipo}:`, error);
                return res.status(500).send({
                    success: false,
                    error: `Erro ao buscar tipos de ${tipo}`,
                    details: error.message
                });
            }
            
            console.log(`✅ [TIPOS] ${resultados.length} tipo(s) de ${tipo} encontrado(s)`);
            
            return res.status(200).send({
                success: true,
                tipo: tipo,
                count: resultados.length,
                data: resultados
            });
        });
    });
});

module.exports = router;

