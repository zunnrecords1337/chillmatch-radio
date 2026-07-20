#!/usr/bin/env python3
import shutil

f = '/home/chillmatch_app/chillmatch-radio/player/index.html'
shutil.copy(f, f + '.bak')

t = open(f).read()

# Add s.title check to first two find calls
t = t.replace(
    "list.find(s => s.listenurl && s.listenurl.endsWith('/stream'))",
    "list.find(s => s.title && s.listenurl && s.listenurl.endsWith('/stream'))\n                    || list.find(s => s.title && s.listenurl && s.listenurl.endsWith('/fallback'))\n                    || list.find(s => s.listenurl && s.listenurl.endsWith('/stream'))",
    1
)

if "s.title && s.listenurl" in t:
    open(f, 'w').write(t)
    print('PATCHED OK')
else:
    print('NOT PATCHED')
