/* ═══════════════════════════════════════════════════════════════
   SIGA · siga-admin.js · DIIPA
   MÓDULO: Administradoras + Bitácora + Negociaciones (Fase 3.2)
   
   Variables globales que vienen de carteras.html:
     · sb (cliente Supabase)
     · _userEmail (email del usuario logueado)
     · _esAutorizado (true/false según permisos)
     · escapeHtml(), mostrarToast() (utilidades)
═══════════════════════════════════════════════════════════════ */

/* ─── CATÁLOGO DE TIPOS · 2 GRUPOS ─── */
const TIPOS_GARANTIAS = [
  { id: 'escrituras',     label: 'Escrituras directas' },
  { id: 'cesion_hipot',   label: 'Cesión de derechos hipotecarios' },
  { id: 'adjud_judicial', label: 'Adjudicaciones judiciales' },
  { id: 'adjud_notarial', label: 'Adjudicaciones notariales' },
  { id: 'compraventa_rd', label: 'Compraventa con reserva de dominio' }
];

const TIPOS_CONTINGENCIAS = [
  { id: 'contingencia',      label: 'Garantías con contingencia jurídica' },
  { id: 'embargo_mercantil', label: 'Embargos mercantiles' },
  { id: 'posesion',          label: 'Posesión litigiosa' },
  { id: 'cartera_vencida',   label: 'Cartera vencida hipotecaria' },
  { id: 'juicio_hipot',      label: 'Juicio Especial Hipotecario' },
  { id: 'juicio_mercantil',  label: 'Juicio Ejecutivo Mercantil' },
  { id: 'bienes_cont',       label: 'Bienes con contingencia jurídica' }
];

/* ─── ESTADO MÓDULO ADMINISTRADORAS ─── */
let _admins = [];
let _filtroEstatus = '';
let _busqueda = '';
let _editandoId = null;

/* ─── ESTADO BITÁCORA Y NEGOCIACIONES ─── */
let _adminActualId = null;
let _adminActualNombre = null;
let _bitacora = [];
let _negociaciones = [];
let _editandoNotaId = null;
let _editandoNegoId = null;
let _tabActual = 'bitacora';

/* ═══════════════════════════════════════════════════════════════
   INICIALIZAR MÓDULO ADMINISTRADORAS
═══════════════════════════════════════════════════════════════ */
async function inicializarAdmin() {
  pintarTiposEnModal();
  await cargarAdmins();
}

function pintarTiposEnModal() {
  const contGar = document.getElementById('tiposGarGrid');
  if (contGar) {
    contGar.innerHTML = TIPOS_GARANTIAS.map(t => `
      <label class="tipo-check">
        <input type="checkbox" value="${t.id}" data-tipo-gar>
        <span>${t.label}</span>
      </label>
    `).join('');
  }
  const contCont = document.getElementById('tiposContGrid');
  if (contCont) {
    contCont.innerHTML = TIPOS_CONTINGENCIAS.map(t => `
      <label class="tipo-check">
        <input type="checkbox" value="${t.id}" data-tipo-cont>
        <span>${t.label}</span>
      </label>
    `).join('');
  }
}

async function cargarAdmins() {
  try {
    const { data, error } = await sb
      .from('administradoras')
      .select('*')
      .order('folio', { ascending: true });
    if (error) {
      console.error('Error al cargar:', error);
      mostrarToast('error', 'No se pudieron cargar las administradoras');
      return;
    }
    _admins = data || [];
    renderTodo();
  } catch (err) {
    console.error(err);
    mostrarToast('error', 'Error inesperado');
  }
}

function renderTodo() {
  renderKpis();
  renderTarjetas();
}

function renderKpis() {
  const total = _admins.length;
  const activas = _admins.filter(a => a.estatus === 'activa').length;
  const tiposGar = new Set();
  _admins.forEach(a => (a.tipos_garantias || []).forEach(t => tiposGar.add(t)));
  const tiposCont = new Set();
  _admins.forEach(a => (a.tipos_contingencias || []).forEach(t => tiposCont.add(t)));
  const elT = document.getElementById('kpi-total');
  const elA = document.getElementById('kpi-activas');
  const elI = document.getElementById('kpi-inactivas');
  const elTi = document.getElementById('kpi-tipos');
  if (elT) elT.textContent = total;
  if (elA) elA.textContent = activas;
  if (elI) elI.textContent = _admins.filter(a => a.estatus === 'inactiva').length;
  if (elTi) elTi.textContent = tiposGar.size + tiposCont.size;
}

function renderTarjetas() {
  const grid = document.getElementById('adminGrid');
  if (!grid) return;
  let lista = _admins;
  if (_filtroEstatus) lista = lista.filter(a => a.estatus === _filtroEstatus);
  if (_busqueda) {
    const q = _busqueda.toLowerCase();
    lista = lista.filter(a =>
      (a.nombre || '').toLowerCase().includes(q) ||
      (a.folio || '').toLowerCase().includes(q) ||
      (a.contacto_nombre || '').toLowerCase().includes(q) ||
      (a.contacto_email || '').toLowerCase().includes(q)
    );
  }
  if (!lista.length) {
    if (_admins.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="icon-big">🏦</div>
          <h3>Aún no hay administradoras</h3>
          <p>Crea la primera administradora para comenzar el catálogo.</p>
          <button class="btn-empty" onclick="abrirModalNueva()">+ Crear primera administradora</button>
        </div>
      `;
    } else {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="icon-big">🔍</div>
          <h3>Sin resultados</h3>
          <p>No se encontraron administradoras con esa búsqueda o filtro.</p>
        </div>
      `;
    }
    return;
  }
  grid.innerHTML = lista.map(a => construirTarjeta(a)).join('');
}

function construirTarjeta(a) {
  const tieneCont = !!(a.contacto_email || a.contacto_nombre || a.contacto_telefono);
  let contactoHtml = '';
  if (tieneCont) {
    contactoHtml = `
      <div class="admin-contacto">
        ${a.contacto_nombre ? `<div class="row"><span class="ico">👤</span><span>${escapeHtml(a.contacto_nombre)}</span></div>` : ''}
        ${a.contacto_email ? `<div class="row"><span class="ico">✉️</span><span>${escapeHtml(a.contacto_email)}</span></div>` : ''}
        ${a.contacto_telefono ? `<div class="row"><span class="ico">☎️</span><span>${escapeHtml(a.contacto_telefono)}</span></div>` : ''}
      </div>
    `;
  } else {
    contactoHtml = `<div class="admin-contacto sin-contacto">⚠️ Sin contacto registrado</div>`;
  }
  const nGar = (a.tipos_garantias || []).length + (a.otros_tipos_garantias ? 1 : 0);
  const nCont = (a.tipos_contingencias || []).length + (a.otros_tipos_contingencias ? 1 : 0);
  const tiposHtml = `
    <div class="admin-tipos-wrap">
      <div class="admin-tipo-pill garantias">🏠 <strong>${nGar}</strong> garantía${nGar!==1?'s':''}</div>
      <div class="admin-tipo-pill contingencias">⚠️ <strong>${nCont}</strong> contingencia${nCont!==1?'s':''}</div>
    </div>
  `;
  const tel = normalizarTelefono(a.contacto_telefono);
  const wa = normalizarWhatsApp(a.contacto_whatsapp || a.contacto_telefono);
  const email = a.contacto_email || '';
  const adminIdSafe = a.id;
  const btnCorreo = email
    ? `<button class="btn-com correo" onclick="iniciarComunicacion(${adminIdSafe}, 'correo')" title="Enviar correo">✉️</button>`
    : `<button class="btn-com disabled" disabled title="Sin email">✉️</button>`;
  const btnLlamar = tel
    ? `<button class="btn-com llamar" onclick="iniciarComunicacion(${adminIdSafe}, 'llamada')" title="Llamar">☎️</button>`
    : `<button class="btn-com disabled" disabled title="Sin teléfono">☎️</button>`;
  const btnWA = wa
    ? `<button class="btn-com whatsapp" onclick="iniciarComunicacion(${adminIdSafe}, 'whatsapp')" title="WhatsApp">💬</button>`
    : `<button class="btn-com disabled" disabled title="Sin WhatsApp">💬</button>`;
  return `
    <div class="admin-card">
      <div class="admin-card-hdr">
        <div class="admin-card-ico">🏦</div>
        <div class="admin-card-title">
          <div class="admin-card-folio">${escapeHtml(a.folio || '—')}</div>
          <div class="admin-card-name" title="${escapeHtml(a.nombre)}">${escapeHtml(a.nombre)}</div>
          <span class="estatus-badge ${a.estatus || 'activa'}">${a.estatus === 'inactiva' ? '⏸ Inactiva' : '✓ Activa'}</span>
        </div>
      </div>
      ${contactoHtml}
      ${tiposHtml}
      <div class="admin-com-row">
        ${btnCorreo}
        ${btnLlamar}
        ${btnWA}
      </div>
      <div class="admin-actions">
        <button class="btn-card primary" onclick="abrirSeguimiento(${adminIdSafe})">📋 Seguimiento</button>
        <button class="btn-card secondary" onclick="abrirModalEditar(${adminIdSafe})">✏️ Editar</button>
      </div>
    </div>
  `;
}

function normalizarTelefono(num) {
  if (!num) return '';
  return String(num).replace(/[^\d+]/g, '');
}

function normalizarWhatsApp(num) {
  if (!num) return '';
  let limpio = String(num).replace(/[^\d]/g, '');
  if (!limpio) return '';
  if (limpio.length === 10) limpio = '52' + limpio;
  return limpio;
}

function filtrarAdmins() {
  _busqueda = document.getElementById('adminBuscar').value || '';
  renderTarjetas();
}

function filtrarEstatus(est) {
  _filtroEstatus = est;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.est === est);
  });
  renderTarjetas();
}

async function abrirModalNueva() {
  _editandoId = null;
  document.getElementById('modalTitulo').textContent = 'Nueva Administradora';
  const folio = await generarFolioAuto();
  document.getElementById('f-folio').value = folio;
  document.getElementById('f-estatus').value = 'activa';
  document.getElementById('f-nombre').value = '';
  document.getElementById('f-cnombre').value = '';
  document.getElementById('f-ccargo').value = '';
  document.getElementById('f-ctel').value = '';
  document.getElementById('f-cwhatsapp').value = '';
  document.getElementById('f-cemail').value = '';
  document.getElementById('f-domicilio').value = '';
  document.getElementById('f-rfc').value = '';
  document.getElementById('f-notas').value = '';
  document.getElementById('f-otros-gar').value = '';
  document.getElementById('f-otros-cont').value = '';
  document.querySelectorAll('[data-tipo-gar]').forEach(cb => cb.checked = false);
  document.querySelectorAll('[data-tipo-cont]').forEach(cb => cb.checked = false);
  document.getElementById('modalAdmin').classList.add('show');
}

function abrirModalEditar(id) {
  const a = _admins.find(x => x.id === id);
  if (!a) return;
  _editandoId = id;
  document.getElementById('modalTitulo').textContent = 'Editar Administradora · ' + (a.folio || '');
  document.getElementById('f-folio').value = a.folio || '';
  document.getElementById('f-estatus').value = a.estatus || 'activa';
  document.getElementById('f-nombre').value = a.nombre || '';
  document.getElementById('f-cnombre').value = a.contacto_nombre || '';
  document.getElementById('f-ccargo').value = a.contacto_cargo || '';
  document.getElementById('f-ctel').value = a.contacto_telefono || '';
  document.getElementById('f-cwhatsapp').value = a.contacto_whatsapp || '';
  document.getElementById('f-cemail').value = a.contacto_email || '';
  document.getElementById('f-domicilio').value = a.domicilio || '';
  document.getElementById('f-rfc').value = a.rfc || '';
  document.getElementById('f-notas').value = a.notas_internas || '';
  document.getElementById('f-otros-gar').value = a.otros_tipos_garantias || '';
  document.getElementById('f-otros-cont').value = a.otros_tipos_contingencias || '';
  const tiposG = a.tipos_garantias || [];
  document.querySelectorAll('[data-tipo-gar]').forEach(cb => { cb.checked = tiposG.includes(cb.value); });
  const tiposC = a.tipos_contingencias || [];
  document.querySelectorAll('[data-tipo-cont]').forEach(cb => { cb.checked = tiposC.includes(cb.value); });
  document.getElementById('modalAdmin').classList.add('show');
}

function cerrarModalAdmin() {
  document.getElementById('modalAdmin').classList.remove('show');
  _editandoId = null;
}

async function generarFolioAuto() {
  try {
    const { data, error } = await sb
      .from('administradoras')
      .select('folio')
      .ilike('folio', 'ADM-%')
      .order('folio', { ascending: false })
      .limit(1);
    if (error || !data || !data.length) return 'ADM-001';
    const ultimo = data[0].folio || '';
    const num = parseInt(ultimo.split('-')[1]) || 0;
    return 'ADM-' + String(num + 1).padStart(3, '0');
  } catch (err) { return 'ADM-001'; }
}

async function guardarAdmin() {
  const nombre = document.getElementById('f-nombre').value.trim();
  if (!nombre) { mostrarToast('error', 'El nombre / razón social es obligatorio'); return; }
  const tiposGarSel = Array.from(document.querySelectorAll('[data-tipo-gar]:checked')).map(cb => cb.value);
  const tiposContSel = Array.from(document.querySelectorAll('[data-tipo-cont]:checked')).map(cb => cb.value);
  const payload = {
    folio: document.getElementById('f-folio').value.trim(),
    nombre: nombre,
    estatus: document.getElementById('f-estatus').value,
    contacto_nombre: document.getElementById('f-cnombre').value.trim() || null,
    contacto_cargo: document.getElementById('f-ccargo').value.trim() || null,
    contacto_telefono: document.getElementById('f-ctel').value.trim() || null,
    contacto_whatsapp: document.getElementById('f-cwhatsapp').value.trim() || null,
    contacto_email: document.getElementById('f-cemail').value.trim() || null,
    domicilio: document.getElementById('f-domicilio').value.trim() || null,
    rfc: document.getElementById('f-rfc').value.trim().toUpperCase() || null,
    notas_internas: document.getElementById('f-notas').value.trim() || null,
    tipos_garantias: tiposGarSel,
    tipos_contingencias: tiposContSel,
    otros_tipos_garantias: document.getElementById('f-otros-gar').value.trim() || null,
    otros_tipos_contingencias: document.getElementById('f-otros-cont').value.trim() || null,
    actualizado_en: new Date().toISOString()
  };
  const btn = document.getElementById('btnGuardar');
  btn.disabled = true;
  btn.textContent = 'Guardando...';
  try {
    let res;
    if (_editandoId) {
      res = await sb.from('administradoras').update(payload).eq('id', _editandoId);
    } else {
      payload.creado_por = _userEmail;
      payload.creado_en = new Date().toISOString();
      res = await sb.from('administradoras').insert(payload);
    }
    if (res.error) { console.error(res.error); mostrarToast('error', 'Error: ' + res.error.message); return; }
    cerrarModalAdmin();
    mostrarToast('success', _editandoId ? '✓ Actualizada' : '✓ Creada');
    await cargarAdmins();
  } catch (err) { console.error(err); mostrarToast('error', 'Error inesperado'); }
  finally { btn.disabled = false; btn.textContent = 'Guardar'; }
}

/* SEGUIMIENTO · Bitácora + Negociaciones */
async function abrirSeguimiento(adminId) {
  const a = _admins.find(x => x.id === adminId);
  if (!a) return;
  _adminActualId = adminId;
  _adminActualNombre = a.nombre || '—';
  _tabActual = 'bitacora';
  document.getElementById('segTitulo').textContent = (a.folio || '') + ' · ' + (a.nombre || '');
  document.getElementById('segSubtitulo').textContent = 'Bitácora de comunicaciones y negociaciones';
  await Promise.all([cargarBitacora(adminId), cargarNegociaciones(adminId)]);
  cambiarTab('bitacora');
  document.getElementById('modalSeguimiento').classList.add('show');
}

function cerrarSeguimiento() {
  document.getElementById('modalSeguimiento').classList.remove('show');
  _adminActualId = null;
  _adminActualNombre = null;
}

function cambiarTab(tab) {
  _tabActual = tab;
  document.querySelectorAll('.seg-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  document.getElementById('segViewBitacora').style.display = tab === 'bitacora' ? 'block' : 'none';
  document.getElementById('segViewNego').style.display = tab === 'negociaciones' ? 'block' : 'none';
  if (tab === 'bitacora') renderBitacora();
  if (tab === 'negociaciones') renderNegociaciones();
}

async function cargarBitacora(adminId) {
  try {
    const { data, error } = await sb.from('admin_bitacora').select('*').eq('admin_id', adminId).order('fecha_evento', { ascending: false });
    if (error) { console.error(error); _bitacora = []; return; }
    _bitacora = data || [];
  } catch (err) { console.error(err); _bitacora = []; }
}

function renderBitacora() {
  const cont = document.getElementById('segViewBitacora');
  if (!_bitacora.length) {
    cont.innerHTML = `<div class="seg-empty"><div class="seg-empty-ico">📋</div><h4>Aún no hay notas</h4><p>Agrega la primera nota de comunicación con esta administradora.</p><button class="btn-nueva" onclick="abrirModalNota(null)">+ Agregar nota</button></div>`;
    return;
  }
  const items = _bitacora.map(n => construirItemBitacora(n)).join('');
  cont.innerHTML = `<div class="seg-actions-bar"><button class="btn-nueva" onclick="abrirModalNota(null)">+ Agregar nota</button></div><div class="bitacora-list">${items}</div>`;
}

function construirItemBitacora(n) {
  const tipoConfig = {
    correo:   { ico: '✉️', label: 'Correo' },
    llamada:  { ico: '☎️', label: 'Llamada' },
    whatsapp: { ico: '💬', label: 'WhatsApp' },
    nota:     { ico: '📝', label: 'Nota' },
    reunion:  { ico: '🤝', label: 'Reunión' }
  };
  const t = tipoConfig[n.tipo] || tipoConfig.nota;
  const fecha = n.fecha_evento ? new Date(n.fecha_evento).toLocaleString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const estatusBadge = `<span class="estatus-mini ${n.estatus || 'terminada'}">${n.estatus === 'pendiente' ? '⏳ Pendiente' : n.estatus === 'hecha' ? '✓ Hecha' : '◉ Terminada'}</span>`;
  const negoTag = n.negociacion_id ? `<span class="nego-tag">📋 NEG-${n.negociacion_id}</span>` : '';
  const siguiente = n.siguiente_accion ? `<div class="nota-siguiente"><strong>Siguiente acción:</strong> ${escapeHtml(n.siguiente_accion)}</div>` : '';
  return `<div class="bitacora-item"><div class="bitacora-ico">${t.ico}</div><div class="bitacora-body"><div class="bitacora-hdr"><div class="bitacora-titulo">${escapeHtml(n.titulo || '(Sin título)')}</div><div class="bitacora-meta"><span class="tipo-tag">${t.label}</span>${estatusBadge}${negoTag}</div></div><div class="bitacora-fecha">${fecha}</div>${n.comentario ? `<div class="bitacora-comentario">${escapeHtml(n.comentario)}</div>` : ''}${siguiente}<div class="bitacora-actions"><button class="btn-mini" onclick="abrirModalNota(${n.id})">✏️ Editar</button><button class="btn-mini danger" onclick="eliminarNota(${n.id})">🗑️ Eliminar</button></div></div></div>`;
}

function iniciarComunicacion(adminId, tipo) {
  const a = _admins.find(x => x.id === adminId);
  if (!a) return;
  if (tipo === 'correo' && a.contacto_email) {
    window.open('mailto:' + encodeURIComponent(a.contacto_email) + '?subject=' + encodeURIComponent('DIIPA · ' + (a.nombre || '')), '_self');
  } else if (tipo === 'llamada' && a.contacto_telefono) {
    window.open('tel:' + normalizarTelefono(a.contacto_telefono), '_self');
  } else if (tipo === 'whatsapp') {
    const wa = normalizarWhatsApp(a.contacto_whatsapp || a.contacto_telefono);
    if (!wa) { mostrarToast('error', 'Sin WhatsApp registrado'); return; }
    window.open('https://wa.me/' + wa, '_blank');
  }
  setTimeout(() => {
    if (confirm('¿Quieres registrar esta comunicación en la bitácora?')) {
      _adminActualId = adminId;
      _adminActualNombre = a.nombre;
      abrirModalNota(null, tipo);
    }
  }, 800);
}

async function abrirModalNota(notaId, tipoSugerido) {
  if (!_adminActualId) return;
  _editandoNotaId = notaId;
  if (!_negociaciones.length) await cargarNegociaciones(_adminActualId);
  const selectNego = document.getElementById('nota-nego');
  selectNego.innerHTML = '<option value="">— Sin negociación específica —</option>' +
    _negociaciones.map(n => `<option value="${n.id}">${escapeHtml(n.folio || '')} · ${escapeHtml(n.titulo || '')}</option>`).join('');
  if (notaId) {
    const n = _bitacora.find(x => x.id === notaId);
    if (!n) return;
    document.getElementById('notaTitulo').textContent = 'Editar nota';
    document.getElementById('nota-tipo').value = n.tipo || 'nota';
    document.getElementById('nota-asunto').value = n.titulo || '';
    document.getElementById('nota-comentario').value = n.comentario || '';
    document.getElementById('nota-siguiente').value = n.siguiente_accion || '';
    document.getElementById('nota-estatus').value = n.estatus || 'terminada';
    document.getElementById('nota-nego').value = n.negociacion_id || '';
    document.getElementById('nota-fecha').value = n.fecha_evento ? n.fecha_evento.substring(0, 16) : '';
  } else {
    document.getElementById('notaTitulo').textContent = 'Nueva nota · ' + (_adminActualNombre || '');
    document.getElementById('nota-tipo').value = tipoSugerido || 'nota';
    document.getElementById('nota-asunto').value = '';
    document.getElementById('nota-comentario').value = '';
    document.getElementById('nota-siguiente').value = '';
    document.getElementById('nota-estatus').value = 'terminada';
    document.getElementById('nota-nego').value = '';
    const ahora = new Date();
    const tz = ahora.getTimezoneOffset() * 60000;
    document.getElementById('nota-fecha').value = new Date(ahora - tz).toISOString().slice(0, 16);
  }
  document.getElementById('modalNota').classList.add('show');
}

function cerrarModalNota() {
  document.getElementById('modalNota').classList.remove('show');
  _editandoNotaId = null;
}

async function guardarNota() {
  const titulo = document.getElementById('nota-asunto').value.trim();
  if (!titulo) { mostrarToast('error', 'El asunto/título es obligatorio'); return; }
  const negoId = document.getElementById('nota-nego').value;
  const payload = {
    admin_id: _adminActualId,
    negociacion_id: negoId ? parseInt(negoId) : null,
    tipo: document.getElementById('nota-tipo').value,
    titulo: titulo,
    comentario: document.getElementById('nota-comentario').value.trim() || null,
    siguiente_accion: document.getElementById('nota-siguiente').value.trim() || null,
    estatus: document.getElementById('nota-estatus').value,
    fecha_evento: document.getElementById('nota-fecha').value
      ? new Date(document.getElementById('nota-fecha').value).toISOString()
      : new Date().toISOString()
  };
  const btn = document.getElementById('btnGuardarNota');
  btn.disabled = true;
  btn.textContent = 'Guardando...';
  try {
    let res;
    if (_editandoNotaId) {
      res = await sb.from('admin_bitacora').update(payload).eq('id', _editandoNotaId);
    } else {
      payload.creado_por = _userEmail;
      res = await sb.from('admin_bitacora').insert(payload);
    }
    if (res.error) { console.error(res.error); mostrarToast('error', 'Error: ' + res.error.message); return; }
    cerrarModalNota();
    mostrarToast('success', _editandoNotaId ? '✓ Nota actualizada' : '✓ Nota agregada');
    await cargarBitacora(_adminActualId);
    renderBitacora();
  } catch (err) { console.error(err); mostrarToast('error', 'Error inesperado'); }
  finally { btn.disabled = false; btn.textContent = 'Guardar'; }
}

async function eliminarNota(notaId) {
  if (!confirm('¿Eliminar esta nota? No se puede deshacer.')) return;
  try {
    const { error } = await sb.from('admin_bitacora').delete().eq('id', notaId);
    if (error) { mostrarToast('error', 'Error al eliminar'); return; }
    mostrarToast('success', '✓ Nota eliminada');
    await cargarBitacora(_adminActualId);
    renderBitacora();
  } catch (err) { console.error(err); }
}

/* NEGOCIACIONES */
async function cargarNegociaciones(adminId) {
  try {
    const { data, error } = await sb.from('admin_negociaciones').select('*').eq('admin_id', adminId).eq('archivada', false).order('creado_en', { ascending: false });
    if (error) { console.error(error); _negociaciones = []; return; }
    _negociaciones = data || [];
  } catch (err) { console.error(err); _negociaciones = []; }
}

function renderNegociaciones() {
  const cont = document.getElementById('segViewNego');
  if (!_negociaciones.length) {
    cont.innerHTML = `<div class="seg-empty"><div class="seg-empty-ico">📋</div><h4>Sin negociaciones</h4><p>Registra la primera negociación con esta administradora.</p><button class="btn-nueva" onclick="abrirModalNego(null)">+ Nueva negociación</button></div>`;
    return;
  }
  const items = _negociaciones.map(n => construirItemNego(n)).join('');
  cont.innerHTML = `<div class="seg-actions-bar"><button class="btn-nueva" onclick="abrirModalNego(null)">+ Nueva negociación</button></div><div class="nego-list">${items}</div>`;
}

function construirItemNego(n) {
  const estatusMap = {
    pendiente: { label: '⏳ Pendiente', cls: 'pend' },
    en_proceso: { label: '◉ En proceso', cls: 'proc' },
    cerrada: { label: '✓ Cerrada', cls: 'cer' },
    cancelada: { label: '✕ Cancelada', cls: 'can' }
  };
  const e = estatusMap[n.estatus] || estatusMap.pendiente;
  const valor = n.valor ? '$' + Number(n.valor).toLocaleString('es-MX', { maximumFractionDigits: 0 }) : '—';
  const masa = n.es_masa ? '<span class="masa-tag">📦 Operación masiva</span>' : '';
  const fechaInicio = n.fecha_inicio ? new Date(n.fecha_inicio).toLocaleDateString('es-MX') : '—';
  const fechaCierre = n.fecha_cierre_estimada ? new Date(n.fecha_cierre_estimada).toLocaleDateString('es-MX') : '—';
  return `<div class="nego-item"><div class="nego-hdr"><div><div class="nego-folio">${escapeHtml(n.folio || '')}</div><div class="nego-titulo">${escapeHtml(n.titulo || '')}</div></div><span class="estatus-mini ${e.cls}">${e.label}</span></div>${n.descripcion ? `<div class="nego-desc">${escapeHtml(n.descripcion)}</div>` : ''}<div class="nego-stats"><div class="nego-stat"><span class="lbl">Valor</span><span class="val">${valor}</span></div><div class="nego-stat"><span class="lbl">Inicio</span><span class="val">${fechaInicio}</span></div><div class="nego-stat"><span class="lbl">Cierre est.</span><span class="val">${fechaCierre}</span></div></div>${masa}<div class="nego-actions"><button class="btn-mini" onclick="abrirModalNego(${n.id})">✏️ Editar</button><button class="btn-mini" onclick="archivarNego(${n.id})">📦 Archivar</button></div></div>`;
}

async function abrirModalNego(negoId) {
  if (!_adminActualId) return;
  _editandoNegoId = negoId;
  if (negoId) {
    const n = _negociaciones.find(x => x.id === negoId);
    if (!n) return;
    document.getElementById('negoTitulo').textContent = 'Editar · ' + (n.folio || '');
    document.getElementById('nego-folio').value = n.folio || '';
    document.getElementById('nego-titulo').value = n.titulo || '';
    document.getElementById('nego-desc').value = n.descripcion || '';
    document.getElementById('nego-estatus').value = n.estatus || 'pendiente';
    document.getElementById('nego-valor').value = n.valor || '';
    document.getElementById('nego-masa').checked = !!n.es_masa;
    document.getElementById('nego-fini').value = n.fecha_inicio || '';
    document.getElementById('nego-fcie').value = n.fecha_cierre_estimada || '';
    document.getElementById('nego-freal').value = n.fecha_cierre_real || '';
    document.getElementById('nego-terminos').value = n.terminos || '';
  } else {
    const folio = await generarFolioNego();
    document.getElementById('negoTitulo').textContent = 'Nueva negociación · ' + (_adminActualNombre || '');
    document.getElementById('nego-folio').value = folio;
    document.getElementById('nego-titulo').value = '';
    document.getElementById('nego-desc').value = '';
    document.getElementById('nego-estatus').value = 'pendiente';
    document.getElementById('nego-valor').value = '';
    document.getElementById('nego-masa').checked = false;
    document.getElementById('nego-fini').value = new Date().toISOString().slice(0, 10);
    document.getElementById('nego-fcie').value = '';
    document.getElementById('nego-freal').value = '';
    document.getElementById('nego-terminos').value = '';
  }
  document.getElementById('modalNego').classList.add('show');
}

function cerrarModalNego() {
  document.getElementById('modalNego').classList.remove('show');
  _editandoNegoId = null;
}

async function generarFolioNego() {
  try {
    const { data, error } = await sb.from('admin_negociaciones').select('folio').ilike('folio', 'NEG-%').order('folio', { ascending: false }).limit(1);
    if (error || !data || !data.length) return 'NEG-001';
    const num = parseInt((data[0].folio || '').split('-')[1]) || 0;
    return 'NEG-' + String(num + 1).padStart(3, '0');
  } catch (err) { return 'NEG-001'; }
}

async function guardarNego() {
  const titulo = document.getElementById('nego-titulo').value.trim();
  if (!titulo) { mostrarToast('error', 'El título es obligatorio'); return; }
  const valorTxt = document.getElementById('nego-valor').value.trim();
  const payload = {
    admin_id: _adminActualId,
    folio: document.getElementById('nego-folio').value.trim(),
    titulo: titulo,
    descripcion: document.getElementById('nego-desc').value.trim() || null,
    estatus: document.getElementById('nego-estatus').value,
    valor: valorTxt ? parseFloat(valorTxt) : null,
    es_masa: document.getElementById('nego-masa').checked,
    fecha_inicio: document.getElementById('nego-fini').value || null,
    fecha_cierre_estimada: document.getElementById('nego-fcie').value || null,
    fecha_cierre_real: document.getElementById('nego-freal').value || null,
    terminos: document.getElementById('nego-terminos').value.trim() || null,
    actualizado_en: new Date().toISOString()
  };
  const btn = document.getElementById('btnGuardarNego');
  btn.disabled = true;
  btn.textContent = 'Guardando...';
  try {
    let res;
    if (_editandoNegoId) {
      res = await sb.from('admin_negociaciones').update(payload).eq('id', _editandoNegoId);
    } else {
      payload.creado_por = _userEmail;
      res = await sb.from('admin_negociaciones').insert(payload);
    }
    if (res.error) { console.error(res.error); mostrarToast('error', 'Error: ' + res.error.message); return; }
    cerrarModalNego();
    mostrarToast('success', _editandoNegoId ? '✓ Actualizada' : '✓ Creada');
    await cargarNegociaciones(_adminActualId);
    renderNegociaciones();
  } catch (err) { console.error(err); mostrarToast('error', 'Error inesperado'); }
  finally { btn.disabled = false; btn.textContent = 'Guardar'; }
}

async function archivarNego(negoId) {
  if (!confirm('¿Archivar esta negociación?')) return;
  try {
    const { error } = await sb.from('admin_negociaciones').update({ archivada: true }).eq('id', negoId);
    if (error) { mostrarToast('error', 'Error al archivar'); return; }
    mostrarToast('success', '✓ Archivada');
    await cargarNegociaciones(_adminActualId);
    renderNegociaciones();
  } catch (err) { console.error(err); }
}

/* ═══ FIN siga-admin.js ═══ */
