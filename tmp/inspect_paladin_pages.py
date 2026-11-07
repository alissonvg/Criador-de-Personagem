import pdfplumber
p=pdfplumber.open(r'C:\Users\aliss\Downloads\RPG\dampd-5e---livro-do-jogador-2024.pdf')
for n in [176,177]:
  print('\nPAGE',n)
  print((p.pages[n-1].extract_text() or '')[:500])
  for t in p.pages[n-1].extract_tables():
    print('ROWS',len(t),'COLS',len(t[0]) if t else 0,'sample',t[:3])
