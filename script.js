/* ===================== ICONS ===================== */
const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
  classroom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="16" x2="12" y2="21"/></svg>',
  assignments: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>',
  exams: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 3v3h6V3"/><polyline points="9 13 11 15 15 10.5"/></svg>',
  library: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 4.6 3.2 8 8 9 4.8-1 8-4.4 8-9V6z"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/></svg>',
};
document.querySelectorAll('.ic').forEach(el=>{
  const key = el.getAttribute('data-i');
  if(ICONS[key]) el.innerHTML = ICONS[key];
});

/* ===================== DUMMY DATA ===================== */
const QUESTIONS = [
  { n:1, text:"Which blood vessel carries blood away from the heart?", score:2, total:2,
    feedback:"Correct — the aorta and arteries carry oxygenated blood away from the heart to the body." },
  { n:2, text:"Which of the following organelles is primarily involved in photosynthesis?", score:2, total:2,
    feedback:"Excellent work! You correctly identified the chloroplast as the organelle responsible for photosynthesis. Keep it up!",
    highlightId:"q2" },
  { n:3, text:"Explain the role of chloroplasts in photosynthesis, naming the main pigments involved and briefly outlining the two major stages of the process.", score:2, total:2,
    feedback:"Good explanation — chlorophyll a and b were correctly named, and both the light and dark reactions were outlined clearly." },
  { n:4, text:"Describe the flow of blood through the human heart starting from the right atrium and ending at the aorta; include the names of valves crossed.", score:0, total:2,
    feedback:"This question was left unanswered on the sheet — no matching response was found." },
  { n:5, text:"Draw a labelled diagram of an alveolus showing capillaries and air space (label alveolar sac, capillary, and direction of gas exchange).", score:2, total:2,
    feedback:"Diagram is well labelled and gas exchange direction is correctly indicated." },
  { n:6, text:"Draw a neat labelled diagram of the human digestive system (stomach, small intestine, large intestine, liver, pancreas) and label the site where most absorption occurs.", score:4, total:5,
    feedback:"Diagram is mostly accurate; the site of maximum absorption could be labelled more precisely on the small intestine." },
  { n:7, text:"Draw and label a nephron (Bowman's capsule, glomerulus, proximal tubule, loop of Henle, distal tubule, collecting duct).", score:5, total:5,
    feedback:"All structures correctly labelled — great work." },
  { n:8, text:"Explain the structural differences between palisade mesophyll and spongy mesophyll and state how each structure aids its function in the leaf.", score:3, total:5,
    feedback:"Structural differences are noted, but the link to function (light capture vs. gas exchange) needs more detail." },
  { n:9, text:"Describe the process of transpiration in plants in two to three sentences and name two environmental factors that increase its rate.", score:5, total:5,
    feedback:"Clear, concise description with two correct environmental factors named." },
  { n:10, text:"Explain how the structure of xylem vessels facilitates water transport (mention one structural feature and its role).", score:4, total:5,
    feedback:"Correctly identifies the hollow, lignified structure of xylem vessels; could expand on capillary action." },
];

/* ===================== STATE ===================== */
const state = { files:{ question:null, answer:null }, zoom:100, page:1, selected:2 };

const $ = (sel)=>document.querySelector(sel);
const screenUpload = $('#screenUpload');
const screenExtracting = $('#screenExtracting');
const screenResults = $('#screenResults');
const sidebar = $('#sidebar');

/* ===================== UPLOAD SCREEN ===================== */
function fmtSize(bytes){
  if(bytes < 1024*1024) return Math.max(1, Math.round(bytes/1024)) + 'KB';
  return (bytes/(1024*1024)).toFixed(1) + 'MB';
}

function wireUpload(kind, dummyName, dummySub){
  const input = $(`#file${cap(kind)}`);
  const btn = $(`#btn${cap(kind)}`);
  const inner = $(`#inner${cap(kind)}`);
  const chip = $(`#chip${cap(kind)}`);
  const nameEl = $(`#name${cap(kind)}`);
  const subEl = $(`#sub${cap(kind)}`);
  const removeBtn = $(`#remove${cap(kind)}`);
  const card = $(`#card${cap(kind)}`);

  card.addEventListener('click', (e)=>{
    if(state.files[kind]) return; // already has a file, ignore card click
    input.click();
  });

  input.addEventListener('change', ()=>{
    const f = input.files[0];
    if(!f) return;
    setFile(kind, f.name, `${fmtSize(f.size)} • ${dummySub}`);
  });

  removeBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    state.files[kind] = null;
    input.value = '';
    inner.hidden = false;
    chip.hidden = true;
    updateStartBtn();
  });

  function setFile(kind, name, sub){
    state.files[kind] = { name, sub };
    nameEl.textContent = name;
    subEl.textContent = sub;
    inner.hidden = true;
    chip.hidden = false;
    updateStartBtn();
  }

  // expose a manual trigger for double-click-to-demo (optional dummy fill)
  card.addEventListener('dblclick', ()=>{
    if(!state.files[kind]) setFile(kind, dummyName, dummySub);
  });
}
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

wireUpload('question', 'Class_10_biology_unit_test.pdf', '2MB • 2 Pages');
wireUpload('answer', 'student_1_answer_sheet.pdf', '8MB • 4 Pages');

function updateStartBtn(){
  const ready = state.files.question && state.files.answer;
  $('#startMappingBtn').disabled = !ready;
  $('#startHint').textContent = ready
    ? "Both files are ready — click Start Mapping to extract questions and answers"
    : "Once both files are uploaded, you'll be able to map answers with questions";
}

$('#startMappingBtn').addEventListener('click', ()=>{
  if($('#startMappingBtn').disabled) return;
  goToExtracting();
});

/* ===================== SCREEN TRANSITIONS ===================== */
function goToExtracting(){
  screenUpload.hidden = true;
  screenExtracting.hidden = false;
  sidebar.classList.add('collapsed');
  setTimeout(goToResults, 2200);
}

function goToResults(){
  screenExtracting.hidden = true;
  screenResults.hidden = false;
  renderQuestions();
  renderSheet();
}

$('#collapseBtn').addEventListener('click', ()=> sidebar.classList.add('collapsed'));
$('#expandBtn').addEventListener('click', ()=> sidebar.classList.remove('collapsed'));
$('#backBtn').addEventListener('click', ()=>{
  // simple back behaviour: return to upload screen from any state
  screenExtracting.hidden = true;
  screenResults.hidden = true;
  screenUpload.hidden = false;
  sidebar.classList.remove('collapsed');
});

/* ===================== RESULTS: QUESTION LIST ===================== */
function scoreClass(q){
  if(q.score === 0) return 'zero';
  if(q.score === q.total) return 'full';
  return 'partial';
}

function renderQuestions(){
  const list = $('#questionList');
  list.innerHTML = '';
  QUESTIONS.forEach(q=>{
    const item = document.createElement('div');
    item.className = 'q-item' + (q.n === state.selected ? ' selected open' : '');
    item.innerHTML = `
      <div class="q-item-head">
        <span class="q-num">${q.n}</span>
        <span class="q-text">${q.text}</span>
        <span class="q-score ${scoreClass(q)}">${q.score}/${q.total}</span>
        <svg class="q-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="q-body">
        <div class="q-feedback">
          <div class="q-feedback-label">AI Feedback</div>
          <div class="q-feedback-text">${q.feedback}</div>
        </div>
      </div>`;
    item.querySelector('.q-item-head').addEventListener('click', ()=> selectQuestion(q.n));
    list.appendChild(item);
  });
}

function selectQuestion(n){
  const already = state.selected === n;
  state.selected = already ? null : n;
  renderQuestions();
  highlightOnSheet(state.selected);
}

$('#expandAllBtn').addEventListener('click', ()=>{
  const items = document.querySelectorAll('.q-item');
  const allOpen = [...items].every(i=>i.classList.contains('open'));
  items.forEach(i=> i.classList.toggle('open', !allOpen));
  $('#expandAllBtn').textContent = allOpen ? 'Expand All' : 'Collapse All';
});

/* ===================== RESULTS: ANSWER SHEET ===================== */
function renderSheet(){
  const page = $('#sheetPage');
  if(state.page !== 1){
    page.innerHTML = `<div class="page-placeholder">Additional answer content on this page.<br>No mapped question is highlighted here.</div>`;
    return;
  }
  page.innerHTML = `
    <div class="ans-block" data-q="1">
      <span class="q-label">Q1.</span> Photosynthesis is the process used by green plants and some
      other organisms to convert light energy into chemical energy.
      <div class="ans-eq">6CO<sub>2</sub> + 6H<sub>2</sub>O &nbsp;—Light / Chlorophyll→&nbsp; C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub></div>
      <div class="ans-diagram">${plantSVG()}</div>
    </div>
    <div class="ans-block highlight" data-q="2" id="ans-q2">
      <span class="ans-tag">Q2</span>
      <span class="q-label">Q2.</span> The process mainly occurs in the chloroplast of the plant cell.
      It has two main stages:<br>
      1. Light reaction – Captures light energy.<br>
      2. Dark reaction – Uses energy to make glucose.
    </div>
    <div class="ans-block" data-q="1b" style="opacity:.55">
      <span class="q-label">Q1.</span> Photosynthesis is the process used by green plants and some
      other organisms to convert light energy into chemical energy.
    </div>
  `;
  highlightOnSheet(state.selected);
}

function highlightOnSheet(n){
  document.querySelectorAll('.ans-block').forEach(b=>b.classList.remove('active-scroll'));
  if(n === 2){
    const el = $('#ans-q2');
    if(el){ el.scrollIntoView({behavior:'smooth', block:'center'}); }
  }
}

/* zoom */
$('#zoomIn').addEventListener('click', ()=>{
  state.zoom = Math.min(200, state.zoom + 10);
  applyZoom();
});
$('#zoomOut').addEventListener('click', ()=>{
  state.zoom = Math.max(50, state.zoom - 10);
  applyZoom();
});
function applyZoom(){
  $('#zoomLevel').textContent = state.zoom + '%';
  $('#sheetPage').style.transform = `scale(${state.zoom/100})`;
}

/* pagination */
$('#pagePrev').addEventListener('click', ()=>{
  state.page = Math.max(1, state.page - 1);
  updatePageLabel(); renderSheet();
});
$('#pageNext').addEventListener('click', ()=>{
  state.page = Math.min(4, state.page + 1);
  updatePageLabel(); renderSheet();
});
function updatePageLabel(){ $('#pageLabel').textContent = `Page ${state.page} of 4`; }

/* ===================== SVG PLANT DIAGRAM ===================== */
function plantSVG(){
  return `
  <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
    <circle cx="70" cy="40" r="20" fill="none" stroke="#c9a227" stroke-width="2"/>
    ${Array.from({length:8}).map((_,i)=>{
      const a = (i*45)*Math.PI/180;
      const x1 = 70+Math.cos(a)*24, y1=40+Math.sin(a)*24;
      const x2 = 70+Math.cos(a)*32, y2=40+Math.sin(a)*32;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c9a227" stroke-width="2"/>`;
    }).join('')}
    <text x="100" y="30" font-size="11" fill="#2b3a63" font-family="Inter,sans-serif">Sunlight</text>
    <line x1="95" y1="25" x2="150" y2="70" stroke="#2b3a63" stroke-width="1.5" marker-end="url(#arrow)"/>

    <path d="M195 170 C 150 150, 140 110, 190 95 C 200 60, 250 55, 260 90 C 300 100, 300 145, 260 160 C 250 180, 210 185, 195 170 Z"
      fill="none" stroke="#2f7d4f" stroke-width="2.5"/>
    <line x1="228" y1="170" x2="228" y2="210" stroke="#6b4423" stroke-width="3"/>
    <path d="M228 210 q -18 6 -26 18" fill="none" stroke="#6b4423" stroke-width="2"/>
    <path d="M228 210 q 18 6 26 18" fill="none" stroke="#6b4423" stroke-width="2"/>
    <path d="M228 210 q 0 10 0 20" fill="none" stroke="#6b4423" stroke-width="2"/>

    <text x="20" y="150" font-size="11" fill="#2b3a63" font-family="Inter,sans-serif">Carbon</text>
    <text x="20" y="163" font-size="11" fill="#2b3a63" font-family="Inter,sans-serif">dioxide</text>
    <line x1="65" y1="150" x2="185" y2="130" stroke="#2b3a63" stroke-width="1.5" marker-end="url(#arrow)"/>

    <text x="320" y="120" font-size="11" fill="#2b3a63" font-family="Inter,sans-serif">Oxygen</text>
    <line x1="270" y1="115" x2="318" y2="118" stroke="#2b3a63" stroke-width="1.5" marker-end="url(#arrow)"/>

    <text x="330" y="205" font-size="11" fill="#2b3a63" font-family="Inter,sans-serif">Water</text>
    <line x1="270" y1="205" x2="328" y2="205" stroke="#2b3a63" stroke-width="1.5" marker-start="url(#arrow)"/>

    <defs>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#2b3a63"/>
      </marker>
    </defs>
  </svg>`;
}

/* ===================== INIT ===================== */
updateStartBtn();
updatePageLabel();
