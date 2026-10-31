// Catálogos enxutos derivados do Livro do Jogador 2024 e integrações da ficha de campanha.
(function(){
  const BOOK=window.FORJA_BOOK||{spells:[],items:[]};
  const spellClass={Bar:'Bárbaro',Bard:'Bardo',Cleric:'Clérigo',Druid:'Druida',Fighter:'Guerreiro',Monk:'Monge',Paladin:'Paladino',Ranger:'Guardião',Rogue:'Ladino',Sorcerer:'Feiticeiro',Warlock:'Bruxo',Wizard:'Mago'};
  const clean=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const byItem=new Map(BOOK.items.map(x=>[x.n.toLocaleLowerCase('pt-BR'),x]));
  const oldRenderCampaign=renderCampaign;
  renderCampaign=function(){oldRenderCampaign();let list=document.getElementById('equipmentCatalog');if(list)list.innerHTML=BOOK.items.map(x=>'<option value="'+clean(x.n)+'">').join('')};
  const oldAddEntry=addEntry;
  addEntry=function(key,inputId,qtyId){
    if(key!=='inventory')return oldAddEntry(key,inputId,qtyId);
    const el=document.getElementById(inputId),text=el.value.trim();if(!text)return toast('Escolha um item ou digite um item personalizado.');
    const source=byItem.get(text.toLocaleLowerCase('pt-BR')),row={text,date:new Date().toLocaleDateString('pt-BR')};
    if(source){row.bookDetail=source.d;row.bookPage=source.p;row.bookCategory=source.c}
    if(qtyId)row.qty=Math.max(1,Number(document.getElementById(qtyId).value)||1);
    S.inventory.unshift(row);el.value='';if(qtyId)document.getElementById(qtyId).value=1;save();renderCampaign();
  };
  const oldDrawEntries=drawEntries;
  drawEntries=function(key,id,withQty){
    if(key!=='inventory')return oldDrawEntries(key,id,withQty);
    const host=document.getElementById(id);host.innerHTML=S.inventory.length?S.inventory.map((x,i)=>'<div class="entry"><span>'+(x.qty?x.qty+' × ':'')+clean(x.text)+(x.bookDetail?'<small class="hint book-detail">'+clean(x.bookDetail)+' · Livro do Jogador, pág. '+x.bookPage+'</small>':'')+' <small class="hint">'+clean(x.date||'')+'</small></span><button onclick="removeEntry(\'inventory\','+i+')">Remover</button></div>').join(''):'<p class="campaign-note">Nada registrado por enquanto.</p>';
  };

  function matchingSpells(){
    const query=(document.getElementById('spellSearch')?.value||'').trim().toLocaleLowerCase('pt-BR');
    const all=document.getElementById('allClassSpells')?.checked;
    const cls=spellClass[S.cls];
    return BOOK.spells.map((s,i)=>({...s,i})).filter(s=>{
      const classOk=all||!cls||s.c.includes(cls);
      const hay=[s.n,s.s,s.l===0?'truque':s.l+'º círculo',s.c.join(' ')].join(' ').toLocaleLowerCase('pt-BR');
      return classOk&&(!query||hay.includes(query));
    });
  }
  window.filterSpellCatalog=function(){
    const sel=document.getElementById('spellCatalogSelect');if(!sel)return;
    const was=sel.value;sel.innerHTML=matchingSpells().map(s=>'<option value="'+s.i+'">'+clean(s.n)+' · '+(s.l===0?'Truque':s.l+'º círculo')+' · '+clean(s.s)+'</option>').join('');
    if([...sel.options].some(o=>o.value===was))sel.value=was;
    showSpellCatalogInfo();
  };
  window.showSpellCatalogInfo=function(){
    const target=document.getElementById('spellCatalogInfo'),sel=document.getElementById('spellCatalogSelect');if(!target||!sel)return;
    const s=BOOK.spells[Number(sel.value)];if(!s){target.innerHTML='<span class="hint">Escolha uma magia para ver sua referência e seus dados básicos.</span>';return}
    target.innerHTML='<b>'+clean(s.n)+'</b> · '+(s.l===0?'Truque':s.l+'º círculo')+' de '+clean(s.s)+'<br><span class="hint">Classes: '+clean(s.c.join(', ')||'—')+' · Livro do Jogador, pág. '+s.p+'<br>Conjuração: '+clean(s['Tempo de Conjuração']||'—')+' · Alcance: '+clean(s['Alcance']||'—')+' · Componentes: '+clean(s['Componentes']||'—')+' · Duração: '+clean(s['Duração']||'—')+'</span>';
  };
  function spellControls(){
    const spells=S.spells||[];
    return '<h4>Magias conhecidas ou preparadas</h4><p class="campaign-note">A busca prioriza a lista da sua classe. As descrições completas e efeitos estão no livro indicado; a ficha mostra os dados rápidos e a página para consulta. Magias de subclasse, espécie ou da campanha podem ser registradas manualmente.</p><div class="field"><label for="spellSearch">Buscar magia por nome, círculo, escola ou classe</label><input id="spellSearch" oninput="filterSpellCatalog()" placeholder="Ex.: Curar Ferimentos, abjuração, truque"></div><label class="catalog-check"><input id="allClassSpells" type="checkbox" onchange="filterSpellCatalog()"> Mostrar também magias de outras classes</label><div class="field"><label for="spellCatalogSelect">Catálogo do Livro do Jogador 2024 · '+BOOK.spells.length+' magias</label><select id="spellCatalogSelect" size="6" onchange="showSpellCatalogInfo()"></select></div><div class="catalog-info" id="spellCatalogInfo"></div><button class="btn" style="margin:8px 0 18px" onclick="addCatalogSpell()">Adicionar magia selecionada</button><details class="custom-spell"><summary>Adicionar magia personalizada</summary><div class="grid" style="margin-top:12px"><div class="field"><label for="spellCustomName">Nome</label><input id="spellCustomName" placeholder="Magia da campanha ou da subclasse"></div><div class="field"><label for="spellCustomLevel">Nível</label><select id="spellCustomLevel"><option value="0">Truque</option>'+Array.from({length:9},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'º círculo</option>').join('')+'</select></div></div><button class="btn" style="margin-top:8px" onclick="addCustomSpell()">Salvar magia personalizada</button></details><div class="spell-entries">'+(spells.length?spells.map((sp,i)=>'<div class="entry"><span><b>'+clean(sp.name)+'</b> · '+(sp.level===0?'Truque':sp.level+'º círculo')+(sp.school?' · '+clean(sp.school):'')+(sp.page?' · pág. '+sp.page:'')+' · <label><input type="checkbox" '+(sp.prepared?'checked':'')+' onchange="togglePrepared('+i+',this.checked)"> preparada</label></span><button onclick="removeSpell('+i+')">Remover</button></div>').join(''):'<p class="campaign-note">Ainda não há magias anotadas.</p>')+'</div>';
  }
  renderSpells=function(){
    syncSpellSlots();const root=document.getElementById('spellListArea');if(!root)return;
    const slots=Object.entries(S.spellSlots).filter(([,v])=>v.max>0);
    root.innerHTML='<h4>Espaços de magia</h4><p class="campaign-note">Truques podem ser usados sem gastar espaços. Magias de círculo usam um espaço do nível indicado ou superior. O total é calculado pela classe e pelo nível; use −/+ para acompanhar o que resta. Bruxos recuperam no descanso curto, e as outras classes no descanso longo.</p>'+(slots.length?'<div class="slot-grid">'+slots.map(([level,v])=>'<div class="slot"><span>Nível '+level+'</span><button class="btn" onclick="spendSlot(\''+level+'\',-1)">−</button><b>'+v.current+' / '+v.max+'</b><button class="btn" onclick="spendSlot(\''+level+'\',1)">+</button></div>').join('')+'</div>':'<p class="campaign-note">Esta classe ainda não tem espaços de magia neste nível. Características de outras fontes podem ser registradas abaixo.</p>')+spellControls();
    filterSpellCatalog();
  };
  window.addCatalogSpell=function(){const sel=document.getElementById('spellCatalogSelect'),sp=BOOK.spells[Number(sel?.value)];if(!sp)return toast('Escolha uma magia do catálogo.');if((S.spells||[]).some(x=>x.name===sp.n))return toast('Essa magia já está na sua ficha.');S.spells.push({name:sp.n,level:sp.l,school:sp.s,classes:sp.c.join(', '),page:sp.p,prepared:true});save();renderCampaign();toast('Magia adicionada à ficha.');};
  window.addCustomSpell=function(){const name=document.getElementById('spellCustomName').value.trim();if(!name)return toast('Informe o nome da magia.');S.spells.push({name,level:Number(document.getElementById('spellCustomLevel').value)||0,prepared:true,custom:true});save();renderCampaign();toast('Magia personalizada adicionada.');};
  document.head.insertAdjacentHTML('beforeend','<style>.book-detail{display:block;margin:4px 0 0}.catalog-check{display:flex;align-items:center;gap:7px;margin:9px 0;font-size:12px;color:#555}.catalog-info{background:#f8f4e9;border-left:3px solid var(--gold);padding:11px 13px;margin:10px 0;font-size:13px;line-height:1.6}.catalog-info .hint{font-size:12px}.spell-entries{margin-top:12px}.custom-spell{margin:8px 0 18px;padding:11px;border:1px solid var(--line);border-radius:7px}.custom-spell summary{cursor:pointer;color:var(--red);font-weight:700;font-size:13px}#spellCatalogSelect{min-height:150px;font:13px system-ui}.entry label{font-size:12px}@media(max-width:680px){#spellCatalogSelect{min-height:190px}}</style>');
})();
