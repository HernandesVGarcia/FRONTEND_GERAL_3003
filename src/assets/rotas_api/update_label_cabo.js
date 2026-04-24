const util = require('util');
const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

router.post('/', login, async (req, res) => {
    console.log('🗺️ Atualizando label do cabo...');

    const { id_meta, Label_cabo } = req.body;

    if (!id_meta) {
        return res.status(400).send({
            error: 'id_meta é obrigatório',
            message: 'Informe o id_meta do cabo a ser atualizado',
        });
    }

    console.log('📊 Dados para atualização:', { id_meta, Label_cabo });

    const getConnectionAsync = util.promisify(mysql.getConnection).bind(mysql);
    let conn;

    try {
        conn = await getConnectionAsync();
        const queryAsync = (sql, params) =>
            new Promise((resolve, reject) => {
                conn.query(sql, params, (err, rows) =>
                    err ? reject(err) : resolve(rows),
                );
            });
        const beginTransactionAsync = util.promisify(conn.beginTransaction).bind(
            conn,
        );
        const commitAsync = util.promisify(conn.commit).bind(conn);
        const rollbackAsync = util.promisify(conn.rollback).bind(conn);

        await beginTransactionAsync();

        // atualizar label na tabela cabopa =============================================================

        const queryCabopa = `UPDATE tstmeta.cabopa
            SET Label_cabo = ?
            WHERE id_meta = ?`;

        const resultadoCabopa = await queryAsync(queryCabopa, [
            Label_cabo,
            id_meta,
        ]);

        if (resultadoCabopa.affectedRows === 0) {
            await rollbackAsync();
            console.warn('⚠️ Nenhum cabo encontrado com id_meta:', id_meta);
            return res.status(404).send({
                error: 'Cabo não encontrado',
                message: `Nenhum cabo encontrado com id_meta ${id_meta}`,
            });
        }

        // atualizar label na tabela cabopb

        const queryCabopb = `UPDATE tstmeta.cabopb
            SET Label_cabo = ?
            WHERE id_meta = ?`;

        const resultadoCabopb = await queryAsync(queryCabopb, [
            Label_cabo,
            id_meta,
        ]);

        if (resultadoCabopb.affectedRows === 0) {
            await rollbackAsync();
            console.warn('⚠️ Nenhum cabo encontrado com id_meta:', id_meta);
            return res.status(404).send({
                error: 'Cabopb não encontrado',
                message: `Nenhum cabo encontrado com id_meta ${id_meta}`,
            });
        }



        await commitAsync();

        console.log(`✅ Cabo ${id_meta} atualizado com sucesso!`);
        console.log(`   - Registros atualizados: ${resultadoCabopa.affectedRows}`);

        return res.status(200).send({
            success: true,
            id_meta: id_meta,
            message: `Cabo id_meta ${id_meta} editado com sucesso`,
            affectedRows: resultadoCabopb.affectedRows,
        });
    } catch (error) {
        if (conn) {
            try {
                await util.promisify(conn.rollback).bind(conn)();
            } catch (rbErr) {
                console.error('Erro no rollback:', rbErr);
            }
        }
        console.error('❌ Erro ao atualizar label cabo:', error);
        return res.status(500).send({
            error: error.message || error,
            message: 'Erro ao atualizar label cabo',
        });
    } finally {
        if (conn) {
            conn.release();
        }
    }
});

module.exports = router;
