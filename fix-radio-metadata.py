#!/usr/bin/env python3
import shutil

f = '/home/chillmatch_app/chillmatch-radio/player/index.html'
shutil.copy(f, f + '.bak')

t = open(f).read()

old = """const source = list.find(s => s.listenurl && s.listenurl.endsWith('/stream'))
                    || list.find(s => s.listenurl && s.listenurl.endsWith('/fallback'))
                    || list[0];"""

new = """const source = list.find(s => s.title && s.listenurl && s.listenurl.endsWith('/stream'))
                    || list.find(s => s.title && s.listenurl && s.listenurl.endsWith('/fallback'))
                    || list.find(s => s.listenurl && s.listenurl.endsWith('/stream'))
                    || list.find(s => s.listenurl && s.listenurl.endsWith('/fallback'))
                    || list[0];"""

if old in t:
    t = t.replace(old, new)
    open(f, 'w').write(t)
    print('PATCHED OK')
else:
    print('OLD PATTERN NOT FOUND - maybe already patched')
