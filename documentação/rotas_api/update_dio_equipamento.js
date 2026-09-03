const util = require('util');
const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');




router.post('/', login, async (req, res, next) => {
    console.log('executou update dio equipamento');

    const {
        grupo,
        campo1,
        campo2,
        campo3,
        campo4,
        campo5,
        campo6,
        campo7,
        campo8,
        campo9,
        campo10,
        campo11,
        campo12,
        n1,
        n2,
        n3,
        n4,
        n5,
        n6,
        n7,
        n8,
        n9,
        n10,
        n11,
        n12,
        id_meta_dio
    } = req.body;

    if (!id_meta_dio) {
        console.log('ERRO: id_meta_dio é obrigatório');
        return res.status(400).send({ error: 'Campo obrigatório: id_meta_dio' });
    }
    

    
    const getConnectionAsync = util.promisify(mysql.getConnection).bind(mysql);
    let conn;

    try {
        conn = await getConnectionAsync();
        const queryAsync = (sql, params) => new Promise((resolve, reject) => {
            conn.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
        });
        const beginTransactionAsync = util.promisify(conn.beginTransaction).bind(conn);
        const commitAsync = util.promisify(conn.commit).bind(conn);
        const rollbackAsync = util.promisify(conn.rollback).bind(conn);
        

        const f1 = (grupo - 1) * 12 + 1;
        const f2 = (grupo - 1) * 12 + 2;
        const f3 = (grupo - 1) * 12 + 3;
        const f4 = (grupo - 1) * 12 + 4;
        const f5 = (grupo - 1) * 12 + 5;
        const f6 = (grupo - 1) * 12 + 6;
        const f7 = (grupo - 1) * 12 + 7;
        const f8 = (grupo - 1) * 12 + 8;
        const f9 = (grupo - 1) * 12 + 9;
        const f10 = (grupo - 1) * 12 + 10;
        const f11 = (grupo - 1) * 12 + 11;
        const f12 = (grupo - 1) * 12 + 12;


        let tabela='dio_t'+ grupo;
       
        

        // Transação: UPDATE em todos os pares do tubo
        
        await beginTransactionAsync();

        try {
            
                const query_Grupo = `UPDATE tstmeta.${tabela} SET obs${f1}= ?, obs${f2}= ?, obs${f3}= ?, obs${f4}= ?,
                obs${f5}= ?, obs${f6}= ?, obs${f7}= ?, obs${f8}= ?, obs${f9}= ?, obs${f10}= ?, obs${f11}= ?, obs${f12}= ?,
                N${f1}= ?, N${f2}= ?, N${f3}= ?, N${f4}= ?, N${f5}= ?, N${f6}= ?, N${f7}= ?, N${f8}= ?, N${f9}= ?, N${f10}= ?, N${f11}= ?, N${f12}= ? WHERE IDMETA = ?`;
                const resultado_Grupo = await queryAsync(
                    query_Grupo,
                    [campo1, campo2, campo3, campo4, campo5, campo6, campo7, campo8, campo9, campo10, campo11,
                     campo12, n1, n2, n3, n4, n5, n6, n7, n8, n9, n10, n11, n12, id_meta_dio]);
                if (resultado_Grupo.affectedRows === 0) {
                    await rollbackAsync();
                    console.log('Nenhum registro encontrado na origem com o id_meta:', id_meta_caixa);
                    return res.status(404).send({ message: 'Nenhum DIO encontrada com o ID fornecido' });
                }
                              
            

            await commitAsync();
            console.log(`Equipamento e nivel atualizados com sucesso. `);
            return res.status(200).send({
                message: `Equipamento e nivel atualizados`,
                affectedRows: resultado_Grupo.affectedRows,
                tabela: tabela
            });
        } catch (err) {
            await rollbackAsync();
            throw err;
        }
    } catch (error) {
        console.error('Erro atualiza equipamentos dio:', error);
        if (res.headersSent) return;
        return res.status(500).send({
            error: error.message || 'Erro ao processar update DIO equipamentos',
            details: error.message
        });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
