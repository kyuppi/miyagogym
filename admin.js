function renderAdmin(){
  const list=document.getElementById("reservations");
  if(!list)return;
  let data=getReservations();

  const fromDate=document.getElementById("fromDate").value;
  const toDate=document.getElementById("toDate").value;
  const fromTime=document.getElementById("fromTime").value;
  const toTime=document.getElementById("toTime").value;
  const club=document.getElementById("filterClub").value;
  const court=document.getElementById("filterCourt").value;

  data=data.filter(r=>{
    if(fromDate && r.date<fromDate)return false;
    if(toDate && r.date>toDate)return false;
    if(club && r.club!==club)return false;
    if(court && !r.courts.includes(court))return false;
    if(fromTime && timeToMinutes(r.endTime)<=timeToMinutes(fromTime))return false;
    if(toTime && timeToMinutes(r.startTime)>=timeToMinutes(toTime))return false;
    return true;
  }).sort((a,b)=>(a.date+a.startTime).localeCompare(b.date+b.startTime));

  document.getElementById("count").textContent=data.length+"件";

  if(!data.length){
    list.innerHTML='<div class="empty">該当する予約はありません。</div>';return
  }
  list.innerHTML=data.map(r=>`
    <article class="reservation-item">
      <div class="reservation-head">
        <strong>${formatDate(r.date)}　${r.startTime}〜${r.endTime}</strong>
        <button class="delete-btn" onclick="deleteReservation('${r.id}')">削除</button>
      </div>
      <div class="meta">
        <span class="tag">${r.courts.join("・")}面</span>
        <span class="tag">${escapeHtml(r.club)}</span>
        <span class="tag">予約者：${escapeHtml(r.name)}</span>
      </div>
    </article>
  `).join("");
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))
}
function deleteReservation(id){
  if(!confirm("この予約を削除しますか？"))return;
  saveReservations(getReservations().filter(r=>r.id!==id));
  renderAdmin();
}
document.addEventListener("DOMContentLoaded",()=>{
  if(!document.getElementById("reservations"))return;
  document.getElementById("filterBtn").addEventListener("click",renderAdmin);
  document.getElementById("clearFilterBtn").addEventListener("click",()=>{
    ["fromDate","toDate","fromTime","toTime"].forEach(id=>document.getElementById(id).value="");
    document.getElementById("filterClub").value="";
    document.getElementById("filterCourt").value="";
    renderAdmin();
  });
  document.getElementById("deleteAllBtn").addEventListener("click",()=>{
    if(confirm("すべての予約データを削除します。よろしいですか？")){
      localStorage.removeItem(STORAGE_KEY);renderAdmin();
    }
  });
  renderAdmin();
});
