/* ═══════════════════════════════════════════════════════════════
   SIGA · siga-carteras.js · DIIPA
   MÓDULO: Carteras y Garantías (Fase 3.3)
═══════════════════════════════════════════════════════════════ */

/* ─── 28 TIPOS DE CASO AGRUPADOS CON POSICIÓN PROCESAL ─── */
const TIPOS_CASO_GRUPOS = [
  {
    label: '🔴 DEMANDADO · Defensa de propiedad (DIIPA defiende)',
    posicion: 'DEMANDADO',
    tipos: [
      'Juicio Especial Hipotecario',
      'Juicio Ejecutivo Mercantil',
      'Juicio Ordinario Civil',
      'Juicio Ordinario Mercantil',
      'Juicio Hipotecario',
      'Juicio Mercantil',
      'Juicio Civil'
    ]
  },
  {
    label: '🛡️ ACTOR · DIIPA demanda',
    posicion: 'ACTOR',
    tipos: [
      'Actor · Recuperación hipotecaria',
      'Actor · Recuperación mercantil',
      'Actor · Acción reivindicatoria',
      'Actor · Otro juicio como demandante'
    ]
  },
  {
    label: '🏠 USUCAPIÓN · Prescripción adquisitiva',
    posicion: 'USUCAPION',
    tipos: [
      'Prescripción Adquisitiva (Usucapión)',
      'Usucapión positiva (con juicio en curso)',
      'Usucapión por iniciar (posesión sin demanda)'
    ]
  },
  {
    label: '📜 SUCESIÓN · Herencias y testamentarías',
    posicion: 'SUCESION',
    tipos: [
      'Sucesión / Herencia sin tramitar',
      'Juicio Sucesorio (Testamentario)',
      'Juicio Sucesorio (Intestamentario)'
    ]
  },
  {
    label: '🏘️ CONTINGENCIAS INMOBILIARIAS · Defectos de propiedad',
    posicion: 'CONTINGENCIAS',
    tipos: [
      'Escritura sin posesión',
      'Posesión sin escritura',
      'Copropietarios ausentes / proindiviso',
      'Defecto registral',
      'Diligencias de jurisdicción voluntaria',
      'Otra contingencia (especificar después)'
    ]
  },
  {
    label: '📑 TRÁMITES ADMINISTRATIVOS · Procesos no civiles',
    posicion: 'TRAMITES',
    tipos: [
      'Juicio de Amparo',
      'Juicio Contencioso-Administrativo',
      'Juicio Laboral'
    ]
  },
  {
    label: '❓ OTROS · Sin categoría definida',
    posicion: 'OTROS',
    tipos: [
      'Otro juicio (especificar después)'
    ]
  }
];

const POSICIONES_PROCESALES = {
  ACTOR:         { label: '🟢 ACTOR',         sub: 'Cartera Litigiosa',         activo: true,  color: '#15803d' },
  DEMANDADO:     { label: '🔴 DEMANDADO',     sub: 'Defensa de Propiedad',      activo: true,  color: '#b91c1c' },
  USUCAPION:     { label: '🟣 USUCAPIÓN',     sub: 'Posesión / Adjudicación',   activo: true,  color: '#5b21b6' },
  SUCESION:      { label: '📜 SUCESIÓN',      sub: 'Herencias (en construcción)', activo: false, color: '#0891b2' },
  CONTINGENCIAS: { label: '🏘️ CONTINGENCIAS', sub: 'Inmobiliarias (en construcción)', activo: false, color: '#ca8a04' },
  TRAMITES:      { label: '📑 TRÁMITES',      sub: 'Administrativos (en construcción)', activo: false, color: '#6366f1' },
  OTROS:         { label: '❓ OTROS',         sub: 'Sin categoría',             activo: false, color: '#64748b' }
};

const ESTATUS_GARANTIA = [
  { id: 'registrada',       label: '📥 Registrada',           color: '#94A3B8' },
  { id: 'en_pre_dictamen',  label: '⚖️ En pre-dictamen URRJ',  color: '#7C3AED' },
  { id: 'aprobada',         label: '✓ Aprobada',              color: '#0F6E56' },
  { id: 'publicada',        label: '📢 Publicada',            color: '#0C447C' },
  { id: 'en_apartado',      label: '🤝 En apartado',          color: '#F59E0B' },
  { id: 'vendida',          label: '💰 Vendida',              color: '#16A34A' },
  { id: 'rechazada',        label: '✕ Rechazada',             color: '#DC2626' },
  { id: 'archivada',        label: '📦 Archivada',            color: '#64748B' }
];

const TIPOS_ORIGEN = [
  { id: 'ADM', label: 'Administradora (convenio)' },
  { id: 'PRO', label: 'Activo propio' },
  { id: 'EXT', label: 'Externa (compra de derechos)' }
];

const ACREEDORES_SUGERIDOS = [
  'BBVA', 'Santander', 'Banamex', 'Banorte', 'HSBC', 'Scotiabank', 'BanBajío',
  'Banco Azteca', 'Banco Mercantil del Norte', 'Inbursa',
  'INFONAVIT', 'FOVISSSTE', 'ISSSTE', 'IMSS', 'PensionISSSTE',
  'GMAC', 'Hipotecaria Su Casita', 'Hipotecaria Crédito y Casa',
  'Sociedad Hipotecaria Federal', 'FONAHPO', 'Otro'
];

let _carteras = [];
let _garantias = [];
let _filtroCarteraId = '';
let _filtroEstatusGar = '';
let _busquedaGar = '';
let _editandoCarteraId = null;
let _editandoGarantiaId = null;
let _tabCyG = 'principal';
let _acreedoresActuales = [];
let _filasParaSubir = [];
let _filasDuplicadas = [];
let _filasError = [];

function detectarPosicionProcesal(tipoCaso) {
  if (!tipoCaso) return 'OTROS';
  for (const grupo of TIPOS_CASO_GRUPOS) {
    if (grupo.tipos.includes(tipoCaso)) return grupo.posicion;
  }
  return 'OTROS';
}

async function inicializarCyG() {
  await Promise.all([cargarCarteras(), cargarGarantias()]);
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

async function cargarGarantias() {
  try {
    const { data, error } = await sb.from('garantias').select('*').eq('eliminada', false).order('folio', { ascending: true });
    if (error) { console.error('Error garantías:', error); _garantias = []; return; }
    _garantias = data || [];
  } catch (err) { console.error(err); _garantias = []; }
}

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
    const numGar = _garantias.filter(g => g.cartera_id === c.id && !g.archivada).length;
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
    grupo.tipos.forEach(tipo => {
      html += `<option value="${escapeHtml(tipo)}">${escapeHtml(tipo)}</option>`;
    });
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
  if (!tipoCaso) {
    box.style.display = 'none';
    box.innerHTML = '';
    return;
  }
  const aviso = conf.activo ? '' : '<div style="font-size:10.5px;color:#92400e;margin-top:4px">⚠️ Módulo en construcción · cuando se libere, esta garantía se migrará automáticamente.</div>';
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
      <input type="text" placeholder="${idx === 0 ? 'Acreedor principal (ej. BBVA, INFONAVIT)' : 'Acreedor secundario'}" value="${escapeHtml(a.nombre || '')}" list="listaAcreedoresSugeridos" oninput="actualizarAcreedor(${idx}, 'nombre', this.value)">
      <input type="number" placeholder="Monto $" step="0.01" value="${a.monto || ''}" oninput="actualizarAcreedor(${idx}, 'monto', this.value)">
      ${_acreedoresActuales.length > 1 ? `<button class="btn-mini danger" onclick="quitarAcreedor(${idx})">✕</button>` : '<span style="width:32px"></span>'}
    </div>
  `).join('') + `<button class="btn-mini" onclick="agregarAcreedor()" style="margin-top:6px">+ Agregar acreedor (cofinanciamiento)</button>`;
}

function actualizarAcreedor(idx, campo, valor) {
  if (!_acreedoresActuales[idx]) return;
  _acreedoresActuales[idx][campo] = valor;
}

function agregarAcreedor() {
  _acreedoresActuales.push({ nombre: '', monto: '' });
  renderAcreedores();
}

function quitarAcreedor(idx) {
  _acreedoresActuales.splice(idx, 1);
  if (!_acreedoresActuales.length) _acreedoresActuales = [{ nombre: '', monto: '' }];
  renderAcreedores();
}

async function abrirModalCartera(id) {
  _editandoCarteraId = id;
  const selAdmin = document.getElementById('cart-admin');
  selAdmin.innerHTML = '<option value="">— Sin administradora —</option>' +
    _admins.filter(a => a.estatus === 'activa').map(a => `<option value="${a.id}">${escapeHtml(a.folio || '')} · ${escapeHtml(a.nombre || '')}</option>`).join('');
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

function cerrarModalCartera() {
  document.getElementById('modalCartera').classList.remove('show');
  _editandoCarteraId = null;
}

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
    folio: document.getElementById('cart-folio').value.trim(),
    nombre: nombre,
    admin_id: adminVal ? parseInt(adminVal) : null,
    tipo_origen: document.getElementById('cart-origen').value,
    estatus: document.getElementById('cart-estatus').value,
    fecha_ingreso: document.getElementById('cart-fingreso').value || null,
    fecha_cierre_estimada: document.getElementById('cart-fcierre').value || null,
    notas: document.getElementById('cart-notas').value.trim() || null,
    actualizado_en: new Date().toISOString()
  };
  const btn = document.getElementById('btnGuardarCartera');
  btn.disabled = true;
  btn.textContent = 'Guardando...';
  try {
    let res;
    if (_editandoCarteraId) {
      res = await sb.from('carteras').update(payload).eq('id', _editandoCarteraId);
    } else {
      payload.creado_por = _userEmail;
      payload.creado_en = new Date().toISOString();
      res = await sb.from('carteras').insert(payload);
    }
    if (res.error) { console.error(res.error); mostrarToast('error', 'Error: ' + res.error.message); return; }
    cerrarModalCartera();
    mostrarToast('success', _editandoCarteraId ? '✓ Cartera actualizada' : '✓ Cartera creada');
    await cargarCarteras();
    renderCarterasGrid();
    poblarSelectCarteras();
  } catch (err) { console.error(err); mostrarToast('error', 'Error inesperado'); }
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
  if (dup) {
    mostrarToast('error', '⚠️ Ya existe una garantía con esa dirección (' + (dup.folio || '') + ')');
    return;
  }

  const acreedoresLimpios = _acreedoresActuales
    .map(a => ({ nombre: (a.nombre || '').trim(), monto: parseFloat(a.monto) || null }))
    .filter(a => a.nombre);

  const folio = await generarFolioGarantia();
  const posicion = detectarPosicionProcesal(tipoCaso);

  const payload = {
    folio: folio,
    cartera_id: parseInt(carteraId),
    tipo_caso: tipoCaso,
    posicion_procesal: posicion,
    acreedores: acreedoresLimpios,
    num_credito: document.getElementById('gar-num-credito').value.trim() || null,
    direccion: direccion,
    direccion_norm: direccionNorm,
    estado_mx: document.getElementById('gar-estado').value.trim() || null,
    municipio: document.getElementById('gar-municipio').value.trim() || null,
    valor_estimado: parseFloat(document.getElementById('gar-valor').value) || null,
    precio_piso: parseFloat(document.getElementById('gar-precio-piso').value) || null,
    m2_terreno: parseFloat(document.getElementById('gar-m2-terreno').value) || null,
    m2_construccion: parseFloat(document.getElementById('gar-m2-construccion').value) || null,
    estatus: 'registrada',
    creado_por: _userEmail,
    creado_en: new Date().toISOString()
  };

  const btn = document.getElementById('btnGuardarGarantia');
  btn.disabled = true;
  btn.textContent = 'Guardando...';
  try {
    const { error } = await sb.from('garantias').insert(payload);
    if (error) { console.error(error); mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', '✓ Garantía ' + folio + ' agregada · Posición: ' + posicion);
    limpiarFormGarantia();
    await cargarGarantias();
    renderCarterasGrid();
  } catch (err) { console.error(err); mostrarToast('error', 'Error inesperado'); }
  finally { btn.disabled = false; btn.textContent = '+ Agregar Garantía'; }
}

function limpiarFormGarantia() {
  document.getElementById('gar-num-credito').value = '';
  document.getElementById('gar-direccion').value = '';
  document.getElementById('gar-estado').value = '';
  document.getElementById('gar-municipio').value = '';
  document.getElementById('gar-valor').value = '';
  document.getElementById('gar-precio-piso').value = '';
  document.getElementById('gar-m2-terreno').value = '';
  document.getElementById('gar-m2-construccion').value = '';
  document.getElementById('gar-tipo-caso').value = '';
  document.getElementById('gar-posicion-detectada').style.display = 'none';
  _acreedoresActuales = [{ nombre: '', monto: '' }];
  renderAcreedores();
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

function procesarArchivoMasivo(file) {
  if (!file) return;
  if (typeof XLSX === 'undefined') {
    mostrarToast('error', 'Librería SheetJS no cargada. Recarga la página.');
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      validarYPreparar(rows);
    } catch (err) {
      console.error(err);
      mostrarToast('error', 'Error al leer el archivo. Verifica el formato.');
    }
  };
  reader.readAsArrayBuffer(file);
}

function validarYPreparar(rows) {
  _filasParaSubir = [];
  _filasDuplicadas = [];
  _filasError = [];
  const carterasByFolio = {};
  _carteras.forEach(c => { if (c.folio) carterasByFolio[c.folio.toUpperCase()] = c; });
  const direccionesExistentes = new Set(_garantias.map(g => g.direccion_norm).filter(Boolean));
  const direccionesEnArchivo = new Set();

  rows.forEach((row, idx) => {
    const numFila = idx + 2;
    const carteraFolio = String(row.cartera_folio || '').trim().toUpperCase();
    const direccion = String(row.direccion || '').trim();
    const tipoCaso = String(row.tipo_caso || '').trim();
    if (!carteraFolio || !direccion || !tipoCaso) {
      _filasError.push({ fila: numFila, razon: 'Faltan campos obligatorios', row });
      return;
    }
    const cartera = carterasByFolio[carteraFolio];
    if (!cartera) {
      _filasError.push({ fila: numFila, razon: 'Cartera no encontrada: ' + carteraFolio, row });
      return;
    }
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
      cartera_id: cartera.id,
      tipo_caso: tipoCaso,
      posicion_procesal: detectarPosicionProcesal(tipoCaso),
      acreedores: acreedores,
      direccion: direccion,
      direccion_norm: direccionNorm,
      estado_mx: String(row.estado_mx || '').trim() || null,
      municipio: String(row.municipio || '').trim() || null,
      num_credito: String(row.num_credito || '').trim() || null,
      valor_estimado: parseFloat(row.valor_estimado) || null,
      precio_piso: parseFloat(row.precio_piso) || null,
      m2_terreno: parseFloat(row.m2_terreno) || null,
      m2_construccion: parseFloat(row.m2_construccion) || null,
      notas: String(row.notas || '').trim() || null,
      estatus: 'registrada',
      creado_por: _userEmail,
      creado_en: new Date().toISOString()
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
  } catch (err) { console.error(err); }
  const conFolios = _filasParaSubir.map((f, i) => ({ ...f, folio: 'GAR-' + String(nextNum + i).padStart(4, '0') }));
  try {
    const { error } = await sb.from('garantias').insert(conFolios);
    if (error) { console.error(error); mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', `✓ ${conFolios.length} garantías subidas`);
    cancelarCargaMasiva();
    await cargarGarantias();
    renderCarterasGrid();
  } catch (err) { console.error(err); mostrarToast('error', 'Error inesperado'); }
}

function cancelarCargaMasiva() {
  _filasParaSubir = [];
  _filasDuplicadas = [];
  _filasError = [];
  const cont = document.getElementById('cyg-reporte');
  if (cont) cont.innerHTML = '';
  const fileInput = document.getElementById('cyg-file-input');
  if (fileInput) fileInput.value = '';
}

function renderVistaGarantias() {
  const cont = document.getElementById('cyg-view-vista');
  if (!cont) return;
  cont.innerHTML = `<div class="placeholder"><div class="icon-big">🚧</div><h3>Vista por Garantías y Propiedades</h3><p>Se construye en la sub-fase 3.3-C.</p></div>`;
}

function renderPapelera() {
  const cont = document.getElementById('cyg-view-papelera');
  if (!cont) return;
  cont.innerHTML = `<div class="placeholder"><div class="icon-big">🚧</div><h3>Papelera y duplicados</h3><p>Se construye en la sub-fase 3.3-D.</p></div>`;
}

/* ═══ FIN siga-carteras.js ═══ */
