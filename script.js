const CATS={out:["Jídlo","Bydlení","Doprava","Zábava","Zdraví","Nákupy","Ostatní"],in:["Výplata","Brigáda","Dárek","Ostatní"]};
const KEY="prijmy-vydaje-v1";
let items=[];
try{items=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){items=[]}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}};
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat("cs-CZ",{maximumFractionDigits:2}).format(n)+" Kč";
let cur=new Date();cur=new Date(cur.getFullYear(),cur.getMonth(),1);
const ym=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const type=()=>document.querySelector('input[name=type]:checked').value;

function fillCats(){
  $("category").innerHTML=CATS[type()].map(c=>`<option>${c}</option>`).join("");
}
document.querySelectorAll('input[name=type]').forEach(r=>r.addEventListener("change",fillCats));

function render(){
  $("monthLabel").textContent=cur.toLocaleDateString("cs-CZ",{month:"long",year:"numeric"});
  const m=items.filter(i=>i.date.startsWith(ym(cur)));
  const sum=t=>m.filter(i=>i.type===t).reduce((a,i)=>a+i.amount,0);
  const inc=sum("in"),out=sum("out");
  $("sumIn").textContent=fmt(inc);$("sumOut").textContent=fmt(out);
  $("balance").textContent=fmt(inc-out);

  const f=$("filterType").value;
  const shown=m.filter(i=>f==="all"||i.type===f).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
  const ul=$("list");ul.innerHTML="";
  if(!shown.length){ul.innerHTML='<li class="empty" style="display:block">Zatím tu nic není. Přidej první záznam ve formuláři výše.</li>';}
  shown.forEach(i=>{
    const li=document.createElement("li");
    const d=new Date(i.date).toLocaleDateString("cs-CZ",{day:"numeric",month:"numeric"});
    li.innerHTML=`<div class="t"><div></div><small></small></div><span class="amt ${i.type}"></span><button class="del" aria-label="Smazat záznam">×</button>`;
    li.querySelector(".t div").textContent=i.desc;
    li.querySelector("small").textContent=d+" · "+i.category;
    li.querySelector(".amt").textContent=(i.type==="in"?"+":"−")+fmt(i.amount);
    li.querySelector(".del").onclick=()=>{items=items.filter(x=>x.id!==i.id);save();render()};
    ul.appendChild(li);
  });

  const by={};m.filter(i=>i.type==="out").forEach(i=>by[i.category]=(by[i.category]||0)+i.amount);
  const rows=Object.entries(by).sort((a,b)=>b[1]-a[1]);
  $("cats").innerHTML=rows.length?rows.map(([c,v])=>`<div class="cat"><span>${c}</span><div class="bar"><i style="width:${Math.round(v/out*100)}%"></i></div><span>${fmt(v)}</span></div>`).join(""):'<p class="note">Žádné výdaje v tomto měsíci.</p>';
}

$("form").addEventListener("submit",e=>{
  e.preventDefault();
  const amount=parseFloat($("amount").value);
  if(!(amount>0))return;
  items.push({id:Date.now(),type:type(),desc:$("desc").value.trim(),amount,date:$("date").value,category:$("category").value});
  save();
  const d=new Date($("date").value);cur=new Date(d.getFullYear(),d.getMonth(),1);
  $("desc").value="";$("amount").value="";$("desc").focus();render();
});
$("prev").onclick=()=>{cur=new Date(cur.getFullYear(),cur.getMonth()-1,1);render()};
$("next").onclick=()=>{cur=new Date(cur.getFullYear(),cur.getMonth()+1,1);render()};
$("filterType").onchange=render;
$("date").value=today();fillCats();render();