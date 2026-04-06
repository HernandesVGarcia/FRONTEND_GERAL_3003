/**
 * Rota: POST /analisa_conexao_nivel
 *
 * Para registrar na API (app.js ou index.js):
 *   const analisaConexaoNivel = require('./routes/analisa_conexao_nivel');
 *   app.use('/analisa_conexao_nivel', analisaConexaoNivel);
 *
 * Port do VB6 ANALISA_TABELA_INI_CAIXA — ver assets/VB6/analisa_conexao_nivel.vb
 * Ajuste: require('../mysql').pool e require('../middleware/login') no servidor.
 *
 * Body: { regist, tabela, idmeta [, metragem, atenuacao, nivels ] }
 */
const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const login = require('../middleware/login');

//const DB = 'tstmeta';

function vbInStr(start, str, sub) {
    if (!str || !sub) return 0;
    const i = String(str).indexOf(sub, Math.max(0, start - 1));
    return i === -1 ? 0 : i + 1;
}

function vbMid(str, start, length) {
    if (str == null || str === '') return '';
    const s = String(str);
    const a = start - 1;
    if (length == null || length === undefined) return s.slice(a);
    return s.slice(a, a + length);
}

function executarQuery(conn, query, params) {
    return new Promise((resolve, reject) => {
        conn.query(query, params || [], (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
}

function assertIdentTable(name) {
    const n = String(name || '').toLowerCase();
    if (!/^(caboa|cabob)_t([1-9]|1[0-2])$/.test(n)
        && !/^dio_t([1-9]|1[0-2])$/.test(n)
        && !['splitter_e', 'ids', 'cabopa', 'cabopb', 'dio', 'cxboca'].includes(n)
        && !/^cxboca(\d+|97|98)_t([1-9]|1[0-2])$/.test(n)) {
        throw new Error(`Tabela não permitida: ${name}`);
    }
    return n;
}

function assertFieldName(reg) {
    const s = String(reg || '');
    if (!/^[A-Za-z0-9_]+$/.test(s)) {
        throw new Error('regist/campo inválido');
    }
    return s;
}

function tuboFromFibra(fibraNum) {
    const f = Number(fibraNum);
    if (f <= 12) return 1;
    if (f <= 24) return 2;
    if (f <= 36) return 3;
    if (f <= 48) return 4;
    if (f <= 60) return 5;
    if (f <= 72) return 6;
    if (f <= 84) return 7;
    if (f <= 96) return 8;
    if (f <= 108) return 9;
    if (f <= 120) return 10;
    if (f <= 132) return 11;
    return 12;
}

function dioTabFromFiber(F) {
    const f = Number(F);
    if (f <= 12) return 'dio_t1';
    if (f <= 24) return 'dio_t2';
    if (f <= 36) return 'dio_t3';
    if (f <= 48) return 'dio_t4';
    if (f <= 60) return 'dio_t5';
    if (f <= 72) return 'dio_t6';
    if (f <= 84) return 'dio_t7';
    if (f <= 96) return 'dio_t8';
    if (f <= 108) return 'dio_t9';
    if (f <= 120) return 'dio_t10';
    if (f <= 132) return 'dio_t11';
    return 'dio_t12';
}

/** No fim da análise: atenuacao + (metragem/1000)*0.23 (metragem em m, perda tipo dB/km). */
function atenuacaoComPerdaPorMetragem(metragem, atenuacao) {
    return (Number(atenuacao) || 0) + ((Number(metragem) || 0) / 1000) * 0.23;
}

function calcularDbSplitter(capacidade, tipoSplitter, fibraSaida) {
    let dB = 0;
    const cap = Number(capacidade);
    const tipo = Number(tipoSplitter);
    const ft = String(fibraSaida || '');

    if (cap === 2 && tipo === 12) dB = 3.7;
    else if (cap === 4 && tipo === 13) dB = 7.1;
    else if (cap === 8 && tipo === 14) dB = 10.5;
    else if (cap === 16 && tipo === 15) dB = 13.7;
    else if (cap === 32 && tipo === 16) dB = 17.1;
    else if (cap === 64 && tipo === 17) dB = 20.5;
    else if (cap === 128 && tipo === 18) dB = 23;
    else if (cap === 256 && tipo === 19) dB = 26;

    if (tipo === 1 && ft === '_1') dB = 20.5;
    if (tipo === 1 && ft === '_2') dB = 0.16;
    if (tipo === 2 && ft === '_1') dB = 18;
    if (tipo === 2 && ft === '_2') dB = 0.16;
    if (tipo === 3 && ft === '_1') dB = 13.7;
    if (tipo === 3 && ft === '_2') dB = 0.36;
    if (tipo === 4 && ft === '_1') dB = 10.5;
    if (tipo === 4 && ft === '_2') dB = 0.55;
    if (tipo === 5 && ft === '_1') dB = 8.07;
    if (tipo === 5 && ft === '_2') dB = 0.85;
    if (tipo === 6 && ft === '_1') dB = 7.3;
    if (tipo === 6 && ft === '_2') dB = 1.04;
    if (tipo === 7 && ft === '_1') dB = 6.4;
    if (tipo === 7 && ft === '_2') dB = 1.4;
    if (tipo === 8 && ft === '_1') dB = 5.3;
    if (tipo === 8 && ft === '_2') dB = 1.2;
    if (tipo === 9 && ft === '_1') dB = 4.8;
    if (tipo === 9 && ft === '_2') dB = 2.05;
    if (tipo === 10 && ft === '_1') dB = 4.3;
    if (tipo === 10 && ft === '_2') dB = 2.4;
    if (tipo === 11 && ft === '_1') dB = 3.7;
    if (tipo === 11 && ft === '_2') dB = 2.8;

    return dB;
}

/**
 * Um passo do Do While do VB até o label FIM (re-atribui TABELA/idmeta/regist no chamador).
 */
async function vbUmaVoltaDoLoop(conn, s) {
    let {
        regist, TABELA, idmeta, metragem, atenuacao, nivels,
    } = s;

    let fiber = s.fiber;
    let tabel = '';
    let IDmet = idmeta;
    let reg = regist;
    let DESTINO_TAB = '';
    let tabelinha = TABELA === 'SPLITTER_E' ? 'splitter_e' : TABELA;
    let tabelacabo = '';
    let dB = 0;
    let tubo = 1;
    let fibra = '';
    let POS_1; let POS_2; let DIGITOS; let i; let NOMECABO;
    let POS1; let POS2; let TAM;
    let DIO_TAB = '';
    let Cabo = '';
    let POS = 0;

    const out = (o) => ({ ...o, destinoTab: DESTINO_TAB });

    const rTipo0 = await executarQuery(
        conn,
        `SELECT TIPO_OBJETO FROM tstmeta.ids WHERE id_meta = ? LIMIT 1`,
        [idmeta],
    );
    const tipoObj = rTipo0 && rTipo0[0] ? String(rTipo0[0].TIPO_OBJETO || '') : '';
    if (vbInStr(1, tipoObj, 'splitter') > 0 && vbInStr(1, TABELA, 'cxboca') > 0) {
        const rCx = await executarQuery(
            conn,
            `SELECT id_meta_caixa FROM tstmeta.splitter_e WHERE idmeta = ? LIMIT 1`,
            [idmeta],
        );
        if (rCx && rCx[0] && rCx[0].id_meta_caixa != null) idmeta = rCx[0].id_meta_caixa;
    }

    tabelinha = TABELA === 'SPLITTER_E' ? 'splitter_e' : TABELA;
    assertIdentTable(tabelinha);
    const colReg = assertFieldName(regist);

    const rs = await executarQuery(
        conn,
        `SELECT \`${colReg}\` AS registro FROM tstmeta.\`${tabelinha}\` WHERE idmeta = ? LIMIT 1`,
        [idmeta],
    );
    const registroVal = rs && rs[0] ? rs[0].registro : '';

    if (registroVal === '' || registroVal == null) {
        return out({
            status: 'fim',
            proximo: null,
            metragem,
            atenuacao,
            nivels,
            fiber: 0,
            motivo: 'cabo_aberto',
        });
    }

    tabel = String(registroVal);

    if (tabel === '=id()') {
        return out({ status: 'fim', proximo: null, metragem, atenuacao, nivels, fiber, motivo: 'caixa_parada' });
    }

    const tU = tabel.toUpperCase();

    if (vbInStr(1, tabel, 'cabo') > 0 || vbInStr(1, tU, 'CABO') > 0) DESTINO_TAB = 'cabo';
    if (vbInStr(1, tabel, 'ROW_5') * vbInStr(1, tabel, 'TST') !== 0) DESTINO_TAB = 'POP';
    if (vbInStr(1, tabel, 'ROW_5') * vbInStr(1, tabel, 'DIO') !== 0) DESTINO_TAB = 'DIO';
    if (vbInStr(1, tabel, 'ROW_5') * vbInStr(1, tabel, 'RBX') !== 0) DESTINO_TAB = 'RABICHO';
    if (vbInStr(1, tabel, 'ROW_5') * vbInStr(1, tabel, 'CDO') !== 0) DESTINO_TAB = 'CONDOMINIO';
    if (vbInStr(1, tabel, 'splitter') > 0) DESTINO_TAB = 'SPLITTER_SAIDA';
    if (vbInStr(1, tabel, 'splitter_E') > 0 || vbInStr(1, tabel, 'splitter_e') > 0) DESTINO_TAB = 'SPLITTER_ENTRADA';

    for (let b = 1; b <= 18; b++) {
        const tag = `BOCA${b}`;
        if (vbInStr(1, tabel, tag) > 0 || vbInStr(1, tU, tag) > 0) {
            DESTINO_TAB = `cxboca${b}`;
            break;
        }
    }
    if (vbInStr(1, tabel, 'BOCA97') > 0 || vbInStr(1, tU, 'BOCA97') > 0) DESTINO_TAB = 'cxboca97';
    if (vbInStr(1, tabel, 'BOCA98') > 0 || vbInStr(1, tU, 'BOCA98') > 0) DESTINO_TAB = 'cxboca98';
    if (vbInStr(1, tabel, 'dioc') > 0) DESTINO_TAB = 'DIOcabo';

    POS_2 = 0;

    //**************************/
    //**     destino = CABO  **/
    //**************************/
    if (DESTINO_TAB === 'cabo') {
        if (vbInStr(1, tabel, 'B!') > 0) {
            DESTINO_TAB = 'cabob';
            tabelacabo = 'cabopb';
        }
        if (vbInStr(1, tabel, 'A!') > 0) {
            DESTINO_TAB = 'caboa';
            tabelacabo = 'cabopa';
        }

        POS_1 = vbInStr(1, tabel, '_');
        if (vbInStr(1, tabel, '.L') > 0) POS_2 = vbInStr(1, tabel, '.L');
        if (vbInStr(1, tabel, '.V') > 0) POS_2 = vbInStr(1, tabel, '.V');
        if (POS_2 === 0) POS_2 = tabel.length + 1;
        DIGITOS = POS_2 - POS_1;
        fibra = vbMid(tabel, POS_1 + 1, DIGITOS - 1);
        tubo = tuboFromFibra(fibra);
        DESTINO_TAB = `${DESTINO_TAB}_t${tubo}`;
        assertIdentTable(DESTINO_TAB);

        reg = `FIBRA_${fibra}`;
        if (vbInStr(1, tabel, 'Label') > 0) reg += 'Label';

        i = vbInStr(1, tabel, '=') > 0 ? 2 : 1;
        POS_1 = vbInStr(i, tabel, '!');
        NOMECABO = vbMid(tabel, i, POS_1 - i);

        assertIdentTable(tabelacabo);
        const rCab = await executarQuery(
            conn,
            `SELECT id_meta AS m FROM tstmeta.\`${tabelacabo}\` WHERE id_visio = ? LIMIT 1`,
            [NOMECABO],
        );
        IDmet = rCab && rCab[0] ? rCab[0].m : idmeta;

        const rLen = await executarQuery(
            conn,
            `SELECT \`length\` AS len FROM tstmeta.cabopa WHERE id_meta = ? LIMIT 1`,
            [IDmet],
        );
        const lenVal = rLen && rLen[0] ? Number(rLen[0].len || 0) : 0;
        if (tabelacabo === 'cabopa') metragem += lenVal;

        return out({
            status: '',
            proximo: { TABELA: DESTINO_TAB, idmeta: IDmet, regist: reg },
            metragem,
            atenuacao,
            nivels,
            fiber: 0,
        });
    }
    //**************************/
    //**     destino = CAIXA  **/
    //**************************/
    if (vbInStr(1, DESTINO_TAB, 'cxboca') > 0) {
        POS_1 = vbInStr(1, tabel, '_');
        if (vbInStr(1, tabel, '.V') > 0) POS_2 = vbInStr(1, tabel, '.V');
        if (vbInStr(1, tabel, '.l') > 0) POS_2 = vbInStr(1, tabel, '.l');
        if (POS_2 === 0) POS_2 = tabel.length + 1;
        DIGITOS = POS_2 - POS_1;
        fibra = vbMid(tabel, POS_1 + 1, DIGITOS - 1);
        tubo = tuboFromFibra(fibra);
        DESTINO_TAB = `${DESTINO_TAB}_t${tubo}`;
        assertIdentTable(DESTINO_TAB);

        reg = `F${fibra}`;
        if (vbInStr(1, tabel, 'Label') > 0 || vbInStr(1, tabel, 'label') > 0) reg += 'L';

        i = vbInStr(1, tabel, '=') > 0 ? 5 : 4;
        if (vbInStr(i, tabel, '!') > 0) {
            POS_1 = vbInStr(i, tabel, '!');
            NOMECABO = vbMid(tabel, i, POS_1 - i);
            IDmet = NOMECABO;
        }

        return out({
            status: '',
            proximo: { TABELA: DESTINO_TAB, idmeta: IDmet, regist: reg },
            metragem,
            atenuacao,
            nivels,
            fiber: 0,
        });
    }

    //**************************/
    //**     destino = POP  **/
    //**************************/

    if (vbInStr(1, DESTINO_TAB, 'POP') > 0) {
        i = vbInStr(1, tabel, '=') > 0 ? 5 : 4;
        if (vbInStr(i, tabel, '!') > 0) {
            POS_1 = vbInStr(i, tabel, '!');
            IDmet = vbMid(tabel, i, POS_1 - i);
        }
        POS_1 = vbInStr(1, regist, '_');
        if (vbInStr(1, regist, 'Label') > 0) POS_2 = vbInStr(1, regist, 'Label');
        DIGITOS = POS_2 - POS_1;
        fiber = vbMid(regist, POS_1 + 1, DIGITOS - 1);
        return out({
            status: 'fim',
            proximo: null,
            metragem,
            atenuacao,
            nivels,
            fiber,
            motivo: 'POP',
        });
    }

    //******************************/
    //**     destino = CONDOMINIO **/
    //******************************/

    if (vbInStr(1, DESTINO_TAB, 'CONDOMINIO') > 0) {
        i = vbInStr(1, tabel, '=') > 0 ? 5 : 4;
        if (vbInStr(i, tabel, '!') > 0) {
            POS_1 = vbInStr(i, tabel, '!');
            IDmet = vbMid(tabel, i, POS_1 - i);
        }
        POS_1 = vbInStr(1, regist, '_');
        if (vbInStr(1, regist, 'Label') > 0) POS_2 = vbInStr(1, regist, 'Label');
        DIGITOS = POS_2 - POS_1;
        fiber = vbMid(regist, POS_1 + 1, DIGITOS - 1);
        return out({
            status: 'fim',
            proximo: null,
            metragem,
            atenuacao,
            nivels,
            fiber,
            motivo: 'CONDOMINIO',
        });
    }

    //****************************/
    //**     destino = RABICHO  **/
    //****************************/

    if (vbInStr(1, DESTINO_TAB, 'RABICHO') > 0) {
        i = vbInStr(1, tabel, '=') > 0 ? 5 : 4;
        if (vbInStr(i, tabel, '!') > 0) {
            POS_1 = vbInStr(i, tabel, '!');
            IDmet = vbMid(tabel, i, POS_1 - i);
        }
        POS_1 = vbInStr(1, regist, '_');
        if (vbInStr(1, regist, 'Label') > 0) POS_2 = vbInStr(1, regist, 'Label');
        DIGITOS = POS_2 - POS_1;
        fiber = vbMid(regist, POS_1 + 1, DIGITOS - 1);
        return out({
            status: 'fim',
            proximo: null,
            metragem,
            atenuacao,
            nivels,
            fiber,
            motivo: 'RABICHO',
        });
    }

    //*************************************/
    //**  VB SPLITTER_SAIDA: só se DESTINO_TAB é SPLITTER_ENTRADA (InStr = 1)  **/
    //**  Caso contrário salta para o label SPLITTER_ENTRADA abaixo (como GoTo).  **/
    //************************************/

    if (vbInStr(1, DESTINO_TAB, 'SPLITTER_ENTRADA') === 1) {
        const rIds = await executarQuery(
            conn,
            `SELECT TIPO_OBJETO FROM tstmeta.ids WHERE id_meta = ? LIMIT 1`,
            [idmeta],
        );
        const tipoO = rIds && rIds[0] ? String(rIds[0].TIPO_OBJETO || '') : '';
        if (tipoO === 'CAIXA') {
            POS1 = 16;
            POS2 = vbInStr(1, tabel, '.l');
            TAM = POS2 - POS1;
            IDmet = vbMid(tabel, 16, TAM);
            return out({
                status: 'fim',
                proximo: null,
                metragem,
                atenuacao,
                nivels,
                fiber,
                motivo: 'splitter_saida_caixa',
            });
        }
        const rSe = await executarQuery(
            conn,
            `SELECT entrada , id_meta_caixa FROM tstmeta.splitter_e WHERE idmeta = ? LIMIT 1`,
            [idmeta],
        );
        if (!rSe || !rSe[0]) {
            return out({ status: 'fim', proximo: null, metragem, atenuacao, nivels, fiber, motivo: 'splitter_saida_sem_row' });
        }
        IDmet = rSe[0].id_meta_caixa;
        const ent = rSe[0].entrada;
        if (!ent) {
            return out({ status: 'fim', proximo: null, metragem, atenuacao, nivels, fiber, motivo: 'splitter_saida_entrada_vazia' });
        }
        tabel = String(ent);
        return out({
            status: '',
            proximo: { TABELA: 'cxboca', idmeta: IDmet, regist },
            metragem,
            atenuacao,
            nivels,
            fiber,
        });
    }

    //*************************************/
    //**  VB SPLITTER_ENTRADA: só se DESTINO_TAB é SPLITTER_SAIDA (InStr = 1)  **/
    //**  Caso contrário GoTo DIO no VB — segue para DIOc/DIO abaixo.            **/
    //************************************/

    if (vbInStr(1, DESTINO_TAB, 'SPLITTER_SAIDA') === 1) {
        const rIds2 = await executarQuery(
            conn,
            `SELECT TIPO_OBJETO FROM tstmeta.ids WHERE id_meta = ? LIMIT 1`,
            [idmeta],
        );
        const tipoO2 = rIds2 && rIds2[0] ? String(rIds2[0].TIPO_OBJETO || '') : '';
        if (tipoO2 === 'CAIXA') {
            POS1 = 14;
            POS2 = vbInStr(1, tabel, '_');
            TAM = POS2 - POS1;
            IDmet = vbMid(tabel, 14, TAM);
            POS1 = vbInStr(1, tabel, '_');
            POS2 = vbInStr(1, tabel, '.l');
            TAM = POS2 - POS1;
            fibra = vbMid(tabel, POS1, TAM);

            const rSp = await executarQuery(
                conn,
                `SELECT capacidade, tipo_splitter FROM tstmeta.splitter_e WHERE idmeta = ? LIMIT 1`,
                [IDmet],
            );
            if (rSp && rSp[0]) {
                dB = calcularDbSplitter(rSp[0].capacidade, rSp[0].tipo_splitter, fibra);
                atenuacao += dB;
            }
            return out({
                status: '',
                proximo: { TABELA: 'SPLITTER_E', idmeta: IDmet, regist: 'ENTRADA' },
                metragem,
                atenuacao,
                nivels,
                fiber,
            });
        }
        const rSe2 = await executarQuery(
            conn,
            `SELECT entrada , id_meta_caixa FROM tstmeta.splitter_e WHERE idmeta = ? LIMIT 1`,
            [idmeta],
        );
        if (rSe2 && rSe2[0] && rSe2[0].entrada) {
            IDmet = rSe2[0].id_meta_caixa;
            tabel = String(rSe2[0].entrada);
            return out({
                status: '',
                proximo: { TABELA: 'cxboca', idmeta: IDmet, regist },
                metragem,
                atenuacao,
                nivels,
                fiber,
            });
        }
    }

    //********************************/
    //**     destino = BANDEJA DIO  **/
    //********************************/

    if (vbInStr(1, DESTINO_TAB, 'DIOc') !== 0) {
        TAM = String(regist).length;
        fiber = vbMid(regist, 2, TAM - 1);
        let colC = '';
        if (vbInStr(1, tabel, 'c1') > 0) colC = 'c1';
        if (vbInStr(1, tabel, 'c2') > 0) colC = 'c2';
        if (vbInStr(1, tabel, 'c3') > 0) colC = 'c3';
        if (vbInStr(1, tabel, 'c4') > 0) colC = 'c4';
        if (vbInStr(1, tabel, 'c5') > 0) colC = 'c5';
        if (vbInStr(1, tabel, 'c6') > 0) colC = 'c6';
        if (!colC) {
            return out({ status: 'fim', proximo: null, metragem, atenuacao, nivels, fiber, motivo: 'DIOc_sem_coluna_c' });
        }
        const rDio = await executarQuery(
            conn,
            `SELECT \`${colC}\` AS cabo FROM tstmeta.dio WHERE id_meta = ? LIMIT 1`,
            [idmeta],
        );
        const caboVal = rDio && rDio[0] ? String(rDio[0].cabo || '') : '';
        if (caboVal === 'ZERO' || caboVal === '') {
            return out({
                status: 'fim',
                proximo: null,
                metragem,
                atenuacao,
                nivels,
                fiber,
                motivo: 'DIOc_ZERO',
            });
        }
        Cabo = caboVal;
        const fnCol = `FN${fiber}`;
        assertIdentTable(TABELA);
        const rFn = await executarQuery(
            conn,
            `SELECT \`${fnCol}\` AS fb FROM tstmeta.\`${TABELA}\` WHERE idmeta = ? LIMIT 1`,
            [idmeta],
        );
        fibra = rFn && rFn[0] ? rFn[0].fb : fibra;
        tubo = tuboFromFibra(fibra);
        if (vbInStr(1, Cabo, 'A') > 0) {
            tabel = `caboa_t${tubo}`;
            POS = vbInStr(1, Cabo, 'A');
        }
        if (vbInStr(1, Cabo, 'B') > 0) {
            tabel = `cabob_t${tubo}`;
            POS = vbInStr(1, Cabo, 'B');
        }
        reg = `Fibra_${fibra}`;
        IDmet = vbMid(Cabo, 5, POS - 5);
        DESTINO_TAB = tabel;
        assertIdentTable(DESTINO_TAB);
        return out({
            status: '',
            proximo: { TABELA: DESTINO_TAB, idmeta: IDmet, regist: reg },
            metragem,
            atenuacao,
            nivels,
            fiber,
        });
    }

    //**************************/
    //**     destino = DIO    **/
    //*************************/        

    if (vbInStr(1, DESTINO_TAB, 'DIO') > 0) {
        i = vbInStr(1, tabel, '=') > 0 ? 5 : 4;
        if (vbInStr(i, tabel, '!') > 0) {
            POS_1 = vbInStr(i, tabel, '!');
            IDmet = vbMid(tabel, i, POS_1 - i);
        }
        POS_1 = vbInStr(1, regist, '_');
        if (vbInStr(1, regist, 'Label') > 0) POS_2 = vbInStr(1, regist, 'Label');
        DIGITOS = POS_2 - POS_1;
        let FIBER = vbMid(regist, POS_1 + 1, DIGITOS - 1);

        const regFn = `FN_${FIBER}LABEL`;
        const rFn2 = await executarQuery(
            conn,
            `SELECT \`${regFn}\` AS registro FROM tstmeta.\`${TABELA}\` WHERE idmeta = ? LIMIT 1`,
            [idmeta],
        );
        FIBER = rFn2 && rFn2[0] ? rFn2[0].registro : FIBER;

        DIO_TAB = dioTabFromFiber(FIBER);
        const nivelCol = `N${FIBER}`;
        const rNiv = await executarQuery(
            conn,
            `SELECT \`${nivelCol}\` AS nv FROM tstmeta.\`${DIO_TAB}\` WHERE idmeta = ? LIMIT 1`,
            [IDmet],
        );
        const nv = rNiv && rNiv[0] ? rNiv[0].nv : '';
        const nvStr = String(nv == null ? '' : nv).trim();
        if (nvStr !== '' && nvStr !== 'OFF') nivels = Number(nvStr);
        else nivels = -399;

        return out({
            status: 'fim',
            proximo: null,
            metragem,
            atenuacao,
            nivels,
            fiber: FIBER,
            motivo: 'DIO',
        });
    }

    return out({
        status: 'fim',
        proximo: null,
        metragem,
        atenuacao,
        nivels,
        fiber,
        motivo: 'sem_destino_reconhecido',
    });
}
//===================================================================================================
async function analisaTabelaIniCaixa(conn, params) {
    const state = {
        regist: assertFieldName(params.regist),
        TABELA: assertIdentTable(String(params.tabela).toLowerCase()),
        idmeta: params.idmeta,
        metragem: Number(params.metragem) || 0,
        atenuacao: Number(params.atenuacao) || 0,
        nivels: params.nivels != null ? Number(params.nivels) : 0,
        fiber: 0,
    };

    const passos = [];
    const maxIter = 500;
    let n = 0;

    while (n < maxIter) {
        n += 1;
        const out = await vbUmaVoltaDoLoop(conn, state);
        passos.push({
            iteracao: n,
            tabela: state.TABELA,
            idmeta: state.idmeta,
            regist: state.regist,
            resultado: out.motivo || (out.status === 'fim' ? 'fim' : 'continua'),
            destinoTab: out.destinoTab ?? '',
        });

        state.metragem = out.metragem;
        state.atenuacao = out.atenuacao;
        state.nivels = out.nivels;
        if (out.fiber !== undefined && out.fiber !== null) state.fiber = out.fiber;

        if (out.status === 'fim') {
            const metragemFim = out.metragem;
            return {
                success: true,
                metragem: metragemFim,
                atenuacao: atenuacaoComPerdaPorMetragem(metragemFim, out.atenuacao),
                nivels: out.nivels,
                fiber: out.fiber,
                passos,
                iteracoes: n,
                motivo: out.motivo,
            };
        }

        if (!out.proximo) {
            const metragemFim = state.metragem;
            return {
                success: true,
                metragem: metragemFim,
                atenuacao: atenuacaoComPerdaPorMetragem(metragemFim, state.atenuacao),
                nivels: state.nivels,
                fiber: state.fiber,
                passos,
                iteracoes: n,
                warning: 'sem_proximo',
            };
        }

        state.TABELA = assertIdentTable(out.proximo.TABELA);
        state.idmeta = out.proximo.idmeta;
        state.regist = assertFieldName(out.proximo.regist);
    }

    const metragemFim = state.metragem;
    return {
        success: true,
        metragem: metragemFim,
        atenuacao: atenuacaoComPerdaPorMetragem(metragemFim, state.atenuacao),
        nivels: state.nivels,
        fiber: state.fiber,
        passos,
        iteracoes: n,
        warning: 'limite_iteracoes',
    };
}

router.post('/', login, async (req, res) => {
    const { regist, tabela, idmeta, metragem, atenuacao, nivels } = req.body || {};

    if (!regist || !tabela || idmeta === undefined || idmeta === null) {
        return res.status(400).send({
            success: false,
            error: 'regist, tabela e idmeta são obrigatórios',
        });
    }

    let conn;
    try {
        conn = await new Promise((resolve, reject) => {
            mysql.getConnection((err, connection) => {
                if (err) reject(err);
                else resolve(connection);
            });
        });

        const resultado = await analisaTabelaIniCaixa(conn, {
            regist: String(regist),
            tabela: String(tabela),
            idmeta,
            metragem,
            atenuacao,
            nivels,
        });

        conn.release();
        return res.status(200).send(resultado);
    } catch (error) {
        if (conn) conn.release();
        console.error('[analisa_conexao_nivel]', error);
        return res.status(500).send({
            success: false,
            error: error.message || 'Erro ao analisar conexão',
        });
    }
});

module.exports = router;
