const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

function isPostesIndefinido(valor) {
    const texto = String(valor ?? '').trim();
    return texto === '' || texto.toLowerCase() === 'indefinido';
}

function parsePostesLista(raw) {
    const texto = String(raw ?? '').trim();
    if (isPostesIndefinido(texto)) {
        return [];
    }

    const tabelas = [];
    const visto = new Set();

    texto.split(',').forEach((parte) => {
        const nome = parte.trim();
        if (!nome || isPostesIndefinido(nome) || visto.has(nome)) {
            return;
        }
        visto.add(nome);
        tabelas.push(nome);
    });

    return tabelas;
}

function enriquecerCidadePostes(cidade) {
    const postesRaw = cidade.POSTES;
    const postesLista = parsePostesLista(postesRaw);

    return {
        ...cidade,
        POSTES: isPostesIndefinido(postesRaw) ? 'Indefinido' : String(postesRaw).trim(),
        POSTES_LISTA: postesLista,
    };
}

//******************consulta cidades *************/
router.post('/', login, (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            console.error('Erro ao obter conexão:', error);
            return res.status(500).send({ error: error });
        }

        try {
            if (!req.body.POLO) {
                conn.release();
                return res.status(400).send({
                    message: 'O parâmetro POLO é obrigatório e não pode ser vazio'
                });
            }

            const perfilField = `perfil${req.body.POLO}`;

            console.log(`Consultando cidades para o polo: ${req.body.POLO}, campo: ${perfilField}`);

            const query = `SELECT IDCIDADES, CIDADE,
                COALESCE(NULLIF(TRIM(POSTES), ''), 'Indefinido') AS POSTES
                FROM TST.cidades WHERE ${perfilField} = 1`;

            conn.query(query, (error, resultado, fields) => {
                conn.release();

                if (error) {
                    console.error('Erro na consulta:', error);
                    return res.status(500).send({ error: error });
                }

                if (resultado.length === 0) {
                    return res.status(404).send({
                        message: 'Nenhuma cidade encontrada para este polo'
                    });
                }

                const response = resultado.map(enriquecerCidadePostes);
                return res.status(200).send({ response });
            });
        } catch (error) {
            conn.release();
            console.error('Erro na execução:', error);
            return res.status(500).send({ error: error });
        }
    });
});

module.exports = router;
