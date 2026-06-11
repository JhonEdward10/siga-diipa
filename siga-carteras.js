/* ═══════════════════════════════════════════════════════════════
   SIGA · siga-carteras.js · DIIPA · Fase 3.3 COMPLETA + 3.3-E
   MÓDULO: Carteras y Garantías
   - Tab 1 · Gestión de Carteras + Agregar Garantía + Carga masiva
   - Tab 2 · Vista por Garantías + línea de vida + validación pre-dictamen
   - Tab 3 · Papelera y duplicados
   NUEVO 3.3-E:
   - Mini báner de pre-revisión (foto, avalúo, estudio mercado)
   - Subida real a Supabase Storage (buckets garantias-fotos + garantias-avaluos)
   - Validación del botón "Mandar a Pre-dictaminar URRJ"
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

    /* ═══ MINI BÁNER DE PRE-REVISIÓN (Fase 3.3-E) ═══ */
    .mini-baner { background: linear-gradient(135deg, #FEF7E6 0%, #FEF3C7 100%); border: 1.5px solid #F59E0B; border-radius: 10px; padding: 14px; margin: 14px 0; }
    .mini-baner-titulo { font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
    .mini-baner-sub { font-size: 10.5px; color: #92400e; opacity: 0.85; margin-bottom: 12px; line-height: 1.45; }
    .mini-baner-grupo { background: var(--bg-card); border-radius: 8px; padding: 12px; margin-bottom: 10px; }
    .mini-baner-grupo-tit { font-size: 11px; font-weight: 600; color: var(--diipa-azul); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
    .mini-baner-grupo:last-child { margin-bottom: 0; }

    .input-archivo { background: var(--bg-tint); border: 1px dashed var(--border); border-radius: 7px; padding: 10px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; transition: background 0.15s, border-color 0.15s; }
    .input-archivo:hover { background: var(--diipa-azul-bg); border-color: var(--diipa-azul-claro); }
    .input-archivo input[type="file"] { display: none; }
    .input-archivo-ico { font-size: 24px; }
    .input-archivo-label { font-size: 11px; color: var(--text-secondary); font-weight: 500; text-align: center; }
    .input-archivo.con-archivo { background: #DCFCE7; border-color: #86EFAC; border-style: solid; }
    .input-archivo.con-archivo .input-archivo-label { color: #166534; font-weight: 600; }
    .input-archivo.obligatorio { border-color: #F59E0B; }
    .input-archivo.obligatorio.con-archivo { border-color: #86EFAC; }

    .foto-preview { width: 100%; max-height: 140px; object-fit: cover; border-radius: 6px; margin-top: 6px; }
    .galeria-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 6px; margin-top: 8px; }
    .galeria-thumb { position: relative; width: 100%; aspect-ratio: 1; border-radius: 6px; overflow: hidden; background: var(--bg-tint); }
    .galeria-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .galeria-thumb-quitar { position: absolute; top: 3px; right: 3px; background: rgba(0,0,0,0.6); color: white; border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; font-size: 11px; display: flex; align-items: center; justify-content: center; }

    .estudio-rango { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

    .checklist-validacion { background: var(--bg-card); border: 0.5px solid var(--border); border-radius: 8px; padding: 10px 12px; margin-top: 10px; }
    .checklist-validacion h5 { font-size: 11.5px; font-weight: 600; margin-bottom: 6px; color: var(--text-secondary); }
    .checklist-item { display: flex; align-items: center; gap: 6px; font-size: 11px; padding: 3px 0; }
    .checklist-item.ok { color: #166534; }
    .checklist-item.falta { color: #b91c1c; }
    .checklist-ico { width: 14px; text-align: center; }

    .modal-validacion { background: #FEE2E2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 10px 14px; margin: 10px 0; }
    .modal-validacion h5 { font-size: 12px; font-weight: 700; color: #b91c1c; margin-bottom: 6px; }
    .modal-validacion ul { margin-left: 18px; font-size: 11.5px; color: #7f1d1d; }
    .modal-validacion li { margin: 2px 0; }

    .btn-card:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-card.con-tooltip { position: relative; }
    .btn-card.con-tooltip:disabled:hover::after { content: attr(data-tooltip); position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); background: #b91c1c; color: white; padding: 7px 12px; border-radius: 6px; font-size: 10.5px; white-space: nowrap; max-width: 280px; white-space: normal; width: 240px; line-height: 1.4; z-index: 100; }

    .upload-progress { width: 100%; height: 4px; background: var(--bg-tint); border-radius: 2px; overflow: hidden; margin-top: 6px; }
    .upload-progress-bar { height: 100%; background: var(--diipa-teal); width: 0%; transition: width 0.3s; }
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
let _editandoGarantiaId = null;
let _tabCyG = 'principal';
let _tabPap = 'archivadas';
let _acreedoresActuales = [];
let _filasParaSubir = [];
let _filasDuplicadas = [];
let _filasError = [];
let _filtroV = { busqueda: '', cartera: '', estatus: '', admin: '', posicion: '' };
let _seleccionados = new Set();

let _fotoFachadaUrl = null;
let _galeriaFotosUrls = [];
let _avaluoPdfUrl = null;

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
  _fotoFachadaUrl = null;
  _galeriaFotosUrls = [];
  _avaluoPdfUrl = null;

  cont.innerHTML = `
    <h4>➕ Agregar Garantía Individual</h4>
    <div class="field">
      <label>📂 Cartera a la que pertenece *</label>
      <select id="gar-cartera"></select>
    </div>
    <div class="field">
      <label>⚖️ Tipo de Caso *</label>
      <select id="gar-tipo-caso" onchange="onCambiarTipoCaso()"></select>
      <div class="posicion-detectada" id="gar-posicion-detectada"></div>
    </div>
    <div class="field">
      <label>💳 Acreedor original (banco / institución)</label>
      <div id="gar-acreedores-list"></div>
    </div>
    <div class="field">
      <label>📜 No. de Crédito (opcional)</label>
      <input type="text" id="gar-num-credito">
    </div>

    <div class="mini-baner">
      <div class="mini-baner-titulo">⭐ Mini báner de pre-revisión</div>
      <div class="mini-baner-sub">Datos que Comercial DEBE llenar antes de poder mandar a pre-dictaminar. El equipo URRJ necesita esto para hacer su trabajo bien.</div>

      <div class="mini-baner-grupo">
        <div class="mini-baner-grupo-tit">📍 Ubicación validada</div>
        <div class="field">
          <label>Dirección / Ubicación *</label>
          <input type="text" id="gar-direccion" placeholder="Calle, Colonia, Ciudad, Estado">
        </div>
        <div class="field-row">
          <div class="field">
            <label>Entre calles *</label>
            <input type="text" id="gar-entre-calles" placeholder="Ej. Av. López Mateos y Av. Vallarta">
          </div>
          <div class="field">
            <label>Código postal *</label>
            <input type="text" id="gar-cp" maxlength="5" placeholder="44100">
          </div>
        </div>
        <div class="field-row">
          <div class="field"><label>Estado</label><input type="text" id="gar-estado"></div>
          <div class="field"><label>Municipio</label><input type="text" id="gar-municipio"></div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Tipo de inmueble *</label>
            <select id="gar-tipo-inmueble">
              <option value="">— Seleccionar —</option>
              ${TIPOS_INMUEBLE.map(t => `<option value="${t.id}">${escapeHtml(t.label)}</option>`).join('')}
            </select>
          </div>
          <div class="field" style="padding-top: 22px">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer">
              <input type="checkbox" id="gar-direccion-validada" style="width:16px; height:16px">
              <span>✓ Dirección verificada en Google Maps</span>
            </label>
          </div>
        </div>
      </div>

      <div class="mini-baner-grupo">
        <div class="mini-baner-grupo-tit">📸 Foto fachada + galería</div>
        <div class="field-row">
          <div class="field">
            <label>Foto de fachada *</label>
            <label class="input-archivo obligatorio" id="lbl-foto-fachada">
              <input type="file" id="gar-foto-fachada" accept="image/jpeg,image/png,image/webp" onchange="onSubirFotoFachada(this)">
              <div class="input-archivo-ico">📷</div>
              <div class="input-archivo-label">Click para subir foto principal</div>
            </label>
            <div id="preview-foto-fachada"></div>
          </div>
          <div class="field">
            <label>Galería opcional</label>
            <label class="input-archivo" id="lbl-galeria">
              <input type="file" id="gar-galeria" accept="image/jpeg,image/png,image/webp" multiple onchange="onSubirGaleria(this)">
              <div class="input-archivo-ico">🖼️</div>
              <div class="input-archivo-label">Varias fotos (interior, calle, etc.)</div>
            </label>
            <div class="galeria-grid" id="preview-galeria"></div>
          </div>
        </div>
      </div>

      <div class="mini-baner-grupo">
        <div class="mini-baner-grupo-tit">💰 Avalúo comercial</div>
        <div class="field-row">
          <div class="field">
            <label>Valor del avalúo (MXN) *</label>
            <input type="number" id="gar-avaluo-valor" step="0.01" placeholder="1500000">
          </div>
          <div class="field">
            <label>PDF del avalúo (opcional)</label>
            <label class="input-archivo" id="lbl-avaluo-pdf">
              <input type="file" id="gar-avaluo-pdf" accept="application/pdf" onchange="onSubirAvaluoPdf(this)">
              <div class="input-archivo-ico">📄</div>
              <div class="input-archivo-label">Click para subir PDF</div>
            </label>
          </div>
        </div>
      </div>

      <div class="mini-baner-grupo">
        <div class="mini-baner-grupo-tit">📊 Estudio de mercado rápido</div>
        <div style="font-size:10.5px; color:var(--text-tertiary); margin-bottom:8px">Cuánto valen casas comparables en la zona según calles, vecindario, etc.</div>
        <div class="estudio-rango">
          <div class="field">
            <label>Valor BAJO de la zona *</label>
            <input type="number" id="gar-mercado-low" step="0.01" placeholder="1200000">
          </div>
          <div class="field">
            <label>Valor ALTO de la zona *</label>
            <input type="number" id="gar-mercado-high" step="0.01" placeholder="1800000">
          </div>
        </div>
        <div class="field">
          <label>Notas del análisis (opcional)</label>
          <textarea id="gar-mercado-notas" rows="2" placeholder="Comparé 3 casas similares en la cuadra..."></textarea>
        </div>
      </div>
    </div>

    <div class="field-row">
      <div class="field">
        <label>💰 Valor estimado interno ($)</label>
        <input type="number" step="0.01" id="gar-valor" placeholder="Promedio que usaremos">
      </div>
      <div class="field">
        <label>🎯 Precio piso ($) <span style="font-size:9px; color:#92400e">(confidencial · Dirección)</span></label>
        <input type="number" step="0.01" id="gar-precio-piso">
      </div>
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

async function onSubirFotoFachada(input) {
  const file = input.files[0];
  if (!file) return;
  const lbl = document.getElementById('lbl-foto-fachada');
  lbl.classList.remove('con-archivo');
  const labelDiv = lbl.querySelector('.input-archivo-label');
  labelDiv.textContent = 'Subiendo...';
  try {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `fachada/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const { data, error } = await sb.storage.from('garantias-fotos').upload(path, file);
    if (error) throw error;
    const { data: urlData } = sb.storage.from('garantias-fotos').getPublicUrl(path);
    _fotoFachadaUrl = urlData.publicUrl;
    document.getElementById('preview-foto-fachada').innerHTML = `<img src="${_fotoFachadaUrl}" class="foto-preview">`;
    lbl.classList.add('con-archivo');
    labelDiv.innerHTML = '✓ Foto subida · click para reemplazar';
    mostrarToast('success', '✓ Foto fachada subida');
  } catch (err) {
    console.error(err);
    mostrarToast('error', 'Error al subir foto: ' + (err.message || ''));
    labelDiv.textContent = 'Click para subir foto principal';
  }
}

async function onSubirGaleria(input) {
  const files = Array.from(input.files || []);
  if (!files.length) return;
  const lbl = document.getElementById('lbl-galeria');
  const labelDiv = lbl.querySelector('.input-archivo-label');
  labelDiv.textContent = `Subiendo ${files.length}...`;
  try {
    for (const file of files) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `galeria/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { error } = await sb.storage.from('garantias-fotos').upload(path, file);
      if (error) throw error;
      const { data: urlData } = sb.storage.from('garantias-fotos').getPublicUrl(path);
      _galeriaFotosUrls.push(urlData.publicUrl);
    }
    renderPreviewGaleria();
    lbl.classList.add('con-archivo');
    labelDiv.innerHTML = `✓ ${_galeriaFotosUrls.length} fotos · click para agregar más`;
    mostrarToast('success', `✓ ${files.length} fotos subidas`);
    input.value = '';
  } catch (err) {
    console.error(err);
    mostrarToast('error', 'Error al subir galería: ' + (err.message || ''));
    labelDiv.textContent = 'Varias fotos (interior, calle, etc.)';
  }
}

function renderPreviewGaleria() {
  const cont = document.getElementById('preview-galeria');
  if (!cont) return;
  cont.innerHTML = _galeriaFotosUrls.map((url, idx) => `
    <div class="galeria-thumb">
      <img src="${url}">
      <button class="galeria-thumb-quitar" onclick="quitarFotoGaleria(${idx})">✕</button>
    </div>
  `).join('');
}

function quitarFotoGaleria(idx) {
  _galeriaFotosUrls.splice(idx, 1);
  renderPreviewGaleria();
  const lbl = document.getElementById('lbl-galeria');
  const labelDiv = lbl.querySelector('.input-archivo-label');
  if (_galeriaFotosUrls.length === 0) {
    lbl.classList.remove('con-archivo');
    labelDiv.textContent = 'Varias fotos (interior, calle, etc.)';
  } else {
    labelDiv.innerHTML = `✓ ${_galeriaFotosUrls.length} fotos · click para agregar más`;
  }
}

async function onSubirAvaluoPdf(input) {
  const file = input.files[0];
  if (!file) return;
  const lbl = document.getElementById('lbl-avaluo-pdf');
  const labelDiv = lbl.querySelector('.input-archivo-label');
  labelDiv.textContent = 'Subiendo PDF...';
  try {
    const path = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.pdf`;
    const { error } = await sb.storage.from('garantias-avaluos').upload(path, file);
    if (error) throw error;
    _avaluoPdfUrl = path;
    lbl.classList.add('con-archivo');
    labelDiv.innerHTML = '✓ Avalúo PDF subido';
    mostrarToast('success', '✓ Avalúo subido');
  } catch (err) {
    console.error(err);
    mostrarToast('error', 'Error al subir avalúo: ' + (err.message || ''));
    labelDiv.textContent = 'Click para subir PDF';
  }
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
  btn.disabled = true; btn.textContent = 'Guardando...';
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
  if (dup) { mostrarToast('error', '⚠️ Ya existe una garantía con esa dirección (' + (dup.folio || '') + ')'); return; }
  const acreedoresLimpios = _acreedoresActuales
    .map(a => ({ nombre: (a.nombre || '').trim(), monto: parseFloat(a.monto) || null }))
    .filter(a => a.nombre);
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
    foto_fachada: _fotoFachadaUrl,
    galeria_fotos: _galeriaFotosUrls,
    avaluo_valor: parseFloat(document.getElementById('gar-avaluo-valor').value) || null,
    avaluo_pdf: _avaluoPdfUrl,
    estudio_mercado_low: parseFloat(document.getElementById('gar-mercado-low').value) || null,
    estudio_mercado_high: parseFloat(document.getElementById('gar-mercado-high').value) || null,
    estudio_mercado_notas: document.getElementById('gar-mercado-notas').value.trim() || null,
    entre_calles: document.getElementById('gar-entre-calles').value.trim() || null,
    codigo_postal: document.getElementById('gar-cp').value.trim() || null,
    tipo_inmueble: document.getElementById('gar-tipo-inmueble').value || null,
    direccion_validada: document.getElementById('gar-direccion-validada').checked,
    estatus: 'registrada', creado_por: _userEmail, creado_en: new Date().toISOString()
  };
  const btn = document.getElementById('btnGuardarGarantia');
  btn.disabled = true; btn.textContent = 'Guardando...';
  try {
    const { error } = await sb.from('garantias').insert(payload);
    if (error) { console.error(error); mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', '✓ Garantía ' + folio + ' agregada · Posición: ' + posicion);
    await cargarGarantiasTodas();
    renderCarterasGrid();
    renderFormGarantiaCompleto();
  } catch (err) { console.error(err); mostrarToast('error', 'Error inesperado'); }
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
  if (!garantia.estudio_mercado_low || !garantia.estudio_mercado_high) faltantes.push('estudio de mercado (rango bajo/alto)');
  if (!garantia.entre_calles) faltantes.push('entre calles');
  if (!garantia.codigo_postal) faltantes.push('código postal');
  if (!garantia.tipo_inmueble) faltantes.push('tipo de inmueble');
  if (!garantia.direccion_validada) faltantes.push('marcar dirección validada en Google Maps');
  return { valido: faltantes.length === 0, faltantes };
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
    } catch (err) { console.error(err); mostrarToast('error', 'Error al leer el archivo'); }
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
  } catch (err) { console.error(err); }
  const conFolios = _filasParaSubir.map((f, i) => ({ ...f, folio: 'GAR-' + String(nextNum + i).padStart(4, '0') }));
  try {
    const { error } = await sb.from('garantias').insert(conFolios);
    if (error) { console.error(error); mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', `✓ ${conFolios.length} garantías subidas`);
    cancelarCargaMasiva();
    await cargarGarantiasTodas();
    renderCarterasGrid();
  } catch (err) { console.error(err); mostrarToast('error', 'Error inesperado'); }
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
            <p>Solo las garantías con mini báner completo pueden mandarse a pre-dictamen</p>
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
        <button class="btn-card primary con-tooltip" id="btn-mandar-pre" onclick="mandarAPredictamen()" style="background:linear-gradient(135deg,#534AB7,#6B5FD0)">⚖️ Mandar a Pre-dictaminar URRJ</button>
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
          <button class="btn-mini" onclick="abrirDetalleGarantia(${g.id})">👁️ Ver</button>
          <button class="btn-mini" onclick="archivarGarantia(${g.id})">📦 Archivar</button>
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
  if (_seleccionados.size === 0) {
    btn.disabled = true;
    btn.setAttribute('data-tooltip', 'Selecciona al menos una garantía');
    return;
  }
  const noValidas = [];
  _seleccionados.forEach(id => {
    const g = _garantias.find(x => x.id === id);
    if (g) {
      const v = validarParaPredictamen(g);
      if (!v.valido) noValidas.push({ folio: g.folio, faltantes: v.faltantes });
    }
  });
  if (noValidas.length) {
    btn.disabled = true;
    btn.setAttribute('data-tooltip', `${noValidas.length} garantía${noValidas.length !== 1 ? 's' : ''} sin mini báner completo. Click en cada una para ver qué falta.`);
  } else {
    btn.disabled = false;
    btn.removeAttribute('data-tooltip');
  }
}

async function mandarAPredictamen() {
  if (!_seleccionados.size) { mostrarToast('error', 'Selecciona al menos una garantía'); return; }
  const noValidas = [];
  _seleccionados.forEach(id => {
    const g = _garantias.find(x => x.id === id);
    if (g) {
      const v = validarParaPredictamen(g);
      if (!v.valido) noValidas.push({ folio: g.folio, faltantes: v.faltantes });
    }
  });
  if (noValidas.length) {
    const detalle = noValidas.map(n => `${n.folio}: ${n.faltantes.join(', ')}`).join('\n');
    mostrarToast('error', `⚠️ ${noValidas.length} garantía(s) sin mini báner completo`);
    alert('NO se puede mandar a pre-dictamen.\n\nFaltantes:\n\n' + detalle);
    return;
  }
  if (!confirm(`¿Mandar ${_seleccionados.size} garantía(s) a Pre-dictaminar URRJ?\n\nEsto cambia su estatus a "En pre-dictamen". Después un abogado URRJ revisará cada caso.`)) return;
  try {
    const ids = Array.from(_seleccionados);
    const { error } = await sb.from('garantias').update({ estatus: 'en_pre_dictamen', actualizado_en: new Date().toISOString() }).in('id', ids);
    if (error) { mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', `✓ ${ids.length} garantía(s) mandadas a pre-dictamen URRJ`);
    _seleccionados.clear();
    await cargarGarantiasTodas();
    renderVistaGarantias();
  } catch (err) { console.error(err); mostrarToast('error', 'Error inesperado'); }
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
      <h5>${val.valido ? '✅ Mini báner completo · lista para pre-dictamen' : '⚠️ Mini báner incompleto · NO se puede mandar a pre-dictamen'}</h5>
      <div class="checklist-item ${g.foto_fachada ? 'ok' : 'falta'}"><span class="checklist-ico">${g.foto_fachada ? '✓' : '✕'}</span> Foto de fachada</div>
      <div class="checklist-item ${g.avaluo_valor ? 'ok' : 'falta'}"><span class="checklist-ico">${g.avaluo_valor ? '✓' : '✕'}</span> Valor del avalúo</div>
      <div class="checklist-item ${(g.estudio_mercado_low && g.estudio_mercado_high) ? 'ok' : 'falta'}"><span class="checklist-ico">${(g.estudio_mercado_low && g.estudio_mercado_high) ? '✓' : '✕'}</span> Estudio de mercado (rango)</div>
      <div class="checklist-item ${g.entre_calles ? 'ok' : 'falta'}"><span class="checklist-ico">${g.entre_calles ? '✓' : '✕'}</span> Entre calles</div>
      <div class="checklist-item ${g.codigo_postal ? 'ok' : 'falta'}"><span class="checklist-ico">${g.codigo_postal ? '✓' : '✕'}</span> Código postal</div>
      <div class="checklist-item ${g.tipo_inmueble ? 'ok' : 'falta'}"><span class="checklist-ico">${g.tipo_inmueble ? '✓' : '✕'}</span> Tipo de inmueble</div>
      <div class="checklist-item ${g.direccion_validada ? 'ok' : 'falta'}"><span class="checklist-ico">${g.direccion_validada ? '✓' : '✕'}</span> Dirección validada en Maps</div>
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
          <div class="field-row">
            <div class="field"><label>Entre calles</label><div>${escapeHtml(g.entre_calles || '—')}</div></div>
            <div class="field"><label>Código postal</label><div>${escapeHtml(g.codigo_postal || '—')}</div></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Estado</label><div>${escapeHtml(g.estado_mx || '—')}</div></div>
            <div class="field"><label>Municipio</label><div>${escapeHtml(g.municipio || '—')}</div></div>
          </div>
          <div class="modal-section-title">📸 Galería</div>
          ${galeriaHtml}
          <div class="modal-section-title">💰 Valores</div>
          <div class="field-row">
            <div class="field"><label>Avalúo (valor)</label><div>${g.avaluo_valor ? '$' + Number(g.avaluo_valor).toLocaleString('es-MX') : '—'}</div></div>
            <div class="field"><label>Valor estimado interno</label><div>${g.valor_estimado ? '$' + Number(g.valor_estimado).toLocaleString('es-MX') : '—'}</div></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Estudio mercado · BAJO</label><div>${g.estudio_mercado_low ? '$' + Number(g.estudio_mercado_low).toLocaleString('es-MX') : '—'}</div></div>
            <div class="field"><label>Estudio mercado · ALTO</label><div>${g.estudio_mercado_high ? '$' + Number(g.estudio_mercado_high).toLocaleString('es-MX') : '—'}</div></div>
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
        mostrarToast('error', '⚠️ No se puede · faltan datos del mini báner');
        alert('No se puede mandar a pre-dictamen.\n\nFaltan:\n• ' + v.faltantes.join('\n• '));
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
  } catch (err) { console.error(err); mostrarToast('error', 'Error inesperado'); }
}

async function archivarGarantia(id) {
  if (!confirm('¿Archivar esta garantía? Pasará a la papelera (se puede restaurar).')) return;
  try {
    const { error } = await sb.from('garantias').update({ archivada: true, actualizado_en: new Date().toISOString() }).eq('id', id);
    if (error) { mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', '✓ Archivada');
    _seleccionados.delete(id);
    await cargarGarantiasTodas();
    renderVistaGarantias();
  } catch (err) { console.error(err); }
}

async function eliminarGarantia(id) {
  if (!confirm('¿Eliminar esta garantía? Pasará a la papelera.')) return;
  try {
    const { error } = await sb.from('garantias').update({ eliminada: true, actualizado_en: new Date().toISOString() }).eq('id', id);
    if (error) { mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', '✓ Eliminada (movida a papelera)');
    _seleccionados.delete(id);
    await cargarGarantiasTodas();
    renderVistaGarantias();
  } catch (err) { console.error(err); }
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
            <p>Restaura, elimina permanentemente o resuelve duplicados detectados automáticamente.</p>
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

function cambiarTabPap(sub) {
  _tabPap = sub;
  renderPapelera();
}

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
  } catch (err) { console.error(err); }
}

async function eliminarPermanente(id) {
  if (!confirm('⚠️ ¿Borrar PERMANENTEMENTE esta garantía?\n\nEsto NO SE PUEDE DESHACER.')) return;
  try {
    const { error } = await sb.from('garantias').delete().eq('id', id);
    if (error) { mostrarToast('error', 'Error: ' + error.message); return; }
    mostrarToast('success', '✓ Borrada permanentemente');
    await cargarGarantiasTodas();
    renderPapelera();
  } catch (err) { console.error(err); }
}

/* ═══ FIN siga-carteras.js ═══ */
