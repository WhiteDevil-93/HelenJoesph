const APP_VERSION='4.1';
let D=null,W=0,act='all',deferred=null,scoreSt={};

const C={favourites:'Favourites',all:'All','1_resuscitation_fluids_and_inotropes':'Resuscitation','2_airway_and_ventilation':'Airway & Vent','3_sedation_analgesia_and_neurology':'Sedation & Neuro','4_antimicrobials_and_infectious_diseases':'Antimicrobials','5_metabolic_electrolytes_and_nutrition':'Metabolic','6_poisoning_and_toxicology':'Toxicology','7_useful_formulae':'Formulae','8_cardiovascular':'Cardiovascular','9_blood_products':'Blood','10_endocrine_and_other':'Endocrine','11_ed_medical_emergencies':'ED Medical','12_ed_toxicology':'ED Toxic','13_ed_trauma_surgical':'ED Trauma','14_ed_metabolic':'ED Metabolic','15_ed_procedures':'ED Procedures','16_score_calculators':'Score Calc'};
const I={'favourites':'\u2B50','all':'\uD83D\uDCCB','1_resuscitation_fluids_and_inotropes':'\uD83D\uDC89','2_airway_and_ventilation':'\uD83E\uDEC1','3_sedation_analgesia_and_neurology':'\uD83E\uDDE0','4_antimicrobials_and_infectious_diseases':'\uD83E\uDDA0','5_metabolic_electrolytes_and_nutrition':'\u2697\uFE0F','6_poisoning_and_toxicology':'\u2620\uFE0F','7_useful_formulae':'\uD83D\uDCD0','8_cardiovascular':'\u2764\uFE0F','9_blood_products':'\uD83E\uDE78','10_endocrine_and_other':'\uD83D\uDD2C','11_ed_medical_emergencies':'\uD83E\uDEC0','12_ed_toxicology':'\u2620\uFE0F','13_ed_trauma_surgical':'\uD83D\uDE91','14_ed_metabolic':'\u2697\uFE0F','15_ed_procedures':'\uD83E\uDE7A','16_score_calculators':'\uD83D\uDCCA'};
const ORDER=['favourites','all','1_resuscitation_fluids_and_inotropes','2_airway_and_ventilation','3_sedation_analgesia_and_neurology','4_antimicrobials_and_infectious_diseases','5_metabolic_electrolytes_and_nutrition','6_poisoning_and_toxicology','7_useful_formulae','8_cardiovascular','9_blood_products','10_endocrine_and_other','11_ed_medical_emergencies','12_ed_toxicology','13_ed_trauma_surgical','14_ed_metabolic','15_ed_procedures','16_score_calculators'];

/* ===== CACHE BUSTING ===== */
function checkVersion(){
  const cached=localStorage.getItem('tr_ver');
  if(cached&&cached!==APP_VERSION){
    // Auto-clear old cache
    localStorage.removeItem('tr_ver');
    localStorage.removeItem('tr_f');
    localStorage.removeItem('tr_w');
    scoreSt={};
    // Unregister old service workers
    if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(regs=>regs.forEach(r=>r.unregister()));
    // Force reload once
    if(!sessionStorage.getItem('tr_reloaded')){sessionStorage.setItem('tr_reloaded','1');location.reload(true)}
  }
  localStorage.setItem('tr_ver',APP_VERSION);
  document.getElementById('ver').textContent='v'+APP_VERSION;
}

/* ===== WEIGHT ===== */
function gW(){return parseFloat(localStorage.getItem('tr_w')||'0')}
function sW(v){W=parseFloat(v)||0;localStorage.setItem('tr_w',W)}

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
    // Cache-busting fetch
    const r=await fetch('data.json?v='+APP_VERSION,{cache:'no-store'});
    D=await r.json();mkNav();renderAll();updF();
  }catch(e){document.getElementById('c').innerHTML='<div class="nores"><div class=ico>\u26A0\uFE0F</div>Failed to load data. Please check connection.</div>'}
  document.getElementById('s').addEventListener('input',doSearch);
  if('serviceWorker'in navigator){
    // Register cache-busting SW
    navigator.serviceWorker.register('sw.js?v='+APP_VERSION).catch(()=>{});
  }
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;document.getElementById('inst').classList.add('on')});
  let cont=document.getElementById('c');
  cont.addEventListener('scroll',()=>document.getElementById('top').classList.toggle('on',cont.scrollTop>400));
}
function doInstall(){if(deferred){deferred.prompt();deferred=null;document.getElementById('inst').classList.remove('on')}};

/* ===== NAV ===== */
function mkNav(){
  let h='';
  for(const k of ORDER){
    if(k==='favourites'){const c=gF().length;h+=`<button class="cp${k===act?' on':''}" data-c="${k}" onclick="setCat('${k}')">${I[k]} ${C[k]}${c?`<span class=n id=favCt>${c}</span>`:''}</button>`}
    else if(k==='all')h+=`<button class="cp on" data-c="all" onclick="setCat('all')">${I.all} All</button>`
    else if(D&&D[k])h+=`<button class="cp" data-c="${k}" onclick="setCat('${k}')">${I[k]} ${C[k]}</button>`
  }
  document.getElementById('nav').innerHTML=h
}
function setCat(c){act=c;document.querySelectorAll('.cp').forEach(b=>b.classList.toggle('on',b.dataset.c===c));document.getElementById('s').value='';if(c==='favourites')renderF();else if(c==='all')renderAll();else renderCat(c)}

/* ===== RENDER ===== */
function renderAll(){let h='';for(const k of ORDER)if(k!=='favourites'&&k!=='all'&&D[k])h+=renderSect(k);document.getElementById('c').innerHTML=h||'<div class=nores>No data</div>';bindTog();updF()}
function renderCat(cat){document.getElementById('c').innerHTML=renderSect(cat);bindTog();updF()}

function renderSect(cat){
  const d=D[cat];if(!d)return'';
  // Score calculators section
  if(cat==='16_score_calculators')return renderScores(d);
  let body='';
  for(const[sk,items]of Object.entries(d)){
    if(Array.isArray(items)){
      let sm='';
      for(const it of items){const c=renderItem(it,cat);if(c)sm+=c}
      if(sm)body+=`<div class="sub">${sk.replace(/_/g,' ').replace(/^\w/,c=>c.toUpperCase())}</div>`+sm
    }else{const c=renderItem(items,cat);if(c)body+=c}
  }
  if(!body)return'';
  return `<div class="sect open" data-c="${cat}"><div class="sh" onclick="togS(this)"><div style="display:flex;align-items:center"><div class="shi">${I[cat]}</div><div class="sht">${C[cat]}</div></div><div class="shc">\u25BC</div></div><div class="sb">${body}</div></div>`
}

/* ===== ITEM RENDERER: Drug vs Protocol ===== */
function renderItem(it,cat){
  const n=it.item||it.drug||it.condition_or_drug||it.poison_or_drug||it.antidote_treatment||it.product||'';
  if(!n)return'';
  // Protocol header entries (━━ style)
  if(n.startsWith('\u2501'))return renderProtoHeader(it,cat);
  // Check if this is a protocol entry (has structured fields or very long notes)
  const notes=(it.notes_updates||it.notes||'');
  const isProtocol=it.protocol_type==='ed_protocol'||it.protocol_type==='ed_guideline'||
    (notes.length>80&&(notes.includes(':')||notes.includes('|')||notes.includes('STEPS')))||
    it.parent_protocol||it.clinical_features||it.management_steps;
  if(isProtocol)return renderProtocol(it,cat,n,notes);
  return renderDrug(it,cat,n);
}

/* ===== PROTOCOL HEADER (━━) ===== */
function renderProtoHeader(it,cat){
  const n=it.item||'';
  return `<div class="proto-h" style="padding:.4rem .75rem;border-top:1px solid var(--b);background:rgba(0,0,0,.2)">
    <div class="proto-icon">\u25B6</div>
    <div style="font-size:.85rem;font-weight:700">${n.replace(/\u2501/g,'').trim()}</div>
  </div>`
}

/* ===== PROTOCOL CARD ===== */
function renderProtocol(it,cat,n,notes){
  const dk=mK(it,cat),fv=iF(dk);
  let h=`<div class="proto" data-s="${(n+' '+notes).toLowerCase()}">`;
  // Header
  let badge='';
  if(notes.toLowerCase().includes('overdose'))badge='<span class="bdg bh">OD</span>';
  else if(notes.toLowerCase().includes('trauma'))badge='<span class="bdg bh">Trauma</span>';
  else if(notes.toLowerCase().includes('sepsis'))badge='<span class="bdg bh">Sepsis</span>';
  else if(notes.toLowerCase().includes('stroke'))badge='<span class="bdg bh">Stroke</span>';
  h+=`<div class="proto-h">
    <div class="proto-icon">\uD83D\uDCC4</div>
    <div class="proto-title">${n}${badge}</div>
    <button class="proto-star${fv?' on':''}" onclick="togF('${dk}')">${fv?'\u2605':'\u2606'}</button>
  </div>`;
  
  // Parse and render structured sections
  h+=parseProtocolSections(notes);
  
  // Parent protocol link for drug entries
  if(it.parent_protocol)h+=`<div style="font-size:.6rem;color:var(--a);margin-top:.2rem">\u25B8 ${it.parent_protocol}</div>`;
  h+='</div>';
  return h;
}

/* ===== PARSE PROTOCOL NOTES INTO SECTIONS ===== */
function parseProtocolSections(text){
  if(!text||text.length<10)return'';
  let h='';
  
  // Split by common section markers
  // Pattern: "Key: value | Key: value" or "FEATURES: a,b,c | MANAGEMENT: step1 -> step2"
  
  // 1. Extract steps (arrows or numbered)
  const steps=[];
  // Match "STEPS: a -> b -> c" or "STEP 1: x | STEP 2: y"
  const stepMatch=text.match(/STEPS?:\s*([^|]*)/i);
  if(stepMatch){
    const stepTexts=stepMatch[1].split(/->|→|\d+\./).filter(s=>s.trim());
    for(let i=0;i<stepTexts.length;i++){
      const st=stepTexts[i].trim();
      if(st.length>2)steps.push(st);
    }
  }
  // Also match steps separated by arrows anywhere
  if(steps.length===0){
    const arrowParts=text.split(/->|→/);
    if(arrowParts.length>1){
      for(let i=0;i<arrowParts.length;i++){
        const st=arrowParts[i].replace(/^[^a-zA-Z]*/,'').trim();
        // Only take reasonable-length steps
        if(st.length>3&&st.length<120)steps.push(st);
      }
    }
  }
  
  // 2. Extract features by system
  const features={};
  const sysPatterns={
    'Muscarinic':/Muscarinic[:\s]*([^|]*)/i,
    'Nicotinic':/Nicotinic[:\s]*([^|]*)/i,
    'CNS':/CNS[:\s]*([^|]*)/i,
    'Symptoms':/Symptoms[:\s]*([^|]*)/i,
    'Signs':/Signs[:\s]*([^|]*)/i,
    'Clinical Features':/Clinical Features[:\s]*([^|]*)/i
  };
  for(const[sys,pattern]of Object.entries(sysPatterns)){
    const m=text.match(pattern);
    if(m){const items=m[1].split(/[,;]/).map(s=>s.trim()).filter(s=>s.length>1);if(items.length)features[sys]=items}
  }
  
  // 3. Extract decontamination info
  const decon={};
  const deconPatterns={
    'Activated Charcoal':/Activated Charcoal[:\s]*([^|]*)/i,
    'Gastric Lavage':/Gastric Lavage[:\s]*([^|]*)/i,
    'Skin Decon':/Skin Decon(?:tamination)?[:\s]*([^|]*)/i,
    'Whole Bowel':/Whole Bowel[:\s]*([^|]*)/i
  };
  for(const[item,pattern]of Object.entries(deconPatterns)){
    const m=text.match(pattern);if(m)decon[item]=m[1].trim()
  }
  
  // 4. Extract warnings
  const warnings=[];
  const warnMatch=text.match(/WARNINGS?:\s*([^|]*)/i);
  if(warnMatch)warnMatch[1].split(/[|,]/).forEach(w=>{const wt=w.trim();if(wt.length>3)warnings.push(wt)});
  // Also match ⚠️ symbols
  const symMatch=text.match(/⚠️\s*([^|]*)/g);
  if(symMatch)symMatch.forEach(m=>{const w=m.replace('⚠️','').trim();if(w.length>3)warnings.push(w)});
  
  // 5. Extract disposition
  let disp='';
  const dispMatch=text.match(/Disposition[:\s]*([^|]*)/i);
  if(dispMatch)disp=dispMatch[1].trim();
  
  // 6. Extract monitoring
  const monitor=[];
  const monMatch=text.match(/Monitor(?:ing)?:\s*([^|]*)/i);
  if(monMatch)monMatch[1].split(/[,;]/).forEach(m=>{const mt=m.trim();if(mt.length>2)monitor.push(mt)});
  
  // === RENDER SECTIONS ===
  
  // Features section
  if(Object.keys(features).length>0){
    h+=`<div class="ps"><div class="ps-h" onclick="togPS(this)">\uD83D\uDE37 Clinical Features</div><div class="ps-b" style="display:none">`;
    for(const[sys,items]of Object.entries(features)){
      h+=`<div style="font-weight:700;color:var(--a);font-size:.7rem;margin:.15rem 0;text-transform:uppercase;letter-spacing:.5px">${sys}</div>`;
      h+=`<ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul>`;
    }
    h+='</div></div>';
  }
  
  // Steps section
  if(steps.length>0){
    h+=`<div class="ps"><div class="ps-h" onclick="togPS(this)">\uD83D\uDCCB Management Steps</div><div class="ps-b" style="display:none"><div class="steplist">`;
    for(let i=0;i<steps.length;i++){
      h+=`<div class="steprow"><span class="steparrow">\u2192</span><div class="steptxt"><strong>Step ${i+1}:</strong> ${steps[i]}</div></div>`;
    }
    h+='</div></div></div>';
  }
  
  // Decontamination section
  if(Object.keys(decon).length>0){
    h+=`<div class="ps"><div class="ps-h" onclick="togPS(this)">\uD83E\uDDF5 Decontamination</div><div class="ps-b" style="display:none">`;
    for(const[item,val]of Object.entries(decon)){
      h+=`<div style="margin:.15rem 0"><strong style="color:var(--a)">${item}:</strong> ${val}</div>`;
    }
    h+='</div></div>';
  }
  
  // Monitoring section
  if(monitor.length>0){
    h+=`<div class="ps"><div class="ps-h" onclick="togPS(this)">\uD83D\uDC41 Monitoring</div><div class="ps-b" style="display:none"><ul>${monitor.map(m=>`<li>${m}</li>`).join('')}</ul></div></div>`;
  }
  
  // Warnings section
  if(warnings.length>0){
    h+=`<div class="warnbox"><div class="wl">\u26A0 Warnings</div>${warnings.join('<br>')}</div>`;
  }
  
  // Disposition
  if(disp){
    h+=`<div style="margin-top:.25rem;padding:.3rem .5rem;border-radius:.3rem;background:rgba(0,201,167,.06);border-left:2px solid var(--g);font-size:.72rem"><strong style="color:var(--g)">Disposition:</strong> ${disp}</div>`;
  }
  
  // If nothing was parsed but there are notes, show them as a clean note (truncated)
  if(h===''&&text.length>10){
    // Try to format as bullet points by splitting on pipes
    const parts=text.split('|').map(p=>p.trim()).filter(p=>p.length>3);
    if(parts.length>1&&parts.length<15){
      h+=`<div class="ps"><div class="ps-h" onclick="togPS(this)">\uD83D\uDCC4 Details</div><div class="ps-b" style="display:none"><ul>${parts.map(p=>`<li>${p}</li>`).join('')}</ul></div></div>`;
    }else{
      // Just show as note, but cap length
      const short=text.length>300?text.substring(0,300)+'...':text;
      h+=`<div class="note">${short}</div>`;
    }
  }
  
  return h;
}

/* ===== DRUG CARD ===== */
function renderDrug(it,cat,n){
  const dk=mK(it,cat),fv=iF(dk);
  let badges='';const nt=(it.notes_updates||it.notes||'').toLowerCase();
  if(nt.includes('first-line'))badges+='<span class="bdg b1">1st</span>';
  if(nt.includes('section 21'))badges+='<span class="bdg bc">S21</span>';
  if(nt.includes('warning')||nt.includes('caution')||nt.includes('contraindicated'))badges+='<span class="bdg bd">\u26A0</span>';
  if(it.formula||it.standard_dilutions)badges+='<span class="bdg bc">\uD83D\uDDFB</span>';
  let h=`<div class="drug" data-s="${(n+' '+nt).toLowerCase()}">`;
  if(it.parent_protocol)h+=`<div style="font-size:.6rem;color:var(--a);font-weight:700;margin-bottom:.1rem;text-transform:uppercase;letter-spacing:.5px">\u25B8 ${it.parent_protocol}</div>`;
  h+=`<div class="dh"><div class="dn">${n}${badges}</div><button class="star${fv?' on':''}" onclick="togF('${dk}')">${fv?'\u2605':'\u2606'}</button></div>`;
  if(it.adult_dose||it.adult_settings)h+=`<div class="dose"><span class="dl">A</span><span class="dv">${it.adult_dose||it.adult_settings}</span></div>`;
  if(it.paediatric_dose||it.paediatric_settings)h+=`<div class="dose"><span class="dl">P</span><span class="dp dv">${it.paediatric_dose||it.paediatric_settings}</span></div>`;
  if(it.protocol_dose)h+=`<div class="dose"><span class="dl">Rx</span><span class="dv">${it.protocol_dose}</span></div>`;
  if(it.formula){h+=`<div class="dose"><span class="dl">\uD83D\uDCD0</span><span class="dv" style="font-family:monospace;font-size:.75rem">${it.formula}</span></div>`;if(it.standard_dilutions)h+=`<div class="dose"><span class="dl">Dil</span><span class="dv">${it.standard_dilutions}</span></div>`}
  if(it.notes_updates||it.notes){let cls='note';if(nt.includes('warning')||nt.includes('avoid')||nt.includes('contraindicated'))cls+=' d';else if(nt.includes('caution'))cls+=' w';h+=`<div class="${cls}">${it.notes_updates||it.notes}</div>`}
  h+='</div>';
  return h}

/* ===== SCORE CALCULATORS ===== */
function renderScores(scores){let h='';
for(const[key,sc]of Object.entries(scores))h+=renderScoreCalc(key,sc);
return`<div class="sect open"><div class="sh" onclick="togS(this)"><div style="display:flex;align-items:center"><div class="shi">\uD83D\uDCCA</div><div class="sht">Score Calculators</div></div><div class="shc">\u25BC</div></div><div class="sb">${h}</div></div>`}

function renderScoreCalc(key,sc){
const ct=sc.calculator_type||'toggle';const sid='sc-'+key;
if(ct==='formula')return renderFormulaCalc(key,sc);
let h=`<div class="calcw" id="${sid}"><div class="calct">\uD83D\uDCCA ${sc.name}</div>`;

if(key==='gcs'||key==='tews'||key==='burch_wartofsky'){
for(const comp of sc.components){
h+=`<div class="scq">${comp.name}</div><div class="scseg" data-comp="${comp.key||comp.name}" data-key="${key}">`;
for(const opt of(comp.options||[])){const oid=`${sid}-${comp.key||comp.name}-${opt.value}`;h+=`<button class="scopt" id="${oid}" onclick="pickSeg('${key}','${comp.key||comp.name}',${opt.value},this)"><div>${opt.label}</div><span class="sd">${opt.desc||opt.range||''}</span></button>`}
h+='</div>'}
}else if(key==='canadian_cspine'){
// Show the 2-phase flow
h+=`<div style="font-size:.68rem;color:var(--t2);margin-bottom:.3rem;padding:.3rem;border-radius:.3rem;background:rgba(0,0,0,.15)"><strong style="color:var(--a)">Phase 1:</strong> If ANY "dangerous" criterion is YES → <strong>CT C-spine</strong><br><strong style="color:var(--a)">Phase 2:</strong> If no dangerous criteria, check "simple" criteria</div>`;
for(const comp of sc.components){
const isDanger=comp.dangerous;
const cid=`${sid}-${comp.key||comp.name.replace(/\s+/g,'_')}`;
h+=`<div class="scq">${isDanger?'\uD83D\uDD34':'\uD83D\uDFE2'} ${comp.name}</div>`;
h+=`<div class="scopts" data-cid="${cid}" data-pts="${isDanger?'danger':'simple'}">`;
h+=`<button class="scopt" id="${cid}-y" onclick="pickCCS('${cid}',true,this)">Yes</button>`;
h+=`<button class="scopt" id="${cid}-n" onclick="pickCCS('${cid}',false,this)">No</button>`;
h+='</div></div>'}
}else if(key==='tetanus_wound'){
h+=`<div class="scq">Prior tetanus doses?</div><div class="scseg" data-key="${key}">`;
['< 3 doses','3+ doses'].forEach((lbl,i)=>h+=`<button class="scopt" onclick="setTetDoses(${i},this)">${lbl}</button>`);
h+='</div></div>';
h+=`<div class="scq">Wound type?</div><div class="scseg" data-key="${key}">`;
['Clean/minor','Dirty/major'].forEach((lbl,i)=>h+=`<button class="scopt" onclick="setTetWound(${i},this)">${lbl}</button>`);
h+='</div></div>';
}else{
for(const comp of sc.components){
const cid=`${sid}-${comp.key||comp.name.replace(/\s+/g,'_')}`;
h+=`<div class="scq">${comp.name}${comp.points?` <span style="color:var(--a);font-size:.65rem">(+${comp.points})</span>`:''}</div>`;
h+=`<div class="scopts" data-cid="${cid}" data-pts="${comp.points||1}">`;
h+=`<button class="scopt" id="${cid}-y" onclick="pickToggle('${key}','${cid}',true,this)">Yes</button>`;
h+=`<button class="scopt" id="${cid}-n" onclick="pickToggle('${key}','${cid}',false,this)">No</button>`;
h+='</div></div>'}
}

h+=`<div class="scres" id="${sid}-res"><div class="tot">--</div><div class="lbl">Select all options</div></div></div>`;
return h}

function renderFormulaCalc(key,sc){
const sid='sc-'+key;
let h=`<div class="calcw" id="${sid}"><div class="calct">\uD83D\uDCD0 ${sc.name}</div>`;
for(const inp of sc.inputs)h+=`<div class="fmrow"><label>${inp.name}</label><input type="number" id="${sid}-${inp.key}" placeholder="${inp.unit}" step="any" oninput="calcFormula('${key}')"><span class="u">${inp.unit}</span></div>`;
if(key==='parkland')h+=`<div class="fmrow"><label>Time of burn</label><input type="datetime-local" id="${sid}-time" oninput="calcFormula('${key}')"></div>`;
h+=`<button class="fmbtn" onclick="calcFormula('${key}')">Calculate</button>`;
h+=`<div class="scres" id="${sid}-res" style="margin-top:.35rem"><div class="tot">--</div><div class="lbl">${sc.formula}</div></div></div>`;
return h}

/* ===== CALCULATOR INTERACTIONS ===== */
function pickSeg(scoreKey,compKey,val,el){
const seg=el.parentElement;seg.querySelectorAll('.scopt').forEach(b=>b.classList.remove('on'));
el.classList.add('on');if(!scoreSt[scoreKey])scoreSt[scoreKey]={};scoreSt[scoreKey][compKey]=val;calcScore(scoreKey)
}
function pickToggle(scoreKey,cid,isYes,el){
const opts=el.parentElement;opts.querySelectorAll('.scopt').forEach(b=>b.classList.remove('on','off'));
if(isYes){el.classList.add('on');const nEl=document.getElementById(cid+'-n');if(nEl)nEl.classList.remove('on','off')}else{el.classList.add('off');const yEl=document.getElementById(cid+'-y');if(yEl)yEl.classList.remove('on','off')}
if(!scoreSt[scoreKey])scoreSt[scoreKey]={};scoreSt[scoreKey][cid]=isYes;calcScore(scoreKey)
}

// Canadian C-spine special
let ccsState={};
function pickCCS(cid,isYes,el){
const opts=el.parentElement;opts.querySelectorAll('.scopt').forEach(b=>b.classList.remove('on','off'));
if(isYes){el.classList.add('on');const nEl=document.getElementById(cid+'-n');if(nEl)nEl.classList.remove('on','off')}else{el.classList.add('off');const yEl=document.getElementById(cid+'-y');if(yEl)yEl.classList.remove('on','off')}
ccsState[cid]=isYes;calcCCS();
}
function calcCCS(){
const sc=D['16_score_calculators']['canadian_cspine'];
const dangerous=['age_65','dangerous_mechanism','paresthesias'];
const simple=['sitting','ambulatory','delayed_pain','midline_tender'];
let anyDanger=false,anySimple=false,allAnswered=true;
for(const dk of dangerous){const cid='sc-canadian_cspine-'+dk;if(ccsState[cid]===undefined)allAnswered=false;if(ccsState[cid])anyDanger=true}
for(const sk of simple){const cid='sc-canadian_cspine-'+sk;if(ccsState[cid]===undefined)allAnswered=false;if(ccsState[cid])anySimple=true}
const r=document.getElementById('sc-canadian_cspine-res');if(!r)return;
if(!allAnswered){r.className='scres';r.innerHTML='<div class="tot">--</div><div class="lbl">Answer all criteria</div>';return}
if(anyDanger){r.className='scres hi';r.innerHTML='<div class="tot">CT C-spine</div><div class="lbl">Imaging Required</div><div class="act">High-risk factors present</div>'}
else if(anySimple){r.className='scres md';r.innerHTML='<div class="tot">ROM Test</div><div class="lbl">Range of Motion</div><div class="act">If full painless ROM, no imaging needed</div>'}
else{r.className='scres';r.innerHTML='<div class="tot">No Imaging</div><div class="lbl">Low Risk</div><div class="act">Clinically cleared</div>'}
}

let tetDoses=-1,tetWound=-1;
function setTetDoses(v,el){tetDoses=v;el.parentElement.querySelectorAll('.scopt').forEach((b,i)=>b.classList.toggle('on',i===v));calcTet()}
function setTetWound(v,el){tetWound=v;el.parentElement.querySelectorAll('.scopt').forEach((b,i)=>b.classList.toggle('on',i===v));calcTet()}
function calcTet(){const r=document.getElementById('sc-tetanus_wound-res');if(!r||tetDoses<0||tetWound<0)return;const dirty=tetWound===1,few=tetDoses===0;let lbl,act,cls='';
if(!dirty&&!few){lbl='No TIG';act='Td booster if >10y since last dose'}
else if(!dirty&&few){lbl='Give Td';act='Td booster + complete schedule';cls=' md'}
else if(dirty&&!few){lbl='No TIG';act='Td booster if >5y since last dose'}
else{lbl='Td + TIG';act='250 IU TIG at separate site';cls=' hi'}
r.className='scres'+cls;r.innerHTML=`<div class="tot">${lbl}</div><div class="act">${act}</div>`}

function calcScore(key){
const sc=D['16_score_calculators'][key];if(!sc)return;
const st=scoreSt[key]||{};const resEl=document.getElementById('sc-'+key+'-res');if(!resEl)return;

if(key==='gcs'){
const eye=st['eye']||0,verbal=st['verbal']||0,motor=st['motor']||0;
if(eye&&verbal&&motor){const tot=eye+verbal+motor;let lbl,act,cls='';
if(tot>=13){lbl='Mild';act='Monitor closely'}
else if(tot>=9){lbl='Moderate';act='CT head, neuro referral';cls=' md'}
else{lbl='Severe';act='Intubate, CT head immediately';cls=' hi'}
resEl.className='scres'+cls;resEl.innerHTML=`<div class="tot">GCS ${tot}</div><div class="lbl">${lbl}</div><div class="act">${act}</div>`
}return}

if(key==='burch_wartofsky'){
const temp=st['temp']||0,cvs=st['cvs']||0,cns=st['cns']||0,gi=st['gi']||0,precip=st['precipitant']||0;
const tot=temp+cvs+cns+gi+precip;
if(tot>0){let lbl,act,cls='';
if(tot<25){lbl='Unlikely';act='Supportive care'}
else if(tot<45){lbl='Imminent';act='Start treatment, admit ICU';cls=' md'}
else{lbl='Thyroid Storm';act='ICU immediately';cls=' hi'}
resEl.className='scres'+cls;resEl.innerHTML=`<div class="tot">${tot}</div><div class="lbl">${lbl}</div><div class="act">${act}</div>`
}return}

if(key==='tews'){
const hr=st['hr']||0,sbp=st['sbp']||0,rr=st['rr']||0,temp=st['temp']||0,avpu=st['avpu']||0;
const tot=hr+sbp+rr+temp+avpu;
if(tot>0||(hr===0&&st['hr']!==undefined)){let lbl,act,cls='';
if(tot<=2){lbl='TEWS Green';act='Standard care'}
else if(tot<=4){lbl='TEWS Yellow';act='MO review within 30 min';cls=' md'}
else if(tot<=6){lbl='TEWS Orange';act='Senior review within 15 min';cls=' md'}
else{lbl='TEWS Red';act='Resus team — ICU';cls=' hi'}
resEl.className='scres'+cls;resEl.innerHTML=`<div class="tot">${tot}</div><div class="lbl">${lbl}</div><div class="act">${act}</div>`
}return}

const comps=sc.components||[];let tot=0,allAnswered=true;
for(const comp of comps){
const cid='sc-'+key+'-'+(comp.key||comp.name.replace(/\s+/g,'_'));
const v=st[cid];if(v===undefined){allAnswered=false;break}
if(v)tot+=(comp.points||1)
}
if(!allAnswered){resEl.className='scres';resEl.innerHTML='<div class="tot">--</div><div class="lbl">Answer all criteria</div>';return}

// PERC
if(key==='perc'){
if(tot===0){resEl.className='scres';resEl.innerHTML='<div class="tot">PE EXCLUDED</div><div class="lbl">PERC Negative</div><div class="act">No further testing needed</div>'}
else{resEl.className='scres md';resEl.innerHTML=`<div class="tot">PERC Not Met (${tot})</div><div class="act">Proceed to Wells or D-dimer</div>`}
return}
// NEXUS
if(key==='nexus'){
if(tot===0){resEl.className='scres';resEl.innerHTML='<div class="tot">Low Risk</div><div class="lbl">Imaging NOT indicated</div><div class="act">Clinical clearance possible</div>'}
else{resEl.className='scres hi';resEl.innerHTML=`<div class="tot">High Risk (${tot}/5)</div><div class="act">C-spine imaging indicated</div>`}
return}

const interp=sc.interpretation||[];let matched=null;
for(const rule of interp){if(rule.min!==undefined&&rule.max!==undefined&&tot>=rule.min&&tot<=rule.max){matched=rule;break}}
if(!matched&&interp.length)matched=interp[interp.length-1];
if(matched){
const cls=matched.label.toLowerCase().includes('high')||matched.label.toLowerCase().includes('severe')?' hi':matched.label.toLowerCase().includes('moderat')?' md':'';
resEl.className='scres'+cls;resEl.innerHTML=`<div class="tot">${tot} — ${matched.label}</div><div class="act">${matched.action}</div>`
}else{resEl.className='scres';resEl.innerHTML=`<div class="tot">${tot}</div>`}
}

function calcFormula(key){
const sc=D['16_score_calculators'][key];const sid='sc-'+key;const resEl=document.getElementById(sid+'-res');
if(!sc||!resEl)return;
const vals={};
for(const inp of(sc.inputs||[])){const v=parseFloat(document.getElementById(sid+'-'+inp.key)?.value);if(isNaN(v)){resEl.innerHTML='<div class="tot">--</div><div class="lbl">Enter all values</div>';return}vals[inp.key]=v}
let result,label,action;
if(key==='parkland'){const ml=4*vals.weight*vals.tbsa;const half=ml/2;result=`${ml.toFixed(0)} mL/24h`;label=`${half.toFixed(0)} mL in first 8h`;action=`Then ${half.toFixed(0)} mL over next 16h`;
const tEl=document.getElementById(sid+'-time');if(tEl&&tEl.value){const bt=new Date(tEl.value);const nw=new Date();const hs=(nw-bt)/3600000;const hl=Math.max(0,8-hs);const rate=hl>0?(half/hl).toFixed(0):'0';action+=` | Rate: ${rate} mL/h (${hs.toFixed(1)}h elapsed)`}
}else if(key==='anion_gap'){const gap=vals.na-(vals.cl+vals.hco3);result=`${gap.toFixed(1)} mmol/L`;label=gap<8?'Low':gap<=12?'Normal':gap<=16?'Elevated':'High';action=gap>16?'MUDPILES: Methanol, Uraemia, DKA, INH, Lactate, Ethylene glycol, Salicylates':'Check albumin, bromide, lithium if low'}
else if(key==='corrected_na'){const corr=vals.na+(1.6*(vals.glucose-5.5)/5.5);result=`${corr.toFixed(1)} mmol/L`;label='Corrected Na';action='Use for treatment decisions'}
else if(key==='free_water_deficit'){const def=0.6*vals.weight*((vals.na/140)-1);result=`${def.toFixed(0)} L`;label='Deficit';action='Replace over 48-72h. Max 10 mmol/L/day'}
else if(key==='sodium_deficit'){const def=0.6*vals.weight*(vals.na_desired-vals.na_actual);result=`${def.toFixed(0)} mmol`;label='Na Deficit';action='Correct max 8-10 mmol/L/24h'}
else if(key==='pf_ratio'){const pf=vals.pao2/vals.fio2;result=`${pf.toFixed(0)}`;label=pf>=300?'Normal':pf>=200?'Mild ARDS':pf>=100?'Moderate ARDS':'Severe ARDS';action=pf<100?'Consider ECMO, proning':pf<200?'Lung protective ventilation':''}
else return;
resEl.innerHTML=`<div class="tot">${result}</div><div class="lbl">${label}</div><div class="act">${action}</div>`;
}

/* ===== FAVOURITES ===== */
function renderF(){
const favs=gF();const c=document.getElementById('c');
if(!favs.length){c.innerHTML='<div class="nores"><div class="ico">\u2B50</div><div style="font-weight:700;margin:.3rem 0">No favourites</div><div style="font-size:.8rem">Tap \u2606 on any drug/protocol to save</div></div>';return}
let h='<div class="sect open"><div class="sb">';let found=0;
for(const ck of Object.keys(D)){if(ck==='16_score_calculators')continue;for(const[sk,items]of Object.entries(D[ck])){if(Array.isArray(items))for(const it of items){if(favs.includes(mK(it,ck))){h+=renderItem(it,ck);found++}}}}
h+='</div></div>';c.innerHTML=h||'<div class="nores">No favourites found</div>';
}

/* ===== SEARCH ===== */
function doSearch(){
const q=document.getElementById('s').value.trim().toLowerCase();if(!q){if(act==='favourites')renderF();else if(act==='all')renderAll();else renderCat(act);return}
let h='';let found=false;
for(const ck of Object.keys(D)){if(act!=='all'&&act!==ck)continue;if(ck==='16_score_calculators')continue;
let cm='';
for(const[sk,items]of Object.entries(D[ck])){
if(Array.isArray(items)){let sm='';for(const it of items){if(JSON.stringify(it).toLowerCase().includes(q))sm+=hl(renderItem(it,ck),q)}if(sm)cm+=`<div class="sub">${sk.replace(/_/g,' ').replace(/^\w/,c=>c.toUpperCase())}</div>`+sm}
else{if(JSON.stringify(items).toLowerCase().includes(q))cm+=hl(renderItem(items,ck),q)}
}
if(cm){h+=`<div class="sect open"><div class="sh" onclick="togS(this)"><div style="display:flex;align-items:center"><div class="shi">${I[ck]}</div><div class="sht">${C[ck]}</div></div><div class="shc">\u25BC</div></div><div class="sb">${cm}</div></div>`;found=true}
}
// Search scores
if((act==='all'||act==='16_score_calculators')&&D['16_score_calculators']){
for(const[key,sc]of Object.entries(D['16_score_calculators'])){
if((sc.name+' '+JSON.stringify(sc)).toLowerCase().includes(q)){if(!found)h+=`<div class="sect open"><div class="sh" onclick="togS(this)"><div style="display:flex;align-items:center"><div class="shi">\uD83D\uDCCA</div><div class="sht">Score Calculators</div></div><div class="shc">\u25BC</div></div><div class="sb">`;h+=renderScoreCalc(key,sc);found=true}}
if(found)h+='</div></div>'}
document.getElementById('c').innerHTML=h||`<div class="nores"><div class="ico">\uD83D\uDD0D</div>No results for "${q}"</div>`;
}

function hl(html,q){if(!q)return html;return html.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'gi'),'<mark style="background:rgba(0,201,167,.2);border-radius:2px">$1</mark>')}

/* ===== UTILS ===== */
function togS(el){el.parentElement.classList.toggle('open')}
function togPS(el){const b=el.nextElementSibling;if(b)b.style.display=b.style.display==='none'?'block':'none';el.parentElement.classList.toggle('open')}
function bindTog(){}
