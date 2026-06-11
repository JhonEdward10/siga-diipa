/* ═══════════════════════════════════════════════════════════════
   SIGA · siga-carteras.js · DIIPA · Fase 3.3 COMPLETA
   MÓDULO: Carteras y Garantías
   - Tab 1 · Gestión de Carteras + Agregar Garantía + Carga masiva
   - Tab 2 · Vista por Garantías y Propiedades (con línea de vida)
   - Tab 3 · Papelera y duplicados
═══════════════════════════════════════════════════════════════ */

/* ─── INYECTAR ESTILOS ADICIONALES ─── */
(function inyectarEstilosCyG() {
  if (document.getElementById('siga-carteras-styles')) return;
  const css = `
    .filtros-vista { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 8px; margin-top: 10px; }
    .filtros-vista input, .filtros-vista select { padding: 7px 10px; border: 1px solid var(--border); border-radius: 7px; font-size: 12px; font-family: 'Sora', sans-serif; background: var(--bg-tint); }
    .filtros-vista input:focus, .filtros-vista select:focus { background: var(--bg-card); border-color: var(--diipa-azul); outline: none; }
    @media (max-width: 800px) { .filtros-vista { grid-template-columns: 1fr; } }

    .resumen-etapas { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
    .resumen-etapa { font-size: 10.5px; padding: 3px 8px; border-radius: 5px; font-weight: 600; }

    .tabla-gar-wrap { display: flex; flex-direction: column; gap: 10px; }
    .fila-garantia { background: var(--bg-card); border: 0.5px solid var(--border); border-radius: 10px; padding: 12px 14px; transition: box-shadow 0.15s, border-color 0.15s; }
    .fila-garantia:hover { box-shadow: var(--shadow-sm); }
    .fila-garantia.seleccionada { border-color: var(--diipa-azul); background: var(--diipa-azul-bg); }
    .fila-gar-top { display: flex; gap: 12px; align-items: flex-start; }
    .fila-gar-top input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; margin-top: 4px; }
    .fila-gar-info { flex: 1; min-width: 0; }
    .fila-gar-folio { font-size: 10px; color: var(--text-tertiary); font-family: 'DM Mono', monospace; letter-spacing: 0.5px; }
    .fila-gar-direccion { font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 2px 0; }
    .fila-gar-meta { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
    .meta-chip { font-size: 10px; background: var(--bg-tint); color: var(--text-secondary); padding: 3px 8px; border-radius: 5px; font-weight: 500; }
    .fila-gar-acciones { display: flex; flex-direction: column; gap: 4px; }

    .linea-vida { display: flex; align-items: center; gap: 4px; margin-top: 12px; padding-top: 10px; border-top: 0.5px dashed var(--border-light); overflow-x: auto; }
    .etapa-vida { display: flex; align-items: center; gap: 5px; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 500; white-space: nowrap; flex-shrink: 0; }
    .etapa-vida.completada { background: var(--bg-tint); color: var(--text-tertiary); }
    .etapa-vida.actual { font-weight: 700; }
    .etapa-vida.futura { background: transparent; color: #cbd5e1; }
    .etapa-conector { flex: 1; min-width: 8px; height: 1.5px; background: var(--border-light); }
    .etapa-ico { font-size: 11px; }
    .etapa-label { font-size: 10px; }
    .linea-vida-rechazada { background: #FEE2E2; color: #b91c1c; padding: 8px 14px; border-radius: 7px; font-size: 12px; font-weight: 600; }

    .acciones-masivas { display: flex; gap: 8px; align-items: center; margin-top: 14px; padding-top: 14px; border-top: 0.5px solid var(--border-light); font-size: 12px; color: var(--text-secondary); flex-wrap: wrap; }

    .pap-subtabs { display: flex; gap: 4px; background: var(--bg-tint); padding: 5px; border-radius: 8px; margin-bottom: 14px; }
    .pap-subtab { flex: 1; background: transparent; border: none; padding: 8px 14px; font-size: 11.5px; font-family: 'Sora', sans-serif; font-weight: 500; color: var(--text-secondary); border-radius: 6px; cursor: pointer; }
    .pap-subtab:hover { color: var(--diipa-azul); }
    .pap-subtab.active { background: var(--bg-card); color: var(--diipa-azul); box-shadow: var(--shadow-sm); font-weight: 600; }

    .pap-list { display: flex; flex-direction: column; gap: 8px; }
    .pap-item { background: var(--bg-card); border: 0.5px solid var(--border); border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; }
    .pap-duplicado { background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 10px; padding: 12px 14px; }
    .pap-dup-header { font-size: 12px; font-weight: 600; color: #92400e; margin-bottom: 10px; }
    .pap-dup-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 600px) { .pap-dup-pair { grid-template-columns: 1fr; } }
    .pap-dup-card { background: var(--bg-card); border: 0.5px solid var(--border); border-radius: 8px; padding: 10px; }
    .pap-dup-card .btn-mini { margin-right: 4px; }

    .acreedor-detalle { background: var(--bg-tint); border-radius: 7px; padding: 8px 12px; margin-bottom: 5px; font-size: 12px; }
  `;
  const style = document.createElement('style');
  style.id = 'siga-carteras-styles';
  style.textContent = css;
  document.head.appendChild(style);
})();

const TIPOS_CASO_GRUPOS = [
  { label: '🔴 DEMANDADO · Defensa de propiedad (DIIPA defiende)', posicion: 'DEMANDADO',
    tipos: ['Juicio Especial Hipotecario','Juicio Ejecutivo Mercantil','Juicio Ordinario Civil','Juicio Ordinario Mercantil','Juicio Hipotecario','Juicio Mercantil','Juicio Civil'] },
  { label: '🛡️ ACTOR · DIIPA demanda', posicion: 'ACTOR',
    tipos: ['Actor · Recuperación hipotecaria','Actor · Recuperación mercantil','Actor · Acción reivindicatoria','Actor · Otro juicio como demandante'] },
  { label: '🏠 USUCAPIÓN · Prescripción adquisitiva', posicion: 'USUCAPION',
    tipos: ['Prescripción Adquisitiva (Usucapión)','Usucapión positiva (con juicio en curso)','Usucapión por iniciar (posesión sin demanda)'] },
  { label: '📜 SUCESIÓN · Herencias y testamentarías', posicion: 'SUCESION',
    tipos: ['Sucesión / Herencia sin tramitar','Juicio Sucesorio (Testamentario)','Juicio Sucesorio (Intestamentario)'] },
  { label: '🏘️ CONTINGENCIAS INMOBILIARIAS · Defectos de propiedad', posicion: 'CONTINGENCIAS',
    tipos: ['Escritura sin posesión','Posesión sin escritura','Copropietarios ausentes / proindiviso','Defecto registral','Diligencias de jurisdicción voluntaria','Otra contingencia (especificar después)'] },
  { label: '📑 TRÁMITES ADMINISTRATIVOS · Procesos no civiles', posicion: 'TRAMITES',
    tipos: ['Juicio de Amparo','Juicio Contencioso-Administrativo','Juicio Laboral'] },
  { label: '❓ OTROS · Sin categoría definida', posicion: 'OTROS',
    tipos: ['Otro juicio (especificar después)'] }
];

const POSICIONES_PROCESALES = {
  ACTOR:         { label: '🟢 ACTOR',         sub: 'Cartera Litigiosa',        activo: true,  color: '#15803d' },
  DEMANDADO:     { label: '🔴 DEMANDADO',     sub: 'Defensa de Propiedad',     activo: true,  color: '#b91c1c' },
  USUCAPION:     { label: '🟣 USUCAPIÓN',     sub: 'Posesión / Adjudicación',  activo: true,  color: '#5b21b6' },
  SUCESION:      { label: '📜 SUCESIÓN',      sub: 'En construcción',          activo: false, color: '#0891b2' },
  CONTINGENCIAS: { label: '🏘️ CONTINGENCIAS', sub: 'En construcción',          activo: false, color: '#ca8a04' },
  TRAMITES:      { label: '📑 TRÁMITES',      sub: 'En construcción',          activo: false, color: '#6366f1' },
  OTROS:         { label: '❓ OTROS',         sub: 'Sin categoría',            activo: false, color: '#64748b' }
};

const ETAPAS_VIDA = [
  { id: 'registrada',      label: 'Registrada',     ico: '📥', color: '#94A3B8' },
  { id: 'en_pre_dictamen', label: 'Pre-dictamen',   ico: '⚖️', color: '#7C3AED' },
  { id: 'aprobada',        label: 'Aprobada',       ico: '✓',  color: '#0F6E56' },
  { id: 'publicada',       label: 'Publicada',      ico: '📢', color: '#0C447C' },
  { id: 'en_apartado',     label: 'En apartado',    ico: '🤝', color: '#F59E0B' },
  { id: 'vendida',         label: 'Vendida',        ico: '💰', color: '#16A34A' }
];

const TIPOS_ORIGEN = [
  { id: 'ADM', label: 'Administradora (convenio)' },
  { id: 'PRO', label: 'Activo propio' },
  { id: 'EXT', label: 'Externa (compra de derechos)' }
];

const ACREEDORES_SUGERIDOS = [
  'BBVA','Santander','Banamex','Banorte','HSBC','Scotiabank','BanBajío',
  'Banco Azteca','Banco Mercantil del Norte','Inbursa',
  'INFONAVIT','FOVISSSTE','ISSSTE','IMSS','PensionISSSTE',
  'GMAC','Hipotecaria Su Casita','Hipotecaria Crédito y Casa',
  'Sociedad Hipotecaria Federal','FONAHPO','Otro'
];

let _carteras = [];
let _garantias = [];
let _editandoCarteraId = null;
let _editandoGarantiaId = null;
let _tabCyG = 'principal';
let _tabPap = 'archivadas';
let _acreedoresActuales = [];
let _filasParaSubir = [];
let _filasDuplicadas = [];
let _filasError = [];
let _filtroV = { busqueda: '', cartera: '', estatus: '', admin: '', posicion: '' };
let _seleccionados = new Set();

function detectarPosicionProcesal(tipoCaso) {
  if (!tipoCaso) return 'OTROS';
  for (const grupo of TIPOS_CASO_GRUPOS) {
    if (grupo.tipos.includes(tipoCaso)) return grupo.posicion;
  }
  return 'OTROS';
}

async function inicializarCyG() {
  await Promise.all([cargarCarteras(), cargarGarantiasTodas()]);
  _tabCyG = 'principal';
  cambiarTabCyG('principal');
}

async function cargarCarteras() {
  try {
    const { data, error } = await sb.from('carteras').select('*').eq('eliminada', false).order('folio', { ascending: true });
    if (error) { console.error('Error carteras:', error); _carteras = []; return; }
    _carteras = data || [];
  } catch (err) { console.error(err); _carteras = []; }
}

async function cargarGarantiasTodas() {
  try {
    const { data, error } = await sb.from('garantias').select('*').order('folio', { ascending: true });
    if (error) { console.error('Error garantías:', error); _garantias = []; return; }
    _garantias = data || [];
  } catch (err) { console.error(err); _garantias = []; }
}

async function cargarGarantias() { return cargarGarantiasTodas(); }

function cambiarTabCyG(tab) {
  _tabCyG = tab;
  document.querySelectorAll('.cyg-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.cygTab === tab);
  });
  document.getElementById('cyg-view-principal').style.display = tab === 'principal' ? 'block' : 'none';
  document.getElementById('cyg-view-vista').style.display = tab === 'vista' ? 'block' : 'none';
  document.getElementById('cyg-view-papelera').style.display = tab === 'papelera' ? 'block' : 'none';
  if (tab === 'principal') {
    renderCarterasGrid();
    poblarSelectCarteras();
    poblarSelectTiposCaso();
    poblarDatalistAcreedores();
    _acreedoresActuales = [{ nombre: '', monto: '' }];
    renderAcreedores();
  } else if (tab === 'vista') {
    renderVistaGarantias();
  } else if (tab === 'papelera') {
    renderPapelera();
  }
}

function renderCarterasGrid() {
  const cont = document.getElementById('cyg-carteras-grid');
  if (!cont) return;
  const carterasActivas = _carteras.filter(c => !c.archivada);
  if (!carterasActivas.length) {
    cont.innerHTML = `<div class="empty-state-mini"><div class="icon-mini">📂</div><p>Aún no hay carteras. Crea la primera para empezar a registrar garantías.</p></div>`;
    return;
  }
  cont.innerHTML = carterasActivas.map(c => {
    const admin = _admins.find(a => a.id === c.admin_id);
    const adminLabel = admin ? `${admin.folio || '—'} · ${admin.nombre}` : '(Sin administradora)';
    const numGar = _garantias.filter(g => g.cartera_id === c.id && !g.archivada && !g.eliminada).length;
    const tipoOrigenLabel = (TIPOS_ORIGEN.find(t => t.id === c.tipo_origen) || {}).label || c.tipo_origen;
    return `<div class="cyg-cartera-card"><div class="cyg-cartera-hdr"><div><div class="cyg-cartera-folio">${escapeHtml(c.folio || '')}</div><div class="cyg-cartera-name">${escapeHtml(c.nombre || '')}</div></div><span class="estatus-mini ${c.estatus || 'activa'}">${c.estatus === 'cerrada' ? '✓ Cerrada' : '◉ Activa'}</span></div><div class="cyg-cartera-meta"><div class="cyg-meta-row"><span class="ico">🏦</span><span>${escapeHtml(adminLabel)}</span></div><div class="cyg-meta-row"><span class="ico">📁</span><span>${escapeHtml(tipoOrigenLabel || '—')}</span></div><div class="cyg-meta-row"><span class="ico">🏷️</span><span><strong>${numGar}</strong> garantía${numGar !== 1 ? 's' : ''}</span></div></div><div class="cyg-cartera-actions"><button class="btn-card secondary" onclick="abrirModalCartera(${c.id})">✏️ Editar</button></div></div>`;
  }).join('');
}

function poblarSelectCarteras() {
  const sel = document.getElementById('gar-cartera');
  if (!sel) return;
  const opts = _carteras.filter(c => !c.archivada && c.estatus !== 'cerrada')
    .map(c => `<option value="${c.id}">${escapeHtml(c.folio || '')} · ${escapeHtml(c.nombre || '')}</option>`).join('');
  sel.innerHTML = '<option value="">— Seleccionar cartera —</option>' + opts;
}

function poblarSelectTiposCaso() {
  const sel = document.getElementById('gar-tipo-caso');
  if (!sel) return;
  let html = '<option value="">— Seleccionar tipo —</option>';
  TIPOS_CASO_GRUPOS.forEach(grupo => {
    html += `<optgroup label="${escapeHtml(grupo.label)}">`;
    grupo.tipos.forEach(tipo => { html += `<option value="${escapeHtml(tipo)}">${escapeHtml(tipo)}</option>`; });
    html += '</optgroup>';
  });
  sel.innerHTML = html;
}

function poblarDatalistAcreedores() {
  const dl = document.getElementById('listaAcreedoresSugeridos');
  if (!dl) return;
  dl.innerHTML = ACREEDORES_SUGERIDOS.map(a => `<opt
