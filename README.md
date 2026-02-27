# statsbreaks-bertin-ui

[statsbreaks](https://github.com/neocarto/statsbreaks) + [bertin](https://github.com/neocarto/bertin) から階級分類とカラースキームUIだけを抽出したライブラリ。

地図・GeoJSON・WebGL等の描画機能は含まず、**数値データの分類とカラーパレット選択**に特化している。

## デモ

```bash
npm install
npm run demo
# http://localhost:5173/
```

## 構成

```
src/
├── core/     # フレームワーク非依存（分類・パレット・色変換）
└── react/    # React コンポーネント・hooks
```

### エントリポイント

| パス | 用途 |
|------|------|
| `statsbreaks-bertin-ui` | Core（React不要） |
| `statsbreaks-bertin-ui/react` | Core + React コンポーネント |

## 階級分類手法

statsbreaks が提供する10種の分類手法をそのまま利用する。

| 手法 | キー | 概要 |
|------|------|------|
| Quantile | `quantile` | 等頻度。各クラスのデータ件数が均等になるよう分割 |
| Q6 | `q6` | 6クラス固定の分位数。両端5%を独立クラスにする |
| Equal Interval | `equal` | 等間隔。値域を均等幅で分割 |
| Jenks (Natural Breaks) | `jenks` | 自然分類。クラス内分散を最小化する最適化手法 |
| Mean-Std Deviation | `msd` | 平均±標準偏差で分割。`k`（標準偏差数）と`middle`（平均を中心にするか）を指定可 |
| Geometric Progression | `geometric` | 幾何級数。右偏り分布向き |
| Arithmetic Progression | `arithmetic` | 等差級数。線形に増加する階級幅 |
| Head/Tail | `headtail` | 平均値で再帰的に二分割。べき乗則的な分布向き |
| Pretty Breaks | `pretty` | 読みやすい切りの良い数値で分割 |
| Nested Means | `nestedmeans` | 入れ子平均。平均値で再帰的に分割し、2^n クラスを生成 |

## カラーパレット

d3-scale-chromatic のスキームをそのまま利用（計36種）。

- **Sequential（18種）**: Blues, Greens, Greys, Oranges, Purples, Reds, BuGn, BuPu, GnBu, OrRd, PuBu, PuBuGn, PuRd, RdPu, YlGn, YlGnBu, YlOrBr, YlOrRd
- **Diverging（9種）**: BrBG, PiYG, PRGn, PuOr, RdBu, RdGy, RdYlBu, RdYlGn, Spectral
- **Qualitative（9種）**: Accent, Dark2, Paired, Pastel1, Pastel2, Set1, Set2, Set3, Tableau10

離散スキームは最大9クラス。それ以上は interpolator によるフォールバック。

## 使い方

### Core のみ（React不要）

```ts
import { classify, colorizeChoropleth, breaksToLegend, ALL_PALETTES } from 'statsbreaks-bertin-ui';

const data = [3, 7, 12, 18, 25, 33, 42, 55, 70, 90];

// 分類
const result = classify(data, { method: 'jenks', nb: 4 });
// result.breaks     → [3, 18, 42, 70, 90]  (min含む5点)
// result.innerBreaks → [18, 42, 70]         (scaleThreshold用)
// result.nClasses   → 4

// 分類 + 着色（bertin の colorize パターン）
const colorized = colorizeChoropleth(data, {
  method: 'quantile',
  nClasses: 5,
  palette: 'RdYlBu',
  reversed: true,
});
colorized.getColor(25);  // → "#fdae61"
colorized.breaks;        // → [3, 12, 25, 42, 70, 90]
colorized.colors;        // → ["#d73027", "#fdae61", "#ffffbf", "#abd9e9", "#4575b4"]

// 凡例生成
const legend = breaksToLegend(colorized.breaks, colorized.colors);
// → [{ color: "#d73027", label: "< 12", range: [null, 12] }, ...]

// パレット一覧
ALL_PALETTES.forEach(p => {
  console.log(p.name, p.type, p.colors(5));
});
```

### React コンポーネント

```tsx
import { ClassifierPanel } from 'statsbreaks-bertin-ui/react';

function App() {
  const data = [3, 7, 12, 18, 25, 33, 42, 55, 70, 90];

  return (
    <ClassifierPanel
      data={data}
      initialMethod="quantile"
      initialNClasses={5}
      theme="dark"
      onChange={({ method, breaks, colors }) => {
        console.log(method, breaks, colors);
      }}
    />
  );
}
```

### 個別コンポーネントの組み合わせ

```tsx
import {
  useClassifier,
  usePaletteUI,
  MethodSelector,
  PaletteSelector,
  BreaksLegend,
} from 'statsbreaks-bertin-ui/react';

function MyClassifier({ data }) {
  const {
    breaks, colors, legend, histogram, histogramDomain,
    method, paletteName, setMethod, setNClasses, setPalette, setReversed,
  } = useClassifier({ data, method: 'jenks', nClasses: 5 });

  const { config, setConfig } = usePaletteUI({ initialConfig: { steps: 5 } });

  return (
    <>
      <MethodSelector method={method} bins={histogram} breaks={breaks}
        colors={colors} histogramDomain={histogramDomain}
        onSelectMethod={setMethod} />
      <PaletteSelector selectedPalette={paletteName} config={config}
        onSelectPalette={setPalette} onConfigChange={(p) => {
          setConfig(p);
          if (p.steps) setNClasses(p.steps);
          if (p.reversed !== undefined) setReversed(p.reversed);
        }} />
      <BreaksLegend legend={legend} />
    </>
  );
}
```

## chromaclass との違い

| | chromaclass | statsbreaks-bertin-ui |
|---|---|---|
| 分類エンジン | D3 scales (quantile, quantize, linear, log, sqrt) | statsbreaks (quantile, jenks, equal, msd 等10種) |
| パレット | chroma.js + 独自68種 | d3-scale-chromatic 36種 |
| カラーマッピング | D3 scale 直接利用 | statsbreaks breaks → d3.scaleThreshold |
| 追加依存 | chroma-js, d3-interpolate | statsbreaks |

## ライセンス

MIT
