import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '../../contexts/ThemeContext';
import './EChart.css';

const EChart = ({
  option,
  height = 360,
  className = '',
  emptyMessage = 'No transactions recorded for this period yet. Add an expense or upload a statement to see your spending trends!',
  emptyContent = null,
  hasData = true,
  tableFallback = null
}) => {
  const { theme } = useTheme();
  const echartsRef = useRef(null);
  const [showTableFallback, setShowTableFallback] = useState(false);

  // Dynamically update ECharts theme tokens
  const isDark = theme === 'dark';
  const textColor = isDark ? '#9CA3AF' : '#475569';
  const textPrimary = isDark ? '#F3F4F6' : '#0F172A';
  const splitLineColor = isDark ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0';
  const tooltipBg = isDark ? '#11161B' : '#FFFFFF';
  const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : '#CBD5E1';

  const mergedOption = {
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: 'Inter, -apple-system, sans-serif'
    },
    tooltip: {
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: textPrimary,
        fontSize: 12
      },
      padding: [10, 14],
      extraCssText: 'border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); font-variant-numeric: tabular-nums;',
      ...option?.tooltip
    },
    grid: {
      top: 35,
      right: 20,
      bottom: 40,
      left: 60,
      containLabel: true,
      ...option?.grid
    },
    xAxis: Array.isArray(option?.xAxis)
      ? option.xAxis.map(x => ({
          axisLine: { lineStyle: { color: splitLineColor } },
          axisLabel: { color: textColor, fontSize: 11, margin: 12 },
          splitLine: { show: false },
          ...x
        }))
      : {
          axisLine: { lineStyle: { color: splitLineColor } },
          axisLabel: { color: textColor, fontSize: 11, margin: 12 },
          splitLine: { show: false },
          ...option?.xAxis
        },
    yAxis: Array.isArray(option?.yAxis)
      ? option.yAxis.map(y => ({
          axisLine: { show: false },
          axisLabel: { color: textColor, fontSize: 11, fontVariantNumeric: 'tabular-nums' },
          splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } },
          ...y
        }))
      : {
          axisLine: { show: false },
          axisLabel: { color: textColor, fontSize: 11, fontVariantNumeric: 'tabular-nums' },
          splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } },
          ...option?.yAxis
        },
    ...option
  };

  useEffect(() => {
    if (echartsRef.current) {
      const chart = echartsRef.current.getEchartsInstance();
      chart.resize();
    }
  }, [theme, height]);

  if (!hasData) {
    return (
      <div className={`echart-empty-container ${className}`} style={{ height }}>
        {emptyContent ? (
          emptyContent
        ) : (
          <p className="echart-empty-text">{emptyMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`echart-wrapper ${className}`}>
      {tableFallback && (
        <div className="echart-accessibility-toggle">
          <button
            type="button"
            className="echart-view-table-btn"
            onClick={() => setShowTableFallback(!showTableFallback)}
            aria-label="Toggle accessible tabular view"
          >
            {showTableFallback ? 'Show Chart Visualizer' : 'View Tabular Data'}
          </button>
        </div>
      )}

      {showTableFallback && tableFallback ? (
        <div className="echart-table-fallback" style={{ minHeight: height }}>
          {tableFallback}
        </div>
      ) : (
        <ReactECharts
          ref={echartsRef}
          option={mergedOption}
          style={{ height, width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
        />
      )}
    </div>
  );
};

export default EChart;
