const STORAGE_KEY = "gymReservationsV1";
const SLOT_MINUTES = 30;

function getReservations(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []}
  catch(e){return []}
}
function saveReservations(data){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function pad(n){return String(n).padStart(2,"0")}
function makeTimes(){
  const arr=[];
  for(let h=6;h<=22;h++){
    for(let m=0;m<60;m+=SLOT_MINUTES){
      arr.push(`${pad(h)}:${pad(m)}`)
    }
  }
  return arr;
}
function fillTimeSelect(selectId, includeBlank=false){
  const el=document.getElementById(selectId); if(!el)return;
  el.innerHTML=includeBlank?'<option value="">指定なし</option>':'';
  makeTimes().forEach(t=>el.insertAdjacentHTML("beforeend",`<option value="${t}">${t}</option>`));
}
function timeToMinutes(t){const [h,m]=t.split(":").map(Number);return h*60+m}
function overlaps(aStart,aEnd,bStart,bEnd){return timeToMinutes(aStart)<timeToMinutes(bEnd)&&timeToMinutes(aEnd)>timeToMinutes(bStart)}
function selectedCourts(){
  return [...document.querySelectorAll('input[name="court"]:checked')].map(x=>x.value)
}
function reservationsConflict(date,start,end,courts){
  return getReservations().filter(r=>{
    if(r.date!==date)return false;
    if(!overlaps(start,end,r.startTime,r.endTime))return false;
    return courts.some(c=>r.courts.includes(c))
  })
}
function formatDate(d){
  const [y,m,day]=d.split("-");
  return `${y}年${Number(m)}月${Number(day)}日`
}
function showMessage(text,type="error"){
  const el=document.getElementById("message");
  if(el)el.innerHTML=`<div class="notice ${type}">${text}</div>`
}

document.addEventListener("DOMContentLoaded",()=>{
  fillTimeSelect("startTime");fillTimeSelect("endTime");
  fillTimeSelect("fromTime",true);fillTimeSelect("toTime",true);

  const date=document.getElementById("date");
  if(date){
    date.value=new Date().toISOString().slice(0,10);
    document.getElementById("startTime").value="09:00";
    document.getElementById("endTime").value="10:00";

    document.getElementById("checkBtn").addEventListener("click",checkAvailability);
    document.getElementById("reserveBtn").addEventListener("click",makeReservation);
  }
});

function getReservationInput(){
  const date=document.getElementById("date").value;
  const club=document.getElementById("club").value;
  const startTime=document.getElementById("startTime").value;
  const endTime=document.getElementById("endTime").value;
  const courts=selectedCourts();
  if(!date||!club||!startTime||!endTime||courts.length===0){
    showMessage("使用日・部活動・時間・使用する面をすべて選択してください。");return null
  }
  if(timeToMinutes(startTime)>=timeToMinutes(endTime)){
    showMessage("終了時刻は開始時刻より後にしてください。");return null
  }
  if(new Date(date+"T23:59:59")<new Date()){
    showMessage("過去の日付は予約できません。");return null
  }
  return {date,club,startTime,endTime,courts}
}
function checkAvailability(){
  const data=getReservationInput();if(!data)return;
  const conflicts=reservationsConflict(data.date,data.startTime,data.endTime,data.courts);
  const area=document.getElementById("reservationArea");
  const result=document.getElementById("availability");
  result.classList.remove("hidden");
  if(conflicts.length){
    result.innerHTML=`<div class="notice error">この時間帯は空いていません。<br>既存予約：${conflicts.map(r=>`${r.courts.join("・")}面 ${r.startTime}〜${r.endTime}（${r.club}）`).join("<br>")}</div>`;
    area.classList.add("hidden");
    return
  }
  result.innerHTML=`<strong>${formatDate(data.date)} ${data.startTime}〜${data.endTime}</strong><br>${data.courts.join("・")}面を予約できます。`;
  area.classList.remove("hidden");
  document.getElementById("message").innerHTML="";
}
function makeReservation(){
  const data=getReservationInput();if(!data)return;
  const name=document.getElementById("name").value.trim();
  if(!name){showMessage("予約者名を入力してください。");return}
  const conflicts=reservationsConflict(data.date,data.startTime,data.endTime,data.courts);
  if(conflicts.length){
    showMessage("直前に別の予約が入ったため、この枠は予約できません。");return
  }
  const reservations=getReservations();
  reservations.push({id:Date.now().toString(),...data,name,createdAt:new Date().toISOString()});
  saveReservations(reservations);
  alert("予約を受け付けました！");
  location.reload();
}
