import pdfplumber
p=pdfplumber.open(r'C:\Users\aliss\Downloads\RPG\dampd-5e---livro-do-jogador-2024.pdf')
for n in [68,69,79,80,81,89,90,91,100,101,102,112,113,114,125,126,156,157,158,159,175,176]:
    tables=p.pages[n-1].extract_tables()
    print('\nPAGE',n,'tables',len(tables))
    for t in tables:
        print('rows',len(t),'sample',t[:3])
