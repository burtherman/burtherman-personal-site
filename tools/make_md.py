import re, html, sys
s = open('index.html').read()
def clean(t):
    return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<br\s*/?>', ' ', t))).strip()
def md_inline(t):
    t = re.sub(r'<a\s[^>]*href="([^"]+)"[^>]*>(.*?)</a>', lambda m: f'[{clean(re.sub(r"<[^>]+>","",m.group(2)))}]({m.group(1)})', t, flags=re.S)
    return clean(re.sub(r'<[^>]+>', '', t))

out = []
out.append('# Burt Herman\n')
out.append('Co-founder, [Hacks/Hackers](https://hackshackers.com)\n')
bio = re.search(r'<div class="bio-short">(.*?)</div>', s, re.S).group(1)
for p in re.findall(r'<p>(.*?)</p>', bio, re.S):
    out.append(md_inline(p) + '\n')

out.append('## Writing and talks\n')
for art in re.findall(r'<article class="writing-featured">(.*?)</article>', s, re.S):
    date = clean(re.search(r'<time[^>]*>(.*?)</time>', art).group(1))
    t = re.search(r'<h3 class="writing-featured-title"><a\s+href="([^"]+)"[^>]*>(.*?)</a>', art, re.S)
    dek = md_inline(re.search(r'<p class="writing-featured-dek">(.*?)</p>', art, re.S).group(1))
    out.append(f'### [{clean(t.group(2))}]({t.group(1)})\n')
    out.append(f'{date}. {dek}\n')
    extra = [(u, clean(l).rstrip(' →')) for u, l in re.findall(r'<a href="([^"]+)"[^>]*class="writing-cta">(.*?)</a>', art, re.S)]
    for u, l in extra:
        out.append(f'- [{l}]({u})')
    if extra: out.append('')

rows = []
for li in re.findall(r'<li class="writing-item">(.*?)</li>', s, re.S):
    m = re.search(r'<a\s+href="([^"]+)"[^>]*>\s*<time[^>]*>(.*?)</time>\s*<span class="writing-title">(.*?)</span>(?:\s*<span class="writing-source">(.*?)</span>)?', li, re.S)
    url, date, title, src = m.group(1), clean(m.group(2)), clean(m.group(3)), m.group(4)
    line = f'- {date}: [{title}]({url})'
    if src: line += f' ({clean(src)})'
    pj = re.search(r'<a href="([^"]+)"[^>]*class="writing-cta writing-item-project">(.*?)</a>', li, re.S)
    if pj: line += f'. [{clean(pj.group(2)).rstrip(" →")}]({pj.group(1)})'
    rows.append(line)
out.append('### More\n')
out += rows
out.append('')

out.append('## About\n')
modal = re.search(r'<h2 id="modal-title">.*?</h2>(.*?)</div>\s*</dialog>', s, re.S).group(1)
for p in re.findall(r'<p>(.*?)</p>', modal, re.S):
    out.append(md_inline(p) + '\n')

out.append('## Work with me\n')
pitch = re.search(r'<div class="contact-pitch">\s*<p>(.*?)</p>', s, re.S).group(1)
out.append(md_inline(pitch) + '\n')
mail = re.search(r'href="mailto:([^"?]+)', s).group(1)
li = re.search(r'href="(https://linkedin\.com/[^"]+)"', s).group(1)
out.append(f'- Email: <{mail}>')
out.append(f'- LinkedIn: <{li}>')
out.append('')
out.append('---\n')
out.append('This is the Markdown version of <https://burtherman.com/>, kept for AI agents and other text-first readers.')
print('\n'.join(out))
