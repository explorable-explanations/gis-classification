'use strict';

var statsbreaks = require('statsbreaks');
var d3sc = require('d3-scale-chromatic');
var d3Array = require('d3-array');
var d3Color = require('d3-color');
var d3Scale = require('d3-scale');
var d3Format = require('d3-format');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var d3sc__namespace = /*#__PURE__*/_interopNamespace(d3sc);

// src/core/constants.ts
var CLASSIFICATION_METHODS = {
  quantile: "\u7B49\u91CF\u5206\u985E (Quantile)",
  equal: "\u7B49\u9593\u9694\u5206\u985E (Equal Interval)",
  jenks: "\u81EA\u7136\u5206\u985E (Jenks)",
  msd: "\u6A19\u6E96\u504F\u5DEE (Mean-Std Dev)",
  geometric: "\u5E7E\u4F55\u5B66\u7684\u5206\u985E (Geometric)",
  headtail: "\u30D8\u30C3\u30C9\u30C6\u30FC\u30EB\u5206\u985E (Head/Tail)",
  pretty: "\u304D\u308A\u306E\u3088\u3044\u5206\u985E (Pretty)",
  arithmetic: "\u7B49\u5DEE\u5206\u985E (Arithmetic)",
  nestedmeans: "\u5165\u308C\u5B50\u5E73\u5747 (Nested Means)",
  q6: "Q6\u5206\u985E (Q6)",
  custom: "\u30AB\u30B9\u30BF\u30E0 (Custom)"
};
var SEQUENTIAL_SCHEMES = [
  "Blues",
  "Greens",
  "Greys",
  "Oranges",
  "Purples",
  "Reds",
  "BuGn",
  "BuPu",
  "GnBu",
  "OrRd",
  "PuBu",
  "PuBuGn",
  "PuRd",
  "RdPu",
  "YlGn",
  "YlGnBu",
  "YlOrBr",
  "YlOrRd"
];
var DIVERGING_SCHEMES = [
  "BrBG",
  "PiYG",
  "PRGn",
  "PuOr",
  "RdBu",
  "RdGy",
  "RdYlBu",
  "RdYlGn",
  "Spectral"
];
var QUALITATIVE_SCHEMES = [
  "Accent",
  "Dark2",
  "Paired",
  "Pastel1",
  "Pastel2",
  "Set1",
  "Set2",
  "Set3",
  "Tableau10"
];
var DEFAULT_METHOD = "quantile";
var DEFAULT_NB_CLASSES = 5;
var DEFAULT_PALETTE = "Blues";
var DEFAULT_MISSING_COLOR = "#f5f5f5";
var DEFAULT_MISSING_TEXT = "No data";
function classify(data, options) {
  const cleanData = data.filter((d) => d !== void 0 && d !== null && !isNaN(+d) && d !== "");
  if (cleanData.length === 0) {
    return { breaks: [], innerBreaks: [], nClasses: 0 };
  }
  if (options.method === "custom") {
    return { breaks: [], innerBreaks: [], nClasses: 0 };
  }
  let nb = options.nb;
  if (options.method === "nestedmeans" && nb !== void 0) {
    const log2 = Math.log2(nb);
    nb = Math.pow(2, Math.round(log2));
    if (nb < 2) nb = 2;
  }
  const allBreaks = statsbreaks.breaks(cleanData, {
    method: options.method,
    nb,
    precision: options.precision,
    k: options.k,
    middle: options.middle,
    minmax: true
  });
  const innerBreaks = allBreaks.slice(1, -1);
  return {
    breaks: allBreaks,
    innerBreaks,
    nClasses: allBreaks.length - 1
  };
}
var METHODS = [
  "quantile",
  "q6",
  "equal",
  "jenks",
  "msd",
  "geometric",
  "headtail",
  "pretty",
  "arithmetic",
  "nestedmeans",
  "custom"
];
function colorToHex(c) {
  const parsed = d3Color.color(c);
  if (!parsed) return c;
  return parsed.formatHex();
}
function hexToRgb(hex) {
  const parsed = d3Color.color(hex);
  if (!parsed) return [0, 0, 0];
  const rgb = parsed.rgb();
  return [rgb.r, rgb.g, rgb.b];
}

// src/core/palettes.ts
function buildPaletteEntry(name, type) {
  const scheme = d3sc__namespace[`scheme${name}`];
  const interpolator = d3sc__namespace[`interpolate${name}`];
  let maxClasses;
  if (type === "qualitative" && Array.isArray(scheme)) {
    maxClasses = scheme.length;
  } else if (Array.isArray(scheme)) {
    maxClasses = scheme.length - 1;
  } else {
    maxClasses = 12;
  }
  return {
    name,
    type,
    maxClasses,
    colors: (n) => {
      const clamped = Math.max(1, Math.min(n, maxClasses));
      if (type === "qualitative" && Array.isArray(scheme)) {
        return scheme.slice(0, clamped).map(colorToHex);
      }
      if (Array.isArray(scheme) && scheme[clamped]) {
        return [...scheme[clamped]].map(colorToHex);
      }
      if (interpolator) {
        if (clamped === 1) return [colorToHex(interpolator(0.5))];
        return d3Array.range(clamped).map((i) => colorToHex(interpolator(i / (clamped - 1))));
      }
      return [];
    }
  };
}
var ALL_PALETTES = [
  ...SEQUENTIAL_SCHEMES.map((n) => buildPaletteEntry(n, "sequential")),
  ...DIVERGING_SCHEMES.map((n) => buildPaletteEntry(n, "diverging")),
  ...QUALITATIVE_SCHEMES.map((n) => buildPaletteEntry(n, "qualitative"))
];
function getPaletteByName(name) {
  return ALL_PALETTES.find((p) => p.name === name);
}
function getPalettesByType(type) {
  if (type === "all") return ALL_PALETTES;
  return ALL_PALETTES.filter((p) => p.type === type);
}
function formatNumber(n) {
  if (!Number.isFinite(n)) return String(n);
  const abs = Math.abs(n);
  if (abs === 0) return "0";
  if (abs < 1) return d3Format.format(".4~f")(n);
  if (abs < 1e3) return d3Format.format(".4~r")(n);
  if (abs < 1e4) return d3Format.format(",.2~f")(n);
  return d3Format.format(".4~s")(n);
}

// src/core/colorize.ts
function colorizeChoropleth(values, options = {}) {
  const method = options.method ?? DEFAULT_METHOD;
  const nClasses = options.nClasses ?? DEFAULT_NB_CLASSES;
  const missingColor = options.missingColor ?? DEFAULT_MISSING_COLOR;
  const missingText = options.missingText ?? DEFAULT_MISSING_TEXT;
  let allBreaks;
  if (options.breaks) {
    allBreaks = [...options.breaks].sort((a, b) => a - b);
  } else {
    const result = classify(values, {
      method,
      nb: nClasses,
      precision: options.precision,
      k: options.k,
      middle: options.middle
    });
    allBreaks = result.breaks;
  }
  let colors;
  if (options.colors) {
    colors = options.colors;
  } else {
    const paletteName = options.palette ?? DEFAULT_PALETTE;
    const entry = getPaletteByName(paletteName);
    colors = entry ? entry.colors(allBreaks.length - 1) : [];
  }
  if (options.reversed) {
    colors = [...colors].reverse();
  }
  const innerBreaks = allBreaks.slice(1, -1);
  const scale = d3Scale.scaleThreshold().domain(innerBreaks).range(colors).unknown(missingColor);
  const hasMissing = values.some((v) => v == null || v === "" || isNaN(+v));
  const missing = hasMissing ? [missingText, missingColor] : null;
  return {
    getColor: (value) => {
      if (value === "" || value == null || isNaN(+value)) {
        return missingColor;
      }
      return scale(+value);
    },
    breaks: allBreaks,
    colors,
    missing
  };
}
function breaksToLegend(breaks, colors) {
  if (breaks.length < 2 || colors.length === 0) return [];
  return colors.map((color2, i) => {
    const lower = i === 0 ? null : breaks[i];
    const upper = i === colors.length - 1 ? null : breaks[i + 1];
    let label;
    if (lower === null) {
      label = `< ${formatNumber(breaks[1])}`;
    } else if (upper === null) {
      label = `${formatNumber(breaks[i])} +`;
    } else {
      label = `${formatNumber(lower)} - ${formatNumber(upper)}`;
    }
    return { color: color2, label, range: [lower, upper] };
  });
}
function computeHistogram(values, numBins = 30) {
  const clean = values.filter((d) => d != null && !isNaN(d));
  if (clean.length === 0) return [];
  const bins = d3Array.bin().thresholds(numBins)(clean);
  return bins.map((b) => ({
    x0: b.x0 ?? 0,
    x1: b.x1 ?? 0,
    count: b.length
  }));
}
function getHistogramDomain(values) {
  const clean = values.filter((d) => d != null && !isNaN(d));
  const [min, max] = d3Array.extent(clean);
  const avg = d3Array.mean(clean) ?? 0;
  return { min: min ?? 0, max: max ?? 0, mean: avg };
}

exports.ALL_PALETTES = ALL_PALETTES;
exports.CLASSIFICATION_METHODS = CLASSIFICATION_METHODS;
exports.DEFAULT_METHOD = DEFAULT_METHOD;
exports.DEFAULT_MISSING_COLOR = DEFAULT_MISSING_COLOR;
exports.DEFAULT_MISSING_TEXT = DEFAULT_MISSING_TEXT;
exports.DEFAULT_NB_CLASSES = DEFAULT_NB_CLASSES;
exports.DEFAULT_PALETTE = DEFAULT_PALETTE;
exports.DIVERGING_SCHEMES = DIVERGING_SCHEMES;
exports.METHODS = METHODS;
exports.QUALITATIVE_SCHEMES = QUALITATIVE_SCHEMES;
exports.SEQUENTIAL_SCHEMES = SEQUENTIAL_SCHEMES;
exports.breaksToLegend = breaksToLegend;
exports.classify = classify;
exports.colorToHex = colorToHex;
exports.colorizeChoropleth = colorizeChoropleth;
exports.computeHistogram = computeHistogram;
exports.formatNumber = formatNumber;
exports.getHistogramDomain = getHistogramDomain;
exports.getPaletteByName = getPaletteByName;
exports.getPalettesByType = getPalettesByType;
exports.hexToRgb = hexToRgb;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map