'use strict';
const { test } = require('node:test');
const assert = require('node:assert');

/** Mesma regra que conexao_bandeja_fibra: só fundir se null ou "" (após trim). */
function entradaDioSlotOcupado(valorEntrada) {
    return valorEntrada != null && String(valorEntrada).trim() !== '';
}

test('entrada livre: null', () => assert.strictEqual(entradaDioSlotOcupado(null), false));
test('entrada livre: string vazia', () => assert.strictEqual(entradaDioSlotOcupado(''), false));
test('entrada livre: só espaços', () => assert.strictEqual(entradaDioSlotOcupado('   \t'), false));
test('entrada ocupada: texto', () => assert.strictEqual(entradaDioSlotOcupado('=cabo1A!...'), true));
test('entrada ocupada: zero como texto', () => assert.strictEqual(entradaDioSlotOcupado('0'), true));

const path = require('path');
// tabelasPorFibraDio é interno ao router; validar cópia da lógica de mapeamento 13 -> t2
const fs = require('fs');
const src = fs.readFileSync(path.join(__dirname, 'conexao_bandeja_fibra.js'), 'utf8');
assert.match(src, /function tabelasPorFibraDio/, 'helper tabelasPorFibraDio presente');
assert.match(src, /SELECT \?\? AS entrada_f FROM tstmeta\.\?\?/, 'SELECT entrada antes da fusão');
assert.match(src, /status\(409\)/, 'conflito 409 quando ocupado');
