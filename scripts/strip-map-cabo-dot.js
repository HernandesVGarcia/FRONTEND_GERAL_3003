const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '../src/app/servico/fiber-trace-map-cabo.service.ts');
let s = fs.readFileSync(target, 'utf8');
const nl = s.includes('\r\n') ? '\r\n' : '\n';

function removeBlock(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start === -1) return { text, removed: false };
  const end = text.indexOf(endMarker, start + startMarker.length);
  if (end === -1) return { text, removed: false };
  return { text: text.slice(0, start) + text.slice(end + endMarker.length), removed: true };
}

// Remove DOT private fields
s = s.replace(
  new RegExp(
    `${nl}${nl}  \\/\\/ .*Variáveis globais para composição DOT.*${nl}(?:  private .*${nl}){6}`,
    'u'
  ),
  nl
);

// Remove DOT init in ANALISA_TABELAGRAFO
s = s.replace(
  new RegExp(
    `      \\/\\/ .*Inicializar variáveis globais DOT.*${nl}(?:      this\\.(?:dotString|Objeto_|cor|flag_caixa|fibraString)[^${nl}]*${nl}){6}`,
    'u'
  ),
  ''
);

// Remove stepCount === 0 DOT block
{
  const r = removeBlock(
    s,
    `      // 🆕 NOVO: Inicializar primeiro objeto (DIO de origem) apenas no primeiro passo${nl}      if (stepCount === 0) {`,
    `      }${nl}${nl}      // Verificar limite de passos`
  );
  if (r.removed) s = r.text;
}

// Remove Objeto_Anterior update block in performTrace
s = s.replace(
  new RegExp(
    `      \\/\\/ .*Atualizar objeto anterior ANTES de processar.*${nl}      if \\(stepCount > 0\\) \\{${nl}        this\\.Objeto_Anterior = this\\.Objeto_Atual;${nl}        console\\.log\\([^;]+\\);${nl}      \\}${nl}${nl}`,
    'u'
  ),
  ''
);

// Remove DOT finalization before each observer.next
s = s.replace(
  new RegExp(
    `        \\/\\/ .*Finalizar DOT string.*${nl}        this\\.dotString \\+= '[^']*';${nl}        console\\.log\\([^;]+\\);${nl}${nl}`,
    'gu'
  ),
  ''
);

// Replace dotString in observer.next with cabosInfo
s = s.replace(/dotString: this\.dotString/g, 'cabosInfo: [...this.cabosInfo]');

// Remove fibraString composition block in processarCabo
{
  const r = removeBlock(
    s,
    `    ${nl}    // 🆕 NOVO: Compor string fibra (igual ao VB6 linha 643)${nl}    try {`,
    `    }${nl}    ${nl}      return {`
  );
  if (r.removed) s = r.text.replace(`    ${nl}      return {`, `      return {`);
}

// Remove DOT block in processarCaixa
{
  const r = removeBlock(
    s,
    `    ${nl}    // 🆕 NOVO: Compor DOT da caixa (igual ao VB6) - SÓ se flag_caixa = false${nl}    if (!this.flag_caixa) {`,
    `    console.log(\`🔄 [FLAG-CAIXA] Invertida para: \${this.flag_caixa}\`);${nl}    ${nl}    return {`
  );
  if (r.removed) s = r.text;
}

// Remove DOT block in processarDIO (final destination)
{
  const r = removeBlock(
    s,
    `    ${nl}    // 🆕 NOVO: Compor DOT do DIO (igual ao VB6)${nl}    try {`,
    `    }${nl}    ${nl}    return {${nl}      idmeta: dioIdmeta,`
  );
  if (r.removed) s = r.text;
}

// Remove comporSplitterDot calls
s = s.replace(new RegExp(`        \\/\\/ .*Compor DOT do SPLITTER.*${nl}        await this\\.comporSplitterDot\\([^)]+\\);${nl}${nl}`, 'gu'), '');
s = s.replace(new RegExp(`    \\/\\/ .*Compor DOT do SPLITTER.*${nl}    await this\\.comporSplitterDot\\([^)]+\\);${nl}${nl}`, 'gu'), '');
s = s.replace(new RegExp(`      await this\\.comporSplitterDot\\([^)]+\\);${nl}${nl}`, 'g'), '');

// Remove comporSplitterDot method entirely
{
  const r = removeBlock(
    s,
    `  // 🆕 NOVO: Compor DOT do SPLITTER (igual ao VB6 linha 710)${nl}  private async comporSplitterDot(`,
    `  }${nl}${nl}  /**${nl}   * Processa equipamento tipo Splitter Saída`
  );
  if (r.removed) s = r.text;
}

// Remove DOT block in processarPOP
{
  const r = removeBlock(
    s,
    `    ${nl}    // 🆕 NOVO: Compor DOT do POP (igual ao VB6 linha 597)${nl}    try {`,
    `    }${nl}${nl}    // POP - destino final`
  );
  if (r.removed) s = r.text;
}

// Remove DOT block in processarRabicho
{
  const r = removeBlock(
    s,
    `    ${nl}    // 🆕 NOVO: Compor DOT do RABICHO (igual ao VB6 linha 628)${nl}    try {`,
    `    }${nl}${nl}    // Rabicho - destino final`
  );
  if (r.removed) s = r.text;
}

// Cleanup stray DOT references
const lines = s.split(nl);
const filtered = lines.filter((line) => {
  if (/this\.dotString/.test(line)) return false;
  if (/this\.Objeto_/.test(line)) return false;
  if (/this\.flag_caixa/.test(line)) return false;
  if (/this\.fibraString/.test(line)) return false;
  if (/this\.cor\s*=/.test(line)) return false;
  if (/private cor:/.test(line)) return false;
  if (/comporSplitterDot/.test(line)) return false;
  if (/\[DOT\]|\[CAIXA-DOT\]|\[DIO-DOT\]|\[POP-DOT\]|\[RABICHO-DOT\]|\[SPLITTER-DOT\]|\[FLAG-CAIXA\]/.test(line)) return false;
  return true;
});
s = filtered.join(nl);

// Ensure cabosInfo on all observer.next success paths
s = s.replace(
  /observer\.next\(\{\s*\r?\n\s*success: true,\s*\r?\n\s*trace: tracePath,\s*\r?\n\s*status: ([^,]+),\s*\r?\n\s*cabosInfo:/g,
  (m) => m
);

const missingCabosInfo = (s.match(/observer\.next\(\{[^}]*success: true[^}]*\}/g) || []).filter(
  (block) => !block.includes('cabosInfo')
);
if (missingCabosInfo.length) {
  console.warn('Warning: observer.next blocks possibly missing cabosInfo:', missingCabosInfo.length);
}

fs.writeFileSync(target, s, 'utf8');
console.log(`Done. Lines: ${lines.length} -> ${filtered.length}`);
console.log('Remaining dotString refs:', (s.match(/dotString/g) || []).length);
