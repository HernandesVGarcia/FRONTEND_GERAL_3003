const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const {
  requireScope,
  resolveAllowedCityId,
} = require('../middleware/auth-integration');

function normalizarIdIntegracao(valor) {
  if (valor === undefined || valor === null) {
    return '0';
  }
  const texto = String(valor).trim();
  return texto === '' ? '0' : texto;
}

function converterParaMapWinGIS(LATI, LONGI) {
  if (!LATI || LATI.length === 0) {
    return null;
  }

  const prefixoMapWinGIS = '1;';
  const geometria = `${LONGI}|${LATI}`;
  return `${prefixoMapWinGIS}${geometria}|`;
}

function executarQuery(conn, query, params) {
  return new Promise((resolve, reject) => {
    conn.query(query, params, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });
}

function obterConexao() {
  return new Promise((resolve, reject) => {
    mysql.getConnection((error, connection) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(connection);
    });
  });
}

function beginTransaction(conn) {
  return new Promise((resolve, reject) => {
    conn.beginTransaction((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function commit(conn) {
  return new Promise((resolve, reject) => {
    conn.commit((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function rollback(conn) {
  return new Promise((resolve) => {
    conn.rollback(() => resolve());
  });
}

function temCoordenadasValidas(LAT, LNG) {
  return LAT && LNG && LAT !== '' && LNG !== ''
    && LAT !== '0.0000000000000' && LNG !== '0.0000000000000';
}

function parseBody(req, cityId) {
  const {
    CONTRATO_GPON,
    id_contrato,
    id_autenticacao,
    CNPJ,
    SIGLA,
    ENDEREÇO,
    NUMERO,
    COMPLEMENTO,
    BAIRRO,
    CEP,
    TELEFONE,
    id_condominio,
    OBS,
    LAT,
    LNG,
    TAMANHO,
    STATUS,
    POP_ESTACAO,
    ID_PROJETISTA,
  } = req.body;

  return {
    CONTRATO_GPON,
    idContrato: normalizarIdIntegracao(id_contrato),
    idAutenticacao: normalizarIdIntegracao(id_autenticacao),
    CNPJ,
    SIGLA,
    ENDEREÇO,
    NUMERO,
    COMPLEMENTO,
    BAIRRO,
    CEP,
    TELEFONE,
    id_city: cityId,
    id_condominio: id_condominio ?? 0,
    OBS,
    LAT,
    LNG,
    TAMANHO,
    STATUS,
    POP_ESTACAO,
    ID_PROJETISTA,
    temCoordenadas: temCoordenadasValidas(LAT, LNG),
  };
}

async function handleInsertCliente(req, res) {
  if (!req.body.city_id && req.body.id_city != null) {
    req.body.city_id = req.body.id_city;
  }

  const cityId = resolveAllowedCityId(req, res);
  if (cityId == null) {
    return;
  }

  const dados = parseBody(req, cityId);
  const GPON = 1;
  const tipoObjeto = 'pop';
  const CONVENCIONAL = 0;

  let conn;

  try {
    conn = await obterConexao();

    const queryEST = `INSERT INTO tst.estações
      (ID_META, CONTRATO_GPON, id_contrato, id_autenticacao, CNPJ, SIGLA, ENDEREÇO, NUMERO, COMPLEMENTO, BAIRRO, CEP, TELEFONE, M, OBS, POP_ESTACAO, GPON)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    if (!dados.temCoordenadas) {
      const resultadoEST = await executarQuery(conn, queryEST, [
        '',
        dados.CONTRATO_GPON,
        dados.idContrato,
        dados.idAutenticacao,
        dados.CNPJ,
        dados.SIGLA,
        dados.ENDEREÇO,
        dados.NUMERO,
        dados.COMPLEMENTO,
        dados.BAIRRO,
        dados.CEP,
        dados.TELEFONE,
        dados.id_city,
        dados.OBS,
        dados.POP_ESTACAO,
        GPON,
      ]);

      return res.status(200).send({
        data: {
          message: 'Cliente inserido com sucesso (sem coordenadas)',
          id_estacao: resultadoEST.insertId,
        },
        meta: {
          city_id: cityId,
          client_id: req.integration.clientId,
        },
      });
    }

    await beginTransaction(conn);

    try {
      const queryID = 'INSERT INTO tstmeta.ids (Tipo_objeto, id_city, id_condominio) VALUES (?, ?, ?)';
      const resultadoID = await executarQuery(conn, queryID, [
        tipoObjeto,
        dados.id_city,
        dados.id_condominio,
      ]);
      const idMeta = resultadoID.insertId;
      const geometriaMapWinGIS = converterParaMapWinGIS(dados.LAT, dados.LNG);

      const resultadoEST = await executarQuery(conn, queryEST, [
        idMeta,
        dados.CONTRATO_GPON,
        dados.idContrato,
        dados.idAutenticacao,
        dados.CNPJ,
        dados.SIGLA,
        dados.ENDEREÇO,
        dados.NUMERO,
        dados.COMPLEMENTO,
        dados.BAIRRO,
        dados.CEP,
        dados.TELEFONE,
        dados.id_city,
        dados.OBS,
        dados.POP_ESTACAO,
        GPON,
      ]);
      const idEstacao = resultadoEST.insertId;

      const queryPOP = `INSERT INTO tstmeta.pop
        (sigla, id_visio, id_meta, id_city, id_condominio, Layer_PON, Layer_CONV, LAT, LNG, TAMANHO, STATUS, id_estacao, GEOMETRIA_LAT_LONG, projetista, data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`;

      await executarQuery(conn, queryPOP, [
        dados.SIGLA,
        idMeta,
        idMeta,
        dados.id_city,
        dados.id_condominio,
        GPON,
        CONVENCIONAL,
        dados.LAT,
        dados.LNG,
        dados.TAMANHO,
        dados.STATUS,
        idEstacao,
        geometriaMapWinGIS,
        dados.ID_PROJETISTA,
      ]);

      await commit(conn);

      return res.status(200).send({
        data: {
          message: 'Cliente inserido com sucesso',
          id_meta: idMeta,
          id_estacao: idEstacao,
        },
        meta: {
          city_id: cityId,
          client_id: req.integration.clientId,
        },
      });
    } catch (txError) {
      await rollback(conn);
      throw txError;
    }
  } catch (error) {
    console.error('Erro na rota insert-cliente (integração):', error);
    return res.status(500).send({
      error: {
        code: 'DB_QUERY',
        message: error.message || 'Erro ao inserir cliente.',
      },
    });
  } finally {
    if (conn) {
      conn.release();
    }
  }
}

router.post('/', requireScope('cliente_insert:write'), handleInsertCliente);

module.exports = router;
