/* ═══════════════════════════════════════════════════════════════
   SIGA · siga-carteras.js · DIIPA · Fase 3.3 + 3.3-E + 3.3-F.1 + 3.3-F.2
═══════════════════════════════════════════════════════════════ */

/* ─── INYECTAR ESTILOS ─── */
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
    .btn-pre-llamativo { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%) !important; color: white !important; border: none !important; font-weight: 600 !important; }
    .btn-pre-llamativo:hover { background: linear-gradient(135deg, #D97706 0%, #B45309 100%) !important; }

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

    .mb-aviso { background: linear-gradient(135deg, #FEF7E6 0%, #FEF3C7 100%); border-bottom: 1px solid #F59E0B; padding: 10px 20px; display: flex; align-items: center; gap: 8px; }
    .mb-aviso-ico { font-size: 18px; color: #92400e; }
    .mb-aviso-txt { font-size: 11px; color: #92400e; line-height: 1.4; }

    .mb-grupo { background: var(--bg-tint); border-radius: 8px; padding: 12px; margin-bottom: 10px; }
    .mb-grupo-tit { font-size: 11px; font-weight: 600; color: var(--diipa-azul); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
    .mb-grupo:last-child { margin-bottom: 0; }

    .input-archivo { background: var(--bg-card); border: 1px dashed var(--border); border-radius: 7px; padding: 10px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; }
    .input-archivo:hover { background: var(--diipa-azul-bg); border-color: var(--diipa-azul-claro); }
    .input-archivo input[type="file"] { display: none; }
    .input-archivo-ico { font-size: 24px; }
    .input-archivo-label { font-size: 11px; color: var(--text-secondary); font-weight: 500; text-align: center; }
    .input-archivo.con-archivo { background: #DCFCE7; border-color: #86EFAC; border-style: solid; }
    .input-archivo.con-archivo .input-archivo-label { color: #166534; font-weight: 600; }
    .input-archivo.obligatorio { border-color: #F59E0B; }
    .input-archivo.obligatorio.con-archivo { border-color: #86EFAC; }

    .foto-preview { width: 100%; max-height: 140px; object-fit: cover; border-radius: 6px; margin-top: 6px; }
    .galeria-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 6px; margin-top: 8px; }
    .galeria-thumb { position: relative; width: 100%; aspect-ratio: 1; border-radius: 6px; overflow: hidden; background: var(--bg-tint); }
    .galeria-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .galeria-thumb-quitar { position: absolute; top: 3px; right: 3px; background: rgba(0,0,0,0.6); color: white; border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; font-size: 11px; display: flex; align-items: center; justify-content: center; }

    .mb-rango { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .checklist-validacion { background: var(--bg-card); border: 0.5px solid var(--border); border-radius: 8px; padding: 10px 12px; margin-top: 10px; }
    .checklist-validacion h5 { font-size: 11.5px; font-weight: 600; margin-bottom: 6px; color: var(--text-secondary); }
    .checklist-item { display: flex; align-items: center; gap: 6px; font-size: 11px; padding: 3px 0; }
    .checklist-item.ok { color: #166534; }
    .checklist-item.falta { color: #b91c1c; }
    .checklist-ico { width: 14px; text-align: center; }

    .btn-modal-mb { padding: 9px 16px; border-radius: 8px; font-size: 12px; font-family: 'Sora', sans-serif; font-weight: 500; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px; }
    .btn-modal-mb.cancel { background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border); }
    .btn-modal-mb.solo-guardar { background: #185FA5; color: white; }
    .btn-modal-mb.solo-guardar:hover { background: #0C447C; }
    .btn-modal-mb.mandar { background: linear-gradient(135deg, #534AB7 0%, #6B5FD0 100%); color: white; font-weight: 600; }
    .btn-modal-mb.mandar:hover { background: linear-gradient(135deg, #3C3489 0%, #534AB7 100%); }
    .btn-modal-mb:disabled { opacity: 0.45; cursor: not-allowed; }

    .mb-cola-info { background: #DBEAFE; color: #1E40AF; padding: 6px 12px; border-radius: 6px; font-size: 11px; margin-right: auto; }

    .btn-card:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-card.con-tooltip { position: relative; }
    .btn-card.con-tooltip:disabled:hover::after { content: attr(data-tooltip); position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); background: #b91c1c; color: white; padding: 7px 12px; border-radius: 6px; font-size: 10.5px; max-width: 280px; white-space: normal; width: 240px; line-height: 1.4; z-index: 100; }
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

const TIPOS_INMUEBLE = [
  { id: 'casa',    label: '🏠 Casa habitación' },
  { id: 'depto',   label: '🏢 Departamento' },
  { id: 'terreno', label: '🟫 Terreno' },
  { id: 'local',   label: '🏪 Local comercial' },
  { id: 'bodega',  label: '🏭 Bodega / nave' }
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
let _tabCyG = 'principal';
let _tabPap = 'archivadas';
let _acreedoresActuales = [];
let _filasParaSubir = [];
let _filasDuplicadas = [];
let _filasError = [];
let _filtroV = { busqueda: '', cartera: '', estatus: '', admin: '', posicion: '' };
let _seleccionados = new Set();

let _mbActualId = null;
let _mbFotoFachada = null;
let _mbGaleria = [];
let _mbAvaluoPdf = null;
let _mbMapsLink = '';
let _mbLat = null;
let _mbLng = null;
let _colaPredictamen = [];
let _completadasEnCadena = 0;
let _accionFinalCola = 'mandar';

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
    if (error) { console.error(error); _carteras = []; return; }
    _carteras = data || [];
  } catch (err) { console.error(err); _carteras = []; }
}

async function cargarGarantiasTodas() {
  try {
    const { data, error } = await sb.from('garantias').select('*').order('folio', { ascending: true });
    if (error) { console.error(error); _garantias = []; return; }
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
    renderFormGarantiaCompleto();
    _acreedoresActuales = [{ nombre: '', monto: '' }];
    renderAcreedores();
  } else if (tab === 'vista') {
    renderVistaGarantias();
  } else if (tab === 'papelera') {
    renderPapelera();
  }
}

function renderFormGarantiaCompleto() {
  const cont = document.querySelector('.cyg-form-individual');
  if (!cont) return;
  cont.innerHTML = `
    <h4>➕ Agregar Garantía Individual</h4>
    <div style="background: var(--diipa-azul-bg); border-left: 3px solid var(--diipa-azul); padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-size: 11px; color: var(--diipa-azul-oscuro)">
      💡 Solo datos básicos. La foto, avalúo y estudio de mercado se llenan después.
    </div>
    <div class="field"><label>📂 Cartera *</label><select id="gar-cartera"></select></div>
    <div class="field"><label>⚖️ Tipo de Caso *</label><select id="gar-tipo-caso" onchange="onCambiarTipoCaso()"></select><div class="posicion-detectada" id="gar-posicion-detectada"></div></div>
    <div class="field"><label>💳 Acreedor original</label><div id="gar-acreedores-list"></div></div>
    <div class="field"><label>📜 No. de Crédito (opcional)</label><input type="text" id="gar-num-credito"></div>
    <div class="field"><label>📍 Dirección / Ubicación *</label><input type="text" id="gar-direccion" placeholder="Calle, Colonia, Ciudad, Estado"></div>
    <div class="field-row">
      <div class="field"><label>Estado</label><input type="text" id="gar-estado"></div>
      <div class="field"><label>Municipio</label><input type="text" id="gar-municipio"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>💰 Valor estimado ($)</label><input type="number" step="0.01" id="gar-valor"></div>
      <div class="field"><label>🎯 Precio piso ($) <span style="font-size:9px; color:#92400e">(confidencial)</span></label><input type="number" step="0.01" id="gar-precio-piso"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>📐 M² Terreno</label><input type="number" step="0.01" id="gar-m2-terreno"></div>
      <div class="field"><label>🏠 M² Construcción</label><input type="number" step="0.01" id="gar-m2-construccion"></div>
    </div>
    <button class="btn-card primary" id="btnGuardarGarantia" onclick="guardarGarantiaIndividual()" style="width:100%; margin-top:12px">+ Agregar Garantía</button>
  `;
  poblarSelectCarteras();
  poblarSelectTiposCaso();
  poblarDatalistAcreedores();
  renderAcreedores();
}

function renderCarterasGrid() {
  const cont = document.getElementById('cyg-carteras-grid');
  if (!cont) return;
  const carterasActivas = _carteras.filter(c => !c.archivada);
  if (!carterasActivas.length) {
    cont.innerHTML = `<div class="empty-state-mini"><div class="icon-mini">📂</div><p>Aún no hay carteras.</p></div>`;
    return;
  }
  cont.innerHTML = carterasActivas.map(c => {
    const admin = _admins.find(a => a.id === c.admin_id);
    const adminLabel = admin ? `${admin.folio || '—'} · ${admin.nombre}` : '(Sin admin)';
    const numGar = _garantias.filter(g => g.cartera_id === c.id && !g.archivada && !g.eliminada).length;
    const tipoOrigenLabel = (TIPOS_ORIGEN.find(t => t.id === c.tipo_origen) || {}).label || c.tipo_origen;
    return `<div class="cyg-cartera-card"><div class="cyg-cartera-hdr"><div><div class="cyg-cartera-folio">${escapeHtml(c.folio || '')}</div><div class="cyg-cartera-name">${escapeHtml(c.nombre || '')}</div></div><span class="estatus-mini ${c.estatus || 'activa'}">${c.estatus === 'cerrada' ? '✓ Cerrada' : '◉ Activa'}</span></div><div class="cyg-cartera-meta"><div class="cyg-meta-row"><span class="ico">🏦</span><span>${escapeHtml(adminLabel)}</span></div><div class="cyg-meta-row"><span class="ico">📁</span><span>${escapeHtml(tipoOrigenLabel || '—')}</span></div><div class="cyg-meta-row"><span class="ico">🏷️</span><span><strong>${numGar}</strong> garantía${numGar !== 1 ? 's' : ''}</span></div></div><div class="cyg-cartera-actions"><button class="btn-card secondary" onclick="abrirModalCartera(${c.id})">✏️ Editar</button></div></div>`;
  }).join('');
}

function poblarSelectCarteras() {
  const sel = document.getElementById('gar-cartera');
  if (!sel) return;
  const opts = _carteras.filter(c => !c.archivada && c.estatus !== 'cerrada').map(c => `<option value="${c.id}">${escapeHtml(c.folio || '')} · ${escapeHtml(c.nombre || '')}</option>`).join('');
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
  dl.innerHTML = ACREEDORES_SUGERIDOS.map(a => `<option value="${escapeHtml(a)}">`).join('');
}

function onCambiarTipoCaso() {
  const tipoCaso = document.getElementById('gar-tipo-caso').value;
  const posicion = detectarPosicionProcesal(tipoCaso);
  const conf = POSICIONES_PROCESALES[posicion];
  const box = document.getElementById('gar-posicion-detectada');
  if (!box) return;
  if (!tipoCaso) { box.style.display = 'none'; box.innerHTML = ''; return; }
  const aviso = conf.activo ? '' : '<div style="font-size:10.5px;color:#92400e;margin-top:4px">⚠️ Módulo en construcción.</div>';
  box.style.display = 'block';
  box.style.borderLeft = '3px solid ' + conf.color;
  box.innerHTML = `<div class="posicion-detectada-titulo">🤖 Posición procesal auto-detectada:</div><div class="posicion-detectada-valor" style="color:${conf.color}"><strong>${conf.label}</strong> · ${escapeHtml(conf.sub)}</div>${aviso}`;
}

function renderAcreedores() {
  const cont = document.getElementById('gar-acreedores-list');
  if (!cont) return;
  if (!_acreedoresActuales.length) _acreedoresActuales = [{ nombre: '', monto: '' }];
  cont.innerHTML = _acreedoresActuales.map((a, idx) => `
    <div class="acreedor-row">
      <input type="text" placeholder="${idx === 0 ? 'Acreedor principal (ej. BBVA)' : 'Acreedor secundario'}" value="${escapeHtml(a.nombre || '')}" list="listaAcreedoresSugeridos" oninput="actualizarAcreedor(${idx}, 'nombre', this.value)">
      <input type="number" placeholder="Monto $" step="0.01" value="${a.monto || ''}" oninput="actualizarAcreedor(${idx}, 'monto', this.value)">
      ${_acreedoresActuales.length > 1 ? `<button class="btn-mini danger" onclick="quitarAcreedor(${idx})">✕</button>` : '<span style="width:32px"></span>'}
    </div>
  `).join('') + `<button class="btn-mini" onclick="agregarAcreedor()" style="margin-top:6px">+ Agregar acreedor</button>`;
}

function actualizarAcreedor(idx, campo, valor) { if (!_acreedoresActuales[idx]) return; _acreedoresActuales[idx][campo] = valor; }
function agregarAcreedor() { _acreedoresActuales.push({ nombre: '', monto: '' }); renderAcreedores(); }
function quitarAcreedor(idx) {
  _acreedoresActuales.splice(idx, 1);
  if (!_acreedoresActuales.length) _acreedoresActuales = [{ nombre: '', monto: '' }];
  renderAcreedores();
}

async function abrirModalCartera(id) {
  _editandoCarteraId = id;
  const selAdmin = document.getElementById('cart-admin');
  selAdmin.innerHTML = '<option value="">— Sin administradora —</option>' + _admins.filter(a => a.estatus === 'activa').map(a => `<option value="${a.id}">${escapeHtml(a.folio || '')} · ${escapeHtml(a.nombre || '')}</option>`).join('');
  const selOrigen = document.getElementById('cart-origen');
  selOrigen.innerHTML = TIPOS_ORIGEN.map(t => `<option value="${t.id}">${escapeHtml(t.label)}</option>`).join('');
  if (id) {
    const c = _carteras.find(x => x.id === id);
    if (!c) return;
    document.getElementById('cartTitulo').textContent = 'Editar cartera · ' + (c.folio || '');
    document.getElementById('cart-folio').value = c.folio || '';
    document.getElementById('cart-nombre').value = c.nombre || '';
    document.getElementById('cart-admin').value = c.admin_id || '';
    document.getElementById('cart-origen').value = c.tipo_origen || 'ADM';
    document.getElementById('cart-estatus').value = c.estatus || 'activa';
    document.getElementById('cart-fingreso').value = c.fecha_ingreso || '';
    document.getElementById('cart-fcierre').value = c.fecha_cierre_estimada || '';
    document.getElementById('cart-notas').value = c.notas || '';
  } else {
    const folio = await generarFolioCartera();
    document.getElementById('cartTitulo').textContent = 'Nueva cartera';
    document.getElementById('cart-folio').value = folio;
    document.getElementById('cart-nombre').value = '';
    document.getElementById('cart-admin').value = '';
    document.getElementById('cart-origen').value = 'ADM';
    document.getElementById('cart-estatus').value = 'activa';
    document.getElementById('cart-fingreso').value = new Date().toISOString().slice(0, 10);
    document.getElementById('cart-fcierre').value = '';
    document.getElementById('cart-notas').value = '';
  }
  document.getElementById('modalCartera').classList.add('show');
}

function cerrarModalCartera() { document.getElementById('modalCartera').classList.remove('show'); _editandoCarteraId = null; }

async function generarFolioCartera() {
  try {
    const { data, error } = await sb.from('carteras').select('folio').ilike('folio', 'CAR-%').order('folio', { ascending: false }).limit(1);
    if (error || !data || !data.length) return 'CAR-001';
    const num = parseInt((data[0].folio || '').split('-')[1]) || 0;
    return 'CAR-' + String(num + 1).padStart(3, '0');
  } catch (err) { return 'CAR-001'; }
}

async function guardarCartera() {
  const nombre = document.getElementById('cart-nombre').value.trim();
  if (!nombre) { mostrarToast('error', 'El nombre de la cartera es obligatorio'); return; }
  const adminVal = document.getElementById('cart-admin').value;
  const payload = {
    folio: document.getElementById('cart-folio').value.trim(), nombre: nombre,
    admin_id: adminVal ? parseInt(adminVal) : null,
    tipo_origen: document.getElementById('cart-origen').value,
    estatus: document.getElementById('cart-estatus').value,
    fecha_ingreso: document.getElementById('cart-fingreso').value || null,
    fecha_cierre_estimada: document.getElementById('cart-fcierre').value || null,
    notas: document.getElementById('cart-notas').value.trim() || null,
    actualizado_en: new Date().toISOString()
  };
  const btn = document.getElementById('btnGuardarCartera');
  btn.disabled = true; btn.textContent = 'Guardando...';
  try {
    let res;
    if (_editandoCarteraId) res = await sb.from('carteras').update(payload).eq('id', _editandoCarteraId);
    else { payload.creado_por = _userEmail; payload.creado_en = new Date().toISOString(); res = await sb.from('carteras').insert(payload); }
    if (res.error) { mostrarToast('error', 'Error: ' + res.error.message); return; }
    cerrarModalCartera();
    mostrarToast('success', _editandoCarteraId ? '✓ Cartera actualizada' : '✓ Cartera creada');
    await cargarCarteras(); renderCarterasGrid(); poblarSelectCarteras();
  } catch (err) { mostrarToast('error', 'Error inesperado'); }
  finally { btn.disabled = false; btn.textContent = 'Guardar'; }
}

async function guardarGarantiaIndividual() {
  const carteraId = document.getElementById('gar-cartera').value;
  if (!carteraId) { mostrarToast('error', 'Selecciona la cartera'); return; }
  const direccion = document.getElementById('gar-direccion').value.trim();
  if (!direccion) { mostrarToast('error', 'La dirección es obligatoria'); return; }
  const tipoCaso = document.getElementById('gar-tipo-caso').value;
  if (!tipoCaso) { mostrarToast('error', 'Selecciona el tipo de caso'); return; }
  const direccionNorm = normalizarDireccion(direccion);
  const dup = _garantias.find(g => g.direccion_norm === direccionNorm && !g.eliminada);
  if (dup) { mostrarToast('error', '⚠️ Ya existe una garantía con esa dirección (' + (dup.folio || '') + ')'); return; }
  const acreedoresLimpios = _acreedoresActuales.map(a => ({ nombre: (a.nombre || '').trim(), monto: parseFloat(a.monto) || null })).filter(a => a.nombre);
  const folio = await generarFolioGarantia();
  const posicion = detectarPosicionProcesal(tipoCaso);
  const payload = {
    folio: folio, cartera_id: parseInt(carteraId), tipo_caso: tipoCaso,
    posicion_procesal: posicion, acreedores: acreedoresLimpios,
    num_credito: document.getElementById('gar-num-credito').value.trim() || null,
    direccion: direccion, direccion_norm: direccionNorm,
    estado_mx: document.getElementById('gar-estado').value.trim() || null,
    municipio: document.getElementById('gar-municipio').value.trim() || null,
    valor_estimado: parseFloat(document.getElementById('gar-valor').value) || null,
    precio_piso: parseFloat(document.getElementById('gar-precio-piso').value) || null,
    m2_terreno: parseFloat(document.getElementById('gar-m2-terreno').value) || null,
    m2_construccion: parseFloat(document.getElementById('gar-m2-construccion').value) || null,
    estatus: 'registrada', creado_por: _userEmail, creado_en: new Date().toISOString()
  };
  const btn = document.getElementById('btnGuardarGarantia');
  btn.disabled = true; btn.textContent = 'Guardando...';
  try {
    const { error } = await sb.from('garantias').insert(payload);
    if (error) { mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', '✓ Garantía ' + folio + ' agregada · Posición: ' + posicion);
    await cargarGarantiasTodas();
    renderCarterasGrid();
    renderFormGarantiaCompleto();
  } catch (err) { mostrarToast('error', 'Error inesperado'); }
  finally { btn.disabled = false; btn.textContent = '+ Agregar Garantía'; }
}

async function generarFolioGarantia() {
  try {
    const { data, error } = await sb.from('garantias').select('folio').ilike('folio', 'GAR-%').order('folio', { ascending: false }).limit(1);
    if (error || !data || !data.length) return 'GAR-0001';
    const num = parseInt((data[0].folio || '').split('-')[1]) || 0;
    return 'GAR-' + String(num + 1).padStart(4, '0');
  } catch (err) { return 'GAR-0001'; }
}

function normalizarDireccion(dir) {
  if (!dir) return '';
  return String(dir).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function validarParaPredictamen(garantia) {
  const faltantes = [];
  if (!garantia.foto_fachada) faltantes.push('foto de fachada');
  if (!garantia.avaluo_valor) faltantes.push('valor del avalúo');
  if (!garantia.estudio_mercado_low || !garantia.estudio_mercado_high) faltantes.push('estudio de mercado (rango)');
  if (!garantia.entre_calles) faltantes.push('entre calles');
  if (!garantia.codigo_postal) faltantes.push('código postal');
  if (!garantia.tipo_inmueble) faltantes.push('tipo de inmueble');
  if (!garantia.lat || !garantia.lng) faltantes.push('link de Google Maps con coordenadas');
  return { valido: faltantes.length === 0, faltantes };
}

function extraerCoordenadasMaps(link) {
  if (!link) return null;
  let m = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  m = link.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  m = link.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  m = link.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  return null;
}

function procesarArchivoMasivo(file) {
  if (!file) return;
  if (typeof XLSX === 'undefined') { mostrarToast('error', 'SheetJS no cargada'); return; }
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type: 'array' });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
      validarYPreparar(rows);
    } catch (err) { mostrarToast('error', 'Error al leer el archivo'); }
  };
  reader.readAsArrayBuffer(file);
}

function validarYPreparar(rows) {
  _filasParaSubir = []; _filasDuplicadas = []; _filasError = [];
  const carterasByFolio = {};
  _carteras.forEach(c => { if (c.folio) carterasByFolio[c.folio.toUpperCase()] = c; });
  const direccionesExistentes = new Set(_garantias.filter(g => !g.eliminada).map(g => g.direccion_norm).filter(Boolean));
  const direccionesEnArchivo = new Set();
  rows.forEach((row, idx) => {
    const numFila = idx + 2;
    const carteraFolio = String(row.cartera_folio || '').trim().toUpperCase();
    const direccion = String(row.direccion || '').trim();
    const tipoCaso = String(row.tipo_caso || '').trim();
    if (!carteraFolio || !direccion || !tipoCaso) { _filasError.push({ fila: numFila, razon: 'Faltan campos obligatorios', row }); return; }
    const cartera = carterasByFolio[carteraFolio];
    if (!cartera) { _filasError.push({ fila: numFila, razon: 'Cartera no encontrada: ' + carteraFolio, row }); return; }
    const direccionNorm = normalizarDireccion(direccion);
    if (direccionesExistentes.has(direccionNorm) || direccionesEnArchivo.has(direccionNorm)) {
      _filasDuplicadas.push({ fila: numFila, direccion: direccion, row });
      return;
    }
    direccionesEnArchivo.add(direccionNorm);
    const acreedores = [];
    for (let i = 1; i <= 3; i++) {
      const nombre = String(row['acreedor_' + i] || '').trim();
      if (nombre) acreedores.push({ nombre: nombre, monto: parseFloat(row['monto_' + i]) || null });
    }
    if (!acreedores.length && row.acreedor_original) {
      acreedores.push({ nombre: String(row.acreedor_original).trim(), monto: null });
    }
    _filasParaSubir.push({
      cartera_id: cartera.id, tipo_caso: tipoCaso,
      posicion_procesal: detectarPosicionProcesal(tipoCaso),
      acreedores: acreedores, direccion: direccion, direccion_norm: direccionNorm,
      estado_mx: String(row.estado_mx || '').trim() || null,
      municipio: String(row.municipio || '').trim() || null,
      num_credito: String(row.num_credito || '').trim() || null,
      valor_estimado: parseFloat(row.valor_estimado) || null,
      precio_piso: parseFloat(row.precio_piso) || null,
      m2_terreno: parseFloat(row.m2_terreno) || null,
      m2_construccion: parseFloat(row.m2_construccion) || null,
      notas: String(row.notas || '').trim() || null,
      estatus: 'registrada', creado_por: _userEmail, creado_en: new Date().toISOString()
    });
  });
  mostrarReporteCarga();
}

function mostrarReporteCarga() {
  const cont = document.getElementById('cyg-reporte');
  if (!cont) return;
  cont.innerHTML = `<div class="reporte-box"><h4>📊 Resumen de carga masiva</h4><div class="reporte-stats"><div class="reporte-stat success"><div class="num">${_filasParaSubir.length}</div><div class="lbl">✓ Para subir</div></div><div class="reporte-stat warning"><div class="num">${_filasDuplicadas.length}</div><div class="lbl">⚠️ Duplicadas</div></div><div class="reporte-stat error"><div class="num">${_filasError.length}</div><div class="lbl">❌ Con error</div></div></div>${_filasError.length ? `<details class="reporte-detalles"><summary>Ver errores</summary><ul>${_filasError.map(e => `<li>Fila ${e.fila}: ${escapeHtml(e.razon)}</li>`).join('')}</ul></details>` : ''}${_filasDuplicadas.length ? `<details class="reporte-detalles"><summary>Ver duplicadas</summary><ul>${_filasDuplicadas.map(d => `<li>Fila ${d.fila}: ${escapeHtml(d.direccion)}</li>`).join('')}</ul></details>` : ''}${_filasParaSubir.length ? `<div style="margin-top:14px;display:flex;gap:8px;justify-content:flex-end"><button class="btn-card secondary" onclick="cancelarCargaMasiva()">Cancelar</button><button class="btn-card primary" onclick="confirmarCargaMasiva()">✓ Subir ${_filasParaSubir.length}</button></div>` : '<p style="margin-top:10px;color:var(--text-tertiary)">No hay filas válidas.</p>'}</div>`;
}

async function confirmarCargaMasiva() {
  if (!_filasParaSubir.length) return;
  let nextNum = 1;
  try {
    const { data } = await sb.from('garantias').select('folio').ilike('folio', 'GAR-%').order('folio', { ascending: false }).limit(1);
    if (data && data.length) nextNum = (parseInt((data[0].folio || '').split('-')[1]) || 0) + 1;
  } catch (err) {}
  const conFolios = _filasParaSubir.map((f, i) => ({ ...f, folio: 'GAR-' + String(nextNum + i).padStart(4, '0') }));
  try {
    const { error } = await sb.from('garantias').insert(conFolios);
    if (error) { mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', `✓ ${conFolios.length} garantías subidas`);
    cancelarCargaMasiva();
    await cargarGarantiasTodas();
    renderCarterasGrid();
  } catch (err) { mostrarToast('error', 'Error inesperado'); }
}

function cancelarCargaMasiva() {
  _filasParaSubir = []; _filasDuplicadas = []; _filasError = [];
  const cont = document.getElementById('cyg-reporte');
  if (cont) cont.innerHTML = '';
  const fileInput = document.getElementById('cyg-file-input');
  if (fileInput) fileInput.value = '';
}

function renderVistaGarantias() {
  const cont = document.getElementById('cyg-view-vista');
  if (!cont) return;
  _seleccionados.clear();
  cont.innerHTML = `
    <div class="cyg-section">
      <div class="cyg-section-hdr">
        <div style="display:flex; gap:12px; align-items:flex-start; flex:1">
          <div class="cyg-section-ico">🏛️</div>
          <div>
            <h3 id="resumen-admin-titulo">Resumen por Administradora (0)</h3>
            <p>Click en una administradora para ver sus garantías agrupadas</p>
          </div>
        </div>
      </div>
      <div id="resumen-admin-grid"></div>
    </div>
    <div class="cyg-section">
      <div class="cyg-section-hdr" style="flex-direction:column; align-items:stretch">
        <div style="display:flex; gap:12px; align-items:flex-start">
          <div class="cyg-section-ico">🏷️</div>
          <div style="flex:1">
            <h3 id="tabla-garantias-titulo">Garantías Registradas (0)</h3>
            <p>Click en "📝 Pre-dictamen" en cada fila para llenar los datos o mándalas masivamente</p>
          </div>
        </div>
        <div class="filtros-vista">
          <input type="text" id="filtro-busqueda" placeholder="🔍 Código o dirección..." oninput="aplicarFiltrosVista()">
          <select id="filtro-cartera" onchange="aplicarFiltrosVista()">
            <option value="">Todas las carteras</option>
            ${_carteras.filter(c=>!c.archivada).map(c => `<option value="${c.id}">${escapeHtml(c.folio || '')} · ${escapeHtml(c.nombre || '')}</option>`).join('')}
          </select>
          <select id="filtro-admin" onchange="aplicarFiltrosVista()">
            <option value="">Todas las administradoras</option>
            ${_admins.map(a => `<option value="${a.id}">${escapeHtml(a.folio || '')} · ${escapeHtml(a.nombre || '')}</option>`).join('')}
          </select>
          <select id="filtro-posicion" onchange="aplicarFiltrosVista()">
            <option value="">Todas las posiciones</option>
            ${Object.entries(POSICIONES_PROCESALES).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
          <select id="filtro-estatus" onchange="aplicarFiltrosVista()">
            <option value="">Todos los estatus</option>
            ${ETAPAS_VIDA.map(e => `<option value="${e.id}">${e.ico} ${e.label}</option>`).join('')}
          </select>
        </div>
      </div>
      <div id="tabla-garantias-container"></div>
      <div class="acciones-masivas">
        <span id="seleccionados-count">0 garantías seleccionadas</span>
        <div style="flex:1"></div>
        <button class="btn-card secondary" onclick="seleccionarTodas()">☑️ Seleccionar todo</button>
        <button class="btn-card primary" id="btn-mandar-pre" onclick="iniciarFlujoPredictamen()" style="background:linear-gradient(135deg,#534AB7,#6B5FD0)">⚖️ Mandar a Pre-dictaminar URRJ</button>
      </div>
    </div>
  `;
  renderResumenAdmin();
  aplicarFiltrosVista();
}

function renderResumenAdmin() {
  const cont = document.getElementById('resumen-admin-grid');
  const titulo = document.getElementById('resumen-admin-titulo');
  if (!cont) return;
  const conteo = {};
  _garantias.filter(g => !g.eliminada && !g.archivada).forEach(g => {
    const cartera = _carteras.find(c => c.id === g.cartera_id);
    const adminId = cartera ? cartera.admin_id : null;
    if (!adminId) return;
    if (!conteo[adminId]) conteo[adminId] = { total: 0, porEstatus: {} };
    conteo[adminId].total += 1;
    conteo[adminId].porEstatus[g.estatus] = (conteo[adminId].porEstatus[g.estatus] || 0) + 1;
  });
  const adminsConGar = Object.keys(conteo);
  if (titulo) titulo.textContent = `Resumen por Administradora (${adminsConGar.length})`;
  if (!adminsConGar.length) {
    cont.innerHTML = `<div class="empty-state-mini"><div class="icon-mini">🏦</div><p>No hay administradoras con garantías registradas.</p></div>`;
    return;
  }
  cont.innerHTML = `<div class="cyg-carteras-grid">${adminsConGar.map(adminId => {
    const admin = _admins.find(a => a.id == adminId);
    if (!admin) return '';
    const c = conteo[adminId];
    const etapasHtml = ETAPAS_VIDA.filter(e => c.porEstatus[e.id]).map(e => 
      `<span class="resumen-etapa" style="background:${e.color}22;color:${e.color}">${e.ico} ${c.porEstatus[e.id]}</span>`
    ).join('');
    return `<div class="cyg-cartera-card" style="cursor:pointer" onclick="filtrarPorAdmin(${admin.id})"><div class="cyg-cartera-hdr"><div><div class="cyg-cartera-folio">${escapeHtml(admin.folio || '')}</div><div class="cyg-cartera-name">${escapeHtml(admin.nombre || '')}</div></div><span class="estatus-mini activa">${c.total}</span></div><div class="resumen-etapas">${etapasHtml || '<span style="color:var(--text-tertiary);font-size:11px">Sin etapas activas</span>'}</div></div>`;
  }).join('')}</div>`;
}

function filtrarPorAdmin(adminId) {
  document.getElementById('filtro-admin').value = adminId;
  aplicarFiltrosVista();
  document.getElementById('tabla-garantias-container').scrollIntoView({ behavior: 'smooth' });
}

function aplicarFiltrosVista() {
  _filtroV.busqueda = (document.getElementById('filtro-busqueda') || {}).value || '';
  _filtroV.cartera = (document.getElementById('filtro-cartera') || {}).value || '';
  _filtroV.admin = (document.getElementById('filtro-admin') || {}).value || '';
  _filtroV.posicion = (document.getElementById('filtro-posicion') || {}).value || '';
  _filtroV.estatus = (document.getElementById('filtro-estatus') || {}).value || '';
  renderTablaGarantias();
}

function renderTablaGarantias() {
  const cont = document.getElementById('tabla-garantias-container');
  const titulo = document.getElementById('tabla-garantias-titulo');
  if (!cont) return;
  const activas = _garantias.filter(g => !g.eliminada && !g.archivada);
  const filtradas = activas.filter(g => {
    const cartera = _carteras.find(c => c.id === g.cartera_id);
    const adminIdCart = cartera ? cartera.admin_id : null;
    if (_filtroV.busqueda) {
      const q = _filtroV.busqueda.toLowerCase();
      if (!(g.folio || '').toLowerCase().includes(q) && !(g.direccion || '').toLowerCase().includes(q)) return false;
    }
    if (_filtroV.cartera && g.cartera_id != _filtroV.cartera) return false;
    if (_filtroV.admin && adminIdCart != _filtroV.admin) return false;
    if (_filtroV.posicion && g.posicion_procesal !== _filtroV.posicion) return false;
    if (_filtroV.estatus && g.estatus !== _filtroV.estatus) return false;
    return true;
  });
  if (titulo) titulo.textContent = `Garantías Registradas (${filtradas.length})`;
  if (!filtradas.length) {
    cont.innerHTML = `<div class="empty-state-mini"><div class="icon-mini">🔍</div><p>No hay garantías que coincidan con los filtros.</p></div>`;
    return;
  }
  cont.innerHTML = `<div class="tabla-gar-wrap">${filtradas.map(g => construirFilaGarantia(g)).join('')}</div>`;
  actualizarContadorSeleccion();
}

function construirFilaGarantia(g) {
  const cartera = _carteras.find(c => c.id === g.cartera_id);
  const admin = cartera && cartera.admin_id ? _admins.find(a => a.id === cartera.admin_id) : null;
  const posicion = POSICIONES_PROCESALES[g.posicion_procesal] || POSICIONES_PROCESALES.OTROS;
  const valor = g.valor_estimado ? '$' + Number(g.valor_estimado).toLocaleString('es-MX', { maximumFractionDigits: 0 }) : '—';
  const isChecked = _seleccionados.has(g.id);
  const val = validarParaPredictamen(g);
  const estadoBaner = val.valido ? '<span class="meta-chip" style="background:#DCFCE7;color:#166534">✓ Listo para pre-dictamen</span>' : `<span class="meta-chip" style="background:#FEF3C7;color:#92400e">⚠️ Faltan ${val.faltantes.length} dato${val.faltantes.length !== 1 ? 's' : ''}</span>`;
  const thumbFoto = g.foto_fachada ? `<img src="${g.foto_fachada}" style="width:60px; height:60px; object-fit:cover; border-radius:6px; flex-shrink:0">` : '';
  const botonPredictamen = (g.estatus === 'registrada' && !val.valido)
    ? `<button class="btn-mini btn-pre-llamativo" onclick="abrirModalMiniBaner(${g.id}, false)">📝 Pre-dictamen</button>`
    : '';
  return `
    <div class="fila-garantia ${isChecked ? 'seleccionada' : ''}">
      <div class="fila-gar-top">
        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleSeleccion(${g.id})">
        ${thumbFoto}
        <div class="fila-gar-info">
          <div class="fila-gar-folio">${escapeHtml(g.folio || '')}</div>
          <div class="fila-gar-direccion">${escapeHtml(g.direccion || '')}</div>
          <div class="fila-gar-meta">
            <span class="meta-chip">📂 ${cartera ? escapeHtml(cartera.folio || '') : '—'}</span>
            <span class="meta-chip">🏦 ${admin ? escapeHtml(admin.nombre || '') : 'Sin admin'}</span>
            <span class="meta-chip" style="background:${posicion.color}22;color:${posicion.color}">${posicion.label}</span>
            <span class="meta-chip">💰 ${valor}</span>
            ${estadoBaner}
          </div>
        </div>
        <div class="fila-gar-acciones">
          ${botonPredictamen}
          <button class="btn-mini" onclick="abrirDetalleGarantia(${g.id})">👁️ Ver</button>
          <button class="btn-mini" onclick="archivarGarantia(${g.id})">📦</button>
          <button class="btn-mini danger" onclick="eliminarGarantia(${g.id})">🗑️</button>
        </div>
      </div>
      ${construirLineaVida(g)}
    </div>
  `;
}

function construirLineaVida(g) {
  const estatusActual = g.estatus;
  const idxActual = ETAPAS_VIDA.findIndex(e => e.id === estatusActual);
  if (estatusActual === 'rechazada') {
    return `<div class="linea-vida"><div class="linea-vida-rechazada">✕ Rechazada en pre-dictamen URRJ</div></div>`;
  }
  return `
    <div class="linea-vida">
      ${ETAPAS_VIDA.map((e, i) => {
        const completada = i < idxActual;
        const actual = i === idxActual;
        const cls = completada ? 'completada' : (actual ? 'actual' : 'futura');
        const color = completada || actual ? e.color : '#cbd5e1';
        return `<div class="etapa-vida ${cls}" style="${actual ? `background:${color};color:white` : ''}" title="${e.label}">
          <span class="etapa-ico" style="color:${color}">${e.ico}</span>
          <span class="etapa-label">${e.label}</span>
        </div>`;
      }).join('<div class="etapa-conector"></div>')}
    </div>
  `;
}

function toggleSeleccion(id) {
  if (_seleccionados.has(id)) _seleccionados.delete(id);
  else _seleccionados.add(id);
  actualizarContadorSeleccion();
  renderTablaGarantias();
}

function seleccionarTodas() {
  const activas = _garantias.filter(g => !g.eliminada && !g.archivada);
  const filtradas = activas.filter(g => {
    const cartera = _carteras.find(c => c.id === g.cartera_id);
    const adminIdCart = cartera ? cartera.admin_id : null;
    if (_filtroV.busqueda) {
      const q = _filtroV.busqueda.toLowerCase();
      if (!(g.folio || '').toLowerCase().includes(q) && !(g.direccion || '').toLowerCase().includes(q)) return false;
    }
    if (_filtroV.cartera && g.cartera_id != _filtroV.cartera) return false;
    if (_filtroV.admin && adminIdCart != _filtroV.admin) return false;
    if (_filtroV.posicion && g.posicion_procesal !== _filtroV.posicion) return false;
    if (_filtroV.estatus && g.estatus !== _filtroV.estatus) return false;
    return true;
  });
  if (_seleccionados.size === filtradas.length) _seleccionados.clear();
  else filtradas.forEach(g => _seleccionados.add(g.id));
  renderTablaGarantias();
}

function actualizarContadorSeleccion() {
  const lbl = document.getElementById('seleccionados-count');
  if (lbl) lbl.textContent = `${_seleccionados.size} garantía${_seleccionados.size !== 1 ? 's' : ''} seleccionada${_seleccionados.size !== 1 ? 's' : ''}`;
  const btn = document.getElementById('btn-mandar-pre');
  if (!btn) return;
  btn.disabled = _seleccionados.size === 0;
}
/* ═══════════════════════════════════════════════════════════════
   FLUJO DE PRE-DICTAMEN MASIVO (con cadena de modales)
═══════════════════════════════════════════════════════════════ */
async function iniciarFlujoPredictamen() {
  if (!_seleccionados.size) { mostrarToast('error', 'Selecciona al menos una garantía'); return; }
  const completas = [];
  const incompletas = [];
  _seleccionados.forEach(id => {
    const g = _garantias.find(x => x.id === id);
    if (!g) return;
    if (g.estatus !== 'registrada') return;
    const v = validarParaPredictamen(g);
    if (v.valido) completas.push(g);
    else incompletas.push(g);
  });
  if (!completas.length && !incompletas.length) {
    mostrarToast('error', 'Las garantías seleccionadas no están en estatus "registrada"');
    return;
  }
  let mensaje = '';
  if (completas.length) mensaje += `✓ ${completas.length} garantía(s) listas (se mandan directo)\n`;
  if (incompletas.length) mensaje += `📝 ${incompletas.length} garantía(s) sin datos completos\n   (se abrirá un modal por cada una)\n`;
  mensaje += `\n¿Continuar?`;
  if (!confirm(mensaje)) return;
  if (completas.length) {
    try {
      const ids = completas.map(g => g.id);
      const { error } = await sb.from('garantias').update({ estatus: 'en_pre_dictamen', actualizado_en: new Date().toISOString() }).in('id', ids);
      if (error) { mostrarToast('error', 'Error: ' + error.message); return; }
      _completadasEnCadena = completas.length;
    } catch (err) { mostrarToast('error', 'Error inesperado'); return; }
  } else {
    _completadasEnCadena = 0;
  }
  if (incompletas.length) {
    _colaPredictamen = incompletas.map(g => g.id);
    _accionFinalCola = 'mandar';
    abrirModalMiniBaner(_colaPredictamen[0], true);
  } else {
    mostrarToast('success', `✓ ${_completadasEnCadena} garantía(s) mandadas a pre-dictamen`);
    _seleccionados.clear();
    _completadasEnCadena = 0;
    await cargarGarantiasTodas();
    renderVistaGarantias();
  }
}

/* ═══════════════════════════════════════════════════════════════
   MODAL MINI BÁNER · llenar datos para pre-dictamen
═══════════════════════════════════════════════════════════════ */
function abrirModalMiniBaner(garantiaId, enCadena) {
  const g = _garantias.find(x => x.id === garantiaId);
  if (!g) return;
  _mbActualId = garantiaId;
  _mbFotoFachada = g.foto_fachada || null;
  _mbGaleria = Array.isArray(g.galeria_fotos) ? [...g.galeria_fotos] : [];
  _mbAvaluoPdf = g.avaluo_pdf || null;
  _mbMapsLink = g.google_maps_link || '';
  _mbLat = g.lat || null;
  _mbLng = g.lng || null;
  const enCadenaInfo = enCadena && _colaPredictamen.length > 1
    ? `<div class="mb-cola-info">📋 Modal ${_completadasEnCadena + 1} de ${_completadasEnCadena + _colaPredictamen.length} · van en cadena</div>`
    : '';
  const html = `
    <div class="modal-overlay show" id="modalMiniBaner" onclick="if(event.target===this)cerrarModalMiniBaner()">
      <div class="modal-box" style="max-width: 560px">
        <div class="modal-hdr">
          <div>
            <div class="modal-hdr-title">📝 Llenar Mini Báner para Pre-dictamen</div>
            <div class="modal-hdr-sub">${escapeHtml(g.folio || '')} · ${escapeHtml(g.direccion || '')}</div>
          </div>
          <button class="modal-hdr-x" onclick="cerrarModalMiniBaner()">✕</button>
        </div>
        <div class="mb-aviso">
          <span class="mb-aviso-ico">ℹ️</span>
          <span class="mb-aviso-txt">Estos datos son obligatorios para que URRJ pueda hacer el pre-dictamen. Sin esto, no se manda.</span>
        </div>
        <div class="modal-body" style="max-height: 60vh; overflow-y: auto">
          <div class="mb-grupo">
            <div class="mb-grupo-tit">📍 Ubicación validada</div>
            <div class="field">
              <label>Calle / Avenida principal *</label>
              <input type="text" id="mb-calle" value="${escapeHtml(g.calle || '')}" placeholder="Av. Reforma">
            </div>
            <div class="field-row">
              <div class="field"><label>Núm. EXTERIOR *</label><input type="text" id="mb-num-ext" value="${escapeHtml(g.num_exterior || '')}" placeholder="2007"></div>
              <div class="field"><label>Núm. INTERIOR (si aplica)</label><input type="text" id="mb-num-int" value="${escapeHtml(g.num_interior || '')}" placeholder="B-13"></div>
            </div>
            <div class="field-row">
              <div class="field"><label>Entre calles *</label><input type="text" id="mb-entre-calles" value="${escapeHtml(g.entre_calles || '')}" placeholder="Av. López Mateos y Vallarta"></div>
              <div class="field"><label>Código postal *</label><input type="text" id="mb-cp" maxlength="5" value="${escapeHtml(g.codigo_postal || '')}" placeholder="44100"></div>
            </div>
            <div class="field">
              <label>Tipo de inmueble *</label>
              <select id="mb-tipo-inmueble">
                <option value="">— Seleccionar —</option>
                ${TIPOS_INMUEBLE.map(t => `<option value="${t.id}" ${g.tipo_inmueble === t.id ? 'selected' : ''}>${escapeHtml(t.label)}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label>🔗 Link de Google Maps *</label>
              <input type="text" id="mb-maps-link" value="${escapeHtml(g.google_maps_link || '')}" placeholder="Pega aquí el link COMPLETO de Google Maps" oninput="onCambiarMapsLink(this.value)">
              <div id="mb-coords-display" style="margin-top:6px;font-size:11px"></div>
              <div style="font-size:10.5px;color:var(--text-tertiary);margin-top:4px">
                💡 Abre Google Maps · busca la dirección · click derecho → "Copiar enlace" · pega aquí
              </div>
            </div>
          </div>
          <div class="mb-grupo">
            <div class="mb-grupo-tit">📸 Foto fachada + galería</div>
            <div class="field-row">
              <div class="field">
                <label>Foto fachada *</label>
                <label class="input-archivo obligatorio ${_mbFotoFachada ? 'con-archivo' : ''}" id="lbl-mb-foto">
                  <input type="file" id="mb-foto-fachada" accept="image/jpeg,image/png,image/webp" onchange="onSubirFotoFachadaMB(this)">
                  <div class="input-archivo-ico">${_mbFotoFachada ? '✓' : '📷'}</div>
                  <div class="input-archivo-label">${_mbFotoFachada ? '✓ Foto cargada · click para reemplazar' : 'Click para subir'}</div>
                </label>
                <div id="preview-mb-foto">${_mbFotoFachada ? `<img src="${_mbFotoFachada}" class="foto-preview">` : ''}</div>
              </div>
              <div class="field">
                <label>Galería opcional</label>
                <label class="input-archivo ${_mbGaleria.length ? 'con-archivo' : ''}" id="lbl-mb-galeria">
                  <input type="file" id="mb-galeria" accept="image/jpeg,image/png,image/webp" multiple onchange="onSubirGaleriaMB(this)">
                  <div class="input-archivo-ico">🖼️</div>
                  <div class="input-archivo-label">${_mbGaleria.length ? `✓ ${_mbGaleria.length} fotos · click para agregar` : 'Varias fotos'}</div>
                </label>
                <div class="galeria-grid" id="preview-mb-galeria"></div>
              </div>
            </div>
          </div>
          <div class="mb-grupo">
            <div class="mb-grupo-tit">💰 Avalúo comercial</div>
            <div class="field-row">
              <div class="field">
                <label>Valor avalúo (MXN) *</label>
                <input type="number" id="mb-avaluo-valor" step="0.01" value="${g.avaluo_valor || ''}" placeholder="1500000">
              </div>
              <div class="field">
                <label>PDF del avalúo (opcional)</label>
                <label class="input-archivo ${_mbAvaluoPdf ? 'con-archivo' : ''}" id="lbl-mb-avaluo">
                  <input type="file" id="mb-avaluo-pdf" accept="application/pdf" onchange="onSubirAvaluoPdfMB(this)">
                  <div class="input-archivo-ico">📄</div>
                  <div class="input-archivo-label">${_mbAvaluoPdf ? '✓ PDF cargado' : 'Click para subir PDF'}</div>
                </label>
              </div>
            </div>
          </div>
          <div class="mb-grupo">
            <div class="mb-grupo-tit">📊 Estudio de mercado rápido</div>
            <div style="font-size:10.5px;color:var(--text-tertiary);margin-bottom:8px">Cuánto valen casas comparables en la zona</div>
            <div class="mb-rango">
              <div class="field"><label>Valor BAJO *</label><input type="number" id="mb-mercado-low" step="0.01" value="${g.estudio_mercado_low || ''}" placeholder="1200000"></div>
              <div class="field"><label>Valor ALTO *</label><input type="number" id="mb-mercado-high" step="0.01" value="${g.estudio_mercado_high || ''}" placeholder="1800000"></div>
            </div>
            <div class="field">
              <label>Notas del análisis (opcional)</label>
              <textarea id="mb-mercado-notas" rows="2" placeholder="Comparé 3 casas similares en la cuadra...">${escapeHtml(g.estudio_mercado_notas || '')}</textarea>
            </div>
          </div>
        </div>
        <div class="modal-actions" style="padding: 12px 20px; background: var(--bg-tint)">
          ${enCadenaInfo}
          <button class="btn-modal-mb cancel" onclick="cerrarModalMiniBaner()">Cancelar</button>
          <button class="btn-modal-mb solo-guardar" onclick="guardarMiniBaner('solo_guardar')">💾 Solo guardar</button>
          <button class="btn-modal-mb mandar" onclick="guardarMiniBaner('mandar_predictamen')">⚖️ Guardar y Mandar a Pre-dictamen</button>
        </div>
      </div>
    </div>
  `;
  const prev = document.getElementById('modalMiniBaner');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', html);
  renderPreviewGaleriaMB();
  if (_mbMapsLink) onCambiarMapsLink(_mbMapsLink);
}

function onCambiarMapsLink(link) {
  _mbMapsLink = link.trim();
  const display = document.getElementById('mb-coords-display');
  if (!display) return;
  if (!_mbMapsLink) {
    _mbLat = null; _mbLng = null;
    display.innerHTML = '';
    return;
  }
  const coords = extraerCoordenadasMaps(_mbMapsLink);
  if (coords) {
    _mbLat = coords.lat;
    _mbLng = coords.lng;
    display.innerHTML = `
      <div style="background:#DCFCE7;color:#166534;padding:6px 10px;border-radius:6px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
        <span>✅ Coordenadas detectadas: <strong>${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}</strong></span>
        <a href="${escapeHtml(_mbMapsLink)}" target="_blank" style="background:#0F6E56;color:white;padding:4px 10px;border-radius:5px;text-decoration:none;font-size:10.5px;font-weight:600">📍 Ver en Maps</a>
      </div>
    `;
  } else {
    _mbLat = null; _mbLng = null;
    const esShortUrl = /(?:maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(_mbMapsLink);
    if (esShortUrl) {
      display.innerHTML = `<div style="background:#FEF3C7;color:#92400e;padding:6px 10px;border-radius:6px;font-size:11px">⚠️ Es un link corto · abre el link en Maps → click derecho en el pin → "Copiar enlace" y pega ESE link.</div>`;
    } else {
      display.innerHTML = `<div style="background:#FEE2E2;color:#b91c1c;padding:6px 10px;border-radius:6px;font-size:11px">❌ No se detectaron coordenadas en el link</div>`;
    }
  }
}

function cerrarModalMiniBaner() {
  const m = document.getElementById('modalMiniBaner');
  if (m) m.remove();
  _mbActualId = null;
  _mbFotoFachada = null;
  _mbGaleria = [];
  _mbAvaluoPdf = null;
  _mbMapsLink = '';
  _mbLat = null;
  _mbLng = null;
}

async function onSubirFotoFachadaMB(input) {
  const file = input.files[0];
  if (!file) return;
  const lbl = document.getElementById('lbl-mb-foto');
  const labelDiv = lbl.querySelector('.input-archivo-label');
  labelDiv.textContent = 'Subiendo...';
  try {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `fachada/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const { error } = await sb.storage.from('garantias-fotos').upload(path, file);
    if (error) throw error;
    const { data: urlData } = sb.storage.from('garantias-fotos').getPublicUrl(path);
    _mbFotoFachada = urlData.publicUrl;
    document.getElementById('preview-mb-foto').innerHTML = `<img src="${_mbFotoFachada}" class="foto-preview">`;
    lbl.classList.add('con-archivo');
    labelDiv.innerHTML = '✓ Foto cargada · click para reemplazar';
    mostrarToast('success', '✓ Foto subida');
  } catch (err) {
    mostrarToast('error', 'Error: ' + (err.message || ''));
    labelDiv.textContent = 'Click para subir';
  }
}

async function onSubirGaleriaMB(input) {
  const files = Array.from(input.files || []);
  if (!files.length) return;
  const lbl = document.getElementById('lbl-mb-galeria');
  const labelDiv = lbl.querySelector('.input-archivo-label');
  labelDiv.textContent = `Subiendo ${files.length}...`;
  try {
    for (const file of files) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `galeria/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { error } = await sb.storage.from('garantias-fotos').upload(path, file);
      if (error) throw error;
      const { data: urlData } = sb.storage.from('garantias-fotos').getPublicUrl(path);
      _mbGaleria.push(urlData.publicUrl);
    }
    renderPreviewGaleriaMB();
    lbl.classList.add('con-archivo');
    labelDiv.innerHTML = `✓ ${_mbGaleria.length} fotos · click para agregar más`;
    mostrarToast('success', `✓ ${files.length} fotos subidas`);
    input.value = '';
  } catch (err) {
    mostrarToast('error', 'Error: ' + (err.message || ''));
  }
}

function renderPreviewGaleriaMB() {
  const cont = document.getElementById('preview-mb-galeria');
  if (!cont) return;
  cont.innerHTML = _mbGaleria.map((url, idx) => `
    <div class="galeria-thumb">
      <img src="${url}">
      <button class="galeria-thumb-quitar" onclick="quitarFotoGaleriaMB(${idx})">✕</button>
    </div>
  `).join('');
}

function quitarFotoGaleriaMB(idx) {
  _mbGaleria.splice(idx, 1);
  renderPreviewGaleriaMB();
  const lbl = document.getElementById('lbl-mb-galeria');
  const labelDiv = lbl.querySelector('.input-archivo-label');
  if (_mbGaleria.length === 0) {
    lbl.classList.remove('con-archivo');
    labelDiv.textContent = 'Varias fotos';
  } else {
    labelDiv.innerHTML = `✓ ${_mbGaleria.length} fotos · click para agregar más`;
  }
}

async function onSubirAvaluoPdfMB(input) {
  const file = input.files[0];
  if (!file) return;
  const lbl = document.getElementById('lbl-mb-avaluo');
  const labelDiv = lbl.querySelector('.input-archivo-label');
  labelDiv.textContent = 'Subiendo PDF...';
  try {
    const path = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.pdf`;
    const { error } = await sb.storage.from('garantias-avaluos').upload(path, file);
    if (error) throw error;
    _mbAvaluoPdf = path;
    lbl.classList.add('con-archivo');
    labelDiv.innerHTML = '✓ PDF cargado';
    mostrarToast('success', '✓ Avalúo subido');
  } catch (err) {
    mostrarToast('error', 'Error: ' + (err.message || ''));
  }
}

async function guardarMiniBaner(opcion) {
  if (!_mbActualId) return;
  const calle = document.getElementById('mb-calle').value.trim();
  const num_exterior = document.getElementById('mb-num-ext').value.trim();
  const num_interior = document.getElementById('mb-num-int').value.trim();
  const entre_calles = document.getElementById('mb-entre-calles').value.trim();
  const codigo_postal = document.getElementById('mb-cp').value.trim();
  const tipo_inmueble = document.getElementById('mb-tipo-inmueble').value;
  const avaluo_valor = parseFloat(document.getElementById('mb-avaluo-valor').value) || null;
  const estudio_mercado_low = parseFloat(document.getElementById('mb-mercado-low').value) || null;
  const estudio_mercado_high = parseFloat(document.getElementById('mb-mercado-high').value) || null;
  const estudio_mercado_notas = document.getElementById('mb-mercado-notas').value.trim() || null;

  const payload = {
    foto_fachada: _mbFotoFachada,
    galeria_fotos: _mbGaleria,
    avaluo_valor: avaluo_valor,
    avaluo_pdf: _mbAvaluoPdf,
    estudio_mercado_low: estudio_mercado_low,
    estudio_mercado_high: estudio_mercado_high,
    estudio_mercado_notas: estudio_mercado_notas,
    entre_calles: entre_calles || null,
    calle: calle || null,
    num_exterior: num_exterior || null,
    num_interior: num_interior || null,
    codigo_postal: codigo_postal || null,
    tipo_inmueble: tipo_inmueble || null,
    google_maps_link: _mbMapsLink || null,
    lat: _mbLat,
    lng: _mbLng,
    direccion_validada: !!(_mbLat && _mbLng),
    actualizado_en: new Date().toISOString()
  };

  const gActual = _garantias.find(x => x.id === _mbActualId);
  if (gActual && gActual.estatus !== 'registrada' && !gActual.correccion_usada) {
    payload.correccion_usada = true;
    payload.correccion_fecha = new Date().toISOString();
    payload.correccion_por = _userEmail;
  }

  if (opcion === 'mandar_predictamen') {
    const v = validarParaPredictamen({ ...payload });
    if (!v.valido) {
      mostrarToast('error', '⚠️ Faltan datos · revisa los campos marcados con *');
      alert('No se puede mandar a pre-dictamen.\n\nFaltan:\n• ' + v.faltantes.join('\n• '));
      return;
    }
    payload.estatus = 'en_pre_dictamen';
  }
  try {
    const { error } = await sb.from('garantias').update(payload).eq('id', _mbActualId);
    if (error) { mostrarToast('error', 'Error: ' + error.message); return; }
    await cargarGarantiasTodas();
    const garantiaProcesada = _mbActualId;
    cerrarModalMiniBaner();
    if (_colaPredictamen.length > 0) {
      _colaPredictamen = _colaPredictamen.filter(id => id !== garantiaProcesada);
      _completadasEnCadena++;
      if (_colaPredictamen.length > 0) {
        mostrarToast('success', `✓ ${_completadasEnCadena} listas · siguen ${_colaPredictamen.length}`);
        setTimeout(() => abrirModalMiniBaner(_colaPredictamen[0], true), 300);
        return;
      } else {
        mostrarToast('success', `✓ ${_completadasEnCadena} garantía(s) procesadas en cadena`);
        _completadasEnCadena = 0;
        _seleccionados.clear();
        renderVistaGarantias();
        return;
      }
    }
    if (opcion === 'mandar_predictamen') {
      mostrarToast('success', '✓ Garantía mandada a pre-dictamen URRJ');
    } else {
      mostrarToast('success', '✓ Datos guardados');
    }
    renderVistaGarantias();
  } catch (err) {
    mostrarToast('error', 'Error inesperado');
  }
}

function abrirDetalleGarantia(id) {
  const g = _garantias.find(x => x.id === id);
  if (!g) return;
  const cartera = _carteras.find(c => c.id === g.cartera_id);
  const admin = cartera && cartera.admin_id ? _admins.find(a => a.id === cartera.admin_id) : null;
  const posicion = POSICIONES_PROCESALES[g.posicion_procesal] || POSICIONES_PROCESALES.OTROS;
  const tipoInmuebleLabel = (TIPOS_INMUEBLE.find(t => t.id === g.tipo_inmueble) || {}).label || g.tipo_inmueble || '—';
  const acreedoresHtml = (g.acreedores && g.acreedores.length) ? g.acreedores.map(a => 
    `<div class="acreedor-detalle">💳 <strong>${escapeHtml(a.nombre || '')}</strong>${a.monto ? ' · $' + Number(a.monto).toLocaleString('es-MX') : ''}</div>`
  ).join('') : '<div style="color:var(--text-tertiary)">Sin acreedores registrados</div>';
  const val = validarParaPredictamen(g);
  const checklistHtml = `
    <div class="checklist-validacion">
      <h5>${val.valido ? '✅ Mini báner completo · lista para pre-dictamen' : '⚠️ Mini báner incompleto'}</h5>
      <div class="checklist-item ${g.foto_fachada ? 'ok' : 'falta'}"><span class="checklist-ico">${g.foto_fachada ? '✓' : '✕'}</span> Foto de fachada</div>
      <div class="checklist-item ${g.avaluo_valor ? 'ok' : 'falta'}"><span class="checklist-ico">${g.avaluo_valor ? '✓' : '✕'}</span> Valor del avalúo</div>
      <div class="checklist-item ${(g.estudio_mercado_low && g.estudio_mercado_high) ? 'ok' : 'falta'}"><span class="checklist-ico">${(g.estudio_mercado_low && g.estudio_mercado_high) ? '✓' : '✕'}</span> Estudio de mercado (rango)</div>
      <div class="checklist-item ${g.entre_calles ? 'ok' : 'falta'}"><span class="checklist-ico">${g.entre_calles ? '✓' : '✕'}</span> Entre calles</div>
      <div class="checklist-item ${g.codigo_postal ? 'ok' : 'falta'}"><span class="checklist-ico">${g.codigo_postal ? '✓' : '✕'}</span> Código postal</div>
      <div class="checklist-item ${g.tipo_inmueble ? 'ok' : 'falta'}"><span class="checklist-ico">${g.tipo_inmueble ? '✓' : '✕'}</span> Tipo de inmueble</div>
      <div class="checklist-item ${(g.lat && g.lng) ? 'ok' : 'falta'}"><span class="checklist-ico">${(g.lat && g.lng) ? '✓' : '✕'}</span> Link de Google Maps con coordenadas</div>
      ${(g.estatus === 'registrada' && !val.valido) ? `<button class="btn-card primary" style="width:100%;margin-top:8px" onclick="cerrarDetalle(); abrirModalMiniBaner(${g.id}, false)">📝 Llenar pre-dictamen ahora</button>` : ''}
      ${(g.estatus !== 'registrada' && g.estatus !== 'rechazada' && !g.correccion_usada) ? `<button class="btn-card primary" style="width:100%;margin-top:8px; background:linear-gradient(135deg,#F59E0B,#D97706)" onclick="cerrarDetalle(); abrirModalMiniBaner(${g.id}, false)">✏️ Corregir mini báner (1 oportunidad)</button>` : ''}
      ${g.correccion_usada ? `
        <div style="background:#FEF3C7; border:1px solid #FCD34D; padding:10px; border-radius:7px; margin-top:8px; font-size:11.5px; color:#92400e">
          ⚠️ <strong>Ya usaste tu corrección</strong> el ${g.correccion_fecha ? new Date(g.correccion_fecha).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}<br>
          Por: ${escapeHtml(g.correccion_por || '—')}
        </div>
        <button class="btn-card primary" style="width:100%;margin-top:8px; background:linear-gradient(135deg,#534AB7,#6B5FD0)" onclick="solicitarValidacionCorreccion(${g.id})">📨 Solicitar validación para corregir de nuevo</button>
      ` : ''}
    </div>
  `;
  const galeriaHtml = (g.galeria_fotos && g.galeria_fotos.length) ? 
    `<div class="galeria-grid">${g.galeria_fotos.map(url => `<div class="galeria-thumb"><img src="${url}"></div>`).join('')}</div>` :
    '<div style="color:var(--text-tertiary); font-size:11px">Sin galería</div>';
  const html = `
    <div class="modal-overlay show" id="modalDetalleGar" onclick="if(event.target===this)cerrarDetalle()">
      <div class="modal-box modal-grande">
        <div class="modal-hdr">
          <div>
            <div class="modal-hdr-title">${escapeHtml(g.folio || '')}</div>
            <div class="modal-hdr-sub">${escapeHtml(g.direccion || '')}</div>
          </div>
          <button class="modal-hdr-x" onclick="cerrarDetalle()">✕</button>
        </div>
        <div class="modal-body">
          ${g.foto_fachada ? `<img src="${g.foto_fachada}" style="width:100%; max-height:280px; object-fit:cover; border-radius:8px; margin-bottom:10px">` : ''}
          ${checklistHtml}
          <div class="modal-section-title">🤖 Posición procesal</div>
          <div style="background:${posicion.color}11; border-left:3px solid ${posicion.color}; padding:10px 14px; border-radius:8px"><strong style="color:${posicion.color}">${posicion.label}</strong> · ${escapeHtml(posicion.sub)}</div>
          <div class="modal-section-title">📋 Línea de vida</div>
          ${construirLineaVida(g)}
          <div class="modal-section-title">📂 Información general</div>
          <div class="field-row">
            <div class="field"><label>Cartera</label><div>${cartera ? escapeHtml(cartera.folio + ' · ' + cartera.nombre) : '—'}</div></div>
            <div class="field"><label>Administradora</label><div>${admin ? escapeHtml(admin.folio + ' · ' + admin.nombre) : '—'}</div></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Tipo de caso</label><div>${escapeHtml(g.tipo_caso || '—')}</div></div>
            <div class="field"><label>Tipo de inmueble</label><div>${escapeHtml(tipoInmuebleLabel)}</div></div>
          </div>
          <div class="modal-section-title">💳 Acreedor(es) original(es)</div>
          ${acreedoresHtml}
          <div class="modal-section-title">📍 Ubicación</div>
          <div class="field"><label>Dirección</label><div>${escapeHtml(g.direccion || '—')}</div></div>
          ${(g.calle || g.num_exterior || g.num_interior) ? `
            <div class="field-row">
              <div class="field"><label>Calle</label><div>${escapeHtml(g.calle || '—')}</div></div>
              <div class="field"><label>Núm. Ext / Int</label><div>${escapeHtml(g.num_exterior || '—')}${g.num_interior ? ' · Int ' + escapeHtml(g.num_interior) : ''}</div></div>
            </div>
          ` : ''}
          <div class="field-row">
            <div class="field"><label>Entre calles</label><div>${escapeHtml(g.entre_calles || '—')}</div></div>
            <div class="field"><label>Código postal</label><div>${escapeHtml(g.codigo_postal || '—')}</div></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Estado</label><div>${escapeHtml(g.estado_mx || '—')}</div></div>
            <div class="field"><label>Municipio</label><div>${escapeHtml(g.municipio || '—')}</div></div>
          </div>
          ${g.lat && g.lng ? `
            <div class="field">
              <label>Coordenadas Google Maps</label>
              <div style="background:#DCFCE7;color:#166534;padding:8px 12px;border-radius:7px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12px">
                <span>📍 <strong>${Number(g.lat).toFixed(6)}, ${Number(g.lng).toFixed(6)}</strong></span>
                ${g.google_maps_link ? `<a href="${escapeHtml(g.google_maps_link)}" target="_blank" style="background:#0F6E56;color:white;padding:5px 12px;border-radius:6px;text-decoration:none;font-size:11px;font-weight:600">📍 Abrir en Maps</a>` : ''}
              </div>
            </div>
          ` : '<div class="field"><label>Coordenadas Google Maps</label><div style="color:#b91c1c;font-size:11px">⚠️ Sin coordenadas registradas</div></div>'}
          <div class="modal-section-title">📸 Galería</div>
          ${galeriaHtml}
          <div class="modal-section-title">💰 Valores</div>
          <div class="field-row">
            <div class="field"><label>Avalúo (valor)</label><div>${g.avaluo_valor ? '$' + Number(g.avaluo_valor).toLocaleString('es-MX') : '—'}</div></div>
            <div class="field"><label>Valor estimado interno</label><div>${g.valor_estimado ? '$' + Number(g.valor_estimado).toLocaleString('es-MX') : '—'}</div></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Estudio · BAJO</label><div>${g.estudio_mercado_low ? '$' + Number(g.estudio_mercado_low).toLocaleString('es-MX') : '—'}</div></div>
            <div class="field"><label>Estudio · ALTO</label><div>${g.estudio_mercado_high ? '$' + Number(g.estudio_mercado_high).toLocaleString('es-MX') : '—'}</div></div>
          </div>
          ${g.estudio_mercado_notas ? `<div class="field"><label>Notas del estudio</label><div>${escapeHtml(g.estudio_mercado_notas)}</div></div>` : ''}
          <div class="field"><label>Precio piso (confidencial)</label><div>${g.precio_piso ? '$' + Number(g.precio_piso).toLocaleString('es-MX') : '—'}</div></div>
          <div class="modal-section-title">📐 Medidas</div>
          <div class="field-row">
            <div class="field"><label>M² Terreno</label><div>${g.m2_terreno || '—'}</div></div>
            <div class="field"><label>M² Construcción</label><div>${g.m2_construccion || '—'}</div></div>
          </div>
          <div class="modal-section-title">⚙️ Cambiar estatus</div>
          <select id="cambiar-estatus-gar" style="width:100%">
            ${ETAPAS_VIDA.map(e => `<option value="${e.id}" ${e.id === g.estatus ? 'selected' : ''}>${e.ico} ${e.label}</option>`).join('')}
            <option value="rechazada" ${g.estatus === 'rechazada' ? 'selected' : ''}>✕ Rechazada</option>
            <option value="archivada" ${g.estatus === 'archivada' ? 'selected' : ''}>📦 Archivada</option>
          </select>
          <button class="btn-card primary" style="width:100%; margin-top:8px" onclick="cambiarEstatusGarantia(${g.id})">Actualizar estatus</button>
        </div>
      </div>
    </div>
  `;
  const prev = document.getElementById('modalDetalleGar');
  if (prev) prev.remove();
  document.body.insertAdjacentHTML('beforeend', html);
}

function solicitarValidacionCorreccion(garantiaId) {
  const g = _garantias.find(x => x.id === garantiaId);
  if (!g) return;
  mostrarToast('error', '🚧 Próximamente · Módulo de Validaciones');
  alert('Para solicitar otra corrección del mini báner:\n\n📨 Por ahora, contacta al director del área por WhatsApp o email.\n\nEn la próxima fase tendremos el Módulo de Validaciones para hacerlo desde el sistema.');
}

function cerrarDetalle() {
  const m = document.getElementById('modalDetalleGar');
  if (m) m.remove();
}

async function cambiarEstatusGarantia(id) {
  const nuevo = document.getElementById('cambiar-estatus-gar').value;
  if (nuevo === 'en_pre_dictamen') {
    const g = _garantias.find(x => x.id === id);
    if (g) {
      const v = validarParaPredictamen(g);
      if (!v.valido) {
        mostrarToast('error', '⚠️ Faltan datos · llena el mini báner primero');
        cerrarDetalle();
        abrirModalMiniBaner(id, false);
        return;
      }
    }
  }
  try {
    const { error } = await sb.from('garantias').update({ estatus: nuevo, actualizado_en: new Date().toISOString() }).eq('id', id);
    if (error) { mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', '✓ Estatus actualizado');
    cerrarDetalle();
    await cargarGarantiasTodas();
    renderVistaGarantias();
  } catch (err) { mostrarToast('error', 'Error inesperado'); }
}

async function archivarGarantia(id) {
  if (!confirm('¿Archivar esta garantía?')) return;
  try {
    const { error } = await sb.from('garantias').update({ archivada: true, actualizado_en: new Date().toISOString() }).eq('id', id);
    if (error) { mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', '✓ Archivada');
    _seleccionados.delete(id);
    await cargarGarantiasTodas();
    renderVistaGarantias();
  } catch (err) {}
}

async function eliminarGarantia(id) {
  if (!confirm('¿Eliminar esta garantía?')) return;
  try {
    const { error } = await sb.from('garantias').update({ eliminada: true, actualizado_en: new Date().toISOString() }).eq('id', id);
    if (error) { mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', '✓ Eliminada');
    _seleccionados.delete(id);
    await cargarGarantiasTodas();
    renderVistaGarantias();
  } catch (err) {}
}

function renderPapelera() {
  const cont = document.getElementById('cyg-view-papelera');
  if (!cont) return;
  const archivadas = _garantias.filter(g => g.archivada && !g.eliminada);
  const eliminadas = _garantias.filter(g => g.eliminada);
  const duplicadas = detectarDuplicados();
  cont.innerHTML = `
    <div class="cyg-section">
      <div class="cyg-section-hdr">
        <div style="display:flex; gap:12px; align-items:flex-start; flex:1">
          <div class="cyg-section-ico">🗑️</div>
          <div>
            <h3>Papelera y duplicados</h3>
            <p>Restaura, elimina permanentemente o resuelve duplicados.</p>
          </div>
        </div>
      </div>
      <div class="pap-subtabs">
        <button class="pap-subtab ${_tabPap === 'archivadas' ? 'active' : ''}" onclick="cambiarTabPap('archivadas')">📦 Archivadas (${archivadas.length})</button>
        <button class="pap-subtab ${_tabPap === 'eliminadas' ? 'active' : ''}" onclick="cambiarTabPap('eliminadas')">🗑️ Eliminadas (${eliminadas.length})</button>
        <button class="pap-subtab ${_tabPap === 'duplicadas' ? 'active' : ''}" onclick="cambiarTabPap('duplicadas')">⚠️ Duplicadas (${duplicadas.length})</button>
      </div>
      <div id="pap-contenido"></div>
    </div>
  `;
  renderPapelerasubtab();
}

function cambiarTabPap(sub) { _tabPap = sub; renderPapelera(); }

function renderPapelerasubtab() {
  const cont = document.getElementById('pap-contenido');
  if (!cont) return;
  if (_tabPap === 'archivadas') {
    const lista = _garantias.filter(g => g.archivada && !g.eliminada);
    if (!lista.length) { cont.innerHTML = `<div class="empty-state-mini"><div class="icon-mini">📦</div><p>No hay archivadas.</p></div>`; return; }
    cont.innerHTML = `<div class="pap-list">${lista.map(g => filaPapelera(g, 'archivada')).join('')}</div>`;
  } else if (_tabPap === 'eliminadas') {
    const lista = _garantias.filter(g => g.eliminada);
    if (!lista.length) { cont.innerHTML = `<div class="empty-state-mini"><div class="icon-mini">🗑️</div><p>No hay eliminadas.</p></div>`; return; }
    cont.innerHTML = `<div class="pap-list">${lista.map(g => filaPapelera(g, 'eliminada')).join('')}</div>`;
  } else if (_tabPap === 'duplicadas') {
    const dups = detectarDuplicados();
    if (!dups.length) { cont.innerHTML = `<div class="empty-state-mini"><div class="icon-mini">✓</div><p>No se detectaron duplicados.</p></div>`; return; }
    cont.innerHTML = `<div class="pap-list">${dups.map(par => `
      <div class="pap-duplicado">
        <div class="pap-dup-header">⚠️ Misma dirección normalizada</div>
        <div class="pap-dup-pair">
          ${[par.a, par.b].map(g => `
            <div class="pap-dup-card">
              <div class="cyg-cartera-folio">${escapeHtml(g.folio || '')}</div>
              <div class="cyg-cartera-name">${escapeHtml(g.direccion || '')}</div>
              <div style="font-size:11px; color:var(--text-tertiary); margin-top:4px">Cartera: ${escapeHtml((_carteras.find(c => c.id === g.cartera_id) || {}).folio || '—')}</div>
              <button class="btn-mini danger" style="margin-top:8px" onclick="eliminarGarantia(${g.id})">🗑️ Eliminar esta</button>
              <button class="btn-mini" style="margin-top:8px" onclick="abrirDetalleGarantia(${g.id})">👁️ Ver</button>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}</div>`;
  }
}

function filaPapelera(g, tipo) {
  const cartera = _carteras.find(c => c.id === g.cartera_id);
  return `
    <div class="pap-item">
      <div style="flex:1; min-width:0">
        <div class="cyg-cartera-folio">${escapeHtml(g.folio || '')}</div>
        <div class="cyg-cartera-name">${escapeHtml(g.direccion || '')}</div>
        <div style="font-size:11px; color:var(--text-tertiary); margin-top:4px">📂 ${cartera ? escapeHtml(cartera.folio || '') : '—'} · ${escapeHtml(g.tipo_caso || '')}</div>
      </div>
      <div style="display:flex; gap:6px">
        <button class="btn-mini" onclick="restaurarGarantia(${g.id}, '${tipo}')">↩️ Restaurar</button>
        ${tipo === 'eliminada' ? `<button class="btn-mini danger" onclick="eliminarPermanente(${g.id})">💀 Borrar permanente</button>` : ''}
      </div>
    </div>
  `;
}

function detectarDuplicados() {
  const dups = [];
  const activas = _garantias.filter(g => !g.archivada && !g.eliminada);
  for (let i = 0; i < activas.length; i++) {
    for (let j = i + 1; j < activas.length; j++) {
      if (activas[i].direccion_norm && activas[i].direccion_norm === activas[j].direccion_norm) {
        dups.push({ a: activas[i], b: activas[j] });
      }
    }
  }
  return dups;
}

async function restaurarGarantia(id, tipo) {
  if (!confirm(`¿Restaurar esta garantía?`)) return;
  const update = tipo === 'archivada' ? { archivada: false } : { eliminada: false };
  try {
    const { error } = await sb.from('garantias').update({ ...update, actualizado_en: new Date().toISOString() }).eq('id', id);
    if (error) { mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', '✓ Restaurada');
    await cargarGarantiasTodas();
    renderPapelera();
  } catch (err) {}
}

async function eliminarPermanente(id) {
  if (!confirm('⚠️ ¿Borrar PERMANENTEMENTE? NO SE PUEDE DESHACER.')) return;
  try {
    const { error } = await sb.from('garantias').delete().eq('id', id);
    if (error) { mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', '✓ Borrada permanentemente');
    await cargarGarantiasTodas();
    renderPapelera();
  } catch (err) {}
}
