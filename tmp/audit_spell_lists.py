from pypdf import PdfReader
from pathlib import Path
import json, re, unicodedata
root=Path(r'D:\Projetos\Criador de Personagem')
book=json.JSONDecoder().raw_decode(Path('catalogo-2024.js').read_text(encoding='utf-8').removeprefix('window.FORJA_BOOK='))[0]
pdf=PdfReader(r'C:\Users\aliss\Downloads\RPG\dampd-5e---livro-do-jogador-2024.pdf')
pages={'Bardo':(68,69),'Bruxo':(79,81),'Clérigo':(89,91),'Druida':(100,102),'Feiticeiro':(112,114),'Guardião':(125,126),'Mago':(156,159),'Paladino':(175,176)}
def norm(s):
    s=unicodedata.normalize('NFKD',s.lower())
    s=''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]','',s)
texts={}
for cls,(a,b) in pages.items():
    raw=' '.join((pdf.pages[i-1].extract_text() or '') for i in range(a,b+1))
    raw=re.sub(r'-\s+','',raw)
    texts[cls]=norm(raw)
for cls in pages:
    expected={s['n'] for s in book['spells'] if norm(s['n']) in texts[cls]}
    listed={s['n'] for s in book['spells'] if cls in s['c']}
    print(f'\n{cls}: PDF {len(expected)} | catalog {len(listed)}')
    print('catalog EXTRA:',sorted(listed-expected))
    print('catalog MISSING:',sorted(expected-listed))
