const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

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

function obterConexao() {
    return new Promise((resolve, reject) => {
        mysql.getConnection((error, connection) => {
            if (error) {
                console.error('Erro ao obter conexão:', error);
                reject(error);
            } else {
                resolve(connection);
            }
        });
    });
}

function validarDadosEntrada(body) {
    const id = body.id ?? body.ID;
    const idCity = body.id_city;

    if (id === undefined || id === null || id === '') {
        throw new Error('Campo obrigatório faltando: id');
    }
    if (idCity === undefined || idCity === null || idCity === '') {
        throw new Error('Campo obrigatório faltando: id_city');
    }
    if (Number.isNaN(Number(id))) {
        throw new Error('id deve ser numérico');
    }
    if (Number.isNaN(Number(idCity))) {
        throw new Error('id_city deve ser numérico');
    }

    return {
        id: Number(id),
        id_city: Number(idCity),
    };
}

router.post('/', login, async (req, res) => {
    console.log('executou exclui poste aprovado (async/await)');

    let conn;

    try {
        const dados = validarDadosEntrada(req.body);
        conn = await obterConexao();

        const query = `
            DELETE FROM tstmeta.postes_aprovados_parana
            WHERE ID = ? AND id_city = ?
        `;

        const resultado = await executarQuery(conn, query, [
            dados.id,
            dados.id_city,
        ]);

        if (!resultado.affectedRows) {
            return res.status(404).send({
                success: false,
                message: 'Poste aprovado não encontrado',
            });
        }

        console.log(`Poste aprovado excluído: ID ${dados.id}, id_city ${dados.id_city}`);

        return res.status(200).send({
            success: true,
            id: dados.id,
            id_city: dados.id_city,
            message: 'Poste aprovado excluído com sucesso',
            affectedRows: resultado.affectedRows,
        });
    } catch (error) {
        console.error('Erro ao excluir poste aprovado:', error);

        if (error.message && (
            error.message.includes('Campo obrigatório') ||
            error.message.includes('deve ser numérico')
        )) {
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).send({
            success: false,
            error: error.message || error,
        });
    } finally {
        if (conn) {
            conn.release();
        }
    }
});

module.exports = router;
