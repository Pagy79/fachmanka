# Fachmanka

Překladač řemeslné hantýrky ze stavby a rekonstrukcí. Statická webová stránka: hledáš pojem, dostaneš srozumitelný překlad a kontext z praxe.

## Struktura

- `index.html` — rozvržení stránky
- `css/styles.css` — vlastní styly
- `js/app.js` — vyhledávání, filtry, vykreslení karet
- `js/terms.js` — slovník pro prohlížeč (generuje se z JSON)
- `data/terms.json` — zdrojová data slovníku (301 pojmů)

Nové heslo přidávej do `data/terms.json` a pak spusť:

```bash
node -e "const t=require('./data/terms.json'); require('fs').writeFileSync('./js/terms.js','window.FACHMANKA_TERMS = '+JSON.stringify(t,null,2)+';\\n')"
```

## Spuštění

Soubory můžeš otevřít přímo v prohlížeči (`index.html`).

Místní server:

```bash
npx --yes serve .
```

## Nasazení na Vercel

1. Importuj GitHub repo na [vercel.com/new](https://vercel.com/new).
2. Framework preset nech **Other**, root directory `.`.
3. Build command i Output directory nech prázdné — jde o statický web, Vercel nasadí `index.html`.

Po každém pushi na `main` Vercel nasadí novou verzi sám.
