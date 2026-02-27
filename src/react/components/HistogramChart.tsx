import React, {useMemo, useRef, useState, useEffect} from 'react';
import type {Bin, BreakLegendEntry, HexColor} from '../../core/types';

const MARGIN = {top: 18, bottom: 4, left: 10, right: 20};

export type HistogramChartProps = {
  bins: Bin[];
  legend?: BreakLegendEntry[];
  colors?: HexColor[];
  breaks?: number[];
  width?: number;
  height?: number;
  domain?: {min: number; max: number; mean?: number};
};

export const HistogramChart: React.FC<HistogramChartProps> = ({
  bins,
  legend,
  colors,
  breaks,
  width: widthProp,
  height = 80,
  domain,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(widthProp ?? 210);

  useEffect(() => {
    if (widthProp !== undefined) return;
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

  const {xScale, yScale, domainMin, domainMax} = useMemo(() => {
    if (!bins.length) {
      return {
        xScale: () => 0,
        yScale: () => innerHeight,
        domainMin: 0,
        domainMax: 0,
      };
    }
    const min = domain ? domain.min : bins[0].x0;
    const max = domain ? domain.max : bins[bins.length - 1].x1;
    const maxCount = Math.max(...bins.map((b) => b.count), 1);
    const range = max - min || 1;

    return {
      xScale: (v: number) => ((v - min) / range) * innerWidth,
      yScale: (v: number) => innerHeight - (v / maxCount) * innerHeight,
      domainMin: min,
      domainMax: max,
    };
  }, [bins, innerWidth, innerHeight, domain]);

  const displayColors = colors || legend?.map((e) => e.color) || [];

  const getColorForValue = (value: number): string => {
    if (!breaks || breaks.length < 2 || displayColors.length === 0) {
      return 'var(--sb-accent, #5b8ef4)';
    }
    const innerBreaks = breaks.slice(1, -1);
    for (let i = innerBreaks.length - 1; i >= 0; i--) {
      if (value >= innerBreaks[i]) return displayColors[i + 1] || displayColors[displayColors.length - 1];
    }
    return displayColors[0];
  };

  return (
    <div ref={containerRef} style={{marginTop: '8px', width: '100%'}}>
      <svg width={width} height={height}>
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {bins.map((bin, i) => {
            const barX = xScale(bin.x0);
            const barWidth = Math.max(xScale(bin.x1) - barX, 1);
            const barHeight = innerHeight - yScale(bin.count);
            return (
              <rect
                key={`bg-${i}`}
                x={barX}
                y={yScale(bin.count)}
                width={barWidth}
                height={barHeight}
                fill="var(--sb-bg-hover, #4a5668)"
                opacity={0.4}
              />
            );
          })}
          {bins.map((bin, i) => {
            const barX = xScale(bin.x0);
            const barWidth = Math.max(xScale(bin.x1) - barX, 1);
            const barHeight = innerHeight - yScale(bin.count);
            const midPoint = (bin.x0 + bin.x1) / 2;
            return (
              <rect
                key={`fg-${i}`}
                x={barX}
                y={yScale(bin.count)}
                width={barWidth}
                height={barHeight}
                fill={getColorForValue(midPoint)}
                opacity={0.8}
              />
            );
          })}
          {breaks && breaks.length > 2 &&
            breaks.slice(1, -1).map((brk, i) => {
              const x = xScale(brk);
              return (
                <g key={`brk-${i}`}>
                  <line
                    x1={x}
                    x2={x}
                    y1={-4}
                    y2={innerHeight}
                    stroke="#000"
                    strokeWidth={1}
                    opacity={0.6}
                  />
                  <text
                    x={x}
                    y={-6}
                    textAnchor="middle"
                    fontSize="7px"
                    fill="var(--sb-text-secondary, #6a7485)"
                  >
                    {brk % 1 === 0 ? brk : brk.toFixed(1)}
                  </text>
                </g>
              );
            })}
        </g>
      </svg>
    </div>
  );
};
