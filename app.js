let D=null,W=0,act='all',deferred=null,scoreState={};

const C={
  favourites:'Favourites',all:'All',
  '1_resuscitation_fluids_and_inotropes':'Resuscitation','2_airway_and_ventilation':'Airway',
  '3_sedation_analgesia_and_neurology':'Sedation','4_antimicrobials_and_infectious_diseases':'Antimicrobials',
  '5_metabolic_electrolytes_and_nutrition':'Metabolic','6_poisoning_and_toxicology':'Toxicology',
  '7_useful_formulae':'Formulae','8_cardiovascular':'Cardiovascular','9_blood_products':'Blood',
  '10_endocrine_and_other':'Endocrine','11_ed_medical_emergencies':'ED Medical',
  '12_ed_toxicology':'ED Toxic','13_ed_trauma_surgical':'ED Trauma',
  '14_ed_metabolic':'ED Metabolic','15_ed_procedures':'ED Procedures',
  '16_score_calculators':'Score Calc'
};
const I={'favourites':'\u2B50','all':'\uD83D\uDCCB','1_resuscitation_fluids_and_inotropes':'\uD83D\uDC89','2_airway_and_ventilation':'\uD83E\uDEC1','3_sedation_analgesia_and_neurology':'\uD83E\uDDE0','4_antimicrobials_and_infectious_diseases':'\uD83E\uDDA0','5_metabolic_electrolytes_and_nutrition':'\u2697\uFE0F','6_poisoning_and_toxicology':'\u2620\uFE0F','7_useful_formulae':'\uD83D\uDCD0','8_cardiovascular':'\u2764\uFE0F','9_blood_products':'\uD83E\uDE78','10_endocrine_and_other':'\uD83D\uDD2C','11_ed_medical_emergencies':'\uD83E\uDEC0','12_ed_toxicology':'\u2620\uFE0F','13_ed_trauma_surgical':'\uD83D\uDE91','14_ed_metabolic':'\u2697\uFE0F','15_ed_procedures':'\uD83E\uDE7A','16_score_calculators':'\uD83D\uDCCA'};
const ORDER=['favourites','all','1_resuscitation_fluids_and_inotropes','2_airway_and_ventilation','3_sedation_analgesia_and_neurology','4_antimicrobials_and_infectious_diseases','5_metabolic_electrolytes_and_nutrition','6_poisoning_and_toxicology','7_useful_formulae','8_cardiovascular','9_blood_products','10_endocrine_and_other','11_ed_medical_emergencies','12_ed_toxicology','13_ed_trauma_surgical','14_ed_metabolic','15_ed_procedures','16_score_calculators'];

function gW(){return parseFloat(localStorage.getItem('tr_w')||'0')}
function sW(v){W=parseFloat(v)||0;localStorage.setItem('tr_w',W);document.getElementById('w').value=W||''}
function gF(){try{return JSON.parse(localStorage.getItem('tr_f')||'[]')}catch{return[]}}
function sF(f){localStorage.setItem('tr_f',JSON.stringify(f));updFB()}
function togF(k){let f=gF();sF(f.includes(k)?f.filter(x=>x!==k):[...f,k]);if(act==='favourites')renderF()}
function iF(k){return gF().includes(k)}
function mK(i,cat){return cat+'::'+(i.item||i.drug||i.condition_or_drug||i.poison_or_drug||i.antidote_treatment||i.product||'')}
function updFB(){const b=document.getElementById('favCt');if(b){const c=gF().length;b.textContent=c;b.style.display=c?'inline':'none'}}

async function init(){W=gW();document.getElementById('w').value=W||'';document.getElementById('w').addEventListener('input',e=>sW(e.target.value));
try{const r=await fetch('data.json?v='+Date.now());D=await r.json();mkNav();renderAll();updFB();}catch(e){document.getElementById('c').innerHTML='<div class="no-res"><div class=ico>\u26A0\uFE0F</div>Failed to load data</div>'}
document.getElementById('s').addEventListener('input',doSearch);
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;document.getElementById('inst').classList.add('on')});
let c=document.getElementById('c');c.addEventListener('scroll',()=>document.getElementById('top').classList.toggle('on',c.scrollTop>400));
}
function doInstall(){if(deferred){deferred.prompt();deferred=null;document.getElementById('inst').classList.remove('on')}}

function mkNav(){let h='';for(const k of ORDER){if(k==='favourites'){const c=gF().length;h+=`<button class="cat-pill${k===act?' on':''}" data-c="${k}" onclick="setCat('${k}')">${I[k]} ${C[k]}${c?`<span class=ct id=favCt>${c}</span>`:''}</button>`}else if(k==='all'){h+=`<button class="cat-pill on" data-c="all" onclick="setCat('all')">${I.all} All</button>`}else if(D&&D[k]){h+=`<button class="cat-pill" data-c="${k}" onclick="setCat('${k}')">${I[k]} ${C[k]}</button>`}}document.getElementById('nav').innerHTML=h}
function setCat(c){act=c;document.querySelectorAll('.cat-pill').forEach(b=>b.classList.toggle('on',b.dataset.c===c));document.getElementById('s').value='';if(c==='favourites')renderF();else if(c==='all')renderAll();else renderCat(c)}

function renderAll(){let h='';for(const k of ORDER)if(k!=='favourites'&&k!=='all'&&D[k])h+=renderSect(k);document.getElementById('c').innerHTML;h?document.getElementById('c').innerHTML=h:0;bindTog();updFB();}
function renderCat(cat){document.getElementById('c').innerHTML=renderSect(cat);bindTog();updFB();}

function renderSect(cat){const d=D[cat];if(!d)return'';const cn=C[cat]||cat;
if(cat==='16_score_calculators')return renderScores(d);
let body='';for(const[sk,items]of Object.entries(d)){const sl=sk.replace(/_/g,' ').replace(/^\w/,c=>c.toUpperCase());if(Array.isArray(items)){let sm='';for(const it of items){const c=renderDrug(it,cat);if(c)sm+=c}if(sm)body+=`<div class=sub>${sl}</div>`+sm}else{const c=renderDrug(items,cat);if(c)body+=c}}
if(!body)return'';return`<div class="sect open" data-c="${cat}"><div class="sect-head" onclick="togSect(this)"><div style=display:flex;align-items:center><div class=sect-icon>${I[cat]}</div><div class=sect-title>${cn}</div></div><div class=sect-chev>&#9662;</div></div><div class=sect-body>${body}</div></div>`}

function renderDrug(it,cat){const n=it.item||it.drug||it.condition_or_drug||it.poison_or_drug||it.antidote_treatment||it.product||'';if(!n)return'';const dk=mK(it,cat),fv=iF(dk);
let badges='';const nt=(it.notes_updates||it.notes||'').toLowerCase();if(nt.includes('first-line'))badges+='<span class="drug-badge db-1st">1st</span>';if(nt.includes('warning')||nt.includes('caution')||nt.includes('contraindicated'))badges+='<span class="drug-badge db-dang">\u26A0</span>';if(it.formula||it.standard_dilutions)badges+='<span class="drug-badge db-calc">\uD83D\uDDFB</span>';
if(n.startsWith('\u2501'))badges+='<span class="drug-badge db-head">\u25B6</span>';
let h=`<div class=drug data-s="${(n+' '+nt).toLowerCase()}">`;
if(it.parent_protocol&&!n.includes(it.parent_protocol))h+=`<div class=pp>${it.parent_protocol}</div>`;
h+=`<div class=drug-h><div class=drug-n>${n}${badges}</div><button class="drug-star${fv?' on':''}" onclick="togF('${dk}')">${fv?'\u2605':'\u2606'}</button></div>`;
if(it.adult_dose||it.adult_settings)h+=`<div class=dose><span class=dose-l>A</span><span class=dose-v>${it.adult_dose||it.adult_settings}</span></div>`;
if(it.paediatric_dose||it.paediatric_settings)h+=`<div class=dose><span class=dose-l>P</span><span class="dose-v dose-p">${it.paediatric_dose||it.paediatric_settings}</span></div>`;
if(it.protocol_dose)h+=`<div class=dose><span class=dose-l>Rx</span><span class=dose-v>${it.protocol_dose}</span></div>`;
if(it.formula){h+=`<div class=dose><span class=dose-l>\uD83D\uDCD0</span><span class=dose-v style="font-family:monospace;font-size:.75rem">${it.formula}</span></div>`;if(it.standard_dilutions)h+=`<div class=dose><span class=dose-l>Dil</span><span class=dose-v>${it.standard_dilutions}</span></div>`}
if(it.notes_updates||it.notes){let cls='note';if(nt.includes('warning')||nt.includes('avoid')||nt.includes('contraindicated'))cls+=' dang';else if(nt.includes('caution'))cls+=' warn';h+=`<div class="${cls}">${it.notes_updates||it.notes}</div>`}
h+='</div>';return h}

// === INTERACTIVE SCORE CALCULATORS ===
function renderScores(scores){let h='';
for(const[key,sc]of Object.entries(scores)){h+=renderScoreCalc(key,sc)}
return`<div class="sect open"><div class="sect-head" onclick="togSect(this)"><div style=display:flex;align-items:center><div class=sect-icon>\uD83D\uDCCA</div><div class=sect-title>Score Calculators</div></div><div class=sect-chev>&#9662;</div></div><div class=sect-body>${h}</div></div>`}

function renderScoreCalc(key,sc){
const ct=sc.calculator_type||'toggle';const sid='sc-'+key;
if(ct==='formula')return renderFormulaCalc(key,sc);
let h=`<div class="calc-wrap" id="${sid}"><div class="calc-title"><span class=icon>\uD83D\uDCCA</span> ${sc.name}</div>`;

if(key==='gcs'||key==='tews'||key==='burch_wartofsky'){
// Segmented picker for each component
for(const comp of sc.components){
h+=`<div class="sc-row"><div class="sc-q">${comp.name}</div><div class="sc-seg" data-comp="${comp.key||comp.name}" data-key="${key}">`;
for(const opt of(comp.options||[])){
const oid=`${sid}-${comp.key||comp.name}-${opt.value}`;
h+=`<button class="sc-opt" id="${oid}" onclick="pickSeg('${key}','${comp.key||comp.name}',${opt.value},this)"><div>${opt.label}</div><span class=desc>${opt.desc||opt.range||''}</span></button>`
}
h+='</div></div>'}
}else if(key==='nexus'||key==='canadian_cspine'||key==='alvarado'||key==='pas'||key==='wells_dvt'||key==='wells_pe'||key==='perc'||key==='curb65'||key==='qsofa'||key==='burn_referral'){
// Toggle (yes/no) for each criterion
for(const comp of sc.components){
const cid=`${sid}-${comp.key||comp.name.replace(/\s+/g,'_')}`;
h+=`<div class="sc-row"><div class="sc-q">${comp.name}${comp.points?` <span style="color:var(--accent);font-size:.7rem">(+${comp.points})</span>`:''}</div>`;
h+=`<div class="sc-opts" data-cid="${cid}" data-pts="${comp.points||1}">`;
h+=`<button class="sc-opt" id="${cid}-y" onclick="pickToggle('${key}','${cid}',true,this)">Yes</button>`;
h+=`<button class="sc-opt" id="${cid}-n" onclick="pickToggle('${key}','${cid}',false,this)">No</button>`;
h+='</div></div>'}
}else if(key==='tetanus_wound'){
h+=`<div class="sc-row"><div class="sc-q">Number of prior tetanus doses?</div><div class="sc-seg" data-key="${key}">`;
['<3 doses','3+ doses'].forEach((lbl,i)=>{h+=`<button class="sc-opt" onclick="setTetDoses(${i},this)">${lbl}</button>`});
h+='</div></div>';
h+=`<div class="sc-row"><div class="sc-q">Wound type?</div><div class="sc-seg" data-key="${key}">`;
['Clean/minor','Dirty/major'].forEach((lbl,i)=>{h+=`<button class="sc-opt" onclick="setTetWound(${i},this)">${lbl}</button>`});
h+='</div></div>';
}

h+=`<div class="sc-res" id="${sid}-res"><div class="tot">--</div><div class="lbl">Select options above</div></div></div>`;
return h}

function renderFormulaCalc(key,sc){
const sid='sc-'+key;
let h=`<div class="calc-wrap" id="${sid}"><div class="calc-title"><span class=icon>\uD83D\uDCD0</span> ${sc.name}</div>`;
for(const inp of sc.inputs){
h+=`<div class="fm-row"><label>${inp.name}</label><input type="number" id="${sid}-${inp.key}" placeholder="${inp.unit}" step="any" oninput="calcFormula('${key}')"><span class="u">${inp.unit}</span></div>`
}
if(key==='parkland'){
h+=`<div class="fm-row"><label>From burn time</label><input type="datetime-local" id="${sid}-time" oninput="calcFormula('${key}')"></div>`;
}
h+=`<button class="fm-btn" onclick="calcFormula('${key}')">Calculate</button>`;
h+=`<div class="sc-res" id="${sid}-res" style="margin-top:.4rem"><div class="tot">--</div><div class="lbl">${sc.formula}</div></div></div>`;
return h}

// --- Interaction handlers ---
function pickSeg(scoreKey,compKey,val,el){
// Clear siblings
const seg=el.parentElement;seg.querySelectorAll('.sc-opt').forEach(b=>b.classList.remove('on'));
el.classList.add('on');
// Store state
if(!scoreState[scoreKey])scoreState[scoreKey]={};
scoreState[scoreKey][compKey]=val;
calcScore(scoreKey);
}

function pickToggle(scoreKey,cid,isYes,el){
const opts=el.parentElement;
opts.querySelectorAll('.sc-opt').forEach(b=>b.classList.remove('on','off'));
if(isYes){el.classList.add('on');document.getElementById(cid+'-n').classList.remove('on','off')}else{el.classList.add('off');document.getElementById(cid+'-y').classList.remove('on','off')}
if(!scoreState[scoreKey])scoreState[scoreKey]={};
scoreState[scoreKey][cid]=isYes;
calcScore(scoreKey);
}

let tetDoses=-1,tetWound=-1;
function setTetDoses(v,el){tetDoses=v;el.parentElement.querySelectorAll('.sc-opt').forEach((b,i)=>b.classList.toggle('on',i===v));calcTetanus()}
function setTetWound(v,el){tetWound=v;el.parentElement.querySelectorAll('.sc-opt').forEach((b,i)=>b.classList.toggle('on',i===v));calcTetanus()}

function calcTetanus(){
const r=document.getElementById('sc-tetanus_wound-res');if(!r)return;
if(tetDoses<0||tetWound<0){r.innerHTML='<div class="tot">--</div><div class="lbl">Select all options</div>';return}
const dirty=tetWound===1,few=tetDoses===0;
let lbl,act;
if(!dirty&&!few){lbl='No TIG needed';act='Give Td booster if >10 years since last dose'}
else if(!dirty&&few){lbl='Give Td';act='Give Td booster + complete schedule'}
else if(dirty&&!few){lbl='TIG not needed';act='Give Td booster if >5 years since last dose'}
else{lbl='Give Td + TIG';act='Give Td + 250 IU TIG at separate site'}
r.innerHTML=`<div class="tot">${lbl}</div><div class="act">${act}</div>`;
}

function calcScore(key){
const sc=D['16_score_calculators'][key];if(!sc)return;
const st=scoreState[key]||{};const resEl=document.getElementById('sc-'+key+'-res');if(!resEl)return;

if(key==='gcs'){
const eye=st['eye']||0,verbal=st['verbal']||0,motor=st['motor']||0;
const tot=eye+verbal+motor;
if(eye&&verbal&&motor){
let lbl,act,cls='';
if(tot>=13){lbl='Mild (GCS 13-15)';act='Monitor closely';}
else if(tot>=9){lbl='Moderate (GCS 9-12)';act='CT head, neuro referral';cls='med'}
else{lbl='Severe (GCS 3-8)';act='Intubate, CT head, neurosurgical referral';cls='high'}
resEl.className='sc-res'+cls;resEl.innerHTML=`<div class="tot">GCS ${tot}</div><div class="lbl">${lbl}</div><div class="act">${act}</div>`;
}return
}

if(key==='burch_wartofsky'){
const temp=st['temp']||0,cvs=st['cvs']||0,cns=st['cns']||0,gi=st['gi']||0,precip=st['precipitant']||0;
const tot=temp+cvs+cns+gi+precip;
if(tot>0){
let lbl,act,cls='';
if(tot<25){lbl='Unlikely thyroid storm';act='Supportive care'}
else if(tot<45){lbl='Imminent thyroid storm';act='Start antithyroid treatment, admit ICU';cls='med'}
else{lbl='Thyroid storm';act='ICU admission immediately';cls='high'}
resEl.className='sc-res'+cls;resEl.innerHTML=`<div class="tot">${tot}</div><div class="lbl">${lbl}</div><div class="act">${act}</div>`;
}return
}

if(key==='tews'){
const hr=st['hr']||0,sbp=st['sbp']||0,rr=st['rr']||0,temp=st['temp']||0,avpu=st['avpu']||0;
const tot=hr+sbp+rr+temp+avpu;
if(tot>0||(hr===0&&st['hr']!==undefined)){
let lbl,act,cls='';
if(tot<=2){lbl='TEWS Green';act='Standard care'}
else if(tot<=4){lbl='TEWS Yellow';act='MO review within 30 min';cls='med'}
else if(tot<=6){lbl='TEWS Orange';act='Senior review within 15 min';cls='med'}
else{lbl='TEWS Red';act='Resus team — ICU immediately';cls='high'}
resEl.className='sc-res'+cls;resEl.innerHTML=`<div class="tot">TEWS ${tot}</div><div class="lbl">${lbl}</div><div class="act">${act}</div>`;
}return
}

// Toggle-based scores
const comps=sc.components||[];let tot=0,allAnswered=true;
for(const comp of comps){
const cid='sc-'+key+'-'+(comp.key||comp.name.replace(/\s+/g,'_'));
const v=st[cid];if(v===undefined){allAnswered=false;break}
if(v)tot+=(comp.points||1);
}
if(!allAnswered){resEl.className='sc-res';resEl.innerHTML='<div class="tot">--</div><div class="lbl">Answer all criteria</div>';return}

// PERC: all no means PE excluded
if(key==='perc'){
if(tot===0){resEl.className='sc-res';resEl.innerHTML='<div class="tot">PE EXCLUDED</div><div class="lbl">PERC negative</div><div class="act">No further testing needed</div>'}
else{resEl.className='sc-res med';resEl.innerHTML=`<div class="tot">PERC not met (${tot})</div><div class="act">Proceed to Wells score or D-dimer</div>`}
return}

// NEXUS: all no means low risk
if(key==='nexus'){
if(tot===0){resEl.className='sc-res';resEl.innerHTML='<div class="tot">Low Risk</div><div class="lbl">C-spine imaging NOT indicated</div><div class="act">Clinical clearance possible</div>'}
else{resEl.className='sc-res high';resEl.innerHTML=`<div class="tot">High Risk (${tot}/5)</div><div class="act">C-spine imaging indicated</div>`}
return}

// Canadian C-spine
if(key==='canadian_cspine'){
const dangerous=['age_65','dangerous_mechanism','paresthesias'];
let anyDanger=false;for(const dk of dangerous){const cid='sc-'+key+'-'+dk;if(st[cid])anyDanger=true}
if(anyDanger){resEl.className='sc-res high';resEl.innerHTML='<div class="tot">Imaging Required</div><div class="act">CT C-spine — high-risk factors present</div>';return}
const simple=['sitting','ambulatory','delayed_pain','midline_tender'];
let anySimple=false;for(const sk of simple){const cid='sc-'+key+'-'+sk;if(st[cid])anySimple=true}
if(anySimple){resEl.className='sc-res med';resEl.innerHTML='<div class="tot">Range of Motion Test</div><div class="act">If full ROM without pain, no imaging needed</div>'}
else{resEl.className='sc-res';resEl.innerHTML='<div class="tot">No Imaging</div><div class="act">Clinically cleared</div>'}
return}

// Generic interpretation
const interp=sc.interpretation||[];let matched=null;
for(const rule of interp){
if(rule.min!==undefined&&rule.max!==undefined&&tot>=rule.min&&tot<=rule.max){matched=rule;break}
if(rule.condition==='any_yes'&&tot>0){matched=rule;break}
if(rule.condition==='all_no'&&tot===0){matched=rule;break}
}
if(!matched&&interp.length>0)matched=interp[interp.length-1];
if(matched){
const cls=matched.label.toLowerCase().includes('high')||matched.label.toLowerCase().includes('severe')?' high':matched.label.toLowerCase().includes('moderat')||matched.label.toLowerCase().includes('inter')?' med':'';
resEl.className='sc-res'+cls;resEl.innerHTML=`<div class="tot">${tot} — ${matched.label}</div><div class="act">${matched.action}</div>`;
} else {resEl.className='sc-res';resEl.innerHTML=`<div class="tot">${tot}</div>`}
}

function calcFormula(key){
const sc=D['16_score_calculators'][key];const sid='sc-'+key;const resEl=document.getElementById(sid+'-res');
if(!sc||!resEl)return;
const vals={};
for(const inp of(sc.inputs||[])){const v=parseFloat(document.getElementById(sid+'-'+inp.key)?.value);if(isNaN(v)){resEl.innerHTML='<div class="tot">--</div><div class="lbl">Enter all values</div>';return}vals[inp.key]=v}

let result,label,action;
if(key==='parkland'){
const ml=4*vals.weight*vals.tbsa;const half=ml/2;
result=`${ml.toFixed(0)} mL/24h`;label=`${half.toFixed(0)} mL in first 8h`;action=`Then ${half.toFixed(0)} mL over next 16h`;
const tEl=document.getElementById(sid+'-time');if(tEl&&tEl.value){const burnTime=new Date(tEl.value);const now=new Date();const hoursSince=(now-burnTime)/3600000;const hoursLeft=Math.max(0,8-hoursSince);const rate=hoursLeft>0?(half/hoursLeft).toFixed(0):'0';action+=` | Current rate: ${rate} mL/h (hours elapsed: ${hoursSince.toFixed(1)})`}
}else if(key==='anion_gap'){
const gap=vals.na-(vals.cl+vals.hco3);result=`${gap.toFixed(1)} mmol/L`;
if(gap<8){label='Low anion gap';action='Check for hypoalbuminaemia, bromide, lithium'}
else if(gap<=12){label='Normal';action='Normal anion gap'}
else if(gap<=16){label='Elevated';action='Consider high anion gap causes'}
else{label='High anion gap';action='MUDPILES: Methanol, Uraemia, DKA, Paraldehyde, INH, Lactate, Ethylene glycol, Salicylates'}
}else if(key==='corrected_na'){
const corr=vals.na+(1.6*(vals.glucose-5.5)/5.5);result=`${corr.toFixed(1)} mmol/L`;label='Corrected sodium';action='Use corrected Na for treatment decisions';
}else if(key==='free_water_deficit'){
const deficit=0.6*vals.weight*((vals.na/140)-1);result=`${deficit.toFixed(0)} L`;label='Free water deficit';action='Replace slowly over 48-72h. Max correction 10 mmol/L/day';
}else if(key==='sodium_deficit'){
const def=0.6*vals.weight*(vals.na_desired-vals.na_actual);result=`${def.toFixed(0)} mmol`;label='Na deficit';action='Correct max 8-10 mmol/L per 24h';
}else if(key==='pf_ratio'){
const pf=vals.pao2/vals.fio2;result=`${pf.toFixed(0)}`;label='P/F Ratio';action=pf>=300?'Normal':pf>=200?'Mild ARDS':pf>=100?'Moderate ARDS':'Severe ARDS — consider ECMO';
}else{return}

resEl.innerHTML=`<div class="tot">${result}</div><div class="lbl">${label}</div><div class="act">${action}</div>`;
}

function renderF(){
const favs=gF();const c=document.getElementById('c');
if(!favs.length){c.innerHTML='<div class="no-res"><div class=ico>\u2B50</div><div style="font-weight:700;margin:.3rem 0">No favourites</div><div style="font-size:.8rem">Tap \u2606 on any drug to save</div></div>';return}
let h='<div class="sect open"><div class="sect-body">';let found=0;
for(const ck of Object.keys(D)){if(ck==='16_score_calculators')continue;for(const[sk,items]of Object.entries(D[ck])){if(Array.isArray(items))for(const it of items)if(favs.includes(mK(it,ck))){h+=renderDrug(it,ck);found++}else if(favs.includes(mK(items,ck))){h+=renderDrug(items,ck);found++}}}
h+='</div></div>';c.innerHTML=h||'<div class="no-res">No favourites found</div>';
}

function doSearch(){
const q=document.getElementById('s').value.trim().toLowerCase();if(!q){if(act==='favourites')renderF();else if(act==='all')renderAll();else renderCat(act);return}
let h='';let found=false;
for(const ck of Object.keys(D)){
if(act!=='all'&&act!==ck)continue;
if(ck==='16_score_calculators')continue;
let cm='';
for(const[sk,items]of Object.entries(D[ck])){
if(Array.isArray(items)){let sm='';for(const it of items){if(JSON.stringify(it).toLowerCase().includes(q))sm+=hl(renderDrug(it,ck),q)}if(sm)cm+=`<div class=sub>${sk.replace(/_/g,' ').replace(/^\w/,c=>c.toUpperCase())}</div>`+sm}
else{if(JSON.stringify(items).toLowerCase().includes(q))cm+=renderDrug(items,ck)}
}
if(cm){h+=`<div class="sect open"><div class=sect-head onclick="togSect(this)"><div style=display:flex;align-items:center><div class=sect-icon>${I[ck]}</div><div class=sect-title>${C[ck]}</div></div><div class=sect-chev>&#9662;</div></div><div class=sect-body>${cm}</div></div>`;found=true}
}
// Also search score calculators
if((act==='all'||act==='16_score_calculators')&&D['16_score_calculators']){
for(const[key,sc]of Object.entries(D['16_score_calculators'])){
const txt=(sc.name+' '+JSON.stringify(sc)).toLowerCase();if(txt.includes(q)){
if(!found)h+=`<div class="sect open"><div class=sect-head onclick="togSect(this)"><div style=display:flex;align-items:center><div class=sect-icon>\uD83D\uDCCA</div><div class=sect-title>Score Calculators</div></div><div class=sect-chev>&#9662;</div></div><div class=sect-body>`;
h+=renderScoreCalc(key,sc);found=true
}}
if(found)h+='</div></div>';
}
document.getElementById('c').innerHTML=h||`<div class="no-res"><div class=ico>\uD83D\uDD0D</div>No results for "${q}"</div>`;
}

function hl(html,q){if(!q)return html;return html.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'gi'),'<mark style="background:rgba(13,138,111,.2);border-radius:2px">$1</mark>')}
function togSect(el){el.parentElement.classList.toggle('open')}
function bindTog(){}

document.addEventListener('DOMContentLoaded',init);
