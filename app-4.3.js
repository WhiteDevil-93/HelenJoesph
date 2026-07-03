const APP_VERSION='4.3';
let D=null,W=0,act='all',deferred=null,scoreSt={};

const C={favourites:'Favourites',all:'All','1_resuscitation_fluids_and_inotropes':'Resuscitation','2_airway_and_ventilation':'Airway & Vent','3_sedation_analgesia_and_neurology':'Sedation & Neuro','4_antimicrobials_and_infectious_diseases':'Antimicrobials','5_metabolic_electrolytes_and_nutrition':'Metabolic','6_poisoning_and_toxicology':'Toxicology','7_useful_formulae':'Formulae','8_cardiovascular':'Cardiovascular','9_blood_products':'Blood','10_endocrine_and_other':'Endocrine','11_ed_medical_emergencies':'ED Medical','12_ed_toxicology':'ED Toxic','13_ed_trauma_surgical':'ED Trauma','14_ed_metabolic':'ED Metabolic','15_ed_procedures':'ED Procedures','16_score_calculators':'Score Calc'};
const I={'favourites':'⭐','all':'📋','1_resuscitation_fluids_and_inotropes':'💉','2_airway_and_ventilation':'🫁','3_sedation_analgesia_and_neurology':'🧠','4_antimicrobials_and_infectious_diseases':'🦠','5_metabolic_electrolytes_and_nutrition':'⚗️','6_poisoning_and_toxicology':'☠️','7_useful_formulae':'📐','8_cardiovascular':'❤️','9_blood_products':'🩸','10_endocrine_and_other':'🔬','11_ed_medical_emergencies':'🩺','12_ed_toxicology':'☠️','13_ed_trauma_surgical':'🚑','14_ed_metabolic':'⚗️','15_ed_procedures':'🩺','16_score_calculators':'📊'};
const ORDER=['favourites','all','1_resuscitation_fluids_and_inotropes','2_airway_and_ventilation','3_sedation_analgesia_and_neurology','4_antimicrobials_and_infectious_diseases','5_metabolic_electrolytes_and_nutrition','6_poisoning_and_toxicology','7_useful_formulae','8_cardiovascular','9_blood_products','10_endocrine_and_other','11_ed_medical_emergencies','12_ed_toxicology','13_ed_trauma_surgical','14_ed_metabolic','15_ed_procedures','16_score_calculators'];

const TAB_NAMES={...C,'2_airway_and_ventilation':'Airway','3_sedation_analgesia_and_neurology':'Sedation','4_antimicrobials_and_infectious_diseases':'Antibiotics','5_metabolic_electrolytes_and_nutrition':'Metabolic','6_poisoning_and_toxicology':'Toxicology','7_useful_formulae':'Formulae','10_endocrine_and_other':'Endocrine','11_ed_medical_emergencies':'ED Medical','12_ed_toxicology':'ED Toxic','13_ed_trauma_surgical':'ED Trauma','14_ed_metabolic':'ED Metabolic','15_ed_procedures':'ED Proc','16_score_calculators':'Scores'};

/* ===== CACHE BUSTING ===== */
function checkVersion(){
  const cached=localStorage.getItem('tr_ver');
  if(cached&&cached!==APP_VERSION){
    localStorage.removeItem('tr_ver');
    localStorage.removeItem('tr_f');
    localStorage.removeItem('tr_w');
    localStorage.removeItem('tr_onboarded');
    scoreSt={};
    if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(regs=>regs.forEach(r=>r.unregister()));
    if(!sessionStorage.getItem('tr_reloaded')){sessionStorage.setItem('tr_reloaded','1');location.reload(true)}
  }
  localStorage.setItem('tr_ver',APP_VERSION);
}

/* ===== WEIGHT ===== */
function gW(){return parseFloat(localStorage.getItem('tr_w')||'0')}
function sW(v){
  W=parseFloat(v)||0;
  localStorage.setItem('tr_w',W);
  if(W>0){
    showWeightToast(W);
    if(act==='all')renderAll();else if(act!=='favourites')renderCat(act);
  }
}

/* ===== FAVS ===== */
function gF(){try{return JSON.parse(localStorage.getItem('tr_f')||'[]')}catch{return[]}}
function sF(f){localStorage.setItem('tr_f',JSON.stringify(f));updF()}
function togF(k){let f=gF();sF(f.includes(k)?f.filter(x=>x!==k):[...f,k]);if(act==='favourites')renderF()}
function iF(k){return gF().includes(k)}
function mK(it,cat){return cat+'::'+(it.item||it.drug||it.condition_or_drug||it.poison_or_drug||it.antidote_treatment||it.product||'')}
function updF(){const b=document.getElementById('favCt');if(b){const c=gF().length;b.textContent=c;b.style.display=c?'inline':'none'}}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded',()=>{
  checkVersion();
  W=gW();document.getElementById('w').value=W||'';
  document.getElementById('w').addEventListener('input',e=>sW(e.target.value));
  load();
});

async function load(){
  try{
    const r=await fetch('data.json?v='+APP_VERSION,{cache:'no-store'});
    D=await r.json();mkNav();renderAll();updF();
  }catch(e){document.getElementById('c').innerHTML='<div class="nores"><div class=ico>⚠️</div>Failed to load data. Please check connection.</div>'}
  if(!localStorage.getItem('tr_onboarded')){showOnboarding();}
  document.getElementById('s').addEventListener('input',doSearch);
  if('serviceWorker'in navigator){
    navigator.serviceWorker.register('sw.js?v='+APP_VERSION).catch(()=>{});
    navigator.serviceWorker.register('service-worker.js?v='+APP_VERSION).catch(()=>{});
    navigator.serviceWorker.getRegistrations().then(regs=>regs.forEach(r=>{
      const url=r.scope||'';
      if(url.includes('service-worker')&&!url.includes('service-worker.js?v='+APP_VERSION))r.unregister();
    }));
  }
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;document.getElementById('inst').classList.add('on')});
  let cont=document.getElementById('c');
  cont.addEventListener('scroll',()=>document.getElementById('top').classList.toggle('on',cont.scrollTop>400));
}
function doInstall(){if(deferred){deferred.prompt();deferred=null;document.getElementById('inst').classList.remove('on')}};

/* ===== ONBOARDING ===== */
let onboardStep=0;
const ONBOARD_STEPS=[
  {title:'Search anything',desc:'Search any drug, protocol, or score to find what you need fast.',icon:'🔍'},
  {title:'Set patient weight',desc:'Set patient weight once — it applies to all dosing calculations.',icon:'⚖️'},
  {title:'Browse & save',desc:'Tap categories to browse, tap stars to save favourites for quick access.',icon:'⭐'}
];
function showOnboarding(){
  if(document.getElementById('obv'))return;
  onboardStep=0;
  const ov=document.createElement('div');ov.id='obv';ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)';
  renderOnboardCard(ov);
  document.body.appendChild(ov);
}
function renderOnboardCard(ov){
  const step=ONBOARD_STEPS[onboardStep];
  ov.innerHTML=`<div style="background:var(--bg);border:1px solid var(--b);border-radius:1rem;padding:1.5rem;max-width:320px;width:85%;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.4)">
    <div style="font-size:3rem;margin-bottom:.5rem">${step.icon}</div>
    <div style="font-weight:700;font-size:1.1rem;margin-bottom:.3rem;color:var(--fg)">${step.title}</div>
    <div style="font-size:.82rem;color:var(--t2);margin-bottom:1rem;line-height:1.4">${step.desc}</div>
    <div style="display:flex;gap:.5rem;margin-bottom:1rem;justify-content:center">
      ${ONBOARD_STEPS.map((_,i)=>`<div style="width:8px;height:8px;border-radius:50%;background:${i===onboardStep?'var(--a)':'var(--b)'};transition:background .2s"></div>`).join('')}
    </div>
    <div style="display:flex;gap:.5rem">
      <button onclick="skipOnboard()" style="flex:1;padding:.5rem;border:1px solid var(--b);border-radius:.5rem;background:transparent;color:var(--t2);font-size:.8rem;cursor:pointer">Skip</button>
      <button onclick="nextOnboard()" style="flex:1;padding:.5rem;border:none;border-radius:.5rem;background:var(--a);color:#000;font-size:.8rem;font-weight:700;cursor:pointer">${onboardStep<ONBOARD_STEPS.length-1?'Next':'Get Started'}</button>
    </div>
  </div>`;
}
function nextOnboard(){
  onboardStep++;
  if(onboardStep>=ONBOARD_STEPS.length){
    localStorage.setItem('tr_onboarded','1');
    const ov=document.getElementById('obv');if(ov)ov.remove();
  }else{renderOnboardCard(document.getElementById('obv'));}
}
function skipOnboard(){
  localStorage.setItem('tr_onboarded','1');
  const ov=document.getElementById('obv');if(ov)ov.remove();
}

/* ===== WEIGHT TOAST ===== */
function showWeightToast(w){
  let t=document.getElementById('wtoast');
  if(!t){
    t=document.createElement('div');t.id='wtoast';
    t.style.cssText='position:fixed;top:calc(60px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);background:var(--g);color:#000;padding:.4rem .8rem;border-radius:.5rem;font-size:.8rem;font-weight:700;z-index:999;opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap';
    document.body.appendChild(t);
  }
  t.textContent=`Weight set: ${w} kg`;
  t.style.opacity='1';
  setTimeout(()=>{t.style.opacity='0'},2000);
}

/* ===== NAV ===== */
function mkNav(){
  let h='';
  for(const k of ORDER){
    const label=TAB_NAMES[k]||C[k];
    if(k==='favourites'){const c=gF().length;h+=`<button class="cp${k===act?' on':''}" data-c="${k}" onclick="setCat('${k}')">${I[k]} ${label}${c?`<span class=n id=favCt>${c}</span>`:''}</button>`}
    else if(k==='all')h+=`<button class="cp on" data-c="all" onclick="setCat('all')">${I.all} All</button>`
    else if(D&&D[k])h+=`<button class="cp" data-c="${k}" onclick="setCat('${k}')">${I[k]} ${label}</button>`
  }
  document.getElementById('nav').innerHTML=h
}
function setCat(c){act=c;document.querySelectorAll('.cp').forEach(b=>b.classList.toggle('on',b.dataset.c===c));document.getElementById('s').value='';if(c==='favourites')renderF();else if(c==='all')renderAll();else renderCat(c)}

/* ===== RENDER ===== */
function renderAll(){let h='';for(const k of ORDER)if(k!=='favourites'&&k!=='all'&&D[k])h+=renderSect(k);document.getElementById('c').innerHTML=h||'<div class=nores>No data</div>';bindTog();updF()}
function renderCat(cat){document.getElementById('c').innerHTML=renderSect(cat);bindTog();updF()}

function renderSect(cat){
  const d=D[cat];if(!d)return'';
  if(cat==='16_score_calculators')return renderScoreCalculators(d);
  if(cat==='15_ed_procedures')return renderEDProcedures(d);
  let h=`<div class="sc" id="${cat}"><h2>${I[cat]} ${C[cat]}</h2>`;
  for(const sub in d){
    const arr=d[sub];
    if(sub==='targets'&&arr&&typeof arr==='object'&&!Array.isArray(arr)){h+=renderTg(arr,cat);continue}
    if(!Array.isArray(arr)||!arr.length)continue;
    // Check if this is a structured ED protocol
    const isStructured = arr.length > 0 && arr[0] && (arr[0].protocol_type || arr[0].diagnostic_criteria || arr[0].management_steps || (arr[0].drugs && arr[0].drugs.length));
    if (isStructured) {
      for(const it of arr) h+=renderStructuredProtocol(it, cat);
    } else {
      h+=`<h3>${fmtK(sub)}</h3>`;
      for(const it of arr) h+=renderIt(it,cat);
    }
  }
  h+='</div>';return h;
}

function renderTg(it,cat){
  const k=mK(it,cat);
  return `<div class="cd"><button class="fav" onclick="togF('${k}')">${iF(k)?'★':'☆'}</button><div class="n">${esc(it.item||'Target')}</div><div class="dg">${esc(it.adult_dose||'')} | Paed: ${esc(it.paediatric_dose||'')}</div>${it.notes_updates?`<div class="nt">${esc(it.notes_updates)}</div>`:''}</div>`;
}

function fmtK(k){return k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
function esc(s){return(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function renderIt(it,cat){
  const k=mK(it,cat);
  let h=`<div class="cd"><button class="fav" onclick="togF('${k}')">${iF(k)?'★':'☆'}</button>`;
  h+=`<div class="n">${esc(it.item||it.drug||it.condition_or_drug||it.poison_or_drug||it.antidote_treatment||it.product||it.category||'')}</div>`;
  // Adult dose with weight calculation
  const ad = it.adult_dose||it.adult_settings||'';
  if(ad){
    const wd = W>0 ? calcWeightDose(ad, W) : null;
    h+=`<div class="dg">${esc(ad)}${wd?`<span class="wtag">${esc(wd)}</span>`:''}</div>`;
  }
  const pd=it.paediatric_dose||it.paediatric_settings||'';
  if(pd)h+=`<div class="pg">Paed: ${esc(pd)}</div>`;
  const rt=it.route||'';
  if(rt)h+=`<div class="rt">${esc(rt)}</div>`;
  // Infusion calculator
  const nm=it.item||it.drug||'';
  if(isInfusionDrug(nm,it))h+=renderInfusionCalc(it,nm);
  const notes=it.notes||it.notes_updates||'';
  if(notes)h+=`<div class="nt">${esc(notes)}</div>`;
  if(it.standard_dilutions)h+=`<div class="sd">${esc(it.standard_dilutions)}</div>`;
  if(it.formula)h+=`<div class="fo">${esc(it.formula)}</div>`;
  h+='</div>';
  return h;
}

/* ===== STRUCTURED PROTOCOL RENDERER (ED) ===== */
function renderStructuredProtocol(it, cat) {
  const k = mK(it, cat);
  let h = `<div class="cd protocol-card"><button class="fav" onclick="togF('${k}')">${iF(k)?'★':'☆'}</button>`;
  h += `<div class="n" style="font-size:1.05rem;font-weight:700;color:var(--fg)">${esc(it.item || 'Protocol')}</div>`;
  
  // Protocol type badge
  if (it.protocol_type) {
    h += `<span class="badge">${esc(it.protocol_type)}</span>`;
  }
  
  // Notes/Overview
  if (it.notes_updates) {
    const sections = parseProtocolSections(it.notes_updates);
    for (const sec of sections) {
      h += `<div class="prot-sec"><div class="prot-sec-title">${esc(sec.title)}</div><div class="prot-sec-body">${sec.content}</div></div>`;
    }
  }
  
  // Diagnostic Criteria
  if (it.diagnostic_criteria) {
    h += `<div class="prot-sec"><div class="prot-sec-title">📋 Diagnostic Criteria</div><div class="prot-sec-body">`;
    for (const [key, val] of Object.entries(it.diagnostic_criteria)) {
      h += `<div class="dxc-row"><span class="dxc-label">${esc(key)}</span><span class="dxc-val">${esc(val)}</span></div>`;
    }
    h += `</div></div>`;
  }
  
  // Classification
  if (it.classification) {
    h += `<div class="prot-sec"><div class="prot-sec-title">🏷️ Classification</div><div class="prot-sec-body">`;
    for (const [key, val] of Object.entries(it.classification)) {
      h += `<div class="cls-row"><span class="cls-label">${esc(key)}</span><span class="cls-val">${esc(val)}</span></div>`;
    }
    h += `</div></div>`;
  }
  
  // Clinical Features
  if (it.clinical_features) {
    h += `<div class="prot-sec"><div class="prot-sec-title">🩺 Clinical Features</div><div class="prot-sec-body">`;
    if (typeof it.clinical_features === 'string') {
      h += esc(it.clinical_features);
    } else {
      for (const [sys, feats] of Object.entries(it.clinical_features)) {
        h += `<div class="cf-sys"><div class="cf-sys-title">${esc(sys)}</div>`;
        if (Array.isArray(feats)) {
          for (const f of feats) h += `<div class="cf-item">${esc(f)}</div>`;
        } else if (typeof feats === 'object') {
          for (const [fk, fv] of Object.entries(feats)) {
            h += `<div class="cf-sub"><b>${esc(fk)}</b>: ${esc(fv)}</div>`;
          }
        }
        h += `</div>`;
      }
    }
    h += `</div></div>`;
  }
  
  // Management Steps
  if (it.management_steps && it.management_steps.length) {
    h += `<div class="prot-sec"><div class="prot-sec-title">📋 Management Steps</div><div class="prot-sec-body">`;
    for (const step of it.management_steps) {
      h += `<div class="step-card">`;
      h += `<div class="step-num">${step.step_number || '•'}</div>`;
      h += `<div class="step-body">`;
      h += `<div class="step-action">${esc(step.action || '')}</div>`;
      if (step.details) h += `<div class="step-details">${esc(step.details)}</div>`;
      if (step.caution) h += `<div class="step-caution">⚠️ ${esc(step.caution)}</div>`;
      h += `</div></div>`;
    }
    h += `</div></div>`;
  }
  
  // Drugs
  if (it.drugs && it.drugs.length) {
    h += `<div class="prot-sec"><div class="prot-sec-title">💊 Drugs</div>`;
    for (const drug of it.drugs) {
      h += renderDrug(drug, cat);
    }
    h += `</div>`;
  }
  
  // Monitoring
  if (it.monitoring) {
    h += `<div class="prot-sec"><div class="prot-sec-title">📈 Monitoring</div><div class="prot-sec-body">`;
    if (typeof it.monitoring === 'string') {
      h += esc(it.monitoring);
    } else if (typeof it.monitoring === 'object') {
      for (const [mk, mv] of Object.entries(it.monitoring)) {
        h += `<div class="mon-row"><span class="mon-label">${esc(mk)}</span><span class="mon-val">${esc(mv)}</span></div>`;
      }
    }
    h += `</div></div>`;
  }
  
  // Warnings
  if (it.warnings) {
    const warns = Array.isArray(it.warnings) ? it.warnings : [it.warnings];
    if (warns.length) {
      h += `<div class="prot-sec"><div class="prot-sec-title">⚠️ Warnings</div><div class="prot-sec-body">`;
      for (const w of warns) h += `<div class="warn-item">${esc(w)}</div>`;
      h += `</div></div>`;
    }
  }
  
  // Disposition
  if (it.disposition) {
    h += `<div class="prot-sec"><div class="prot-sec-title">🏥 Disposition</div><div class="prot-sec-body">`;
    if (typeof it.disposition === 'string') {
      h += esc(it.disposition);
    } else if (typeof it.disposition === 'object') {
      for (const [dk, dv] of Object.entries(it.disposition)) {
        h += `<div class="disp-row"><span class="disp-label">${esc(dk)}</span><span class="disp-val">${esc(dv)}</span></div>`;
      }
    }
    h += `</div></div>`;
  }
  
  // Equipment (for procedures)
  if (it.equipment && it.equipment.length) {
    h += `<div class="prot-sec"><div class="prot-sec-title">🧰 Equipment</div><div class="eq-list">`;
    for (const eq of it.equipment) h += `<span class="eq-tag">${esc(eq)}</span>`;
    h += `</div></div>`;
  }
  
  // Settings (for procedures)
  if (it.settings && it.settings.length) {
    h += `<div class="prot-sec"><div class="prot-sec-title">⚙️ Settings</div><div class="prot-sec-body">`;
    for (const s of it.settings) {
      h += `<div class="set-row"><span class="set-param">${esc(s.parameter||'')}</span><span class="set-val">${esc(s.value||'')}</span>${s.unit?`<span class="set-unit">${esc(s.unit)}</span>`:''}${s.conditions?`<span class="set-cond">${esc(s.conditions)}</span>`:''}</div>`;
    }
    h += `</div></div>`;
  }
  
  // Formulas
  if (it.formulas && it.formulas.length) {
    h += `<div class="prot-sec"><div class="prot-sec-title">🧮 Formulas</div>`;
    for (const f of it.formulas) {
      h += `<div class="formula-card"><div class="formula-name">${esc(f.name||'')}</div><div class="formula-expr">${esc(f.formula||'')}</div>${f.interpretation?`<div class="formula-int">${esc(f.interpretation)}</div>`:''}</div>`;
    }
    h += `</div>`;
  }
  
  // Scoring systems embedded
  if (it.scoring_systems && it.scoring_systems.length) {
    for (const sc of it.scoring_systems) {
      h += `<div class="prot-sec"><div class="prot-sec-title">📊 ${esc(sc.name||'Score')}</div><div class="prot-sec-body">${esc(sc.description||'')}</div></div>`;
    }
  }
  
  h += '</div>';
  return h;
}

function renderDrug(drug, cat) {
  const k = mK(drug, cat);
  let h = `<div class="drug-card"><button class="fav" onclick="togF('${k}')">${iF(k)?'★':'☆'}</button>`;
  h += `<div class="drug-name">${esc(drug.item || drug.drug || '')}</div>`;
  
  const ad = drug.adult_dose || '';
  if (ad) {
    const wd = W>0 ? calcWeightDose(ad, W) : null;
    h += `<div class="drug-dose">${esc(ad)}${wd?`<span class="wtag">${esc(wd)}</span>`:''}</div>`;
  }
  const pd = drug.paediatric_dose || '';
  if (pd) h += `<div class="drug-paed">Paed: ${esc(pd)}</div>`;
  const rt = drug.route || '';
  if (rt) h += `<div class="drug-route">${esc(rt)}</div>`;
  
  // Infusion calculator for infusion drugs
  const nm = drug.item || drug.drug || '';
  if (isInfusionDrug(nm, drug)) h += renderInfusionCalc(drug, nm);
  
  const notes = drug.notes || drug.notes_updates || '';
  if (notes) h += `<div class="drug-notes">${esc(notes)}</div>`;
  
  // Cautions
  if (drug.cautions && drug.cautions.length) {
    h += `<div class="drug-cautions">`;
    for (const c of drug.cautions) h += `<span class="caution-tag">${esc(c)}</span>`;
    h += `</div>`;
  }
  // Contraindications
  if (drug.contraindications && drug.contraindications.length) {
    h += `<div class="drug-contra">`;
    for (const c of drug.contraindications) h += `<span class="contra-tag">${esc(c)}</span>`;
    h += `</div>`;
  }
  
  h += '</div>';
  return h;
}

/* ===== WEIGHT DOSE CALCULATOR ===== */
function calcWeightDose(doseStr, wt) {
  if (!doseStr || !wt) return null;
  const s = doseStr.toString();
  // Range pattern: "0.05 - 1 ug/kg/min"
  const rangeMatch = s.match(/([\d.]+)\s*[-–]\s*([\d.]+)\s*(ug|mcg|mg|g|units|mEq|mmol|ml|U)\s*\/\s*kg/i);
  if (rangeMatch) {
    const minV = parseFloat(rangeMatch[1]) * wt;
    const maxV = parseFloat(rangeMatch[2]) * wt;
    const unit = rangeMatch[3].toLowerCase();
    const unitMap = {ug:'mcg', mcg:'mcg', mg:'mg', g:'g', units:'units', meq:'mEq', mmol:'mmol', ml:'mL', u:'U'};
    return minV.toFixed(1).replace(/\.0$/, '') + ' - ' + maxV.toFixed(1).replace(/\.0$/, '') + ' ' + (unitMap[unit] || unit);
  }
  // Single value: "10 mg/kg"
  const singleMatch = s.match(/([\d.]+)\s*(ug|mcg|mg|g|units|mEq|mmol|ml|U)\s*\/\s*kg/i);
  if (singleMatch) {
    const val = parseFloat(singleMatch[1]) * wt;
    const unit = singleMatch[2].toLowerCase();
    const unitMap = {ug:'mcg', mcg:'mcg', mg:'mg', g:'g', units:'units', meq:'mEq', mmol:'mmol', ml:'mL', u:'U'};
    return val.toFixed(1).replace(/\.0$/, '') + ' ' + (unitMap[unit] || unit);
  }
  // ml/kg pattern
  const mlMatch = s.match(/([\d.]+)\s*ml\/kg/i);
  if (mlMatch) {
    return (parseFloat(mlMatch[1]) * wt).toFixed(1).replace(/\.0$/, '') + ' mL';
  }
  return null;
}

/* ===== INFUSION CALCULATOR ===== */
function isInfusionDrug(name, it) {
  const n = (name || '').toLowerCase();
  const doses = ((it.adult_dose || '') + ' ' + (it.notes || '') + ' ' + (it.notes_updates || '')).toLowerCase();
  return doses.includes('mcg/kg/min') || doses.includes('ug/kg/min') || doses.includes('mg/kg/hr') || doses.includes('mg/kg/min') || doses.includes('units/kg/hr') || n.includes('infusion');
}

function renderInfusionCalc(it, name) {
  const id = 'inf_' + Math.random().toString(36).substr(2, 9);
  return `<div class="inf-calc">
    <div class="inf-title">Infusion Calc</div>
    <div class="inf-row">
      <div class="inf-fld"><label>Dose</label><input type="number" step="0.01" id="${id}-d" placeholder="mcg/kg/min"></div>
      <div class="inf-fld"><label>Conc</label><input type="number" step="0.1" id="${id}-c" placeholder="mcg/mL"></div>
      <div class="inf-fld"><label>Weight</label><input type="number" id="${id}-w" placeholder="kg" value="${W||''}"></div>
    </div>
    <button class="inf-btn" onclick="calcInfusion('${id}')">Calculate mL/hr</button>
    <div class="inf-res" id="${id}-r"></div>
  </div>`;
}

function calcInfusion(id) {
  const dose = parseFloat(document.getElementById(id + '-d')?.value);
  const conc = parseFloat(document.getElementById(id + '-c')?.value);
  const wt = parseFloat(document.getElementById(id + '-w')?.value);
  const resEl = document.getElementById(id + '-r');
  if (!dose || !conc || !wt) { resEl.textContent = 'Enter all values'; return; }
  const mlhr = (dose * wt * 60) / conc;
  resEl.innerHTML = `<b>${mlhr.toFixed(1)} mL/hr</b>`;
}

/* ===== ED PROCEDURES RENDERER ===== */
function renderEDProcedures(d) {
  const protocols = d.protocols || [];
  // Group items by protocol name
  const groups = {};
  let currentProtocol = null;
  for (const it of protocols) {
    if (!it.parent_protocol) {
      currentProtocol = it.item || 'Unnamed';
      if (!groups[currentProtocol]) groups[currentProtocol] = { protocol: it, children: [] };
    } else {
      if (!groups[it.parent_protocol]) groups[it.parent_protocol] = { protocol: null, children: [] };
      groups[it.parent_protocol].children.push(it);
    }
  }
  
  let h = `<div class="sc" id="15_ed_procedures"><h2>🩺 ED Procedures</h2>`;
  for (const [protoName, group] of Object.entries(groups)) {
    const proto = group.protocol;
    const children = group.children;
    h += `<div class="cd protocol-card">`;
    h += `<div class="n" style="font-size:1.1rem;font-weight:700;color:var(--fg);margin-bottom:.3rem">${esc(protoName)}</div>`;
    if (proto && proto.notes_updates) {
      const secs = parseProtocolSections(proto.notes_updates);
      for (const s of secs) {
        h += `<div class="prot-sec"><div class="prot-sec-title">${esc(s.title)}</div><div class="prot-sec-body">${s.content}</div></div>`;
      }
    }
    // Equipment list
    if (proto && proto.equipment && proto.equipment.length) {
      h += `<div class="eq-list">`;
      for (const eq of proto.equipment) h += `<span class="eq-tag">${esc(eq)}</span>`;
      h += `</div>`;
    }
    // Settings
    if (proto && proto.settings && proto.settings.length) {
      h += `<div class="prot-sec"><div class="prot-sec-title">⚙️ Settings</div>`;
      for (const s of proto.settings) {
        h += `<div class="set-row"><span class="set-param">${esc(s.parameter||'')}</span><span class="set-val">${esc(s.value||'')}</span>${s.unit?`<span class="set-unit">${esc(s.unit)}</span>`:''}${s.conditions?`<span class="set-cond">${esc(s.conditions)}</span>`:''}</div>`;
      }
      h += `</div>`;
    }
    // Step-by-step
    const steps = children.filter(c => c.step_number || c.action);
    if (steps.length) {
      h += `<div class="prot-sec"><div class="prot-sec-title">📋 Step by Step</div>`;
      for (const step of steps) {
        h += `<div class="step-card">`;
        h += `<div class="step-num">${step.step_number || '•'}</div>`;
        h += `<div class="step-body">`;
        h += `<div class="step-action">${esc(step.action || '')}</div>`;
        if (step.details) h += `<div class="step-details">${esc(step.details)}</div>`;
        if (step.caution) h += `<div class="step-caution">⚠️ ${esc(step.caution)}</div>`;
        h += `</div></div>`;
      }
      h += `</div>`;
    }
    // Drugs
    const drugs = children.filter(c => c.adult_dose);
    if (drugs.length) {
      h += `<div class="prot-sec"><div class="prot-sec-title">💊 Drugs</div>`;
      for (const drug of drugs) h += renderDrug(drug, '15_ed_procedures');
      h += `</div>`;
    }
    // Monitoring
    const monitors = children.filter(c => c.monitoring_parameter);
    if (monitors.length) {
      h += `<div class="prot-sec"><div class="prot-sec-title">📈 Monitoring</div>`;
      for (const m of monitors) h += `<div class="mon-row">${esc(m.monitoring_parameter||'')}${m.frequency?` <span class="mon-freq">(${esc(m.frequency)})</span>`:''}</div>`;
      h += `</div>`;
    }
    // Complications
    const complications = children.filter(c => c.complication);
    if (complications.length) {
      h += `<div class="prot-sec"><div class="prot-sec-title">⚠️ Complications</div>`;
      for (const c of complications) h += `<div class="comp-row">${esc(c.complication||'')}${c.management?` → ${esc(c.management)}`:''}</div>`;
      h += `</div>`;
    }
    h += `</div>`;
  }
  h += '</div>';
  return h;
}

/* ===== PROTOCOL TEXT PARSER ===== */
function parseProtocolSections(text) {
  if (!text) return [];
  const sections = [];
  const lines = text.split('|').map(l => l.trim()).filter(l => l.length);
  let current = { title: 'Overview', content: '' };
  for (const line of lines) {
    const clean = line.replace(/^[-–•]\s*/, '').trim();
    if (!clean) continue;
    if (clean.startsWith('Symptoms:') || clean.startsWith('Signs:') || clean.startsWith('Risk:') || 
        clean.startsWith('Bedside:') || clean.startsWith('Lab:') || clean.startsWith('Imaging:') ||
        clean.startsWith('Monitor:') || clean.startsWith('⚠️') || clean.startsWith('→') ||
        clean.startsWith('STEPS:') || clean.startsWith('Class:') || clean.startsWith('Dx:')) {
      if (current.content) sections.push(current);
      current = { title: clean.split(':')[0], content: clean.split(':').slice(1).join(':').trim() };
    } else {
      current.content += (current.content ? ' | ' : '') + clean;
    }
  }
  if (current.content) sections.push(current);
  return sections;
}

/* ===== SCORE CALCULATORS ===== */
function renderScoreCalculators(d) {
  let h = `<div class="sc" id="16_score_calculators"><h2>📊 Score Calculators</h2>`;
  for (const [key, calc] of Object.entries(d)) {
    h += `<div class="cd calc-card">`;
    h += `<div class="n" style="font-size:1.1rem;font-weight:700">${esc(calc.name)}</div>`;
    h += `<div class="calc-cat">${esc(calc.category)}</div>`;
    
    if (calc.calculator_type === 'formula') {
      h += renderFormulaCalc(key, calc);
    } else if (calc.low_risk_when_all_no) {
      h += renderYesNoCalc(key, calc);
    } else if (calc.all_no_means_pe_excluded) {
      h += renderYesNoCalc(key, calc);
    } else if (calc.components && calc.components[0] && calc.components[0].options) {
      h += renderSegmentedCalc(key, calc);
    } else if (calc.components && calc.components[0] && calc.components[0].points !== undefined) {
      h += renderPointCalc(key, calc);
    } else if (calc.components && calc.components[0] && calc.components[0].dangerous !== undefined) {
      h += renderDecisionCalc(key, calc);
    } else if (calc.components && calc.components[0] && calc.components[0].refer !== undefined) {
      h += renderChecklistCalc(key, calc);
    } else {
      h += `<div class="calc-placeholder">Interactive calculator - tap options to score</div>`;
    }
    
    // Result bar
    h += `<div class="calc-result" id="res-${key}"><div class="calc-res-label">Tap options above to calculate</div></div>`;
    h += `</div>`;
  }
  h += '</div>';
  return h;
}

function renderSegmentedCalc(key, calc) {
  let h = '';
  scoreSt[key] = {};
  for (const comp of calc.components) {
    h += `<div class="calc-comp"><div class="calc-comp-label">${esc(comp.name)}</div><div class="calc-seg" id="seg-${key}-${comp.key}">`;
    for (const opt of comp.options) {
      h += `<button class="seg-btn" onclick="setSeg('${key}','${comp.key}',${opt.value},this)">${esc(opt.label)}<small>${esc(opt.desc)}</small></button>`;
    }
    h += `</div></div>`;
  }
  return h;
}

function renderYesNoCalc(key, calc) {
  let h = '';
  scoreSt[key] = {};
  for (const comp of calc.components) {
    h += `<div class="calc-yn"><div class="calc-yn-label">${esc(comp.name)}</div><div class="calc-yn-btns">`;
    h += `<button class="yn-btn" onclick="setYN('${key}','${comp.key}',0,this)">No</button>`;
    h += `<button class="yn-btn" onclick="setYN('${key}','${comp.key}',1,this)">Yes</button>`;
    h += `</div></div>`;
  }
  return h;
}

function renderPointCalc(key, calc) {
  let h = '';
  scoreSt[key] = 0;
  for (const comp of calc.components) {
    h += `<div class="calc-pt"><label class="pt-lbl"><input type="checkbox" onchange="togglePt('${key}',${comp.points||1},this)"> ${esc(comp.name)} ${comp.points?`(+${comp.points})`:''}</label></div>`;
  }
  return h;
}

function renderDecisionCalc(key, calc) {
  let h = '';
  scoreSt[key] = {};
  // Dangerous factors
  const dangerous = calc.components.filter(c => c.dangerous);
  if (dangerous.length) {
    h += `<div class="calc-dgrp"><div class="calc-dgrp-title">🚨 High Risk Factors</div>`;
    for (const comp of dangerous) {
      h += `<div class="calc-d"><label class="pt-lbl"><input type="checkbox" onchange="setDec('${key}','${comp.key}',this.checked,this)"> ${esc(comp.name)}</label></div>`;
    }
    h += `</div>`;
  }
  // Simple factors
  const simple = calc.components.filter(c => c.simple);
  if (simple.length) {
    h += `<div class="calc-dgrp"><div class="calc-dgrp-title">✅ Low Risk Factors</div>`;
    for (const comp of simple) {
      h += `<div class="calc-d"><label class="pt-lbl"><input type="checkbox" onchange="setDec('${key}','${comp.key}',this.checked,this)"> ${esc(comp.name)}</label></div>`;
    }
    h += `</div>`;
  }
  return h;
}

function renderChecklistCalc(key, calc) {
  let h = '';
  scoreSt[key] = {};
  for (const comp of calc.components) {
    h += `<div class="calc-d"><label class="pt-lbl"><input type="checkbox" onchange="setChk('${key}','${comp.name}',this.checked,this)"> ${esc(comp.name)}</label></div>`;
  }
  return h;
}

function renderFormulaCalc(key, calc) {
  let h = `<div class="calc-formula">${esc(calc.formula)}</div>`;
  h += `<div class="calc-inputs">`;
  for (const inp of calc.inputs) {
    h += `<div class="calc-inp"><label>${esc(inp.name)} (${esc(inp.unit)})</label><input type="number" id="${key}-${inp.key}" oninput="calcFormula('${key}')"></div>`;
  }
  h += `</div>`;
  return h;
}

/* ===== SCORE CALCULATION LOGIC ===== */
function setSeg(key, compKey, value, btn) {
  if (!scoreSt[key]) scoreSt[key] = {};
  scoreSt[key][compKey] = value;
  // Update UI
  const container = btn.parentElement;
  container.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  recalcSeg(key);
}

function recalcSeg(key) {
  const calc = D['16_score_calculators'][key];
  const st = scoreSt[key];
  let total = 0;
  for (const comp of calc.components) {
    if (st[comp.key] !== undefined) total += st[comp.key];
  }
  showResult(key, calc, total);
}

function setYN(key, compKey, value, btn) {
  if (!scoreSt[key]) scoreSt[key] = {};
  scoreSt[key][compKey] = value;
  const container = btn.parentElement;
  container.querySelectorAll('.yn-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  recalcYN(key);
}

function recalcYN(key) {
  const calc = D['16_score_calculators'][key];
  const st = scoreSt[key];
  const allAnswered = calc.components.every(c => st[c.key] !== undefined);
  if (!allAnswered) return;
  const anyYes = calc.components.some(c => st[c.key] === 1);
  showInterpretation(key, calc, anyYes ? 'any_yes' : 'all_no');
}

function togglePt(key, points, cb) {
  if (!scoreSt[key]) scoreSt[key] = 0;
  scoreSt[key] += cb.checked ? points : -points;
  const calc = D['16_score_calculators'][key];
  showResult(key, calc, scoreSt[key]);
}

function setDec(key, compKey, checked, cb) {
  if (!scoreSt[key]) scoreSt[key] = {};
  scoreSt[key][compKey] = checked;
  recalcDec(key);
}

function recalcDec(key) {
  const calc = D['16_score_calculators'][key];
  const st = scoreSt[key];
  const anyDangerous = calc.components.filter(c => c.dangerous).some(c => st[c.key]);
  if (anyDangerous) {
    showInterpretation(key, calc, 'any_dangerous_yes');
    return;
  }
  const anySimple = calc.components.filter(c => c.simple).some(c => st[c.key]);
  if (anySimple) {
    showInterpretation(key, calc, 'no_dangerous_and_any_simple_yes');
    return;
  }
  showInterpretation(key, calc, 'all_no');
}

function setChk(key, compName, checked, cb) {
  if (!scoreSt[key]) scoreSt[key] = {};
  scoreSt[key][compName] = checked;
  recalcChk(key);
}

function recalcChk(key) {
  const calc = D['16_score_calculators'][key];
  const st = scoreSt[key];
  const anyChecked = Object.values(st).some(v => v);
  showInterpretation(key, calc, anyChecked ? 'any_yes' : 'all_no');
}

function calcFormula(key) {
  const calc = D['16_score_calculators'][key];
  try {
    let formula = calc.formula;
    for (const inp of calc.inputs) {
      const val = parseFloat(document.getElementById(`${key}-${inp.key}`)?.value);
      if (isNaN(val)) return;
      formula = formula.replace(new RegExp(inp.key, 'g'), val);
    }
    // Replace common function names
    formula = formula.replace(/\[([^\]]+)\]/g, '($1)');
    const result = eval(formula);
    showFormulaResult(key, calc, result);
  } catch (e) {
    document.getElementById(`res-${key}`).innerHTML = '<div class="calc-res-label">Enter valid numbers</div>';
  }
}

function showResult(key, calc, total) {
  const el = document.getElementById(`res-${key}`);
  let interp = '';
  if (calc.interpretation) {
    for (const rule of calc.interpretation) {
      if (rule.min !== undefined && rule.max !== undefined && total >= rule.min && total <= rule.max) {
        interp = `<div class="res-action ${rule.label.toLowerCase().replace(/\s+/g,'-')}">${esc(rule.label)}: ${esc(rule.action)}</div>`;
        break;
      }
    }
  }
  el.innerHTML = `<div class="res-score">${total}</div>${interp}`;
}

function showInterpretation(key, calc, condition) {
  const el = document.getElementById(`res-${key}`);
  let interp = '';
  if (calc.interpretation) {
    for (const rule of calc.interpretation) {
      if (rule.condition === condition) {
        const cls = rule.label.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
        interp = `<div class="res-action ${cls}">${esc(rule.label)}: ${esc(rule.action)}</div>`;
        break;
      }
    }
  }
  el.innerHTML = interp || `<div class="res-action">${esc(condition)}</div>`;
}

function showFormulaResult(key, calc, result) {
  const el = document.getElementById(`res-${key}`);
  let interp = '';
  if (calc.interpretation) {
    const rule = calc.interpretation[0];
    if (rule) {
      interp = `<div class="res-action">${esc(rule.label)}: ${result.toFixed(2)} ${esc(rule.action)}</div>`;
    }
  }
  el.innerHTML = `<div class="res-score">${result.toFixed(2)}</div>${interp}`;
}

/* ===== SEARCH ===== */
function doSearch(){
  const q=document.getElementById('s').value.toLowerCase().trim();
  if(!q){if(act==='favourites')renderF();else if(act==='all')renderAll();else renderCat(act);return}
  let h='';let n=0;
  for(const k of ORDER){
    if(k==='favourites'||k==='all'||!D[k])continue;
    const d=D[k];let sh='';
    // Check score calculators
    if(k==='16_score_calculators'){
      for(const [sk,sc]of Object.entries(d)){
        const nm=(sc.name||'').toLowerCase();
        const cat=(sc.category||'').toLowerCase();
        if(nm.includes(q)||cat.includes(q)){sh+=`<div class="cd calc-card"><div class="n">${esc(sc.name)}</div><div class="calc-cat">${esc(sc.category)}</div></div>`;n++}
      }
    } else {
      for(const sub in d){
        const arr=d[sub];
        if(!Array.isArray(arr))continue;
        for(const it of arr){
          const txt=(it.item||it.drug||it.condition_or_drug||it.poison_or_drug||it.antidote_treatment||it.product||it.category||it.name||'')+' '+(it.notes_updates||it.notes||'')+' '+(it.adult_dose||'')+' '+(it.paediatric_dose||'');
          if(txt.toLowerCase().includes(q)){
            if(k==='15_ed_procedures') {
              // For ED procedures in search, show simplified
              sh+=`<div class="cd"><div class="n">${esc(it.item||it.parent_protocol||'')}</div>${it.adult_dose?`<div class="dg">${esc(it.adult_dose)}</div>`:''}${it.notes_updates?`<div class="nt">${esc(it.notes_updates.substring(0,200))}</div>`:''}</div>`;
            } else {
              sh+=renderIt(it,k);
            }
            n++;
          }
        }
      }
    }
    if(sh)h+=`<div class="sc" id="${k}"><h2>${I[k]} ${C[k]}</h2>${sh}</div>`;
  }
  h+=`<div class="search-count">${n} result${n!==1?'s':''}</div>`;
  document.getElementById('c').innerHTML=h||'<div class="nores">No results found</div>';
  bindTog();updF();
}

/* ===== TOGGLE DETAILS ===== */
function bindTog(){
  document.querySelectorAll('.cd').forEach(c=>{
    c.addEventListener('click',e=>{
      if(e.target.closest('button')||e.target.closest('input')||e.target.closest('label')||e.target.closest('.calc-seg')||e.target.closest('.inf-calc'))return;
      c.classList.toggle('exp');
    });
  });
}

/* ===== FAVOURITES ===== */
function renderF(){
  const f=gF();let h='<div class="sc"><h2>⭐ Favourites</h2>';
  if(!f.length){h+='<div class="nores">Tap the star on any item to save it here.</div></div>';document.getElementById('c').innerHTML=h;return}
  let n=0;
  for(const key of f){
    const [cat,itemName]=key.split('::');
    if(!D[cat])continue;
    // Search for the item in the category
    const catData=D[cat];
    for(const sub in catData){
      const arr=catData[sub];
      if(!Array.isArray(arr))continue;
      for(const it of arr){
        const name=it.item||it.drug||it.condition_or_drug||it.poison_or_drug||it.antidote_treatment||it.product||it.category||'';
        if(name===itemName){h+=renderIt(it,cat);n++;break}
      }
    }
  }
  h+=`</div>`;
  document.getElementById('c').innerHTML=h;
  bindTog();updF();
}

/* ===== SCROLL TO TOP ===== */
function scrollToTop(){document.getElementById('c').scrollTo({top:0,behavior:'smooth'})}
