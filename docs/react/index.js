import { breaks } from 'statsbreaks';
import * as d3sc from 'd3-scale-chromatic';
import { range, bin, extent, mean } from 'd3-array';
import { color } from 'd3-color';
import { scaleThreshold } from 'd3-scale';
import { format } from 'd3-format';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';

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
  const allBreaks = breaks(cleanData, {
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
  const parsed = color(c);
  if (!parsed) return c;
  return parsed.formatHex();
}
function hexToRgb(hex) {
  const parsed = color(hex);
  if (!parsed) return [0, 0, 0];
  const rgb = parsed.rgb();
  return [rgb.r, rgb.g, rgb.b];
}

// src/core/palettes.ts
function buildPaletteEntry(name, type) {
  const scheme = d3sc[`scheme${name}`];
  const interpolator = d3sc[`interpolate${name}`];
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
        return range(clamped).map((i) => colorToHex(interpolator(i / (clamped - 1))));
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
  if (abs < 1) return format(".4~f")(n);
  if (abs < 1e3) return format(".4~r")(n);
  if (abs < 1e4) return format(",.2~f")(n);
  return format(".4~s")(n);
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
  const scale = scaleThreshold().domain(innerBreaks).range(colors).unknown(missingColor);
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
  const bins = bin().thresholds(numBins)(clean);
  return bins.map((b) => ({
    x0: b.x0 ?? 0,
    x1: b.x1 ?? 0,
    count: b.length
  }));
}
function getHistogramDomain(values) {
  const clean = values.filter((d) => d != null && !isNaN(d));
  const [min, max] = extent(clean);
  const avg = mean(clean) ?? 0;
  return { min: min ?? 0, max: max ?? 0, mean: avg };
}
function useClassifier(options) {
  const { data, precision } = options;
  const [method, setMethodInternal] = useState(options.method ?? DEFAULT_METHOD);
  const [nClasses, setNClasses] = useState(options.nClasses ?? DEFAULT_NB_CLASSES);
  const [paletteName, setPalette] = useState(options.palette ?? DEFAULT_PALETTE);
  const [reversed, setReversed] = useState(options.reversed ?? false);
  const [isEditingCustomBreaks, setIsEditingCustomBreaks] = useState(false);
  const [customBreaks, setCustomBreaks] = useState(null);
  const [lastAutoMethod, setLastAutoMethod] = useState(
    (options.method ?? DEFAULT_METHOD) === "custom" ? DEFAULT_METHOD : options.method ?? DEFAULT_METHOD
  );
  const autoBreaks = useMemo(() => {
    if (!data || data.length === 0) return [];
    const m = method === "custom" ? lastAutoMethod : method;
    try {
      return classify(data, { method: m, nb: nClasses, precision }).breaks;
    } catch {
      return [];
    }
  }, [data, method, lastAutoMethod, nClasses, precision]);
  const classResult = useMemo(() => {
    if (!data || data.length === 0) return { breaks: [], innerBreaks: [], nClasses: 0 };
    if (method === "custom" && customBreaks) {
      return {
        breaks: customBreaks,
        innerBreaks: customBreaks.slice(1, -1),
        nClasses: customBreaks.length - 1
      };
    }
    if (customBreaks) {
      return {
        breaks: customBreaks,
        innerBreaks: customBreaks.slice(1, -1),
        nClasses: customBreaks.length - 1
      };
    }
    try {
      return classify(data, { method: method === "custom" ? lastAutoMethod : method, nb: nClasses, precision });
    } catch {
      return { breaks: [], innerBreaks: [], nClasses: 0 };
    }
  }, [data, method, lastAutoMethod, nClasses, precision, customBreaks]);
  const colors = useMemo(() => {
    if (classResult.nClasses === 0) return [];
    const entry = getPaletteByName(paletteName);
    const c = entry ? entry.colors(classResult.nClasses) : [];
    return reversed ? [...c].reverse() : c;
  }, [paletteName, classResult.nClasses, reversed]);
  const legend = useMemo(() => {
    return breaksToLegend(classResult.breaks, colors);
  }, [classResult.breaks, colors]);
  const histogram = useMemo(() => {
    if (!data || data.length === 0) return [];
    return computeHistogram(data, 30);
  }, [data]);
  const histogramDomain = useMemo(() => {
    if (!data || data.length === 0) return { min: 0, max: 0, mean: 0 };
    return getHistogramDomain(data);
  }, [data]);
  const setMethod = useCallback(
    (newMethod) => {
      if (newMethod === "custom") {
        const baseBreaks = classResult.breaks.length > 0 ? [...classResult.breaks] : autoBreaks.length > 0 ? [...autoBreaks] : null;
        setCustomBreaks(baseBreaks);
        setIsEditingCustomBreaks(true);
      } else {
        setLastAutoMethod(newMethod);
        setCustomBreaks(null);
        setIsEditingCustomBreaks(false);
      }
      setMethodInternal(newMethod);
    },
    [classResult.breaks, autoBreaks]
  );
  const startEditCustomBreaks = useCallback(() => {
    setCustomBreaks(classResult.breaks.length > 0 ? [...classResult.breaks] : null);
    setIsEditingCustomBreaks(true);
  }, [classResult.breaks]);
  const editBreakValue = useCallback(
    (index, value) => {
      if (!customBreaks) return;
      const newBreaks = [...customBreaks];
      if (index >= 0 && index < newBreaks.length) {
        newBreaks[index] = value;
      }
      newBreaks.sort((a, b) => a - b);
      setCustomBreaks(newBreaks);
    },
    [customBreaks]
  );
  const confirmCustomBreaks = useCallback(() => {
    setIsEditingCustomBreaks(false);
  }, []);
  const cancelCustomBreaks = useCallback(() => {
    if (method === "custom") {
      const baseBreaks = autoBreaks.length > 0 ? [...autoBreaks] : null;
      setCustomBreaks(baseBreaks);
      setIsEditingCustomBreaks(false);
    } else {
      setIsEditingCustomBreaks(false);
      setCustomBreaks(null);
    }
  }, [method, autoBreaks]);
  return {
    breaks: classResult.breaks,
    colors,
    legend,
    histogram,
    histogramDomain,
    method,
    nClasses,
    paletteName,
    reversed,
    setMethod,
    setNClasses,
    setPalette,
    setReversed,
    isEditingCustomBreaks,
    startEditCustomBreaks,
    editBreakValue,
    confirmCustomBreaks,
    cancelCustomBreaks
  };
}
function usePaletteUI(options = {}) {
  const [config, setConfigState] = useState({
    type: "all",
    steps: 5,
    reversed: false,
    ...options.initialConfig
  });
  const setConfig = useCallback((partial) => {
    setConfigState((prev) => ({ ...prev, ...partial }));
  }, []);
  return {
    config,
    setConfig
  };
}
function Dropdown({
  options,
  value,
  onChange,
  getLabel = (o) => String(o),
  getValue = (o) => String(o),
  disabled,
  placeholder
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return /* @__PURE__ */ jsxs("div", { ref, style: { position: "relative", width: "100%", minWidth: "80px" }, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "4px 8px",
          border: "1px solid var(--sb-border, #3a4552)",
          borderRadius: "var(--sb-radius, 4px)",
          backgroundColor: "var(--sb-input-bg, #29323c)",
          color: "var(--sb-text-primary, #a0a7b4)",
          fontSize: "var(--sb-font-size-sm, 11px)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1
        },
        onClick: () => !disabled && setIsOpen(!isOpen),
        disabled,
        children: [
          /* @__PURE__ */ jsx("span", { children: value ? getLabel(value) : placeholder || "Select..." }),
          /* @__PURE__ */ jsx("span", { style: { marginLeft: "4px" }, children: "\u25BE" })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsx(
      "ul",
      {
        style: {
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          zIndex: 100,
          maxHeight: "200px",
          overflowY: "auto",
          backgroundColor: "var(--sb-dropdown-bg, #3a4552)",
          border: "1px solid var(--sb-border, #3a4552)",
          borderRadius: "var(--sb-radius, 4px)",
          boxShadow: "var(--sb-dropdown-shadow, 0 4px 12px rgba(0,0,0,0.3))",
          margin: "2px 0 0 0",
          padding: 0,
          listStyle: "none"
        },
        children: options.map((option) => /* @__PURE__ */ jsx(
          "li",
          {
            style: {
              padding: "6px 8px",
              cursor: "pointer",
              fontSize: "var(--sb-font-size-sm, 11px)",
              color: "var(--sb-text-primary, #a0a7b4)",
              backgroundColor: getValue(option) === getValue(value) ? "var(--sb-bg-hover, #4a5668)" : "transparent"
            },
            onMouseEnter: (e) => {
              e.target.style.backgroundColor = "var(--sb-bg-hover, #4a5668)";
            },
            onMouseLeave: (e) => {
              if (getValue(option) !== getValue(value)) {
                e.target.style.backgroundColor = "transparent";
              }
            },
            onClick: () => {
              onChange(option);
              setIsOpen(false);
            },
            children: getLabel(option)
          },
          getValue(option)
        ))
      }
    )
  ] });
}
var MARGIN = { top: 18, bottom: 4, left: 10, right: 20 };
var HistogramChart = ({
  bins,
  legend,
  colors,
  breaks,
  width: widthProp,
  height = 80,
  domain
}) => {
  const containerRef = useRef(null);
  const [measuredWidth, setMeasuredWidth] = useState(widthProp ?? 210);
  useEffect(() => {
    if (widthProp !== void 0) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMeasuredWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    setMeasuredWidth(el.clientWidth);
    return () => observer.disconnect();
  }, [widthProp]);
  const width = widthProp ?? measuredWidth;
  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const { xScale, yScale, domainMin, domainMax } = useMemo(() => {
    if (!bins.length) {
      return {
        xScale: () => 0,
        yScale: () => innerHeight,
        domainMin: 0,
        domainMax: 0
      };
    }
    const min = domain ? domain.min : bins[0].x0;
    const max = domain ? domain.max : bins[bins.length - 1].x1;
    const maxCount = Math.max(...bins.map((b) => b.count), 1);
    const range3 = max - min || 1;
    return {
      xScale: (v) => (v - min) / range3 * innerWidth,
      yScale: (v) => innerHeight - v / maxCount * innerHeight,
      domainMin: min,
      domainMax: max
    };
  }, [bins, innerWidth, innerHeight, domain]);
  const displayColors = colors || legend?.map((e) => e.color) || [];
  const getColorForValue = (value) => {
    if (!breaks || breaks.length < 2 || displayColors.length === 0) {
      return "var(--sb-accent, #5b8ef4)";
    }
    const innerBreaks = breaks.slice(1, -1);
    for (let i = innerBreaks.length - 1; i >= 0; i--) {
      if (value >= innerBreaks[i]) return displayColors[i + 1] || displayColors[displayColors.length - 1];
    }
    return displayColors[0];
  };
  return /* @__PURE__ */ jsx("div", { ref: containerRef, style: { marginTop: "8px", width: "100%" }, children: /* @__PURE__ */ jsx("svg", { width, height, children: /* @__PURE__ */ jsxs("g", { transform: `translate(${MARGIN.left},${MARGIN.top})`, children: [
    bins.map((bin, i) => {
      const barX = xScale(bin.x0);
      const barWidth = Math.max(xScale(bin.x1) - barX, 1);
      const barHeight = innerHeight - yScale(bin.count);
      return /* @__PURE__ */ jsx(
        "rect",
        {
          x: barX,
          y: yScale(bin.count),
          width: barWidth,
          height: barHeight,
          fill: "var(--sb-bg-hover, #4a5668)",
          opacity: 0.4
        },
        `bg-${i}`
      );
    }),
    bins.map((bin, i) => {
      const barX = xScale(bin.x0);
      const barWidth = Math.max(xScale(bin.x1) - barX, 1);
      const barHeight = innerHeight - yScale(bin.count);
      const midPoint = (bin.x0 + bin.x1) / 2;
      return /* @__PURE__ */ jsx(
        "rect",
        {
          x: barX,
          y: yScale(bin.count),
          width: barWidth,
          height: barHeight,
          fill: getColorForValue(midPoint),
          opacity: 0.8
        },
        `fg-${i}`
      );
    }),
    breaks && breaks.length > 2 && breaks.slice(1, -1).map((brk, i) => {
      const x = xScale(brk);
      return /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx(
          "line",
          {
            x1: x,
            x2: x,
            y1: -4,
            y2: innerHeight,
            stroke: "#000",
            strokeWidth: 1,
            opacity: 0.6
          }
        ),
        /* @__PURE__ */ jsx(
          "text",
          {
            x,
            y: -6,
            textAnchor: "middle",
            fontSize: "7px",
            fill: "var(--sb-text-secondary, #6a7485)",
            children: brk % 1 === 0 ? brk : brk.toFixed(1)
          }
        )
      ] }, `brk-${i}`);
    })
  ] }) }) });
};
var METHOD_OPTIONS = Object.entries(CLASSIFICATION_METHODS).map(
  ([value, label]) => ({ label, value })
);
var MethodSelector = ({
  method,
  bins,
  breaks,
  legend,
  colors,
  histogramDomain,
  onSelectMethod,
  disabled
}) => {
  const selectedOption = useMemo(
    () => METHOD_OPTIONS.find((o) => o.value === method) || METHOD_OPTIONS[0],
    [method]
  );
  const handleSelect = useCallback(
    (option) => {
      onSelectMethod(option.value);
    },
    [onSelectMethod]
  );
  return /* @__PURE__ */ jsxs("div", { style: { fontFamily: "var(--sb-font-family)" }, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
          fontSize: "var(--sb-font-size-sm, 11px)",
          color: "var(--sb-text-primary, #a0a7b4)"
        },
        children: [
          /* @__PURE__ */ jsx("span", { children: "Method" }),
          /* @__PURE__ */ jsx("div", { style: { width: "80%" }, children: /* @__PURE__ */ jsx(
            Dropdown,
            {
              options: METHOD_OPTIONS,
              value: selectedOption,
              onChange: handleSelect,
              getLabel: (o) => o.label,
              getValue: (o) => o.value,
              disabled
            }
          ) })
        ]
      }
    ),
    bins && bins.length > 0 && /* @__PURE__ */ jsx(
      HistogramChart,
      {
        bins,
        legend,
        colors,
        breaks,
        domain: histogramDomain
      }
    )
  ] });
};
var PaletteStrip = ({
  colors,
  height = 10,
  isSelected = false,
  onClick
}) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      onClick,
      style: {
        display: "flex",
        height: `${height}px`,
        cursor: onClick ? "pointer" : "default",
        borderRadius: "2px",
        overflow: "hidden",
        outline: isSelected ? "2px solid var(--sb-accent, #5b8ef4)" : "none",
        outlineOffset: "1px"
      },
      children: colors.map((color2, i) => /* @__PURE__ */ jsx("div", { style: { flex: 1, backgroundColor: color2 } }, `${color2}-${i}`))
    }
  );
};
var Switch = ({ checked, onChange, label, disabled }) => {
  return /* @__PURE__ */ jsxs(
    "label",
    {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontSize: "var(--sb-font-size-md, 12px)",
        color: "var(--sb-text-primary, #a0a7b4)"
      },
      children: [
        label && /* @__PURE__ */ jsx("span", { children: label }),
        /* @__PURE__ */ jsx(
          "span",
          {
            onClick: (e) => {
              e.preventDefault();
              if (!disabled) onChange(!checked);
            },
            style: {
              position: "relative",
              display: "inline-block",
              width: "32px",
              height: "18px",
              borderRadius: "9px",
              backgroundColor: checked ? "var(--sb-switch-on, #5b8ef4)" : "var(--sb-switch-off, #6a7485)",
              transition: "background-color 0.2s"
            },
            children: /* @__PURE__ */ jsx(
              "span",
              {
                style: {
                  position: "absolute",
                  top: "2px",
                  left: checked ? "16px" : "2px",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  transition: "left 0.2s"
                }
              }
            )
          }
        )
      ]
    }
  );
};
var TYPE_OPTIONS = ["all", "sequential", "diverging", "qualitative"];
var STEP_OPTIONS = range(3, 10);
var PaletteSelector = ({
  selectedPalette,
  config,
  onSelectPalette,
  onConfigChange
}) => {
  const { type, steps, reversed } = config;
  const filteredPalettes = useMemo(() => {
    return getPalettesByType(type).filter((p) => p.maxClasses >= steps);
  }, [type, steps]);
  const configRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    fontSize: "var(--sb-font-size-sm, 11px)",
    color: "var(--sb-text-primary, #a0a7b4)"
  };
  return /* @__PURE__ */ jsxs("div", { style: { fontFamily: "var(--sb-font-family)", color: "var(--sb-text-primary, #a0a7b4)" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { padding: "12px 12px 0 12px" }, children: [
      /* @__PURE__ */ jsxs("div", { style: configRowStyle, children: [
        /* @__PURE__ */ jsx("span", { children: "Type" }),
        /* @__PURE__ */ jsx("div", { style: { width: "40%" }, children: /* @__PURE__ */ jsx(
          Dropdown,
          {
            options: [...TYPE_OPTIONS],
            value: type,
            onChange: (val) => onConfigChange({ type: val }),
            getLabel: (v) => v.charAt(0).toUpperCase() + v.slice(1),
            getValue: (v) => v
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: configRowStyle, children: [
        /* @__PURE__ */ jsx("span", { children: "Steps" }),
        /* @__PURE__ */ jsx("div", { style: { width: "40%" }, children: /* @__PURE__ */ jsx(
          Dropdown,
          {
            options: STEP_OPTIONS,
            value: steps,
            onChange: (val) => onConfigChange({ steps: val }),
            getLabel: (v) => String(v),
            getValue: (v) => String(v)
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: configRowStyle, children: [
        /* @__PURE__ */ jsx("span", { children: "Reversed" }),
        /* @__PURE__ */ jsx("div", { style: { width: "40%" }, children: /* @__PURE__ */ jsx(Switch, { checked: reversed, onChange: (val) => onConfigChange({ reversed: val }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { maxHeight: "200px", overflowY: "auto", padding: "0 8px 8px 8px" }, children: [
      filteredPalettes.map((palette) => {
        const paletteColors = reversed ? [...palette.colors(steps)].reverse() : palette.colors(steps);
        const isSelected = palette.name === selectedPalette;
        return /* @__PURE__ */ jsx(
          "div",
          {
            style: { padding: "4px 0", cursor: "pointer" },
            title: palette.name,
            children: /* @__PURE__ */ jsx(
              PaletteStrip,
              {
                colors: paletteColors,
                height: 12,
                isSelected,
                onClick: () => onSelectPalette(palette.name)
              }
            )
          },
          palette.name
        );
      }),
      filteredPalettes.length === 0 && /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            padding: "12px",
            textAlign: "center",
            fontSize: "11px",
            color: "var(--sb-text-secondary)"
          },
          children: "No matching palettes found"
        }
      )
    ] })
  ] });
};
var SwatchStyle = {
  width: "16px",
  height: "16px",
  borderRadius: "2px",
  marginRight: "8px",
  flexShrink: 0
};
var RowStyle = {
  display: "flex",
  alignItems: "center",
  padding: "3px 0",
  fontSize: "var(--sb-font-size-sm, 11px)",
  color: "var(--sb-text-primary, #a0a7b4)"
};
var ThresholdInput = ({ value, placeholder, disabled, onChange }) => {
  const [localValue, setLocalValue] = useState(
    value !== null && Number.isFinite(value) ? String(value) : ""
  );
  const inputRef = useRef(null);
  useEffect(() => {
    setLocalValue(value !== null && Number.isFinite(value) ? String(value) : "");
  }, [value]);
  const applyValue = useCallback(() => {
    const parsed = parseFloat(localValue);
    if (!isNaN(parsed) && Number.isFinite(parsed)) {
      onChange(parsed);
    }
  }, [localValue, onChange]);
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        applyValue();
        inputRef.current?.blur();
      }
    },
    [applyValue]
  );
  if (disabled) {
    return /* @__PURE__ */ jsx(
      "span",
      {
        style: {
          display: "inline-block",
          width: "60px",
          textAlign: "right",
          color: "var(--sb-text-secondary, #6a7485)",
          fontSize: "var(--sb-font-size-sm, 11px)"
        },
        children: placeholder || ""
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "input",
    {
      ref: inputRef,
      type: "text",
      value: localValue,
      onChange: (e) => setLocalValue(e.target.value),
      onBlur: applyValue,
      onKeyDown,
      style: {
        width: "60px",
        background: "var(--sb-bg-secondary, #3a4552)",
        color: "var(--sb-text-primary, #a0a7b4)",
        border: "1px solid var(--sb-border, #4a5668)",
        borderRadius: "3px",
        padding: "2px 4px",
        fontSize: "var(--sb-font-size-sm, 11px)",
        textAlign: "right",
        outline: "none"
      }
    }
  );
};
var BreaksLegend = ({
  legend,
  isEditing,
  onEdit,
  onEditValue,
  onConfirm,
  onCancel
}) => {
  if (!legend || legend.length === 0) return null;
  if (!isEditing) {
    return /* @__PURE__ */ jsxs("div", { style: { padding: "8px 12px 0 12px" }, children: [
      onEdit && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onEdit,
          style: {
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "none",
            border: "none",
            color: "var(--sb-accent, #5b8ef4)",
            cursor: "pointer",
            fontSize: "var(--sb-font-size-sm, 11px)",
            padding: "2px 0",
            marginBottom: "4px"
          },
          children: "Edit"
        }
      ),
      legend.map((item, index) => /* @__PURE__ */ jsxs("div", { style: RowStyle, children: [
        /* @__PURE__ */ jsx("div", { style: { ...SwatchStyle, backgroundColor: item.color } }),
        /* @__PURE__ */ jsx("span", { children: item.label })
      ] }, index))
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { style: { padding: "8px 12px 0 12px" }, children: [
    legend.map((item, index) => {
      const isFirst = index === 0;
      const isLast = index === legend.length - 1;
      return /* @__PURE__ */ jsxs("div", { style: { ...RowStyle, gap: "4px" }, children: [
        /* @__PURE__ */ jsx("div", { style: { ...SwatchStyle, backgroundColor: item.color } }),
        /* @__PURE__ */ jsx(
          ThresholdInput,
          {
            value: item.range[0],
            placeholder: isFirst ? "Less" : void 0,
            disabled: isFirst,
            onChange: (val) => onEditValue?.(index, val)
          }
        ),
        /* @__PURE__ */ jsx("span", { style: { color: "var(--sb-text-secondary, #6a7485)", padding: "0 2px" }, children: "\u2014" }),
        /* @__PURE__ */ jsx(
          ThresholdInput,
          {
            value: item.range[1],
            placeholder: isLast ? "More" : void 0,
            disabled: isLast,
            onChange: (val) => onEditValue?.(index, val)
          }
        )
      ] }, index);
    }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          gap: "8px",
          justifyContent: "flex-end",
          padding: "8px 0 4px",
          borderTop: "1px solid var(--sb-border, #3a4552)",
          marginTop: "6px"
        },
        children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onCancel,
              style: {
                background: "none",
                border: "none",
                color: "var(--sb-text-secondary, #6a7485)",
                cursor: "pointer",
                fontSize: "var(--sb-font-size-sm, 11px)",
                padding: "4px 8px"
              },
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onConfirm,
              style: {
                background: "var(--sb-accent, #5b8ef4)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: "var(--sb-font-size-sm, 11px)",
                padding: "4px 12px",
                borderRadius: "3px"
              },
              children: "Confirm"
            }
          )
        ]
      }
    )
  ] });
};
var ClassifierPanel = ({
  data,
  initialMethod = "quantile",
  initialNClasses = 5,
  initialPalette = "Blues",
  theme = "dark",
  onChange,
  className,
  style
}) => {
  const {
    breaks,
    colors,
    legend,
    histogram,
    histogramDomain,
    method,
    nClasses,
    paletteName,
    reversed,
    setMethod,
    setNClasses,
    setPalette,
    setReversed,
    isEditingCustomBreaks,
    startEditCustomBreaks,
    editBreakValue,
    confirmCustomBreaks,
    cancelCustomBreaks
  } = useClassifier({
    data,
    method: initialMethod,
    nClasses: initialNClasses,
    palette: initialPalette
  });
  const { config, setConfig } = usePaletteUI({
    initialConfig: { steps: initialNClasses }
  });
  useEffect(() => {
    onChange?.({ method, nClasses, breaks, colors, legend });
  }, [method, nClasses, breaks, colors, legend, onChange]);
  const handleConfigChange = useCallback(
    (partial) => {
      setConfig(partial);
      if (partial.steps !== void 0) setNClasses(partial.steps);
      if (partial.reversed !== void 0) setReversed(partial.reversed);
    },
    [setConfig, setNClasses, setReversed]
  );
  const handleSelectPalette = useCallback(
    (name) => {
      setPalette(name);
    },
    [setPalette]
  );
  const sectionStyle = {
    padding: "8px 12px",
    borderBottom: "1px solid var(--sb-border, #3a4552)"
  };
  const labelStyle = {
    fontSize: "var(--sb-font-size-sm, 11px)",
    color: "var(--sb-text-secondary, #6a7485)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "6px"
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className,
      "data-theme": theme,
      style: {
        backgroundColor: "var(--sb-bg-primary, #29323c)",
        borderRadius: "var(--sb-radius, 4px)",
        border: "1px solid var(--sb-border, #3a4552)",
        overflow: "hidden",
        fontFamily: "var(--sb-font-family)",
        ...style
      },
      children: [
        /* @__PURE__ */ jsxs("div", { style: sectionStyle, children: [
          /* @__PURE__ */ jsx("div", { style: labelStyle, children: "Classification" }),
          /* @__PURE__ */ jsx(
            MethodSelector,
            {
              method,
              bins: histogram,
              breaks,
              legend,
              colors,
              histogramDomain,
              onSelectMethod: setMethod
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { style: sectionStyle, children: [
          /* @__PURE__ */ jsx("div", { style: labelStyle, children: "Color Palette" }),
          /* @__PURE__ */ jsx(
            PaletteSelector,
            {
              selectedPalette: paletteName,
              config,
              onSelectPalette: handleSelectPalette,
              onConfigChange: handleConfigChange
            }
          )
        ] }),
        legend.length > 0 && /* @__PURE__ */ jsxs("div", { style: { padding: "8px 0" }, children: [
          /* @__PURE__ */ jsx("div", { style: { ...labelStyle, padding: "0 12px" }, children: "Legend" }),
          /* @__PURE__ */ jsx(
            BreaksLegend,
            {
              legend,
              isEditing: isEditingCustomBreaks,
              onEdit: method === "custom" ? startEditCustomBreaks : void 0,
              onEditValue: method === "custom" ? editBreakValue : void 0,
              onConfirm: method === "custom" ? confirmCustomBreaks : void 0,
              onCancel: method === "custom" ? cancelCustomBreaks : void 0
            }
          )
        ] })
      ]
    }
  );
};

export { ALL_PALETTES, BreaksLegend, CLASSIFICATION_METHODS, ClassifierPanel, DEFAULT_METHOD, DEFAULT_MISSING_COLOR, DEFAULT_MISSING_TEXT, DEFAULT_NB_CLASSES, DEFAULT_PALETTE, DIVERGING_SCHEMES, Dropdown, HistogramChart, METHODS, MethodSelector, PaletteSelector, PaletteStrip, QUALITATIVE_SCHEMES, SEQUENTIAL_SCHEMES, Switch, breaksToLegend, classify, colorToHex, colorizeChoropleth, computeHistogram, formatNumber, getHistogramDomain, getPaletteByName, getPalettesByType, hexToRgb, useClassifier, usePaletteUI };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map