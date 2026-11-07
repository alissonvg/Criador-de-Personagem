import pdfplumber, json, re, unicodedata
from pathlib import Path
PDF=r'C:\Users\aliss\Downloads\RPG\dampd-5e---livro-do-jogador-2024.pdf'
p=pdfplumber.open(PDF)
book=json.JSONDecoder().raw_decode(Path('catalogo-2024.js').read_text(encoding='utf-8').removeprefix('window.FORJA_BOOK='))[0]
ranges={'Bardo':(68,69),'Bruxo':(79,81),'Clérigo':(89,91),'Druida':(100,102),'Feiticeiro':(113,114),'Guardião':(125,126),'Mago':(156,159),'Paladino':(176,176)}
def norm(s):
 s=unicodedata.normalize('NFKD',s.lower()); s=''.join(c for c in s if not unicodedata.combining(c)); return re.sub(r'[^a-z0-9]','',s)
schools={norm(x) for x in ['Abjuração','Adivinhação','Conjuração','Encantamento','Evocação','Ilusão','Necromancia','Transmutação','Invocação']}
byname={norm(x['n']):x for x in book['spells']}
for cls,(a,b) in ranges.items():
 rows=[]
 for n in range(a,b+1):
  for table in p.pages[n-1].extract_tables():
   for row in table:
    if len(row)>=3 and row[1] and norm(row[1]) in schools:
     name=' '.join((row[0] or '').split())
     if name: rows.append(name)
 official={norm(name):name for name in rows}
 catalog={norm(x['n']):x for x in book['spells'] if cls in x['c']}
 extras=sorted(catalog[k]['n'] for k in catalog.keys()-official.keys())
 absent=sorted(official[k] for k in official.keys()-catalog.keys())
 unknown=sorted(official[k] for k in official.keys()-byname.keys())
 print(f'{cls}: source {len(official)}, catalog {len(catalog)}, extra {len(extras)}, unassigned {len(absent)}, missing catalog {len(unknown)}')
 if extras or absent or unknown:
  print(' EXTRA:',extras); print(' UNASSIGNED:',absent); print(' MISSING:',unknown)
