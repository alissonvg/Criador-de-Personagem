// Reforça os controles essenciais do fluxo de criação, inclusive em fichas antigas.
(function(){
  const S=window.__forja, AB=window.__abilities||{}, SK=window.__skills||{};
  if(!S)return;
  const cost={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
  const sum=()=>Object.values(S.baseScores||S.scores).reduce((n,v)=>n+(cost[Number(v)]??99),0);
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function paintPreview(){
    const root=document.getElementById('statPreview');if(!root)return;
    root.innerHTML=Object.entries(AB).map(([a,n])=>{let v=Number(S.scores[a]??S.baseScores?.[a]??8),m=Math.floor((v-10)/2);return '<div class="stat"><span>'+safe(n)+'</span><strong>'+v+'</strong><small>mod. '+(m>=0?'+':'')+m+'</small></div>'}).join('');
  }
  function paintScores(){
    const root=document.getElementById('scoreInputs');if(!root)return;
    S.baseScores=S.baseScores||{...S.scores};
    const used=sum();
    root.innerHTML='<p class="campaign-note">Compra de pontos do D&amp;D: você pode gastar até 27 pontos. Cada atributo começa em 8; subir para 14 custa 7 pontos e para 15 custa 9. Os aumentos do antecedente são aplicados automaticamente.</p><p class="point-total">Pontos usados: <b>'+used+' / 27</b></p><div class="score-buy repair-score-buy">'+Object.entries(AB).map(([a,n])=>'<div class="buyrow"><span>'+safe(n)+'</span><button type="button" class="btn" onclick="changePointBuy(\''+a+'\',-1)" aria-label="Diminuir '+safe(n)+'" '+(Number(S.baseScores[a])<=8?'disabled':'')+'>−</button><strong>'+Number(S.baseScores[a])+'</strong><button type="button" class="btn" onclick="changePointBuy(\''+a+'\',1)" aria-label="Aumentar '+safe(n)+'" '+(Number(S.baseScores[a])>=15||used>=27?'disabled':'')+'>+</button><small>'+cost[Number(S.baseScores[a])]+' pts</small></div>').join('')+'</div>';
    paintPreview();
  }
  window.changePointBuy=function(a,d){
    if(!S.baseScores||!(a in S.baseScores))return;
    const next=Number(S.baseScores[a])+d,after=sum()-(cost[Number(S.baseScores[a])]??0)+(cost[next]??999);
    if(next<8||next>15||after>27)return;
    S.baseScores[a]=next;
    if(typeof window.applyOriginBonuses==='function')window.applyOriginBonuses();else S.scores={...S.baseScores};
    paintScores();if(typeof window.refreshDerivedFields==='function')window.refreshDerivedFields();
    if(typeof window.save==='function')window.save();
  };
  window.renderScores=paintScores;
  if(typeof window.next==='function'){
    const oldNext=window.next;
    window.next=function(){if(S.step===3){if(sum()>27){window.toast?.('A distribuição ultrapassa o limite de 27 pontos.');return}window.go(S.step+1);return}oldNext()};
  }
  const allSkills=Object.keys(SK);
  window.renderSkills=function(){
    const c=window.__classes?.[S.cls],host=document.getElementById('skills');if(!c||!host)return;
    const allowed=new Set(c.opts||[]),origin=String(S.backgroundSkill||'').split(/,\s*|\s+e\s+/).filter(Boolean);
    S.skillProfs=(S.skillProfs||[]).filter(x=>allowed.has(x)&&!origin.includes(x)).slice(0,c.count);
    document.getElementById('skillTitle').textContent='Perícias treinadas';
    document.getElementById('counter').textContent=S.skillProfs.length+' de '+c.count+' escolhas de classe · antecedente: '+origin.join(', ');
    host.innerHTML='<div class="skill-list-all">'+allSkills.map(n=>{
      const trained=S.skillProfs.includes(n)||origin.includes(n),available=allowed.has(n)&&!origin.includes(n),attr=AB[SK[n]]||'';
      return '<div class="skill-option '+(trained?'trained':'')+' '+(!available&&!trained?'not-available':'')+'">'+(available?'<button class="chip '+(S.skillProfs.includes(n)?'on':'')+'" onclick="toggleSkill(\''+safe(n)+'\')">'+(S.skillProfs.includes(n)?'✓ ':'+')+safe(n)+' <span class="mono">('+safe(attr)+')</span></button>':'<span class="skill-name">'+safe(n)+' <span class="mono">('+safe(attr)+')</span></span>')+'<small>'+(origin.includes(n)?'Treinada pelo antecedente; escolha outra opção da classe':available?(trained?'Treinada · classe':'Opção da classe'):'Disponível por outras características')+'</small></div>'
    }).join('')+'</div>';
    const saves=document.getElementById('saveText');if(saves)saves.innerHTML='<b>Salvaguardas treinadas</b> <span class="campaign-note">As proficiências sugeridas pela classe são marcadas automaticamente.</span><div class="save-choices">'+Object.entries(AB).map(([a,n])=>'<span class="chip '+((S.saveProfs||c.saves).includes(a)?'on':'')+'">'+((S.saveProfs||c.saves).includes(a)?'✓ ':'')+safe(n)+'</span>').join('')+'</div><p class="campaign-note">A lista mostra todas as 18 perícias do jogo. Só as opções da classe podem ser escolhidas aqui; o antecedente e outras características podem conceder treinamento adicional.</p>';
  };
  window.toggleSkill=function(n){const c=window.__classes[S.cls],background=String(S.backgroundSkill||'').split(/,\s*|\s+e\s+/).filter(Boolean);S.skillProfs=S.skillProfs||[];if(S.skillProfs.includes(n))S.skillProfs=S.skillProfs.filter(x=>x!==n);else if(background.includes(n))return window.toast?.('Essa perícia já vem do antecedente; escolha outra opção da classe.');else if(c.opts.includes(n)&&S.skillProfs.length<c.count)S.skillProfs.push(n);else if(!c.opts.includes(n))return window.toast?.('Essa perícia não está entre as opções desta classe.');else window.toast?.('Você já selecionou todas as perícias da classe.');window.renderSkills();window.save?.()};
  const level=document.getElementById('level');if(level){const levelField=level.closest('.field');if(levelField){levelField.hidden=true;levelField.style.display='none'}if(!S.campaignStarted){S.level=1;level.value='1';if(typeof window.derived==='function')S.currentHP=window.derived().hp;window.save?.()}}
  const raceNote=document.getElementById('raceBonus');
  if(raceNote)raceNote.textContent='Regras de 2024: os aumentos de atributo vêm do antecedente e são aplicados automaticamente. A espécie define características e deslocamento.';
  const launch=document.getElementById('startPlaying');
  if(launch)launch.innerHTML='<h3>Pronto para jogar?</h3><p>Abra a ficha digital para acompanhar PV, recursos, itens, magias e avanços de nível durante a campanha.</p><button type="button" class="btn primary" onclick="openCampaign()">▶ Começar a jogar</button>';
  const oldSummary=window.renderSummary;
  if(oldSummary)window.renderSummary=function(){oldSummary();document.querySelectorAll('#summary .campaign-open').forEach(x=>x.remove())};
  const oldOpenCampaign=window.openCampaign;
  if(oldOpenCampaign)window.openCampaign=function(){S.campaignStarted=true;window.save?.();oldOpenCampaign()};
  const style=document.createElement('style');style.textContent='.repair-score-buy{margin:12px 0}.point-total{padding:9px 12px;background:#f7f5ef;border-radius:6px;font-size:13px}.buyrow button:disabled{opacity:.35;cursor:not-allowed}.skill-list-all{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.skill-option{padding:8px;border:1px solid var(--line);border-radius:7px;display:flex;flex-direction:column;gap:5px}.skill-option small{font-size:10px;color:var(--muted)}.skill-option .chip{width:100%;text-align:left}.skill-option.not-available{background:#f8f6f1}.skill-name{font-size:13px;padding:8px}.ready-to-play{display:block!important;position:relative;z-index:2}.ready-to-play .btn{font-size:16px;padding:13px 20px}.ready-to-play p{max-width:620px}@media(max-width:700px){.skill-list-all{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:460px){.skill-list-all{grid-template-columns:1fr}}';document.head.appendChild(style);
  paintScores();window.renderSkills?.();if(S.step===6)window.renderSummary?.();
})();
