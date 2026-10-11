const COURT_RATE_PER_HOUR=200;
const OPENING_HOUR=8;
const CLOSING_HOUR=16;
const courtColors=["#78b94d","#45a7a0","#87a9d6","#d28b54","#8279c6","#cf7180"];
const courts=[
 {id:1,available:true},
 {id:2,available:true},
 {id:3,available:true},
 {id:4,available:true},
 {id:5,available:true},
 {id:6,available:true}
];
const date=document.getElementById("date"), grid=document.getElementById("courtGrid"), title=document.getElementById("availabilityTitle");
date.value=new Date().toISOString().slice(0,10);

function formatTime(hour){
  const period=hour<12?"AM":"PM";
  const displayHour=hour%12||12;
  return `${displayHour}:00 ${period}`;
}

function timeOptions(firstHour,lastHour){
  return Array.from({length:lastHour-firstHour+1},(_,index)=>{
    const hour=firstHour+index;
    return `<option value="${hour}">${formatTime(hour)}</option>`;
  }).join("");
}

function updateCourtSelection(courtId,resetEndTime=false){
  const startSelect=document.getElementById(`start-time-${courtId}`);
  const endSelect=document.getElementById(`end-time-${courtId}`);
  const startHour=Number(startSelect.value);
  const previousEndHour=Number(endSelect.value);
  const nextEndHour=startHour+1;
  endSelect.innerHTML=timeOptions(nextEndHour,CLOSING_HOUR);
  endSelect.value=!resetEndTime&&previousEndHour>=nextEndHour?String(previousEndHour):String(nextEndHour);

  const duration=Number(endSelect.value)-startHour;
  const fee=COURT_RATE_PER_HOUR*duration;
  document.getElementById(`court-fee-${courtId}`).textContent=`${duration} ${duration===1?"hour":"hours"} · ₱${fee}`;
}

function courtPreview(c){
  const color=courtColors[(c.id-1)%courtColors.length];
  const ballX=170+((c.id*71)%300);
  const ballY=90+((c.id*37)%120);
  return `<svg class="court-illustration" viewBox="0 0 640 300" role="img" aria-label="Illustrative pickleball court preview for Court ${c.id}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="court-bg-${c.id}" x2="0" y2="1"><stop stop-color="#dce8d4"/><stop offset="1" stop-color="#b9ceb0"/></linearGradient><filter id="court-shadow-${c.id}" x="-20%" y="-30%" width="140%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#10231f" flood-opacity=".22"/></filter></defs>
    <rect width="640" height="300" fill="url(#court-bg-${c.id})"/>
    <path d="M0 42 640 20M0 260 640 280" stroke="#fff" stroke-opacity=".22" stroke-width="3"/>
    <g transform="rotate(-3 320 150)" filter="url(#court-shadow-${c.id})">
      <rect x="55" y="29" width="530" height="242" rx="8" fill="#f8faf3"/>
      <rect x="64" y="38" width="512" height="224" rx="3" fill="${color}"/>
      <path d="M64 82h512M64 218h512M190 82v136M450 82v136M320 38v224" fill="none" stroke="#fff" stroke-width="4"/>
      <rect x="190" y="82" width="260" height="136" fill="#e9a368" opacity=".94"/>
      <path d="M64 82h512M64 218h512M190 82v136M450 82v136M320 38v224" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M64 150h512" stroke="#1a342f" stroke-width="7"/>
      <path d="M64 145h512" stroke="#dbe1cf" stroke-width="1.5" stroke-dasharray="5 4"/>
    </g>
    <circle cx="${ballX}" cy="${ballY}" r="12" fill="#d9ef68" stroke="#fff" stroke-width="4"/>
    <text x="26" y="278" fill="#244237" font-family="Arial,sans-serif" font-size="12" font-weight="700">COURT ${c.id} · ILLUSTRATIVE PREVIEW</text>
  </svg>`;
}

function renderCourts(){
  const pretty=new Date(date.value+"T12:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
  title.textContent=`Courts for ${pretty}`;
  grid.innerHTML=courts.map(c=>`
    <article class="court-card ${c.available?"":"booked"}">
      <div class="court-photo">${courtPreview(c)}</div>
      <div class="court-top"><span class="court-num">Court ${c.id}</span><span class="status ${c.available?"":"busy"}">${c.available?"AVAILABLE":"BOOKED"}</span></div>
      <div class="court-details"><span>Pickleball court</span><span>₱${COURT_RATE_PER_HOUR} / hour</span><span id="court-fee-${c.id}">1 hour · ₱${COURT_RATE_PER_HOUR}</span></div>
      <div class="court-time">
        ${c.available?`<label for="start-time-${c.id}"><strong>Start time</strong></label>
        <select class="court-slot-select" id="start-time-${c.id}" aria-label="Start time for Court ${c.id}">${timeOptions(OPENING_HOUR,CLOSING_HOUR-1)}</select>
        <label for="end-time-${c.id}"><strong>End time</strong></label>
        <select class="court-slot-select" id="end-time-${c.id}" aria-label="End time for Court ${c.id}">${timeOptions(OPENING_HOUR+1,CLOSING_HOUR)}</select>`:"<strong>Availability</strong><br><span>No open slots for this selection</span>"}
      </div>
      <button ${c.available?"":"disabled"} data-court="${c.id}">${c.available?"Choose court":"Unavailable"}</button>
    </article>`).join("");
  courts.filter(c=>c.available).forEach(c=>{
    document.getElementById(`start-time-${c.id}`).addEventListener("change",()=>updateCourtSelection(c.id));
    document.getElementById(`end-time-${c.id}`).addEventListener("change",()=>updateCourtSelection(c.id));
  });
  document.querySelectorAll("[data-court]").forEach(b=>b.addEventListener("click",()=>{
    const courtId=+b.dataset.court;
    const startHour=Number(document.getElementById(`start-time-${courtId}`).value);
    const endHour=Number(document.getElementById(`end-time-${courtId}`).value);
    openModal(courtId,startHour,endHour);
  }));
}
renderCourts();
document.getElementById("findBtn").onclick=()=>{renderCourts();toast("Availability refreshed");};
date.onchange=renderCourts;

const modal=document.getElementById("bookingModal");
function openModal(id,startHour,endHour){
  const duration=endHour-startHour;
  const fee=COURT_RATE_PER_HOUR*duration;
  document.getElementById("modalTitle").textContent=`Court ${id}`;
  document.getElementById("modalDetails").textContent=`${new Date(date.value+"T12:00:00").toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})} · ${formatTime(startHour)}–${formatTime(endHour)} · ${duration} ${duration===1?"hour":"hours"} · Court fee: ₱${fee}`;
  document.getElementById("bookingForm").style.display="grid";
  document.getElementById("success").style.display="none";
  modal.classList.add("open"); modal.setAttribute("aria-hidden","false");
}
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true")}
document.getElementById("closeModal").onclick=closeModal;
modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
document.getElementById("bookingForm").addEventListener("submit",e=>{
 e.preventDefault();
 document.getElementById("bookingForm").style.display="none";
 document.getElementById("success").style.display="block";
 setTimeout(closeModal,2600);
});
document.querySelectorAll(".event-btn").forEach(b=>b.onclick=()=>toast(`${b.dataset.event}: event details would open here.`));
document.querySelector(".menu-btn").onclick=()=>document.querySelector(".nav-links").classList.toggle("mobile-open");
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
