import {useState, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import * as topojson from 'topojson-client';
import {geoMercator, geoPath} from 'd3-geo';
import type {FeatureCollection, Feature, Geometry} from 'geojson';
import {
  HistogramChart,
  classify,
  getPaletteByName,
  getPalettesByType,
  computeHistogram,
  getHistogramDomain,
  CLASSIFICATION_METHODS,
} from '../src/react/index';
import type {ClassificationMethod} from '../src/core/types';
import '../src/react/styles/tokens.css';
import japanTopo from './japan.json';

const SAMPLE_DATA = {
  uniform: Array.from({length: 200}, () => Math.random() * 100),
  normal: Array.from({length: 200}, () => {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return 50 + Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * 15;
  }),
  skewed: Array.from({length: 200}, () => Math.pow(Math.random(), 3) * 100),
  bimodal: Array.from({length: 200}, (_, i) =>
    i < 100 ? 20 + Math.random() * 20 : 70 + Math.random() * 20
  ),
};

// Convert topojson to geojson features
const japanGeo = topojson.feature(
  japanTopo as unknown as topojson.Topology,
  (japanTopo as any).objects.japan
) as FeatureCollection;
const japanFeatures = japanGeo.features;

const AUTO_METHODS = Object.keys(CLASSIFICATION_METHODS).filter(
  (m) => m !== 'custom'
) as ClassificationMethod[];

function getColorForValue(
  value: number,
  breaks: number[],
  colors: string[]
): string {
  if (breaks.length < 2 || colors.length === 0) return '#ccc';
  const innerBreaks = breaks.slice(1, -1);
  for (let i = innerBreaks.length - 1; i >= 0; i--) {
    if (value >= innerBreaks[i]) return colors[i + 1] || colors[colors.length - 1];
  }
  return colors[0];
}

function ChoroplethMap({
  features,
  prefValues,
  breaks,
  colors,
  width,
  height,
}: {
  features: Feature<Geometry>[];
  prefValues: Map<number, number>;
  breaks: number[];
  colors: string[];
  width: number;
  height: number;
}) {
  const {pathGenerator} = useMemo(() => {
    const fc: FeatureCollection = {type: 'FeatureCollection', features};
    const projection = geoMercator().fitSize([width, height], fc);
    return {pathGenerator: geoPath(projection)};
  }, [features, width, height]);

  return (
    <svg width={width} height={height} style={{display: 'block'}}>
      {features.map((feat) => {
        const id = (feat.properties as any)?.id as number;
        const value = prefValues.get(id);
        const fill =
          value !== undefined && breaks.length > 1
            ? getColorForValue(value, breaks, colors)
            : '#ccc';
        return (
          <path
            key={id}
            d={pathGenerator(feat) || ''}
            fill={fill}
            stroke="var(--sb-border, #e0e0e0)"
            strokeWidth={0.5}
          />
        );
      })}
    </svg>
  );
}

function SmallMultiple({
  data,
  method,
  nClasses,
  paletteName,
  features,
  prefValues,
}: {
  data: number[];
  method: ClassificationMethod;
  nClasses: number;
  paletteName: string;
  features: Feature<Geometry>[];
  prefValues: Map<number, number>;
}) {
  const result = useMemo(() => {
    try {
      const {breaks} = classify(data, {method, nb: nClasses});
      const entry = getPaletteByName(paletteName);
      const colors = entry ? entry.colors(breaks.length - 1) : [];
      return {breaks, colors};
    } catch {
      return {breaks: [] as number[], colors: [] as string[]};
    }
  }, [data, method, nClasses, paletteName]);

  const bins = useMemo(() => computeHistogram(data, 20), [data]);
  const domain = useMemo(() => getHistogramDomain(data), [data]);

  const label = CLASSIFICATION_METHODS[method];

  return (
    <div
      style={{
        background: 'var(--sb-bg-primary)',
        borderRadius: '4px',
        border: '1px solid var(--sb-border)',
        padding: '8px',
      }}
    >
      <div
        style={{
          fontSize: '14px',
          color: 'var(--sb-text-highlight)',
          marginBottom: '4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: 600,
        }}
        title={label}
      >
        {label}
      </div>
      <ChoroplethMap
        features={features}
        prefValues={prefValues}
        breaks={result.breaks}
        colors={result.colors}
        width={250}
        height={200}
      />
      <HistogramChart
        bins={bins}
        breaks={result.breaks}
        colors={result.colors}
        domain={domain}
        height={80}
      />
      <div
        style={{
          fontSize: '9px',
          color: 'var(--sb-text-secondary)',
          marginTop: '2px',
        }}
      >
        {result.breaks.length > 1 ? `${result.breaks.length - 1} classes` : '—'}
      </div>
    </div>
  );
}

function SmallMultiplesTab({
  data,
  nClasses,
  paletteName,
  features,
  prefValues,
}: {
  data: number[];
  nClasses: number;
  paletteName: string;
  features: Feature<Geometry>[];
  prefValues: Map<number, number>;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px',
      }}
    >
      {AUTO_METHODS.map((method) => (
        <SmallMultiple
          key={method}
          data={data}
          method={method}
          nClasses={nClasses}
          paletteName={paletteName}
          features={features}
          prefValues={prefValues}
        />
      ))}
    </div>
  );
}

function App() {
  const [dataKey, setDataKey] = useState<keyof typeof SAMPLE_DATA>('normal');
  const [overviewPalette, setOverviewPalette] = useState('Blues');
  const [overviewSteps, setOverviewSteps] = useState(5);
  const data = SAMPLE_DATA[dataKey];

  const sequentialPalettes = useMemo(() => getPalettesByType('sequential'), []);

  // Assign data values to 47 prefectures (id: 1-47)
  const prefValues = useMemo(() => {
    const map = new Map<number, number>();
    for (let i = 0; i < 47; i++) {
      map.set(i + 1, data[i % data.length]);
    }
    return map;
  }, [data]);

  return (
    <div
      data-theme="light"
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: 'var(--sb-bg-secondary)',
        color: 'var(--sb-text-highlight)',
        minHeight: '100vh',
        padding: '24px',
      }}
    >
      <h1 style={{fontSize: '20px', fontWeight: 600, margin: '0 0 4px 0'}}>
        階級分類方法の可視化
      </h1>
      <p style={{fontSize: '12px', color: 'var(--sb-text-secondary)', margin: '0 0 16px 0'}}>
        statsbreaks + bertin から抽出した階級分類 &amp; カラーパレット選択UI
      </p>

      <div style={{marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px'}}>
        <div>
          <label style={{fontSize: '12px', color: 'var(--sb-text-primary)'}}>データ分布: </label>
          <select
            value={dataKey}
            onChange={(e) => setDataKey(e.target.value as keyof typeof SAMPLE_DATA)}
            style={{
              background: 'var(--sb-bg-primary)',
              color: 'var(--sb-text-primary)',
              border: '1px solid var(--sb-border)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
            }}
          >
            <option value="uniform">一様分布</option>
            <option value="normal">正規分布</option>
            <option value="skewed">右偏り分布</option>
            <option value="bimodal">二峰性分布</option>
          </select>
        </div>
        <div>
          <label style={{fontSize: '12px', color: 'var(--sb-text-primary)'}}>カラーパレット: </label>
          <select
            value={overviewPalette}
            onChange={(e) => setOverviewPalette(e.target.value)}
            style={{
              background: 'var(--sb-bg-primary)',
              color: 'var(--sb-text-primary)',
              border: '1px solid var(--sb-border)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
            }}
          >
            {sequentialPalettes.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{fontSize: '12px', color: 'var(--sb-text-primary)'}}>分類数: </label>
          <select
            value={overviewSteps}
            onChange={(e) => setOverviewSteps(Number(e.target.value))}
            style={{
              background: 'var(--sb-bg-primary)',
              color: 'var(--sb-text-primary)',
              border: '1px solid var(--sb-border)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
            }}
          >
            {[3, 4, 5, 6, 7, 8, 9].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <SmallMultiplesTab
        data={data}
        nClasses={overviewSteps}
        paletteName={overviewPalette}
        features={japanFeatures}
        prefValues={prefValues}
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
