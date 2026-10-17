"""Build conservative page CSS and small WOFF2 fonts. Run from the project root.

Install scripts/performance-requirements.txt in a development environment first.
Supply --inter-source for the original Google Fonts Inter variable TTF when
regenerating that font; subsequent CSS builds reuse the checked-in WOFF2.
"""
from pathlib import Path
from html.parser import HTMLParser
import argparse, re, json
import tinycss2
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from rcssmin import cssmin

parser = argparse.ArgumentParser()
parser.add_argument('--inter-source', type=Path)
args = parser.parse_args()

class Inventory(HTMLParser):
    def __init__(self):
        super().__init__(); self.classes=set(); self.ids=set()
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs); self.classes.update(attrs.get('class','').split())
        if attrs.get('id'): self.ids.add(attrs['id'])

dynamic = set('active show original stricked-menu stricky-fixed xb-menu-toggle body-overflow open closing animated fadeInUp fadeInDown fadeInLeft skewIn swiper-initialized swiper-horizontal swiper-slide-active swiper-slide-next swiper-slide-prev swiper-button-disabled swiper-pagination-current swiper-pagination-total swiper-pagination-fraction alert-success alert-danger alert-dismissible alert fade btn-close fa-spinner fa-spin ms-2 plan-choice'.split())
inventories={}
for name,file in [('home','index.html'),('ngo','ngo-crm-software.html')]:
    inv=Inventory(); inv.feed(Path(file).read_text(encoding='utf-8')); inv.classes.update(dynamic); inventories[name]=inv

def split_selectors(tokens):
    chunks=[[]]
    for token in tokens:
        if token.type=='literal' and token.value==',': chunks.append([])
        else: chunks[-1].append(token)
    return [tinycss2.serialize(chunk).strip() for chunk in chunks if chunk]

def relevant(selector, inventory):
    # Ignore strings/negative conditions when detecting required classes.
    selector=re.sub(r':not\([^()]*\)', '', selector)
    selector=re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"|\'[^\'\\]*(?:\\.[^\'\\]*)*\'', '', selector)
    classes=set(re.findall(r'(?<!\\)\.([a-zA-Z_][\w-]*)', selector))
    ids=set(re.findall(r'(?<!\\)#([a-zA-Z_][\w-]*)', selector))
    return all(c in inventory.classes or c.startswith('swiper-') for c in classes) and ids <= inventory.ids

def prune(css, inventory):
    output=[]
    for rule in tinycss2.parse_stylesheet(css,skip_comments=True,skip_whitespace=True):
        if rule.type=='qualified-rule':
            selectors=[s for s in split_selectors(rule.prelude) if relevant(s,inventory)]
            if selectors: output.append(','.join(selectors)+'{'+tinycss2.serialize(rule.content)+'}')
        elif rule.type=='at-rule':
            if rule.lower_at_keyword in ('import','charset'): continue
            prelude=tinycss2.serialize(rule.prelude)
            if rule.content is None: output.append('@'+rule.at_keyword+prelude+';')
            elif rule.lower_at_keyword in ('media','supports','layer','container'):
                inner=prune(tinycss2.serialize(rule.content),inventory)
                if inner: output.append('@'+rule.at_keyword+prelude+'{'+inner+'}')
            else: output.append('@'+rule.at_keyword+prelude+'{'+tinycss2.serialize(rule.content)+'}')
    return ''.join(output)

latin=set(range(32,0x250))|set(range(0x2000,0x2070))|{0x20b9}|set(range(0x2190,0x2200))
def font_subset(source,destination,unicodes):
    options=subset.Options(); options.flavor='woff2'; options.desubroutinize=True
    font=TTFont(source)
    subsetter=subset.Subsetter(options=options); subsetter.populate(unicodes=unicodes); subsetter.subset(font)
    if 'fvar' in font and any(axis.axisTag=='opsz' for axis in font['fvar'].axes):
        font=instantiateVariableFont(font,{'opsz':14},inplace=True)
    font.flavor='woff2'; font.save(destination)
    print(destination,Path(destination).stat().st_size)

if args.inter_source:
    font_subset(args.inter_source,'assets/fonts/inter-latin-variable.woff2',latin)
assert Path('assets/fonts/inter-latin-variable.woff2').exists(), 'Supply --inter-source on the first build.'

font_css='''@font-face{font-family:Inter;src:url('../fonts/inter-latin-variable.woff2') format('woff2');font-style:normal;font-weight:100 900;font-display:swap}
@font-face{font-family:Aeonik;src:url('../fonts/Aeonik-Medium.woff2') format('woff2');font-style:normal;font-weight:500;font-display:swap}
@font-face{font-family:Aeonik;src:url('../fonts/Aeonik-Bold.woff2') format('woff2');font-style:normal;font-weight:700;font-display:swap}'''
union=Inventory(); union.classes=set.union(*(i.classes for i in inventories.values())); union.ids=set.union(*(i.ids for i in inventories.values()))
icon_css=prune(Path('assets/css/fontawesome.css').read_text(encoding='utf-8'),union)
icon_codes={int(code,16) for code in re.findall(r'\\([a-fA-F0-9]{4,6})',icon_css)}
icon_codes.update(ord(character) for character in icon_css if 0xf000 <= ord(character) <= 0xf8ff)
assert len(icon_codes)>10, 'Expected icon glyphs in the filtered CSS.'
for name in ('fa-brands-400','fa-light-300','fa-regular-400','fa-solid-900'):
    destination=f'assets/fonts/{name}-pages.woff2'
    font_subset(f'assets/fonts/{name}.ttf',destination,icon_codes)
    icon_css=icon_css.replace(f'../fonts/{name}.ttf',f'../fonts/{name}-pages.woff2')
icon_css=icon_css.replace('format("truetype")','format("woff2")').replace('font-display: auto','font-display: swap')

performance_css='''
.hero .wow{visibility:visible!important;animation:none!important;transform:none!important;opacity:1!important}
.wow{visibility:visible!important}#xb-loadding{display:none!important}
.input-box select{display:block;width:100%;height:60px;border:1px solid #dce2e9;border-radius:8px;background:#fff;padding:0 16px;color:#334155;font:inherit}
.xb-menu-toggle{border:0;background:transparent;padding:0}
.testimonial-slider:not(.swiper-initialized) .swiper-wrapper{display:flex;gap:30px}
.testimonial-slider:not(.swiper-initialized) .swiper-slide{flex:0 0 calc((100% - 60px)/3)}
.testimonial-slider{overflow:hidden}
.it-services .service-list .active-bg{display:none}
.it-services .service-list-item.current{background:#c94300}
.it-services .service-list-item.current .xb-item--title{color:#fff}
@media(max-width:767px){.testimonial-slider:not(.swiper-initialized) .swiper-slide{flex-basis:100%}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}}
'''
for name,inventory in inventories.items():
    files=['bootstrap.min.css','main.css']
    if name=='ngo': files+=['price.css','ngo-crm-page.css','ngo-inline.css']
    files+=['navigation-nested.css']
    parts=[font_css,icon_css]
    for file in files:
        parts.append(prune((Path('assets/css')/file).read_text(encoding='utf-8'),inventory))
    parts.append(performance_css)
    result=cssmin('\n'.join(parts))
    destination=Path(f'assets/css/{name}-page.min.css'); destination.write_text(result,encoding='utf-8')
    print(json.dumps({'page':name,'css_bytes':destination.stat().st_size,'icon_codes':len(icon_codes)}))
