import os

os.chdir('levels')

final = 'levels = [\n'

files = os.listdir(os.getcwd())
files = [f for f in files if f[0] != '.']

files = map(lambda x: float(x.replace("DIABLvl", "").replace(".json", "")), files)
files.sort()
print files

for i in files:
    with open('DIABLvl{}.json'.format(int(i) if i.is_integer() else i)) as f:
        final += ''.join(f.readlines())
    final += ','

final += ']'

os.chdir('..')

with open('level.js', 'w') as f:
    f.write(final)
