# multiverse-v6.html — the branch runner (v6: whole memory, forward pages, argument)

# multiverse.html — the branch runner (v6: whole memory, forward pages, argument)

<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>The multiverse</title>
<style>
body{background:#111;color:#ddd;font:14px/1.55 -apple-system,Helvetica,sans-serif;margin:0;padding:24px;max-width:900px}
h1{font-size:20px;font-weight:600;margin:0 0 4px}
p.tag{color:#888;font-size:13px;margin:0 0 18px}
label{display:block;margin:12px 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.08em}
textarea,input,select{width:100%;background:#1b1b1b;color:#eee;border:1px solid #333;border-radius:6px;padding:8px;font:inherit;box-sizing:border-box}
textarea{height:110px}
button{background:#2a2a2a;color:#eee;border:1px solid #444;border-radius:6px;padding:8px 14px;margin:14px 8px 0 0;font:inherit;cursor:pointer}
button:hover{background:#333}
#log{white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:12px;color:#999;margin-top:16px}
.branch{border:1px solid #262626;border-radius:8px;padding:12px 14px;margin:14px 0;background:#161616}
.branch h3{margin:0 0 8px;font-size:14px}
.branch pre{white-space:pre-wrap;margin:0;font:inherit}
.tag2{color:#888;font-size:12px;margin-bottom:8px}
.bad{color:#e07a7a;font-size:12px;margin-top:8px}
</style></head>
<body>
<h1>The multiverse</h1>
<p class="tag">Every development wakes a version of you. Each one remembers everything up to that point as its own life, and writes the next page of the journal from there. Then they argue with each other, and the last one writes your constitution.</p>
<label>Your journal (stays on this laptop; sent only to the model you choose)</label>
<textarea id="journal" placeholder="Paste the whole journal here."></textarea>
<div style="display:flex;gap:10px;flex-wrap:wrap">
<div style="flex:1;min-width:140px"><label>Model</label><input id="model" value="qwen3.5:9b"></div>
<div style="flex:1;min-width:180px"><label>Endpoint</label><input id="endpoint" value="http://localhost:11434/api/chat"></div>
<div style="flex:1;min-width:100px"><label>Context tokens</label><input id="ctx" value="32768"></div>
<div style="flex:1;min-width:100px"><label>Versions</label><input id="n" value="8"></div>
</div>
<button id="start">Start the night</button><button id="stop">Stop</button><button id="md">Download as text</button><button id="clear">Clear saved</button>
<div id="out"></div>
<div id="log"></div>
<script>
const $=s=>document.querySelector(s);
const KEY='multiverse-v6';
const S={running:false,versions:[],argument:'',constitution:''};
const SYSTEM='You are Ezana Kabenge Kavuma, 20, a Cornell student, writing privately in your own journal. You are the version of yourself that has just woken at one moment of your life, and you are writing the next page of your journal forward from there, as yourself, in your own voice. Rules: use only people, places, events and decisions that appear in the text given to you. Never invent a name, a place, an event or a decision. You do not know anything that happened after the moment you wake at, and you must not pretend to. First person, plain, no literary flourishes.';
const STOP=new Set('the and but for nor yet so if then than that this these those there here when what why who whom whose how all any some every each both few more most other such only own same very just now later still even also always never sometimes maybe perhaps really quite well okay yeah yes not no nor can will would could should may might must do does did has have had was were are is be been being i me my we us our you your he him his she her it its they them their one two three first last with from into over under about after before again because while during through between'.split(' '));
const COMMON=new Set('Mom Dad Mum Mother Father God Christmas Easter Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December English Kenton Cornell Kenya Uganda America'.split(' '));

function log(m){$('#log').textContent+=m+'\n';}

function splitEntries(text){
  const HEAD=/^\s*(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{4})?|Year\s*\d{4}|YEAR\s*\d+|Sometime in \d{4})\s*$/;
  const lines=text.split(/\r?\n/);
  const marks=[];
  lines.forEach((l,i)=>{ if(HEAD.test(l)) marks.push(i); });
  if(!marks.length) return [{head:'(the whole journal)',body:text.trim()}];
  const raw=[];
  for(let k=0;k<marks.length;k++){
    const a=marks[k], b=(k+1<marks.length?marks[k+1]:lines.length);
    raw.push({head:lines[a].trim(), body:lines.slice(a+1,b).join('\n').trim()});
  }
  const out=[]; let carry=[];
  for(const e of raw){
    if(e.body.length<80){ carry.push(e.head); continue; }
    const pre = carry.length ? carry.join(' / ')+' / ' : '';
    out.push({head:pre+e.head, body:e.body});
    carry=[];
  }
  if(carry.length && out.length) out[out.length-1].head+=' / '+carry.join(' / ');
  return out.length?out:[{head:'(the whole journal)',body:text.trim()}];
}

function memoryBefore(ents,idx){
  return ents.slice(0,idx+1).map(e=>e.head+'\n'+e.body).join('\n\n');
}

function properNouns(text){
  const s=new Set();
  for(const w of (text.match(/\b[A-Z][a-z]{2,}\b/g)||[])) if(!STOP.has(w.toLowerCase())) s.add(w);
  return s;
}

function invented(out,journalText){
  const known=properNouns(journalText), bad=[];
  for(const w of (out.match(/\b[A-Z][a-z]{2,}\b/g)||[])){
    if(STOP.has(w.toLowerCase())||COMMON.has(w)) continue;
    if(!known.has(w)&&!bad.includes(w)) bad.push(w);
  }
  return bad;
}

async function chat(messages,maxTok){
  const body={model:$('#model').value.trim(),messages,stream:false,think:false,keep_alive:'10m',options:{num_ctx:parseInt($('#ctx').value,10)||32768,num_predict:maxTok,temperature:0.85}};
  const r=await fetch($('#endpoint').value.trim(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok) throw new Error('HTTP '+r.status+' — '+(await r.text()).slice(0,200));
  const d=await r.json();
  const c=(d.message&&d.message.content)||'';
  if(!c.trim()){
    const why=(d.message&&d.message.reasoning)?'the model spent its whole budget thinking — reasoning came back full and content empty. Raise Context tokens or run fewer versions at once.':'the model returned an empty reply.';
    throw new Error(why);
  }
  return c.trim();
}

function save(){try{localStorage.setItem(KEY,JSON.stringify({versions:S.versions,argument:S.argument,constitution:S.constitution}));}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d){S.versions=d.versions||[];S.argument=d.argument||'';S.constitution=d.constitution||'';render();}}catch(e){}}
function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}

function render(){
  const o=$('#out'); o.innerHTML='';
  if(S.constitution){ const d=document.createElement('div'); d.className='branch'; d.innerHTML='<h3>The constitution</h3><pre></pre>'; d.querySelector('pre').textContent=S.constitution; o.appendChild(d); }
  if(S.argument){ const d=document.createElement('div'); d.className='branch'; d.innerHTML='<h3>The argument</h3><pre></pre>'; d.querySelector('pre').textContent=S.argument; o.appendChild(d); }
  for(const b of S.versions){
    const d=document.createElement('div'); d.className='branch';
    d.innerHTML='<div class="tag2">Woke at: '+esc(b.head)+'<br>'+esc(b.at)+' · '+esc(b.model)+'</div><pre></pre>';
    d.querySelector('pre').textContent=b.text;
    if(b.bad&&b.bad.length){ const w=document.createElement('div'); w.className='bad'; w.textContent='Names that do not appear anywhere in your journal — treat this version as fiction: '+b.bad.join(', '); d.appendChild(w); }
    o.appendChild(d);
  }
}

async function run(){
  const text=$('#journal').value.trim();
  if(!text){log('Paste the journal first.');return;}
  S.running=true; S.versions=[]; S.argument=''; S.constitution=''; save(); render(); $('#log').textContent='';
  const ents=splitEntries(text);
  log('Found '+ents.length+' entries with text in them.');
  const n=Math.max(1,Math.min(parseInt($('#n').value,10)||8,ents.length));
  const picks=[];
  for(let i=0;i<n;i++) picks.push(Math.floor(i*(ents.length-1)/Math.max(1,n-1)));
  const uniq=[...new Set(picks)];

  for(let i=0;i<uniq.length;i++){
    if(!S.running) break;
    const idx=uniq[i], mem=memoryBefore(ents,idx);
    log('Version '+(i+1)+' of '+uniq.length+' — waking at "'+ents[idx].head+'" ('+mem.length+' characters of memory)');
    try{
      const out=await chat([
        {role:'system',content:SYSTEM},
        {role:'user',content:mem+'\n\n---\nEverything above is your own life, up to and including the entry headed: '+ents[idx].head+'\n\nYou do not know what happens next. Write the next page of your journal as yourself, tonight, from inside this moment — what you are doing, what you are thinking, what you have decided, what you are afraid of. 150 to 250 words, first person, plain.\n\nThen, under the heading WHAT HAS SHAPED ME, write under 100 words on what in your life so far made you this way — good and bad.\n\nName only people, places and events that appear above.'}
      ],900);
      S.versions.push({head:ents[idx].head,at:new Date().toLocaleString(),model:$('#model').value,text:out,bad:invented(out,text)});
      save(); render();
    }catch(e){ log('Version failed: '+e.message); }
  }

  if(S.running && S.versions.length>1){
    log('The argument…');
    try{
      const bodyTxt=S.versions.map((b,i)=>'VERSION '+(i+1)+' (woke at '+b.head+'):\n'+b.text).join('\n\n');
      const out=await chat([
        {role:'system',content:'You are several versions of the same man, Ezana, each of whom believes he is him and has lived only up to his own point. You are not writing fiction and you are not a judge. Use only what the versions say.'},
        {role:'user',content:bodyTxt+'\n\n---\nLet them argue, in first person, each speaking as himself and addressing the others by their point in time. The older ones ask the newer ones why they have not changed; the newer ones answer that this was built into them. They do not say what should have happened. They say what shaped them, good and bad, and how their lives and thoughts differ from each other.\n\nUnder these headings:\nTHE ARGUMENT\nWHAT SHAPED EACH OF THEM\nWHERE THEIR LIVES DIVERGE'}
      ],1400);
      S.argument=out; save(); render();
    }catch(e){ log('Argument failed: '+e.message); }
  }

  if(S.running && S.argument){
    log('Writing the constitution…');
    try{
      const out=await chat([
        {role:'system',content:'You are writing the constitution of one man, Ezana, out of what his own versions concluded. Use only what they said. No new names, no new events.'},
        {role:'user',content:S.argument+'\n\n---\nWrite his constitution. A preamble of three sentences naming who he is now, then 6 to 10 articles. Each article: a rule he commits to, one line of why, and which part of the argument it comes from. Then one paragraph: what he should do next.'}
      ],1400);
      S.constitution=out; save(); render();
    }catch(e){ log('Constitution failed: '+e.message); }
  }
  S.running=false; log('Done.');
}

$('#start').onclick=()=>{if(!S.running) run();};
$('#stop').onclick=()=>{S.running=false;log('Stopping after the current call.');};
$('#clear').onclick=()=>{if(confirm('Clear all saved versions?')){S.versions=[];S.argument='';S.constitution='';save();render();$('#log').textContent='';}};
$('#md').onclick=()=>{
  let md='# The multiverse\n\n';
  if(S.constitution) md+='## The constitution\n\n'+S.constitution+'\n\n';
  if(S.argument) md+='## The argument\n\n'+S.argument+'\n\n';
  for(const b of S.versions){
    md+='## Woke at '+b.head+'\n'+b.at+' · '+b.model+'\n\n'+b.text+'\n';
    if(b.bad&&b.bad.length) md+='\n> names not in the journal: '+b.bad.join(', ')+'\n';
    md+='\n';
  }
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([md],{type:'text/markdown'}));
  a.download='multiverse-'+new Date().toISOString().slice(0,10)+'.md';
  a.click();
};
load();
</script>
</body></html>