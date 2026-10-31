from pathlib import Path
from docx import Document
from docx.oxml import OxmlElement
from docx.text.paragraph import Paragraph

src = Path(r'C:\Users\aliss\Downloads\Orvanis - guia para jogadores.docx')
out = Path(r'D:\Projetos\Criador de Personagem\Orvanis - guia para jogadores atualizado.docx')
doc = Document(src)
body = doc._element.body
start = next(p for p in doc.paragraphs if p.text.strip() == 'Montando seu personagem')
end = next(p for p in doc.paragraphs if p.text.strip() == 'Lugares e figuras de Orvanis')
# Remove the old character-creation material and its tables, preserving the campaign setting before and after it.
node = start._p
while node is not None and node is not end._p:
    following = node.getnext()
    node.getparent().remove(node)
    node = following

def add_before_end(text='', style='Normal', bold_prefix=None):
    p_el = OxmlElement('w:p')
    end._p.addprevious(p_el)
    p = Paragraph(p_el, end._parent)
    p.style = style
    if bold_prefix and text.startswith(bold_prefix):
        p.add_run(bold_prefix).bold = True
        p.add_run(text[len(bold_prefix):])
    else:
        p.add_run(text)
    return p

add_before_end('Criando e jogando com a ficha digital', 'Title')
add_before_end('Guia rápido do criador e da ficha de campanha', 'Subtitle')
add_before_end('A Forja ajuda você a montar o personagem e mantém uma ficha digital para usar durante a campanha. Siga as etapas na tela; os cálculos são feitos pelo sistema. Se uma regra depender da campanha, confirme a decisão com o mestre.')
add_before_end('1. Crie seu personagem', 'Heading 1')
steps = [
    ('Comece pela ideia. ', 'Clique em “Criar personagem”, escolha um estilo de herói e dê um nome. Você pode mudar a ideia depois.'),
    ('Escolha classe e nível. ', 'A classe define as capacidades do personagem. Se está aprendendo, nível 1 é o começo mais simples. Use o nível que o mestre indicar para a campanha.'),
    ('Escolha a origem. ', 'Selecione uma espécie e um antecedente. O antecedente fornece escolhas de perícias, um talento e aumentos de atributo. Preencha também alinhamento, idade, altura e peso se quiser; a altura respeita os limites da espécie.'),
    ('Distribua os atributos. ', 'Use os botões de mais e menos para gastar os 27 pontos. Os atributos começam em 8 e podem chegar a 15 antes dos bônus do antecedente. A tela calcula o custo e impede ultrapassar as regras; os aumentos do antecedente são aplicados automaticamente.'),
    ('Escolha suas perícias. ', 'A tela mostra as opções permitidas pela classe. As perícias do antecedente entram automaticamente. Se aparecerem escolhas de salvaguardas ou outras características, selecione as opções que combinam com o personagem e com a campanha.'),
    ('Dê detalhes ao personagem. ', 'Na etapa “Detalhes”, descreva aparência, personalidade, ideais, vínculos e defeitos. Você pode escrever pouco e completar a história durante o jogo. Os cálculos de defesa, deslocamento, pontos de vida e conjuração são preenchidos pela ficha.'),
    ('Revise e comece a jogar. ', 'Confira o resumo. Quando estiver pronto, clique em “Começar a jogar com este personagem” para abrir a ficha de campanha.')
]
for lead, rest in steps:
    add_before_end(lead + rest, 'List Number', lead)

add_before_end('2. Use a ficha durante a campanha', 'Heading 1')
add_before_end('A tela da campanha reúne os números que você consulta com frequência. Pontos de vida, classe de armadura, deslocamento, bônus e recursos são calculados a partir do personagem; atualize os valores de acompanhamento quando sofrer dano, recuperar-se ou gastar um recurso.')
features = [
    ('Itens e dinheiro. ', 'Adicione ao inventário o que encontrar ou comprar, ajuste as moedas e registre itens especiais da campanha.'),
    ('Magias e truques. ', 'Em “Lista disponível”, veja opções permitidas pela classe e pelo nível; em “Minhas magias”, consulte o que já anotou. A ficha indica quantos truques e quantas magias cabem nas escolhas atuais. Truques podem ser conjurados sem gastar espaços, mas você conhece apenas a quantidade indicada pela classe ou característica. Magias de círculo normalmente gastam um espaço.'),
    ('Subir de nível. ', 'Use “Subir de nível” quando o mestre autorizar ou quando a campanha alcançar o marco combinado. A ficha atualiza os números e apresenta as características e escolhas liberadas. Faça as escolhas indicadas, como uma subclasse quando ela ficar disponível, e registre os detalhes recebidos.'),
    ('Aparência, habilidades e diário. ', 'Edite a aparência, acrescente características concedidas durante a campanha e registre acontecimentos importantes no diário.')
]
for lead, rest in features:
    add_before_end(lead + rest, 'List Bullet', lead)

add_before_end('3. Lembretes para sua primeira sessão', 'Heading 1')
reminders = [
    ('Teste. ', 'Role 1d20 e some o modificador do atributo indicado. Se tiver proficiência na perícia ou salvaguarda, some também seu bônus de proficiência. O mestre informa a dificuldade ou o resultado necessário.'),
    ('Sua vez. ', 'Normalmente você pode se mover e realizar uma ação. Use uma ação bônus ou reação somente quando uma habilidade, magia ou situação permitir.'),
    ('Magia. ', 'Um truque não consome espaço de magia. Uma magia de círculo gasta um espaço do nível indicado ou superior; acompanhe os espaços na ficha. Se a magia exigir concentração, só mantenha uma magia de concentração por vez.'),
    ('Dados salvos. ', 'A ficha fica salva neste navegador e neste dispositivo. Use “Salvar dados” para criar uma cópia de segurança e “Abrir dados” para recuperar essa cópia ou levar o personagem para outro dispositivo.')
]
for lead, rest in reminders:
    add_before_end(lead + rest, 'List Bullet', lead)

add_before_end('Antes da aventura, combine com o mestre o nível inicial, o equipamento permitido e qualquer regra específica da campanha. Você não precisa decorar o livro: use as explicações e os lembretes da ficha, e pergunte quando uma situação depender de uma decisão da mesa.')
doc.save(out)
print(out)
