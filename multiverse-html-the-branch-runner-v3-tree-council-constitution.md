# multiverse.html — the branch runner (v3: tree, council, constitution)

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
.branch{border-top:1px solid #2a2a2a;margin-top:22px;padding-top:12px}
.tag2{color:#777;font-size:12px}
.warn{color:#e0a050}
.bad{color:#e06060}
h3{font-size:15px;margin:16px 0 4px}
pre{white-space:pre-wrap;font:inherit;margin:0}
</style></head>
<body>
<h1>The multiverse</h1>
<p class="tag">Every decision wakes a version of you. Each one works out what it should have done. Then they argue, and the last one writes your constitution.</p>
<label>Your journal (stays on this laptop; sent only to the model you choose)</label>
<textarea id="journal"></textarea>
<div style="display:flex;gap:10px;flex-wrap:wrap">
<div style="flex:1;min-width:140px"><label>Model</label><input id="model" value="qwen3.5:9b"></div>
<div style="flex:1;min-width:180px"><label>Endpoint</label><input id="endpoint" value="http://localhost:11434/api/chat"></div>
<div style="flex:1;min-width:100px"><label>Context tokens</label><input id="ctx" value="16384"></div>
<div style="flex:1;min-width:100px"><label>Branches</label><input id="n" value="12"></div>
</div>
<button id="start">Start the night</button><button id="stop">Stop</button><button id="md">Download as text</button><button id="clear">Clear saved</button>
<div id="log"></div>
<div id="out"></div>
<script>
const $=s=>document.querySelector(s);
const KEY='multiverse-v3';
const S={running:false,branches:[],council:[],constitution:''};
const SYSTEM='You are Ezana Kabenge Kavuma, 20, a Cornell student, writing privately in his own journal. You are the version of him at one moment of his life. Hard rules: use only people, places, events and decisions that appear in the journal text given to you. Never invent a name, a place, an event or a decision. If the text gives you nothing to work from, say so instead of writing. First person, plain, no literary flourishes.';
const STOP=new Set('the and but for nor yet so if then than that this these those there here when what why who whom whose how all any some every each both few more most other such only own same very just now later still even also always never sometimes maybe perhaps really quite well okay yeah yes not no nor can will would could should may might must do does did has have had was were are is be been being i me my we us our you your he him his she her it its they them their one two three first last with from into over under about after before again because while during through between'.split(' '));

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
    out.push({head:(carry.length?carry.join(' / ')+' / ':'')+e.head, body:e.body});
    carry=[];
  }
  if(carry.length && out.length) out[out.length-1].head+=' / '+carry.join(' / ');
  return out.length?out:[{head:'(the whole journal)',body:text.trim()}];
}

function memoryUpTo(ents,idx,budget){
  const all=ents.slice(0,idx+1).map(e=>e.head+'\n'+e.body).join('\n\n');
  if(all.length<=budget) return all;
  const h=Math.floor(budget*0.25), t=Math.floor(budget*0.75);
  return all.slice(0,h)+'\n\n[…the middle of this is not shown to you…]\n\n'+all.slice(-t);
}

function invented(out,mem){
  const have=new Set((mem.match(/\b[A-Z][a-z]{2,}\b/g)||[]).map(w=>w.toLowerCase()));
  const seen=new Set(), bad=[];
  for(const w of (out.match(/\b[A-Z][a-z]{2,}\b/g)||[])){
    const k=w.toLowerCase();
    if(seen.has(k)||STOP.has(k)) continue;
    seen.add(k);
    if(!have.has(k)) bad.push(w);
  }
  return bad;
}

async function chat(messages,maxTok){
  const body={model:$('#model').value.trim(),messages,stream:false,think:false,keep_alive:'10m',
    options:{num_ctx:parseInt($('#ctx').value,10)||16384,num_predict:maxTok,temperature:0.8}};
  const r=await fetch($('#endpoint').value.trim(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok) throw new Error('HTTP '+r.status+' — '+(await r.text()).slice(0,200));
  const d=await r.json();
  const c=(d.message&&d.message.content)||'';
  if(!c.trim()){
    const why=(d.message&&d.message.reasoning)?'the model spent its whole budget thinking — reasoning came back full and content empty. Raise Context tokens or run fewer branches at once.':'the model returned an empty reply.';
    throw new Error(why);
  }
  return c.trim();
}

function save(){try{localStorage.setItem(KEY,JSON.stringify({branches:S.branches,council:S.council,constitution:S.constitution}));}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d){S.branches=d.branches||[];S.council=d.council||[];S.constitution=d.constitution||'';render();}}catch(e){}}

function render(){
  const o=$('#out'); o.innerHTML='';
  if(S.constitution){
    const d=document.createElement('div'); d.className='branch';
    d.innerHTML='<h3>The constitution</h3><pre></pre>';
    d.querySelector('pre').textContent=S.constitution;
    o.appendChild(d);
  }
  for(const c of S.council){
    for(const g of c.groups){
      const d=document.createElement('div'); d.className='branch';
      d.innerHTML='<div class="tag2">Council round '+c.round+' — '+esc(g.label)+'</div><pre></pre>';
      d.querySelector('pre').textContent=g.text;
      o.appendChild(d);
    }
  }
  for(const b of S.branches){
    const d=document.createElement('div'); d.className='branch';
    d.innerHTML='<div class="tag2">Woke at: '+esc(b.head)+'<br>'+esc(b.at)+' · '+esc(b.model)+'</div><pre></pre>';
    d.querySelector('pre').textContent=b.text;
    if(b.bad&&b.bad.length){
      const w=document.createElement('div'); w.className='bad';
      w.textContent='Names that do not appear in your journal at this point — treat this branch as fiction: '+b.bad.join(', ');
      d.appendChild(w);
    }
    o.appendChild(d);
  }
}
function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}

async function run(){
  const text=$('#journal').value.trim();
  if(!text){log('Paste the journal first.');return;}
  S.running=true; S.branches=[]; S.council=[]; S.constitution=''; save(); render();
  $('#log').textContent='';
  const ents=splitEntries(text);
  log('Found '+ents.length+' entries with text in them.');
  const n=Math.max(1,Math.min(parseInt($('#n').value,10)||12,ents.length));
  const picks=[];
  for(let i=0;i<n;i++) picks.push(Math.floor(i*(ents.length-1)/Math.max(1,n-1)));
  const uniq=[...new Set(picks)];
  const budget=Math.floor((parseInt($('#ctx').value,10)||16384)*3);

  for(let i=0;i<uniq.length;i++){
    if(!S.running) break;
    const idx=uniq[i], mem=memoryUpTo(ents,idx,budget);
    log('Branch '+(i+1)+' of '+uniq.length+' — waking at "'+ents[idx].head+'" ('+mem.length+' characters of memory)');
    try{
      const out=await chat([
        {role:'system',content:SYSTEM},
        {role:'user',content:mem+'\n\n---\nYou are at this point: '+ents[idx].head+'\n\nWrite your answer under exactly these four headings, each under 120 words:\nWHAT I DID\nWHAT WAS WRONG\nWHY I DID IT\nWHAT I SHOULD HAVE DONE\nName only decisions, people and places that appear in the text above. If there is nothing here to work with, write only: NOTHING HERE.'}
      ],900);
      S.branches.push({head:ents[idx].head,at:new Date().toLocaleString(),model:$('#model').value,text:out,bad:invented(out,mem)});
      save(); render();
    }catch(e){ log('Branch failed: '+e.message); }
  }

  let level=S.branches.map(b=>({label:b.head,text:b.text}));
  let round=1;
  while(S.running && level.length>1){
    const groups=[];
    for(let i=0;i<level.length;i+=4) groups.push(level.slice(i,i+4));
    log('Council round '+round+' — '+groups.length+' groups of up to 4');
    const next=[];
    for(const g of groups){
      if(!S.running) break;
      const bodyTxt=g.map((x,i)=>'VERSION '+(i+1)+' (woke at '+x.label+'):\n'+x.text).join('\n\n');
      try{
        const out=await chat([
          {role:'system',content:'You are a council of versions of the same man, Ezana, each from a different point in his life. You are not writing fiction. Use only what the versions say. Do not introduce a person, place or event that is not in their accounts.'},
          {role:'user',content:bodyTxt+'\n\n---\nSpeak as the council. Under these headings, under 150 words each:\nWHAT THEY ALL AGREE ON\nWHERE THEY DISAGREE, AND WHO IS RIGHT\nTHE MISTAKE THAT REPEATS'}
        ],900);
        next.push({label:g.map(x=>x.label).join(' + '),text:out});
        save();
      }catch(e){ log('Council failed: '+e.message); }
    }
    if(!next.length) break;
    S.council.push({round,groups:next});
    level=next; round++;
    save(); render();
  }

  if(S.running && level.length){
    log('Writing the constitution…');
    try{
      const out=await chat([
        {role:'system',content:'You are writing the constitution of one man, Ezana, out of what his own versions concluded. Use only what they said. No new names, no new events.'},
        {role:'user',content:level.map(x=>x.text).join('\n\n')+'\n\n---\nWrite his constitution. A preamble of three sentences naming who he is now, then 6 to 10 articles. Each article: a rule he commits to, one line of why, and the branch finding it comes from. Then one paragraph: what he should do next.'}
      ],1400);
      S.constitution=out; save(); render();
    }catch(e){ log('Constitution failed: '+e.message); }
  }
  S.running=false; log('Done.');
}

$('#start').onclick=()=>{if(!S.running) run();};
$('#stop').onclick=()=>{S.running=false;log('Stopping after the current call.');};
$('#clear').onclick=()=>{if(confirm('Clear all saved branches?')){S.branches=[];S.council=[];S.constitution='';save();render();$('#log').textContent='';}};
$('#md').onclick=()=>{
  let md='# The multiverse\n\n';
  if(S.constitution) md+='## The constitution\n\n'+S.constitution+'\n\n';
  for(const c of S.council) for(const g of c.groups) md+='## Council round '+c.round+' — '+g.label+'\n\n'+g.text+'\n\n';
  for(const b of S.branches){
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