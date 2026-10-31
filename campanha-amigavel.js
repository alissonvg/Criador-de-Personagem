// Navegação por áreas e testes de perícia para a ficha durante a sessão.
(function(){
  const S=window.__forja,AB=window.__abilities||{},SK=window.__skills||{};
  if(!S)return;
  const labels=[['overview','Visão geral'],['checks','Testes'],['character','Personagem'],['spells','Magias'],['inventory','Inventário'],['journal','Diário'],['progress','Progressão']];
  let active=S.activeCampaignTab||'overview';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function cardFor(selector){return document.querySelector(selector)?.closest('.sumcard')||null}
  function ensureSkillCard(){
    let card=document.getElementById('campaignSkillChecks');if(card)return card;
    card=document.createElement('section');card.id='campaignSkillChecks';card.className='sumcard campaign-skill-card';
    card.innerHTML='<h3>Testes de perícia</h3><p class="campaign-note">Quando o Mestre pedir um teste, escolha a perícia e role. A Forja soma o modificador do atributo e, se você for treinado, seu bônus de proficiência. A dificuldade vem do Mestre. Especialização dobra a proficiência naquela perícia.</p><div id="expertiseHint" class="expertise-hint"></div><div class="field roll-mode"><label for="skillRollMode">Modo de rolagem</label><select id="skillRollMode"><option value="normal">Normal</option><option value="advantage">Vantagem · role 2d20 e use o maior</option><option value="disadvantage">Desvantagem · role 2d20 e use o menor</option></select></div><div id="skillRollResult" class="roll-result" aria-live="polite">Escolha uma perícia para fazer seu primeiro teste.</div><div id="campaignSkillList" class="campaign-skill-list"></div>';
    const campaign=document.getElementById('campaign'),nav=document.getElementById('campaignNav');if(nav)nav.after(card);else campaign.appendChild(card);
    card.querySelector('#skillRollMode').value=S.rollMode||'normal';card.querySelector('#skillRollMode').onchange=e=>{S.rollMode=e.target.value;window.save?.()};
    return card;
  }
  function addNavigation(){
    const campaign=document.getElementById('campaign');if(!campaign)return;
    let nav=document.getElementById('campaignNav');
    if(!nav){
      nav=document.createElement('nav');nav.id='campaignNav';nav.setAttribute('aria-label','Seções da ficha de campanha');
      nav.innerHTML=labels.map(([id,name])=>'<button type="button" data-tab="'+id+'" onclick="showCampaignTab(\''+id+'\')">'+name+'</button>').join('');
      const actions=campaign.querySelector(':scope > .actions');if(actions)actions.after(nav);else campaign.insertBefore(nav,campaign.firstChild);
    }
    campaign.querySelectorAll(':scope > .grid').forEach((grid,i)=>{
      if(i===0)grid.dataset.campTab='overview';
      else{grid.dataset.campGrid='true';[...grid.children].forEach(el=>{if(!el.dataset.campTab)el.dataset.campTab='character'})}
    });
    const mappings=[['#inventoryList','inventory'],['#featuresList','character'],['#journalList','journal'],['#spellListArea','spells'],['#resourcesList','overview'],['#turnGuide','overview'],['#campaignAppearance','character'],['#armorChoice','character'],['#subclassChoice','progress']];
    mappings.forEach(([sel,tab])=>{const card=cardFor(sel);if(card)card.dataset.campTab=tab});
    ['progressCard','pendingLevelCard'].forEach(id=>{const el=document.getElementById(id);if(el)el.dataset.campTab='progress'});
    ensureSkillCard().dataset.campTab='checks';
    campaign.querySelectorAll(':scope > .sumcard').forEach(el=>{if(!el.dataset.campTab)el.dataset.campTab='character'});
    campaign.querySelectorAll(':scope > .grid[data-camp-grid] > .sumcard').forEach(el=>{if(!el.dataset.campTab)el.dataset.campTab='character'});
    showCampaignTab(active,false);
  }
  function applyTabs(){
    const campaign=document.getElementById('campaign');if(!campaign)return;
    campaign.querySelectorAll('[data-camp-tab]').forEach(el=>{el.hidden=el.dataset.campTab!==active});
    campaign.querySelectorAll('[data-camp-grid]').forEach(grid=>{grid.hidden=[...grid.children].every(el=>el.hidden)});
    campaign.querySelectorAll('#campaignNav [data-tab]').forEach(btn=>{btn.classList.toggle('active',btn.dataset.tab===active);btn.setAttribute('aria-current',btn.dataset.tab===active?'page':'false')});
    S.activeCampaignTab=active;window.save?.();
  }
  window.showCampaignTab=function(tab,scroll=true){if(!labels.some(([id])=>id===tab))return;active=tab;applyTabs();if(scroll)document.getElementById('campaignNav')?.scrollIntoView({behavior:'smooth',block:'start'})};
  function backgroundSkills(){return String(S.backgroundSkill||'').split(/,\s*|\s+e\s+/).filter(Boolean)}
  function expertiseCapacity(){if(S.cls==='Rogue')return Number(S.level)>=6?4:2;if(S.cls==='Bard')return Number(S.level)>=9?4:Number(S.level)>=2?2:0;if(S.cls==='Ranger')return Number(S.level)>=9?2:0;return 0}
  function skillBonus(name){
    const attr=SK[name],score=Number(S.scores[attr]||10),mod=Math.floor((score-10)/2),trained=(S.skillProfs||[]).includes(name)||backgroundSkills().includes(name);
    const pb=Math.ceil(Math.max(1,Number(S.level)||1)/4)+1,expertise=trained&&(S.expertiseSkills||[]).includes(name);
    return{attr,mod,pb:trained?pb*(expertise?2:1):0,total:mod+(trained?pb*(expertise?2:1):0),trained,expertise};
  }
  function renderSkillChecks(){
    const host=document.getElementById('campaignSkillList');if(!host)return;
    S.expertiseSkills=S.expertiseSkills||[];const cap=expertiseCapacity();
    const hint=document.getElementById('expertiseHint');if(hint)hint.innerHTML=cap?'<b>Especialização: '+S.expertiseSkills.length+' de '+cap+' escolhas.</b> Marque uma perícia treinada para dobrar o bônus de proficiência.':'Sua classe ainda não concede Especialização neste nível.';
    host.innerHTML=Object.entries(SK).map(([name,attr])=>{
      const b=skillBonus(name),expertiseControl=cap&&b.trained?'<label class="expertise-toggle"><input type="checkbox" '+(b.expertise?'checked':'')+' onchange="toggleExpertiseSkill(\''+esc(name)+'\',this.checked)" '+(!b.expertise&&S.expertiseSkills.length>=cap?'disabled':'')+'> Especialização</label>':'';
      return '<div class="check-row"><div><b>'+esc(name)+'</b><small>'+esc(AB[attr])+' · '+(b.expertise?'especialização':b.trained?'treinada':'sem proficiência')+'</small>'+expertiseControl+'</div><strong class="check-mod">'+(b.total>=0?'+':'')+b.total+'</strong><button type="button" class="btn" onclick="rollSkillCheck(\''+esc(name)+'\')">Rolar</button></div>'
    }).join('');
  }
  window.toggleExpertiseSkill=function(name,on){
    const b=skillBonus(name),cap=expertiseCapacity();S.expertiseSkills=S.expertiseSkills||[];
    if(on&&!b.trained){window.toast?.('A Especialização só pode ser escolhida em uma perícia treinada.');renderSkillChecks();return}
    if(on&&!S.expertiseSkills.includes(name)&&S.expertiseSkills.length>=cap){window.toast?.('Você já escolheu todas as Especializações disponíveis.');renderSkillChecks();return}
    S.expertiseSkills=on?[...new Set([...S.expertiseSkills,name])]:S.expertiseSkills.filter(x=>x!==name);window.save?.();renderSkillChecks();
  };
  window.rollSkillCheck=function(name){
    if(!SK[name])return;
    const mode=document.getElementById('skillRollMode')?.value||S.rollMode||'normal',b=skillBonus(name),a=1+Math.floor(Math.random()*20),c=mode==='normal'?a:1+Math.floor(Math.random()*20),d20=mode==='advantage'?Math.max(a,c):mode==='disadvantage'?Math.min(a,c):a,total=d20+b.total;
    const modeText=mode==='advantage'?' · vantagem ('+a+', '+c+')':mode==='disadvantage'?' · desvantagem ('+a+', '+c+')':'';
    const bonusText=(b.mod>=0?'+':'')+b.mod+(b.pb?' + '+b.pb+' proficiência':'');
    const host=document.getElementById('skillRollResult');if(host)host.innerHTML='<b>'+esc(name)+': '+total+'</b><span>d20 '+d20+modeText+' · '+bonusText+' = '+total+'. Compare com a CD informada pelo Mestre.</span>';
  };
  const oldRender=window.renderCampaign;
  if(oldRender)window.renderCampaign=function(){oldRender();addNavigation();renderSkillChecks()};
  const oldOpen=window.openCampaign;
  if(oldOpen)window.openCampaign=function(){oldOpen();addNavigation();renderSkillChecks();window.showCampaignTab(active,false)};
  if(typeof window.renderCampaign==='function'&&document.getElementById('campaign').style.display!=='none'){addNavigation();renderSkillChecks()}
  const css=document.createElement('style');css.textContent='#campaignNav{position:sticky;top:62px;z-index:2;display:flex;gap:6px;overflow:auto;padding:9px;margin:0 0 16px;background:var(--paper);border:1px solid var(--line);border-radius:9px}#campaignNav button{flex:0 0 auto;border:0;border-radius:7px;padding:9px 12px;background:transparent;color:#57554f;font:600 12px system-ui;cursor:pointer}#campaignNav button.active{background:var(--pale);color:var(--red)}#campaign [hidden]{display:none!important}.campaign-skill-card{margin-bottom:14px}.expertise-hint{padding:10px 12px;background:#f7f5ef;border-radius:6px;font-size:12px}.expertise-toggle{display:flex;align-items:center;gap:5px;margin-top:5px;font-size:10px;color:var(--red)}.roll-mode{max-width:440px;margin:12px 0}.roll-result{padding:12px 14px;border-left:3px solid var(--gold);background:#f8f4e9;border-radius:4px;margin:12px 0;font-size:14px}.roll-result span{display:block;margin-top:3px;font-size:12px;color:var(--muted)}.campaign-skill-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.check-row{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:7px;padding:8px 10px;background:#fffefa}.check-row>div{flex:1}.check-row small{display:block;color:var(--muted);font-size:10px}.check-mod{font:14px monospace;min-width:26px}.check-row .btn{padding:6px 10px}.campaign-note{max-width:760px}@media(max-width:600px){.campaign-skill-list{grid-template-columns:1fr}#campaignNav{top:0}.check-row{gap:7px}}';document.head.appendChild(css);
})(); 
