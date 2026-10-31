// Progressão guiada e consulta de magias dentro da ficha de campanha.
(function(){
  const S=window.__forja, BOOK=window.FORJA_BOOK||{};
  if(!S)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const CLASS_NAMES={Bar:'Bárbaro',Bard:'Bardo',Cleric:'Clérigo',Druid:'Druida',Fighter:'Guerreiro',Monk:'Monge',Paladin:'Paladino',Ranger:'Guardião',Rogue:'Ladino',Sorcerer:'Feiticeiro',Warlock:'Bruxo',Wizard:'Mago'};
  // Faixas aproximadas publicadas para tamanho de espécie nas regras de 2024 (em metros).
  const SPECIES_HEIGHT={Draconato:[1.52,2.13],Anão:[1.22,1.52],Elfo:[1.52,1.83],Gnomo:[0.91,1.22],Golias:[2.13,2.44],Halfling:[0.61,0.91],Humano:[1.22,2.13],Orc:[1.83,2.13],Tiefling:[1.22,2.13]};
  const SMALL_HEIGHT={Humano:[0.61,1.22],Tiefling:[0.91,1.22]};
  const SUBCLASSES={
    Bar:['Berserker','Coração Selvagem','Árvore do Mundo','Fanático'],
    Bard:['Colégio da Dança','Colégio do Glamour','Colégio do Conhecimento','Colégio da Bravura'],
    Cleric:['Domínio da Vida','Domínio da Luz','Domínio da Trapaça','Domínio da Guerra'],
    Druid:['Círculo da Terra','Círculo da Lua','Círculo do Mar','Círculo das Estrelas'],
    Fighter:['Campeão','Mestre de Batalha','Cavaleiro Arcano','Guerreiro Psiônico'],
    Monk:['Discípulo da Misericórdia','Discípulo das Sombras','Discípulo dos Elementos','Discípulo da Mão Aberta'],
    Paladin:['Juramento dos Anciões','Juramento de Devoção','Juramento da Glória','Juramento da Vingança'],
    Ranger:['Mestre das Feras','Andarilho Feérico','Perseguidor Sombrio','Caçador'],
    Rogue:['Trapaceiro Arcano','Assassino','Lâmina Psíquica','Ladrão'],
    Sorcerer:['Feitiçaria Aberrante','Feitiçaria Mecânica','Feitiçaria Dracônica','Feitiçaria da Magia Selvagem'],
    Warlock:['Arquifada','Celestial','Infernal','Grande Antigo'],
    Wizard:['Abjurador','Adivinho','Evocador','Ilusionista']
  };
  const SUBCLASS_HELP={
    'Berserker':'Entra em fúria com força bruta e causa dano pesado de perto. Boa escolha para quem quer avançar na linha de frente.',
    'Coração Selvagem':'Conecta a fúria a animais e à natureza, ganhando ferramentas de exploração e combate. Boa para quem quer versatilidade selvagem.',
    'Árvore do Mundo':'Usa a força mística da Árvore do Mundo para proteger aliados e controlar o campo de batalha.',
    'Fanático':'Combina fúria com poder divino, causando dano e sendo difícil de derrubar.',
    'Colégio da Dança':'Transforma movimento e dança em defesa, mobilidade e apoio. Boa para quem quer um Bardo ágil.',
    'Colégio do Glamour':'Usa encanto feérico para inspirar, reposicionar e proteger aliados.',
    'Colégio do Conhecimento':'É especialista em perícias e magia versátil, capaz de atrapalhar ataques e testes inimigos.',
    'Colégio da Bravura':'Mistura magia de Bardo com combate, apoiando aliados e lutando com armas.',
    'Domínio da Vida':'Especialista em cura e proteção, mantendo o grupo de pé.',
    'Domínio da Luz':'Usa luz e fogo para atacar inimigos e proteger o grupo contra ameaças.',
    'Domínio da Trapaça':'Favorece furtividade, ilusões e enganos para confundir ou contornar perigos.',
    'Domínio da Guerra':'Une magia divina e combate armado, ajudando a equipe a acertar golpes decisivos.',
    'Círculo da Terra':'Druida focado em magia da natureza e em adaptar suas magias ao ambiente.',
    'Círculo da Lua':'Usa Forma Selvagem com mais força para assumir formas animais e lutar na linha de frente.',
    'Círculo do Mar':'Canaliza tempestades e forças do mar para afastar ameaças e controlar áreas.',
    'Círculo das Estrelas':'Lê sinais celestes e escolhe formas estelares que ajudam a curar, atacar ou manter a concentração.',
    'Campeão':'Opção direta para quem quer um Guerreiro resistente, atlético e eficiente em combate.',
    'Mestre de Batalha':'Usa manobras táticas para derrubar, empurrar, proteger aliados ou melhorar ataques.',
    'Cavaleiro Arcano':'Combina ataques de Guerreiro com magias de proteção e ataque.',
    'Guerreiro Psiônico':'Usa energia psíquica para defender aliados, mover objetos e reforçar ataques.',
    'Discípulo da Misericórdia':'Mistura golpes com técnicas de cura e efeitos debilitantes.',
    'Discípulo das Sombras':'Especialista em furtividade, escuridão e deslocamento silencioso.',
    'Discípulo dos Elementos':'Reveste os golpes com forças elementais e amplia seu alcance e controle.',
    'Discípulo da Mão Aberta':'Controla o ritmo da luta com golpes que derrubam, empurram ou limitam inimigos.',
    'Juramento dos Anciões':'Defende a vida e a esperança, usando poderes ligados à natureza para proteger o grupo.',
    'Juramento de Devoção':'Paladino exemplar, focado em proteger aliados e enfrentar o mal de frente.',
    'Juramento da Glória':'Busca feitos heroicos e fortalece a mobilidade e o desempenho físico do grupo.',
    'Juramento da Vingança':'Persegue um inimigo prioritário e ganha ferramentas para alcançá-lo e derrotá-lo.',
    'Mestre das Feras':'Luta em parceria com um companheiro animal que age junto com você.',
    'Andarilho Feérico':'Une exploração e magia feérica, com encanto e presença sobrenatural.',
    'Perseguidor Sombrio':'Ataca de surpresa e se destaca em lugares escuros, emboscadas e exploração furtiva.',
    'Caçador':'Adapta suas táticas para enfrentar diferentes ameaças e proteger o grupo.',
    'Trapaceiro Arcano':'Usa ilusão e encantamento para ampliar as opções de furtividade e truques.',
    'Assassino':'Especialista em infiltração e em eliminar alvos com preparação e ataques precisos.',
    'Lâmina Psíquica':'Cria armas psíquicas e usa energia mental para atacar e se comunicar.',
    'Ladrão':'Especialista em mãos rápidas, escalada e uso criativo de objetos mágicos.',
    'Feitiçaria Aberrante':'Poder psíquico estranho: lê pensamentos, comunica-se mentalmente e altera magias.',
    'Feitiçaria Mecânica':'Poder ligado à ordem e à previsibilidade, capaz de neutralizar caos e proteger aliados.',
    'Feitiçaria Dracônica':'Herda vigor e magia de dragões, com afinidade por um tipo de dano elemental.',
    'Feitiçaria da Magia Selvagem':'Magia imprevisível que pode gerar efeitos inesperados e alterar resultados.',
    'Arquifada':'Recebe magia feérica para encantar, confundir e se deslocar pelo campo de batalha.',
    'Celestial':'Recebe poder radiante para curar aliados e ferir inimigos.',
    'Infernal':'Obtém poder de um patrono infernal, ficando mais resistente e causando dano ígneo.',
    'Grande Antigo':'Usa poderes psíquicos e telepatia para influenciar mentes e espalhar temor.',
    'Abjurador':'Especialista em barreiras e proteção mágica para si e para seus aliados.',
    'Adivinho':'Obtém sinais do futuro para influenciar jogadas importantes.',
    'Evocador':'Especialista em magias de energia e dano, com mais controle sobre suas explosões mágicas.',
    'Ilusionista':'Cria ilusões convincentes e aprende a moldá-las para enganar ou escapar.'
  };
  const SPELL_SUMMARIES={
    'Acudir os Moribundos':'Toca uma criatura com 0 PV e a estabiliza: ela para de fazer salvaguardas contra a morte, mas não recupera PV.',
    'Amigos':'Ajuda você a influenciar uma criatura por pouco tempo; pense bem, pois ela pode perceber a magia depois.',
    'Arte Druídica':'Pequenos efeitos naturais: prever o tempo, fazer uma planta florescer ou criar um sinal inofensivo.',
    'Badalar Fúnebre':'Um som fúnebre fere uma criatura próxima com energia necrótica.',
    'Bolha Ácida':'Arremessa uma bolha que explode em ácido e pode atingir criaturas próximas do ponto escolhido.',
    'Bordão Místico':'Encanta um bastão ou clava para usar sua magia em ataques corpo a corpo com essa arma.',
    'Chama Sagrada':'Uma luz divina atinge uma criatura; ela tenta se esquivar para evitar dano radiante.',
    'Chicote de Espinhos':'Um chicote vegetal atinge um alvo e pode puxá-lo para mais perto.',
    'Criar Chamas':'Cria uma chama que ilumina; você também pode arremessá-la para atacar.',
    'Elementalismo':'Cria pequenos efeitos de ar, terra, fogo ou água para interagir com o ambiente.',
    'Explosão Elemental':'Dispara energia elemental contra um alvo; ele tenta resistir ao dano.',
    'Fagulha Estelar':'Lança uma fagulha de energia estelar que fere e ilumina o alvo.',
    'Golpe Certeiro':'Faz um ataque com arma guiado pela magia, usando seu atributo de conjuração.',
    'Ilusão Menor':'Cria uma imagem pequena ou um som para distrair, esconder algo ou enganar.',
    'Luz':'Faz um objeto brilhar como uma tocha por bastante tempo.',
    'Luzes Dançantes':'Cria luzes móveis que iluminam ou servem como distração.',
    'Mãos Mágicas':'Cria uma mão espectral para manipular objetos leves à distância; não é uma mão extra para atacar.',
    'Mensagem':'Sussurra uma frase a alguém distante; a pessoa pode responder em segredo.',
    'Orientação':'Ajuda alguém a fazer um teste de atributo com um pequeno bônus mágico.',
    'Palavra de Radiância':'Uma palavra divina fere criaturas próximas com luz radiante.',
    'Prestidigitação Arcana':'Pequenos truques mágicos: limpar, aquecer, criar um aroma ou produzir um efeito visual breve.',
    'Proteção Contra Lâminas':'Reduz o impacto de um ataque que acerte você antes do início do seu próximo turno.',
    'Raio de Fogo':'Dispara fogo contra um alvo. Faça um ataque mágico à distância.',
    'Raio de Gelo':'Dispara gelo contra um alvo, causando dano e atrapalhando seu deslocamento.',
    'Raio Místico':'Dispara energia mágica contra um alvo; o número de raios aumenta com seu nível.',
    'Rajada de Veneno':'Expele veneno contra uma criatura próxima; ela tenta resistir ao efeito.',
    'Reparar':'Conserta uma pequena quebra ou rasgo em um objeto.',
    'Resistência':'Protege alguém com magia para ajudar em uma salvaguarda próxima.',
    'Talho Mental':'Ataca a mente de um alvo e atrapalha sua próxima resistência a uma magia.',
    'Taumaturgia':'Produz sinais sobrenaturais breves, como uma voz forte, chamas tremulantes ou uma porta batendo.',
    'Toque Necrótico':'Um ataque mágico à distância causa dano necrótico e pode impedir o alvo de recuperar PV por pouco tempo.',
    'Toque Chocante':'Uma descarga elétrica atinge uma criatura tocada e dificulta que ela reaja.',
    'Alarme':'Protege uma área pequena e avisa você se alguém entrar nela.',
    'Amizade Animal':'Acalma e encanta uma fera para que ela não veja você como ameaça por um tempo.',
    'Armadura Arcana':'Protege uma criatura sem armadura por várias horas; não exige concentração.',
    'Armadura de Agathys':'Concede PV temporários e fere com frio quem atingir você corpo a corpo enquanto eles durarem.',
    'Bênção':'Até três aliados somam um dado às jogadas de ataque e salvaguardas.',
    'Bom Fruto':'Cria frutos mágicos que curam um pouco e alimentam quem os come.',
    'Braços de Hadar':'Energia sombria atinge criaturas ao seu redor e pode impedir reações.',
    'Comando':'Dá uma ordem curta a uma criatura; se ela falhar na resistência, tenta obedecer no próximo turno.',
    'Compreender Idiomas':'Permite entender idiomas falados e escritos, mas não falar nem decifrar códigos.',
    'Convocar Familiar':'Invoca um espírito em forma de animal pequeno para explorar e ajudar; ele não é um combatente comum.',
    'Criar ou Destruir Água':'Cria água potável ou faz a água desaparecer de uma área pequena.',
    'Curar Ferimentos':'Uma criatura tocada recupera PV. É uma boa opção quando você pode chegar perto do aliado.',
    'Danação':'Amaldiçoa um alvo para causar dano extra quando você o atinge e atrapalhar um atributo escolhido.',
    'Destruição Cauterizante':'Seu próximo ataque corpo a corpo acrescenta dano de fogo e pode incendiar o alvo.',
    'Destruição Colérica':'Seu próximo ataque corpo a corpo acrescenta dano e pode deixar o alvo amedrontado.',
    'Destruição Divina':'Seu próximo ataque corpo a corpo causa dano radiante adicional.',
    'Destruição Estrondosa':'Seu próximo ataque corpo a corpo causa dano trovejante e pode empurrar o alvo.',
    'Detectar Magia':'Percebe a presença de magia nas proximidades e ajuda a localizar sua fonte.',
    'Detectar o Bem e o Mal':'Percebe certos tipos de seres sobrenaturais e locais consagrados ou profanados próximos.',
    'Detectar Veneno e Doença':'Ajuda a perceber venenos, criaturas venenosas e doenças nas proximidades.',
    'Disco Flutuante de Tenser':'Cria um disco invisível que acompanha você e carrega objetos pesados.',
    'Disfarçar-se':'Altera sua aparência. A magia muda como você parece, não suas roupas ou objetos carregados.',
    'Duelo Compelido':'Tenta manter um inimigo focado em você, dificultando que ele ataque outros alvos.',
    'Emaranhar':'Plantas prendem uma área; criaturas podem ficar agarradas e o terreno se torna difícil.',
    'Enfeitiçar Pessoa':'Torna um humanoide mais amistoso com você por um tempo; não o transforma em aliado obediente.',
    'Escrita Ilusória':'Esconde uma mensagem em escrita que só leitores escolhidos conseguem entender.',
    'Escudo Arcano':'Reação defensiva que aumenta sua CA contra um ataque e pode bloquear Mísseis Mágicos.',
    'Escudo da Fé':'Aumenta a CA de uma criatura por um tempo; exige concentração.',
    'Falar com Animais':'Permite conversar com animais; eles compartilham o que perceberam, conforme sua inteligência.',
    'Faca de Gelo':'Cria e arremessa um fragmento de gelo que explode ao atingir o ponto escolhido.',
    'Favor Divino':'Envolve sua arma em energia sagrada para causar dano radiante adicional.',
    'Fogo das Fadas':'Contorna inimigos com luz, ajudando ataques contra eles e revelando criaturas invisíveis na área.',
    'Gargalhada Nefasta de Tasha':'Faz uma criatura rir e cair no chão se falhar na resistência; exige concentração.',
    'Golpe Constritor':'Seu próximo ataque à distância pode prender o alvo com vinhas e limitar seu movimento.',
    'Graxa':'Deixa o chão escorregadio: criaturas podem cair e a área vira terreno difícil.',
    'Heroísmo':'Protege alguém contra medo e concede PV temporários enquanto a magia durar.',
    'Identificar':'Revela propriedades mágicas de um objeto ou efeito que você examina.',
    'Imagem Silenciosa':'Cria uma imagem visual sem som para distrair ou ocultar algo.',
    'Infligir Ferimentos':'Um ataque mágico de toque causa dano necrótico.',
    'Leque Cromático':'Uma explosão de luz pode cegar temporariamente criaturas próximas.',
    'Mãos Flamejantes':'Uma onda de fogo atinge criaturas à sua frente; elas tentam se esquivar.',
    'Marca do Predador':'Marca um alvo para causar dano extra quando você o atinge e facilitar sua perseguição.',
    'Mísseis Mágicos':'Dispara projéteis de força que acertam automaticamente os alvos escolhidos.',
    'Névoa Obscurecente':'Cria uma nuvem de névoa que bloqueia a visão.',
    'Onda Trovejante':'Uma explosão ao seu redor causa dano e empurra criaturas para longe.',
    'Orbe Cromático':'Dispara uma esfera elemental; escolha entre diferentes tipos de dano ao conjurar.',
    'Palavra Curativa':'Cura um aliado à distância como ação bônus; útil quando ele caiu ou está longe.',
    'Passos Largos':'Aumenta o deslocamento de uma criatura por bastante tempo.',
    'Perdição':'Até três inimigos têm dificuldade extra em ataques e salvaguardas; exige concentração.',
    'Proteção Contra o Bem e o Mal':'Protege uma criatura contra certos seres sobrenaturais, dificultando que eles a atinjam ou influenciem.',
    'Purificar Alimentos e Bebidas':'Remove contaminações e venenos de comida e bebida em uma área pequena.',
    'Queda Suave':'Protege criaturas em queda para que desçam devagar e não sofram dano da queda.',
    'Raio de Bruxa':'Liga você a um alvo com energia elétrica; exige concentração para continuar causando dano.',
    'Raio Guia':'Ataque mágico à distância causa dano radiante e deixa o próximo ataque contra o alvo mais fácil.',
    'Raio Nauseante':'Um raio venenoso fere e pode deixar o alvo debilitado.',
    'Repreensão Diabólica':'Reação contra alguém que feriu você; devolve dano de fogo.',
    'Retirada Acelerada':'Permite usar sua ação bônus para correr enquanto a magia durar.',
    'Salto':'Aumenta a distância que uma criatura consegue saltar.',
    'Santuário':'Protege uma criatura; inimigos precisam resistir antes de atacá-la diretamente.',
    'Saraivada de Espinhos':'Seu próximo ataque à distância espalha espinhos que podem ferir criaturas ao redor do alvo.',
    'Servo Invisível':'Cria um ajudante invisível simples para tarefas e serviços sem combate.',
    'Sono':'Envia criaturas de uma área para um sono mágico, começando pelas mais frágeis.',
    'Sussurros Dissonantes':'Uma voz perturbadora fere e pode fazer o alvo fugir usando sua reação.'
  };
  function spellComponentHelp(value){
    if(!value)return 'Consulte os componentes da magia antes de começar.';
    const parts=[];if(/\bV\b/.test(value))parts.push('V: precisa falar palavras mágicas');if(/\bS\b/.test(value))parts.push('S: precisa fazer gestos com uma mão');if(/\bM\b/.test(value))parts.push('M: precisa do material indicado entre parênteses');
    return parts.join(' · ')||'Componentes: '+value;
  }
  function spellTimeHelp(value){
    if(!value)return 'Veja se a magia pede uma ação, ação bônus ou reação.';
    const v=String(value);if(v==='Ação')return 'Consome sua Ação durante o turno.';if(v==='Ação Bônus')return 'Consome sua Ação Bônus; ela não é automática, veja se sua classe tem uma forma de usá-la.';if(v==='Reação')return 'Pode ser conjurada fora do seu turno quando o gatilho descrito acontecer.';if(/Ritual/i.test(v))return 'Pode ser conjurada como ritual, se sua classe permitir; isso leva mais tempo e não gasta espaço.';return 'Você precisa deste tempo para conjurar.';
  }
  const SUB_LEVELS={Bar:[3,6,10,14],Bard:[3,6,14],Cleric:[3,6,17],Druid:[3,6,10,14],Fighter:[3,7,10,15,18],Monk:[3,6,11,17],Paladin:[3,7,15,20],Ranger:[3,7,11,15],Rogue:[3,9,13,17],Sorcerer:[3,6,14,18],Warlock:[3,6,10,14],Wizard:[3,6,10,14]};
  const CLASS_CHOICE_HELP={
    'Melhoria de atributo':'Escolha aumentar um atributo em 2, ou dois atributos diferentes em 1. Você também pode escolher um talento elegível em vez disso. Nenhum atributo pode passar de 20.',
    'Subclasse':'Escolha uma especialização da sua classe. Ela concede características próprias agora e em outros níveis indicados abaixo.',
    'característica de subclasse':'Sua especialização concede uma nova característica. Veja a trilha da subclasse escolhida e registre o que ela permite fazer.',
    'Bênção Épica':'Escolha um talento épico elegível. É uma escolha de nível alto que concede um benefício marcante.',
    'Especialização':'Escolha perícias em que já é treinado para dobrar seu bônus de proficiência nelas.',
    'Estilo de Luta':'Escolha uma opção de combate que combina com sua forma de lutar; algumas opções exigem certos equipamentos.',
    'Maestria em Armas':'Escolha entre as propriedades de maestria das armas que você sabe usar; suas escolhas podem ser atualizadas ao terminar um descanso longo.',
    'Metamagia':'Escolha formas de alterar suas magias. Cada opção explica como gastar pontos de feitiçaria para modificar a conjuração.',
    'Invocações Místicas':'Escolha dádivas mágicas. Confira os requisitos de nível e de outras escolhas antes de selecionar.',
    'novo truque':'Aprenda um truque adicional da lista da sua classe. Truques não gastam espaços de magia.',
    'truque':'Aprenda ou substitua truques conforme a regra da sua classe.',
    'magia':'Atualize as magias conhecidas ou preparadas conforme a regra da sua classe e consulte a lista abaixo.',
    'Maestria em Magia':'Escolha magias de baixo círculo para conjurar sem gastar espaços, conforme a característica da classe.',
    'Arcano Místico':'Escolha uma magia do círculo indicado para usar com o recurso Arcano Místico; ela não usa seus espaços de Pacto.'
  };
  function explainGain(name){
    const n=name.toLocaleLowerCase('pt-BR');
    for(const [key,desc] of Object.entries(CLASS_CHOICE_HELP))if(n.includes(key.toLocaleLowerCase('pt-BR')))return desc;
    if(n.includes('subclasse'))return CLASS_CHOICE_HELP['Subclasse'];
    if(n.includes('característica de subclasse'))return CLASS_CHOICE_HELP['característica de subclasse'];
    if(n.includes('magia')||n.includes('conjuração')||n.includes('espaço'))return 'Confira quantas magias você conhece ou prepara e quantos espaços tem neste nível. A seção Magias acompanha seus espaços e oferece a lista da sua classe.';
    if(n.includes('maestria em arma'))return CLASS_CHOICE_HELP['Maestria em Armas'];
    if(n.includes('atributo')||n.includes('talento'))return CLASS_CHOICE_HELP['Melhoria de atributo'];
    if(n.includes('especialização'))return CLASS_CHOICE_HELP['Especialização'];
    return 'Característica automática da classe: ela já foi liberada ao alcançar este nível. Abra a descrição na trilha abaixo para entender quando e como usá-la.';
  }
  function subclassMilestones(){return SUB_LEVELS[S.cls]||[]}
  function renderSubclassChoices(){
    const sel=document.getElementById('subclassChoice');if(!sel)return;
    const choices=SUBCLASSES[S.cls]||[],current=S.subclass||'';
    const oldCustom=document.getElementById('customSubclass');
    sel.innerHTML='<option value="">Escolha uma subclasse</option>'+choices.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('')+'<option value="__custom">Outra (personalizada)</option>';
    let custom=oldCustom;
    if(!custom){custom=document.createElement('input');custom.id='customSubclass';custom.placeholder='Nome da subclasse';sel.after(custom)}
    const builtin=choices.includes(current);sel.value=builtin?current:current?'__custom':'';
    custom.hidden=sel.value!=='__custom';custom.value=builtin?'':current;
    sel.disabled=Number(S.level)<3;custom.disabled=Number(S.level)<3;
    const syncDescription=()=>{const selected=sel.value==='__custom'?custom.value:sel.value;S.subclass=selected;const card=sel.closest('.sumcard'),note=card?.querySelector('.subclass-guide');if(note){const description=SUBCLASS_HELP[selected];note.innerHTML=(Number(S.level)<3?'<b>A subclasse é escolhida no nível 3.</b> Você pode conhecer as opções antes de escolher. ':'')+(description?'<b>'+esc(selected)+':</b> '+esc(description):selected?'Subclasse personalizada. Registre com o mestre as características que ela concede.':'Escolha uma opção para ver uma explicação simples.')}};
    sel.onchange=()=>{custom.hidden=sel.value!=='__custom';syncDescription();window.save?.();renderProgression()};
    custom.oninput=()=>{syncDescription();window.save?.();renderProgression()};
    const card=sel.closest('.sumcard');if(card){let note=card.querySelector('.subclass-guide');if(!note){note=document.createElement('p');note.className='campaign-note subclass-guide';sel.closest('.grid')?.after(note)}syncDescription()}
  }
  function getGains(level){try{return CLASS_GAINS[S.cls]?.[level]||[]}catch(_){return []}}
  function renderProgression(){
    const card=document.getElementById('progressCard');if(!card)return;
    const next=Math.min(20,Number(S.level)+1),gains=getGains(next),subLevels=subclassMilestones(),xpNeed=typeof XP_LEVELS!=='undefined'?XP_LEVELS[Number(S.level)]:null,remaining=xpNeed?Math.max(0,xpNeed-(Number(S.xp)||0)):null;
    let html='<div class="progression-head"><div><span class="eyebrow">SUA JORNADA</span><h3>Progressão do '+esc(CLASS_NAMES[S.cls]||S.cls)+'</h3><p>Nível atual <b>'+S.level+'</b> · próximo marco <b>'+(Number(S.level)>=20?'Nível máximo':'Nível '+next)+'</b></p></div>'+(remaining!==null&&Number(S.level)<20?'<div class="xp-reminder"><b>'+remaining.toLocaleString('pt-BR')+' XP</b><small>para alcançar o próximo nível</small></div>':'')+'</div>';
    if(Number(S.level)<20){
      html+='<div class="next-level"><h4>O que acontece no próximo nível</h4>'+(gains.length?'<ul class="gain-list">'+gains.map(x=>'<li><b>'+esc(x)+'</b><span>'+esc(explainGain(x))+'</span></li>').join('')+'</ul>':'<p>Este nível não apresenta uma característica nova na tabela da classe. PV e, em alguns níveis, proficiência ou recursos ainda podem mudar.</p>')+'<p class="campaign-note">Quando a campanha conceder XP suficiente, use <b>Subir de nível</b> para atualizar PV, recursos e registrar suas escolhas.</p></div>';
    }else html+='<p>Você chegou ao nível 20.</p>';
    html+='<details class="progression-details"><summary>Ver todos os níveis da minha classe</summary><div class="level-timeline">';
    for(let level=1;level<=20;level++){let list=getGains(level);html+='<details class="level-row" '+(level===next?'open':'')+'><summary><b>Nível '+level+'</b><span>'+(list.length?esc(list.join(' · ')):'Sem característica nova listada')+'</span></summary>'+(list.length?'<ul>'+list.map(x=>'<li><b>'+esc(x)+':</b> '+esc(explainGain(x))+'</li>').join('')+'</ul>':'<p>Consulte a progressão automática de PV e recursos na ficha.</p>')+(subLevels.includes(level)?'<p class="subclass-milestone"><b>Trilha de subclasse:</b> '+(level===3?'escolha sua subclasse.':'recebe outra característica da sua subclasse escolhida.')+'</p>':'')+'</details>'}
    html+='</div></details>';
    const chosen=S.subclass?'<p><b>Sua subclasse:</b> '+esc(S.subclass)+'. Características adicionais nos níveis '+subLevels.filter(x=>x>3).join(', ')+'.</p>':'<p>Você ainda não escolheu uma subclasse. A escolha abre no nível 3.</p>';
    html+='<details class="progression-details"><summary>Subclasses e escolhas</summary><div class="subclass-overview">'+chosen+'<p>Opções de '+esc(CLASS_NAMES[S.cls]||S.cls)+':</p><div class="subclass-options">'+(SUBCLASSES[S.cls]||[]).map((x,i)=>'<div class="subclass-option '+(S.subclass===x?'selected':'')+'"><b>'+esc(x)+'</b><p>'+esc(SUBCLASS_HELP[x]||'Especialização que concede características próprias nos níveis indicados.')+'</p><small>Características nos níveis '+subLevels.join(', ')+'</small></div>').join('')+'</div><p class="campaign-note">Escolha a que combina com o conceito do personagem; características são liberadas nos níveis indicados. Registre detalhes ou escolhas específicas em Personagem.</p></div></details>';
    card.innerHTML=html;
  }
  const spellClass=CLASS_NAMES;let activeSpellPane='available';
  function maxSpellCircle(){const level=Number(S.level)||1,cls=S.cls;if(['Bard','Cleric','Druid','Sorcerer','Wizard'].includes(cls))return Math.min(9,Math.ceil(level/2));if(cls==='Warlock')return Math.min(5,Math.ceil(level/2));if(['Paladin','Ranger'].includes(cls))return Math.min(5,Math.floor((level+3)/4));if(cls==='Rogue'&&/Trapaceiro Arcano/i.test(S.subclass))return level<3?0:level<7?1:level<13?2:level<19?3:4;if(cls==='Fighter'&&/Cavaleiro Arcano/i.test(S.subclass))return level<3?0:level<7?1:level<13?2:level<19?3:4;return 0}
  function eligibleSpellSources(){const list=[];const classCasters=['Bard','Cleric','Druid','Paladin','Ranger','Sorcerer','Warlock','Wizard'];if(S.cls==='Rogue'&&/Trapaceiro Arcano/i.test(S.subclass))list.push({name:'Mago',kind:'classe'});else if(S.cls==='Fighter'&&/Cavaleiro Arcano/i.test(S.subclass))list.push({name:'Mago',kind:'classe'});else if(classCasters.includes(S.cls))list.push({name:spellClass[S.cls],kind:'classe'});const featClass={Acólito:'Clérigo',Sábio:'Mago'}[S.background];if(featClass)list.push({name:featClass,kind:'Iniciado em Magia'});return list}
  function sourceSpellLimit(source){return source.kind==='Iniciado em Magia'?1:maxSpellCircle()}
  const PREPARED_TABLES={Bard:[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22],Sorcerer:[2,4,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22],Warlock:[2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15],Wizard:[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,25],Paladin:[2,3,4,5,6,6,7,7,9,9,10,10,11,11,12,12,14,14,15,15],Ranger:[2,3,4,5,6,6,7,7,9,9,10,10,11,11,12,12,14,14,15,15]};
  function preparedLimit(){const level=Math.max(1,Number(S.level)||1),ability=S.cls==='Paladin'?'CHA':S.cls==='Ranger'?'WIS':S.cls==='Cleric'||S.cls==='Druid'?'WIS':null;if(ability)return Math.max(1,level+Math.floor((Number(S.scores?.[ability]||10)-10)/2));return PREPARED_TABLES[S.cls]?.[level-1]||Infinity}
  function cantripLimit(source){if(source.kind==='Iniciado em Magia')return 2;const level=Math.max(1,Number(S.level)||1),cls=S.cls,progression={Bard:[[1,2],[4,3],[10,4]],Cleric:[[1,3],[4,4],[10,5]],Druid:[[1,2],[4,3],[10,4]],Sorcerer:[[1,4],[4,5],[10,6]],Warlock:[[1,2],[4,3],[10,4]],Wizard:[[1,3],[4,4],[10,5]],Rogue:/Trapaceiro Arcano/i.test(S.subclass)?[[3,3],[10,4]]:[],Fighter:/Cavaleiro Arcano/i.test(S.subclass)?[[3,2],[10,3]]:[]}[cls]||[];return progression.reduce((count,[at,total])=>level>=at?total:count,0)}
  function ownedFromSource(mine,source,level){return mine.filter(x=>x.custom!==true&&x.source!=='Iniciado em Magia'&&Number(x.level)===level&&String(x.classes||'').split(', ').includes(source.name))}
  function canAddFromSource(sp,mine,source){if(source.kind==='Iniciado em Magia'){const cap=sp.l===0?2:1;return sp.l<=1&&mine.filter(x=>x.source==='Iniciado em Magia'&&Number(x.level)===sp.l).length<cap}if(sp.l===0)return ownedFromSource(mine,source,0).length<cantripLimit(source);const all=mine.filter(x=>x.custom!==true&&x.source!=='Iniciado em Magia'&&Number(x.level)>0&&String(x.classes||'').split(', ').includes(source.name));if(S.cls==='Wizard')return all.length<6+2*(Number(S.level)-1);if(['Cleric','Druid','Paladin','Ranger'].includes(S.cls))return all.filter(x=>x.prepared!==false).length<preparedLimit();return all.length<preparedLimit()}
  function spellSourceForAdd(sp,mine){return eligibleSpellSources().find(source=>sp.c.includes(source.name)&&(sp.l===0||sp.l<=sourceSpellLimit(source))&&canAddFromSource(sp,mine,source))}
  function canAddCatalogSpell(sp,mine){return !mine.some(x=>x.name===sp.n)&&!!spellSourceForAdd(sp,mine)}
  function shouldPrepareCatalogSpell(sp,mine,source){if(!source||source.kind==='Iniciado em Magia'||sp.l===0)return true;if(S.cls==='Wizard')return mine.filter(x=>x.custom!==true&&x.source!=='Iniciado em Magia'&&Number(x.level)>0&&x.prepared!==false&&String(x.classes||'').split(', ').includes(source.name)).length<preparedLimit();return true}
  function spellSelectionHint(mine){const source=eligibleSpellSources().find(x=>x.kind==='classe');if(!source){return eligibleSpellSources().some(x=>x.kind==='Iniciado em Magia')?'Seu talento de origem libera até dois truques e uma magia de 1º círculo.':'Sua classe ainda não aprende magias; truques e magias de origem aparecem quando uma característica os conceder.'}const classSpells=mine.filter(x=>x.custom!==true&&x.source!=='Iniciado em Magia'&&Number(x.level)>0&&String(x.classes||'').split(', ').includes(source.name)),cantrips=ownedFromSource(mine,source,0).length,cantripMax=cantripLimit(source),spellMax=preparedLimit();if(!Number.isFinite(spellMax))return 'Sua subclasse abre uma lista de Mago. Escolha magias compatíveis com o círculo liberado; confirme com o mestre as escolhas da subclasse.';if(S.cls==='Wizard'){const prepared=classSpells.filter(x=>x.prepared!==false).length,bookMax=6+2*(Number(S.level)-1);return 'No nível atual: '+prepared+'/'+spellMax+' preparadas · '+classSpells.length+'/'+bookMax+' no grimório · '+cantrips+'/'+cantripMax+' truques.'}const count=['Cleric','Druid'].includes(S.cls)?classSpells.filter(x=>x.prepared!==false).length:classSpells.length;return 'No nível atual: '+count+'/'+spellMax+' magias de círculo escolhidas · '+cantrips+'/'+cantripMax+' truques.'}
  const togglePreparedBeforeSpellLimit=window.togglePrepared;if(togglePreparedBeforeSpellLimit&&!window.__spellPreparedLimitGuard){window.__spellPreparedLimitGuard=true;window.togglePrepared=function(i,value){const sp=S.spells?.[i],source=eligibleSpellSources().find(x=>x.kind==='classe'&&String(sp?.classes||'').split(', ').includes(x.name));if(value&&sp&&Number(sp.level)>0&&sp.prepared===false&&sp.source!=='Iniciado em Magia'&&['Cleric','Druid','Paladin','Ranger','Wizard'].includes(S.cls)&&source){const used=S.spells.filter((x,j)=>j!==i&&x.custom!==true&&x.source!=='Iniciado em Magia'&&Number(x.level)>0&&x.prepared!==false&&String(x.classes||'').split(', ').includes(source.name)).length;if(used>=preparedLimit()){window.toast?.('Você já está usando todas as magias que pode preparar neste nível. Desmarque outra primeiro.');window.renderCampaign?.();return}}togglePreparedBeforeSpellLimit(i,value)}}
  const SCHOOL_IDEA={Abjuração:'costuma proteger, bloquear ou desfazer efeitos mágicos',Adivinhação:'costuma revelar informações ou ajudar a prever e localizar',Conjuração:'costuma criar, chamar ou transportar algo',Encantamento:'costuma influenciar emoções ou comportamento',Evocação:'costuma canalizar energia para causar dano ou curar',Ilusão:'costuma alterar o que alguém percebe',Necromancia:'costuma manipular energia vital, morte ou mortos-vivos',Transmutação:'costuma alterar propriedades de criaturas ou objetos'};
  const ORIGIN_FEAT_HELP={'Iniciado em Magia (Clérigo)':'Escolha 2 truques e 1 magia de 1º círculo da lista de Clérigo. Os truques não gastam espaços; você sempre tem a magia preparada e pode conjurá-la 1 vez sem espaço por descanso longo. Escolha também Inteligência, Sabedoria ou Carisma como atributo de conjuração.','Iniciado em Magia (Mago)':'Escolha 2 truques e 1 magia de 1º círculo da lista de Mago. Os truques não gastam espaços; você sempre tem a magia preparada e pode conjurá-la 1 vez sem espaço por descanso longo. Escolha também Inteligência, Sabedoria ou Carisma como atributo de conjuração.','Alerta':'Some seu bônus de proficiência à iniciativa. Logo depois das rolagens, você também pode trocar seu resultado com o de um aliado que aceite (nenhum dos dois pode estar incapacitado).','Atacante Selvagem':'Uma vez por turno, ao acertar com uma arma corpo a corpo segurada com as duas mãos, trate qualquer 1 ou 2 nos dados de dano da arma como 3.'};
  function explainOriginFeat(){const feat=document.getElementById('originFeat');if(!feat)return;feat.readOnly=true;feat.title='Concedido automaticamente pelo antecedente';let help=feat.parentElement?.querySelector('.origin-feat-help');if(!help){help=document.createElement('small');help.className='origin-feat-help';feat.insertAdjacentElement('afterend',help)}const key=feat.value;help.textContent=(ORIGIN_FEAT_HELP[key]||'Benefício concedido automaticamente pelo antecedente.')+' Não é uma escolha adicional; o antecedente define este benefício.'}
  function renderSpellReference(){
    const root=document.getElementById('spellListArea');if(!root)return;
    if(!document.getElementById('spell-owned-style')){const style=document.createElement('style');style.id='spell-owned-style';style.textContent='.spell-cantrip-limit{margin:9px 0 0;padding:9px 11px;border-left:3px solid var(--gold);background:#fffefa;border-radius:4px}.spell-owned-card{margin:7px 0}.spell-owned-actions{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px}.spell-owned-actions label{display:flex;align-items:center;gap:6px}.spell-owned-actions input{width:auto}';document.head.appendChild(style)}
    const spells=BOOK.spells||[],slots=Object.entries(S.spellSlots||{}).filter(([,v])=>v.max>0),mine=S.spells||[],sources=eligibleSpellSources(),maxCircle=Math.max(0,...sources.map(sourceSpellLimit));
    root.innerHTML='<div class="spell-intro"><h4>Magias e truques</h4><p>Consulte as opções permitidas para sua classe e nível. Abra uma opção para entender o que ela faz e use <b>Adicionar à minha ficha</b> para guardar as que seu personagem aprendeu ou preparou.</p><div class="spell-first-steps"><b>Truques</b> podem ser usados sem gastar espaços. Magias de círculo normalmente gastam um espaço do mesmo círculo ou maior. “Concentração” significa que você mantém o efeito ativo e só pode manter uma magia assim por vez.</div></div>'+ 
      (slots.length?'<div class="slot-grid">'+slots.map(([n,v])=>'<div class="slot"><span>Espaços de '+n+'º círculo</span><button class="btn" onclick="spendSlot(\''+n+'\',-1)">−</button><b>'+v.current+' / '+v.max+'</b><button class="btn" onclick="spendSlot(\''+n+'\',1)">+</button></div>').join('')+'</div>':'<p class="campaign-note">Sua classe ainda não tem espaços de magia neste nível. Truques, se possuir, não gastam espaços.</p>')+
      '<div class="spell-tabs" role="tablist"><button type="button" class="spell-tab active" data-pane="available" onclick="showSpellPane(\'available\')">Lista disponível</button><button type="button" class="spell-tab" data-pane="owned" onclick="showSpellPane(\'owned\')">Minhas magias ('+mine.length+')</button></div><section id="spellPaneAvailable" class="spell-pane"><div class="spell-book-tools"><h4>Escolha uma magia</h4><p class="campaign-note">A lista libera novos círculos conforme sua classe avança. Por enquanto, mostro apenas os truques e círculos que seu personagem pode acessar.</p><div class="spell-filters"><label>Buscar<input id="spellQuickSearch" placeholder="Nome ou escola" oninput="filterQuickSpells()"></label><label>Tipo<select id="spellQuickKind" onchange="filterQuickSpells()"><option value="all">Todos</option><option value="cantrip">Só truques</option><option value="leveled" '+(maxCircle?'':'disabled')+'>Magias de círculo</option></select></label>'+(maxCircle?'<label>Círculo<select id="spellQuickLevel" onchange="filterQuickSpells()"><option value="all">Todos os círculos liberados</option>'+Array.from({length:maxCircle},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'º círculo</option>').join('')+'</select></label>':'')+'</div><div id="spellQuickResults" class="spell-quick-results"></div></div></section><section id="spellPaneOwned" class="spell-pane" hidden><h4>Magias que você anotou</h4><p class="campaign-note">Truques não gastam espaços. As magias desta aba já fazem parte da ficha.</p><div class="spell-known-list">'+(mine.length?mine.map((sp,i)=>'<div class="entry"><span><b>'+esc(sp.name)+'</b> · '+(sp.level===0?'Truque':sp.level+'º círculo')+(sp.school?' · '+esc(sp.school):'')+' <label><input type="checkbox" '+(sp.prepared?'checked':'')+' onchange="togglePrepared('+i+',this.checked)"> preparada/conhecida</label></span><button onclick="removeSpell('+i+')">Remover</button></div>').join(''):'<p class="campaign-note">Sua lista está vazia. Abra “Lista disponível” para adicionar uma magia.</p>')+'</div><details class="spell-known"><summary>Adicionar magia da campanha ou de outra fonte</summary><p class="campaign-note">Use apenas para uma magia concedida por talento, subclasse ou pelo mestre.</p><div class="spell-filters"><label>Nome<input id="spellCustomName" placeholder="Nome da magia"></label><label>Círculo<select id="spellCustomLevel"><option value="0">Truque</option>'+Array.from({length:9},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'º círculo</option>').join('')+'</select></label><button class="btn" onclick="addCustomSpell()">Adicionar</button></div></details></section>';
    const classSource=sources.find(source=>source.kind==='classe'),featSource=sources.find(source=>source.kind==='Iniciado em Magia'),classCantripCount=classSource?ownedFromSource(mine,classSource,0).length:0,featCantripCount=featSource?mine.filter(sp=>sp.source==='Iniciado em Magia'&&Number(sp.level)===0).length:0,cantripInfo=[];
    if(classSource){const limit=cantripLimit(classSource);cantripInfo.push(limit?'<b>Truques da classe:</b> '+classCantripCount+'/'+limit+' conhecidos.':'<b>Truques da classe:</b> nenhum neste nível.')}else cantripInfo.push('<b>Truques da classe:</b> sua classe não concede truques por padrão.');
    if(featSource)cantripInfo.push('<b>Iniciado em Magia:</b> '+featCantripCount+'/2 truques conhecidos.');
    const cantripNote=document.createElement('p');cantripNote.className='campaign-note spell-cantrip-limit';cantripNote.innerHTML=cantripInfo.join(' · ')+' Truques podem ser conjurados à vontade e não gastam espaços; esse limite é quantos você conhece.';root.querySelector('.spell-intro')?.appendChild(cantripNote);
    const ownedList=root.querySelector('.spell-known-list');if(ownedList)ownedList.innerHTML=mine.length?mine.map((sp,i)=>{const record=spells.find(item=>item.n===sp.name),school=sp.school||record?.s||'',effect=SPELL_SUMMARIES[sp.name]||(record?'Pela escola de '+school+', esta magia '+(SCHOOL_IDEA[school]||'tem um efeito mágico específico')+'. O alcance e a duração ajudam a entender em que situações pode ser útil.':'A descrição completa não está no catálogo. Consulte a fonte que concedeu esta magia ou as anotações do mestre.');return '<details class="spell-quick-card spell-owned-card"><summary><b>'+esc(sp.name)+'</b><span>'+(Number(sp.level)===0?'Truque':esc(sp.level)+'º círculo')+(school?' · '+esc(school):'')+'</span></summary><div class="spell-quick-body"><div class="spell-effect '+(SPELL_SUMMARIES[sp.name]?'':'spell-effect-missing')+'"><b>'+(SPELL_SUMMARIES[sp.name]?'Em palavras simples':'Ideia geral do efeito')+'</b><p>'+esc(effect)+'</p></div>'+(record?'<div class="spell-facts"><span><small>O que você gasta</small>'+esc(spellTimeHelp(record['Tempo de Conjuração']))+'</span><span><small>Até onde alcança</small>'+esc(record['Alcance']||'Alcance não informado')+'</span><span><small>Quanto dura</small>'+esc(record['Duração']||'Duração não informada')+( /Concentração/i.test(record['Duração']||'')?'<em>Concentração: acompanhe este efeito; você não mantém outra magia concentrada ao mesmo tempo.</em>':'')+'</span><span><small>O que precisa</small>'+esc(spellComponentHelp(record['Componentes']))+'</span></div><p class="spell-source">'+esc(record.s)+' · Referência: Livro do Jogador 2024, pág. '+esc(record.p||'—')+'</p>':'')+'<div class="spell-owned-actions"><label><input type="checkbox" '+(sp.prepared?'checked':'')+' onchange="togglePrepared('+i+',this.checked)"> preparada/conhecida</label><button class="btn" onclick="removeSpell('+i+')">Remover da ficha</button></div></div></details>'}).join(''):'<p class="campaign-note">Sua lista está vazia. Abra “Lista disponível” para adicionar uma magia.</p>';
    const selectionHint=document.createElement('p');selectionHint.className='campaign-note';selectionHint.textContent=spellSelectionHint(mine);root.querySelector('.spell-book-tools h4')?.insertAdjacentElement('afterend',selectionHint);
    window.filterQuickSpells=()=>{
      const q=(document.getElementById('spellQuickSearch')?.value||'').toLocaleLowerCase('pt-BR'),kind=document.getElementById('spellQuickKind')?.value||'all',lvl=document.getElementById('spellQuickLevel')?.value||'all',sources=eligibleSpellSources(),host=document.getElementById('spellQuickResults');if(!host)return;
      const matches=spells.map((s,i)=>({...s,i})).filter(s=>sources.some(source=>s.c.includes(source.name)&&(s.l===0||s.l<=sourceSpellLimit(source)))&&(kind==='all'||(kind==='cantrip'?s.l===0:s.l>0))&&(lvl==='all'||s.l===Number(lvl))&&(!q||(s.n+' '+s.s+' '+s.c.join(' ')).toLocaleLowerCase('pt-BR').includes(q)));
      const classSource=sources.find(source=>source.kind==='classe'),featSource=sources.find(source=>source.kind==='Iniciado em Magia'),myCantrips=classSource?ownedFromSource(mine,classSource,0).length:0,myCircleSpells=classSource?mine.filter(x=>x.custom!==true&&x.source!=='Iniciado em Magia'&&Number(x.level)>0&&String(x.classes||'').split(', ').includes(classSource.name)).length:0,classCantrips=classSource?cantripLimit(classSource):0,featCantrips=featSource?mine.filter(x=>x.source==='Iniciado em Magia'&&Number(x.level)===0).length:0,limitText=classSource?(classCantrips?'Sua classe permite até '+classCantrips+' truques. ':'Sua classe não aprende truques. ')+(Number.isFinite(preparedLimit())?'Limite de magias de círculo: '+preparedLimit()+'. ':'')+'Estas são opções; não precisa adicionar todas.':featSource?'Sua classe não aprende magias por conta própria. O talento Iniciado em Magia concede 2 truques e 1 magia de 1º círculo.':'Sua classe não aprende magias por conta própria; uma característica ou talento pode concedê-las.';
      host.innerHTML=matches.length?'<p class="campaign-note"><b>'+matches.length+' opções para escolher.</b> '+limitText+(classSource?' Na ficha: '+myCantrips+'/'+classCantrips+' truques e '+myCircleSpells+'/'+(Number.isFinite(preparedLimit())?preparedLimit():'—')+' magias de círculo.':'')+(featSource?' Truques do talento: '+featCantrips+'/2.':'')+'</p>'+matches.map(s=>{const owned=mine.some(x=>x.name===s.n),canAdd=canAddCatalogSpell(s,mine),effect=SPELL_SUMMARIES[s.n]||('Pela escola de '+s.s+', esta magia '+(SCHOOL_IDEA[s.s]||'tem um efeito mágico específico')+'. Em geral, esse tipo de magia '+(SCHOOL_IDEA[s.s]||'produz um efeito próprio')+'. O alcance e a duração abaixo ajudam a imaginar quando ela é útil; abra a descrição da magia na ficha para consultar o resumo em linguagem simples disponível.');return '<details class="spell-quick-card"><summary><b>'+esc(s.n)+'</b><span>'+(s.l===0?'Truque':s.l+'º círculo')+' · '+esc(s.s)+'</span></summary><div class="spell-quick-body"><div class="spell-effect '+(SPELL_SUMMARIES[s.n]?'':'spell-effect-missing')+'"><b>'+(SPELL_SUMMARIES[s.n]?'Em palavras simples':'Ideia geral do efeito')+'</b><p>'+esc(effect)+'</p></div><div class="spell-facts"><span><small>O que você gasta</small>'+esc(spellTimeHelp(s['Tempo de Conjuração']))+'</span><span><small>Até onde alcança</small>'+esc(s['Alcance']||'Alcance não informado')+'</span><span><small>Quanto dura</small>'+esc(s['Duração']||'Duração não informada')+( /Concentração/i.test(s['Duração']||'')?'<em>Concentração: acompanhe este efeito; você não mantém outra magia concentrada ao mesmo tempo.</em>':'')+'</span><span><small>O que precisa</small>'+esc(spellComponentHelp(s['Componentes']))+'</span></div><p class="spell-source">'+esc(s.s)+' · '+esc(s.c.join(', '))+' · Referência: Livro do Jogador 2024, pág. '+esc(s.p||'—')+'</p><button class="btn" '+(!canAdd?'disabled':'')+' onclick="addQuickSpell('+s.i+')">'+(owned?'Já está na ficha':canAdd?'Adicionar à minha ficha':'Limite de escolhas atingido')+'</button></div></details>'}).join(''):'<p class="campaign-note">Nenhuma magia permitida encontrada para esta busca, classe e nível. Truques continuam disponíveis mesmo sem espaços de magia.</p>';
    };
    window.showSpellPane=name=>{activeSpellPane=name;document.querySelectorAll('.spell-tab').forEach(b=>b.classList.toggle('active',b.dataset.pane===name));document.querySelectorAll('.spell-pane').forEach(p=>p.hidden=p.id!==(name==='owned'?'spellPaneOwned':'spellPaneAvailable'))};
    window.addQuickSpell=i=>{const sp=spells[i];if(!sp)return;const source=spellSourceForAdd(sp,mine);if(!source)return window.toast?.('Você atingiu o limite de escolhas deste nível ou essa magia ainda não está liberada.');mine.push({name:sp.n,level:sp.l,school:sp.s,classes:sp.c.join(', '),page:sp.p,prepared:shouldPrepareCatalogSpell(sp,mine,source),...(source.kind==='Iniciado em Magia'?{source:'Iniciado em Magia'}:{})});activeSpellPane='owned';window.save?.();window.renderCampaign?.();window.toast?.('Magia adicionada à ficha.')};
    window.filterQuickSpells();window.showSpellPane(activeSpellPane);
  }
  function maxHP(){try{return Math.max(1,Number(derived().hp)||1)}catch(_){return 1}}
  function enforceCurrentHP(){
    const max=maxHP(),before=Number(S.currentHP)||0;S.currentHP=Math.max(0,Math.min(max,before));if(S.currentHP!==before)window.save?.();
    const input=document.getElementById('currentHP');if(!input)return;
    input.max=String(max);input.value=String(S.currentHP);input.title='PV atuais não podem passar do máximo de '+max+'.';
    if(input.dataset.maxGuard)return;input.dataset.maxGuard='1';
    input.addEventListener('input',()=>{const cap=maxHP();input.max=String(cap);if(input.value!==''&&Number(input.value)>cap){input.value=String(cap);S.currentHP=cap;window.save?.()}});
    input.addEventListener('change',()=>{const cap=maxHP(),v=Math.max(0,Math.min(cap,Number(input.value)||0));input.value=String(v);S.currentHP=v;window.save?.()});
  }
  const priorSetCampaignValue=window.setCampaignValue;
  if(priorSetCampaignValue)window.setCampaignValue=function(key,value){if(key!=='currentHP')return priorSetCampaignValue(key,value);const max=maxHP(),n=Math.max(0,Math.min(max,Number(value)||0));S.currentHP=n;const input=document.getElementById('currentHP');if(input){input.max=String(max);input.value=String(n)}window.save?.()};
  function enhance(){renderSubclassChoices();renderProgression();renderSpellReference();explainOriginFeat()}
  function ensureSizeChoice(){
    const height=document.getElementById('height');if(!height)return null;let field=document.getElementById('heightSizeField');if(field)return document.getElementById('heightSize');
    field=document.createElement('div');field.id='heightSizeField';field.className='field';field.innerHTML='<label for="heightSize">Porte</label><select id="heightSize"><option value="medium">Médio · faixa adulta maior</option><option value="small">Pequeno · faixa adulta menor</option></select><small class="hint">Humanos e tieflings podem escolher porte Pequeno ou Médio nas regras 2024.</small>';
    height.closest('.field')?.insertAdjacentElement('afterend',field);const select=field.querySelector('#heightSize');S.heightSize=S.heightSize||'medium';select.value=S.heightSize;select.addEventListener('change',()=>{S.heightSize=select.value;syncHeightLimit(true);window.save?.()});return select;
  }
  function syncHeightLimit(clamp=true){
    const race=document.getElementById('race'),height=document.getElementById('height');if(!race||!height)return true;
    const sizeSelect=ensureSizeChoice(),sizeField=document.getElementById('heightSizeField'),hasChoice=['Humano','Tiefling'].includes(race.value);if(sizeField)sizeField.hidden=!hasChoice;
    const range=hasChoice&&sizeSelect?.value==='small'?SMALL_HEIGHT[race.value]:SPECIES_HEIGHT[race.value]||[1.22,2.13];const [min,max]=range;height.min=String(min);height.max=String(max);height.step='0.01';height.placeholder=min.toFixed(2)+' a '+max.toFixed(2)+' m';
    const hint=document.getElementById('raceHint');if(hint)hint.textContent='Faixa de altura de referência para '+race.value+(hasChoice?' ('+(sizeSelect?.value==='small'?'Pequeno':'Médio')+')':'')+': '+min.toFixed(2).replace('.',',')+' a '+max.toFixed(2).replace('.',',')+' m.';
    height.title='Altura sugerida: de '+min.toFixed(2)+' m a '+max.toFixed(2)+' m para '+race.value+'.';
    if(!height.value)return true;const value=Number(height.value);if(!Number.isFinite(value))return false;
    if(value<min||value>max){if(clamp){const adjusted=Math.max(min,Math.min(max,value));height.value=adjusted.toFixed(2);S.height=height.value;window.save?.();window.toast?.('Altura ajustada para a faixa de '+race.value+': '+min.toFixed(2).replace('.',',')+'–'+max.toFixed(2).replace('.',',')+' m.')}return false}
    S.height=height.value;return true;
  }
  function installHeightLimits(){
    const race=document.getElementById('race'),height=document.getElementById('height');if(!race||!height)return;
    ensureSizeChoice();syncHeightLimit(true);
    if(!race.dataset.heightRangeGuard){race.dataset.heightRangeGuard='1';race.addEventListener('change',()=>syncHeightLimit(true))}
    if(!height.dataset.heightRangeGuard){height.dataset.heightRangeGuard='1';height.addEventListener('input',()=>{const value=Number(height.value),cap=Number(height.max);if(height.value!==''&&value>cap){height.value=String(cap);S.height=height.value;window.save?.()}});height.addEventListener('change',()=>syncHeightLimit(true));height.addEventListener('blur',()=>syncHeightLimit(true))}
    const previousNext=window.next;if(previousNext&&!window.__heightRangeNextGuard){window.__heightRangeNextGuard=true;window.next=function(){if(!syncHeightLimit(true)){window.toast?.('Confira a altura dentro da faixa da espécie antes de continuar.');return}return previousNext()}}
  }
  const prevRender=window.renderCampaign;
  if(prevRender)window.renderCampaign=function(){prevRender();enforceCurrentHP();enhance()};
  const prevProgress=window.renderProgressCard;
  if(prevProgress)window.renderProgressCard=renderProgression;
  installHeightLimits();
  document.getElementById('background')?.addEventListener('change',()=>setTimeout(explainOriginFeat,0));explainOriginFeat();
  if(document.getElementById('campaign')){enforceCurrentHP();enhance()}
  const style=document.createElement('style');style.textContent=`
  #progressCard h3,#spellListArea h4{margin-top:0}.spell-tabs{display:flex;gap:8px;margin:18px 0 12px;border-bottom:1px solid var(--line)}.spell-tab{border:1px solid var(--line);border-bottom:0;background:#faf8f3;padding:10px 15px;border-radius:7px 7px 0 0;color:var(--ink);font:600 13px system-ui;cursor:pointer}.spell-tab.active{background:var(--red);border-color:var(--red);color:#fff}.spell-pane[hidden]{display:none}.origin-feat-help{display:block;margin-top:6px;line-height:1.55;color:var(--muted)}.progression-head{display:flex;justify-content:space-between;align-items:center;gap:18px}.progression-head h3{margin:5px 0}.eyebrow{font:10px system-ui;letter-spacing:.14em;color:var(--red)}.xp-reminder{padding:11px 14px;background:#f7f4ec;border-radius:8px;text-align:center}.xp-reminder b,.xp-reminder small{display:block}.xp-reminder small{font-size:11px;color:var(--muted)}.next-level{margin:14px 0;padding:16px;border:1px solid var(--line);border-radius:9px;background:#fffefa}.next-level h4{margin:0 0 10px}.gain-list{list-style:none;padding:0;margin:0}.gain-list li{padding:9px 0;border-top:1px solid var(--line)}.gain-list li span{display:block;font-size:12px;line-height:1.5;color:var(--muted);margin-top:3px}.progression-details,.spell-known{border:1px solid var(--line);border-radius:8px;margin:10px 0;padding:12px;background:#fffefa}.progression-details>summary,.spell-known>summary{font-weight:700;cursor:pointer}.level-timeline{margin-top:9px;max-height:490px;overflow:auto}.level-row{padding:8px 10px;border-top:1px solid var(--line)}.level-row>summary{cursor:pointer;display:flex;gap:12px;align-items:baseline}.level-row>summary span{font-size:12px;color:var(--muted)}.level-row ul{font-size:12px;line-height:1.6}.subclass-milestone{font-size:12px;background:#f7f4ec;padding:8px;border-radius:6px}.subclass-overview{margin-top:12px}.subclass-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.subclass-option{border:1px solid var(--line);padding:10px;border-radius:7px}.subclass-option.selected{border-color:var(--red);background:#fbefec}.subclass-option small{display:block;margin-top:4px;color:var(--muted)}.subclass-option p{font-size:12px;line-height:1.5;margin:7px 0}.subclass-guide{max-width:800px}.spell-intro p{font-size:13px;line-height:1.55}.spell-first-steps{background:#f7f4ec;border-radius:7px;padding:12px;font-size:12px}.spell-first-steps ol{padding-left:20px;line-height:1.65}.spell-first-steps small{color:var(--muted);line-height:1.6}.spell-book-tools{margin-top:18px}.spell-filters{display:grid;grid-template-columns:2fr 1fr 1fr;gap:9px;align-items:end}.spell-filters label{display:flex;flex-direction:column;gap:5px;font-size:12px}.spell-filters input,.spell-filters select{min-width:0}.spell-quick-results{max-height:560px;overflow:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:10px 0}.spell-quick-card{align-self:start;border:1px solid var(--line);border-radius:7px;background:#fffefa}.spell-quick-card>summary{cursor:pointer;padding:10px;display:flex;justify-content:space-between;gap:7px}.spell-quick-card>summary span{font-size:11px;color:var(--muted);text-align:right}.spell-quick-body{padding:0 10px 10px;font-size:12px}.spell-effect{padding:10px;background:#f6f1e5;border-left:3px solid var(--gold);border-radius:4px;margin-bottom:9px}.spell-effect p{margin:4px 0 0;line-height:1.55}.spell-effect-missing{background:#f7f4ec;border-left-color:#aaa}.spell-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.spell-facts span{padding:7px;background:#f7f4ec;border-radius:5px;overflow-wrap:anywhere}.spell-facts small,.spell-facts em{display:block;font-size:10px;color:var(--muted);font-style:normal;line-height:1.5}.spell-facts small{font-size:10px}.spell-source{font-size:10px;color:var(--muted)}.spell-known-list{margin-top:10px}.catalog-check{display:flex;gap:7px;align-items:center;margin:10px 0;font-size:12px}@media(max-width:700px){.spell-filters{grid-template-columns:1fr 1fr}.spell-filters label:first-child{grid-column:1/-1}.spell-quick-results{grid-template-columns:1fr}.subclass-options{grid-template-columns:1fr}.progression-head{align-items:flex-start;flex-direction:column}.level-row>summary{flex-direction:column;gap:3px}}
  `;document.head.appendChild(style);
})();
