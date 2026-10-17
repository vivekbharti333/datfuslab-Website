from pathlib import Path
from PIL import Image
import re

def optimized_image(source, widths, quality=80):
    source=Path(source)
    with Image.open(source) as image:
        for width in widths:
            height=round(image.height*width/image.width)
            resized=image if width==image.width else image.resize((width,height),Image.Resampling.LANCZOS)
            suffix='' if width==image.width else f'-{width}'
            target=source.with_name(source.stem+'-perf'+suffix+'.webp')
            resized.save(target,'WEBP',quality=quality,method=6)
            print(target,target.stat().st_size)

optimized_image('assets/img/hero/hero-img01.webp',[320,480,635],78)
optimized_image('assets/img/shape/hero-glassisom.webp',[960],65)
optimized_image('assets/img/contact/cont_img01.webp',[640,960],80)

for name,file in [('home','index.html'),('ngo','ngo-crm-software.html')]:
    path=Path(file); html=path.read_text(encoding='utf-8')
    if name=='ngo':
        html=re.sub(r'<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->','',html,count=1)
        styles=re.findall(r'<style>([\s\S]*?)</style>',html)
        Path('assets/css/ngo-inline.css').write_text('\n'.join(styles),encoding='utf-8')
        html=re.sub(r'<style>[\s\S]*?</style>','',html)
        body_scripts=re.findall(r'<script>([\s\S]*?)</script>',html)
        Path('assets/js/ngo-page.js').write_text('\n'.join(body_scripts),encoding='utf-8')
        html=re.sub(r'<script>[\s\S]*?</script>','',html)
    html=re.sub(r'<link\b[^>]*rel="stylesheet"[^>]*>','',html)
    html=html.replace('</head>',f'<link rel="stylesheet" href="assets/css/{name}-page.min.css?v=20261017-perf1"/>\n<link rel="preload" href="assets/fonts/Aeonik-Bold.woff2" as="font" type="font/woff2" crossorigin/>\n<link rel="preload" href="assets/fonts/inter-latin-variable.woff2" as="font" type="font/woff2" crossorigin/>\n</head>')
    html=re.sub(r'<script\b[^>]*src="assets/js/(?!analytics\.js)[^"]+"[^>]*>\s*</script>','',html)
    html=html.replace('<script defer src="assets/js/analytics.js"></script>', '<script defer src="assets/js/analytics.js?v=20261017-perf1" data-defer-analytics="true"'+(' data-tag-manager="GTM-PQGHXH47"' if name=='ngo' else '')+'></script>')
    scripts=['site-shell.js', 'home-page.js' if name=='home' else 'ngo-page.js', 'contact.js' if name=='home' else 'donexia-testimonials.js']
    html=html.replace('</body>', '\n'.join(f'<script defer src="assets/js/{script}?v=20261017-perf1"></script>' for script in scripts)+'\n</body>')
    # Make background image discovery independent of any JavaScript runtime.
    html=re.sub(r'(<[^>]*\bdata-background="([^"]+)"[^>]*)(>)',lambda m:m[1]+f' style="background-image:url(\'{m[2]}\')"'+m[3] if 'style=' not in m[1] else m[0],html)
    if name=='home':
        html=html.replace('assets/img/hero/hero-img01.webp','assets/img/hero/hero-img01-perf.webp')
        html=html.replace('href="assets/img/hero/hero-img01-perf.webp" fetchpriority="high"','href="assets/img/hero/hero-img01-perf.webp" imagesrcset="assets/img/hero/hero-img01-perf-320.webp 320w, assets/img/hero/hero-img01-perf-480.webp 480w, assets/img/hero/hero-img01-perf.webp 635w" imagesizes="(max-width: 767px) 95vw, 45vw" fetchpriority="high"')
        html=html.replace('src="assets/img/hero/hero-img01-perf.webp"','src="assets/img/hero/hero-img01-perf.webp" srcset="assets/img/hero/hero-img01-perf-320.webp 320w, assets/img/hero/hero-img01-perf-480.webp 480w, assets/img/hero/hero-img01-perf.webp 635w" sizes="(max-width: 767px) 95vw, 45vw"')
        html=html.replace('assets/img/shape/hero-glassisom.webp','assets/img/shape/hero-glassisom-perf-960.webp')
        html=html.replace('src="assets/img/contact/cont_img01.webp"','src="assets/img/contact/cont_img01-perf-960.webp" srcset="assets/img/contact/cont_img01-perf-640.webp 640w, assets/img/contact/cont_img01-perf-960.webp 960w" sizes="(max-width: 991px) 90vw, 45vw"')
    html=re.sub(r'\n[ \t]*\n(?:[ \t]*\n)+','\n\n',html)
    path.write_text(html,encoding='utf-8')
