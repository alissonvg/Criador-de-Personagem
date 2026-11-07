from pypdf import PdfReader
import re
p=PdfReader(r'C:\Users\aliss\Downloads\RPG\dampd-5e---livro-do-jogador-2024.pdf')
texts=[x.extract_text() or '' for x in p.pages]
for i,t in enumerate(texts):
    found=[]
    for line in t.splitlines():
        if re.search(r'(Truques|Magias de (Bardo|Bruxo|Clérigo|Druida|Feiticeiro|Guardião|Mago|Paladino)|Lista de Magias)',line,re.I):
            found.append(line.strip())
    if found and 50 <= i+1 <= 180:
        print(f'PAGE {i+1}: ' + ' | '.join(found))
