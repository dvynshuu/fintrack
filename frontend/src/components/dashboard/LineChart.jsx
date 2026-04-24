import React, { useState, useRef, useEffect, useMemo } from 'react';
import './LineChart.css';

const LineChart = ({ data = [], height: initialHeight = 350 }) => {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: initialHeight });
    const [tooltip, setTooltip] = useState(null);
    const [animated, setAnimated] = useState(false);

    // Responsive measurement
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            if (!entries || entries.length === 0) return;
            const { width } = entries[0].contentRect;
            setDimensions(prev => ({ ...prev, width }));
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 150);
        return () => clearTimeout(timer);
    }, []);

    const padding = useMemo(() => ({ 
        top: 40, 
        right: 40, 
        bottom: 50, 
        left: 75 
    }), []);

    const { width, height } = dimensions;
    const chartW = Math.max(0, width - padding.left - padding.right);
    const chartH = Math.max(0, height - padding.top - padding.bottom);

    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data.map(d => {
            let label = d.month || '';
            if (label.includes('-')) {
                const [year, month] = label.split('-');
                const date = new Date(year, month - 1);
                label = date.toLocaleString('default', { month: 'short' });
            }
            return { ...d, label };
        });
    }, [data]);

    if (!processedData || processedData.length === 0) {
        return (
            <div className="line-chart__empty">
                <p>No monthly data available yet.</p>
            </div>
        );
    }

    const allValues = processedData.flatMap(d => [d.income || 0, d.expenses || 0]);
    const maxVal = Math.max(...allValues, 100); // Minimum max of 100
    const minVal = 0;
    const range = maxVal - minVal || 1;

    const xScale = (i) => padding.left + (i / (processedData.length - 1 || 1)) * chartW;
    const yScale = (v) => padding.top + chartH - ((v - minVal) / range) * chartH;

    // Generate smooth cubic bezier path
    const makePath = (key) => {
        const points = processedData.map((d, i) => ({ x: xScale(i), y: yScale(d[key] || 0) }));
        if (points.length < 2) return points.length === 1 ? `M ${points[0].x} ${points[0].y}` : '';

        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx1 = prev.x + (curr.x - prev.x) * 0.45;
            const cpx2 = prev.x + (curr.x - prev.x) * 0.55;
            path += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
        }
        return path;
    };

    const incomePath = makePath('income');
    const expensePath = makePath('expenses');

    // Grid lines
    const gridCount = 5;
    const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
        const val = minVal + (range / gridCount) * i;
        return { 
            y: yScale(val), 
            label: val >= 1000 ? `₹${(val / 1000).toFixed(1)}k` : `₹${Math.round(val)}` 
        };
    });

    const handleMouseMove = (e) => {
        const svg = svgRef.current;
        if (!svg || !width) return;
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        // Find closest data point
        let closest = 0;
        let minDist = Infinity;
        processedData.forEach((_, i) => {
            const dist = Math.abs(xScale(i) - mouseX);
            if (dist < minDist) {
                minDist = dist;
                closest = i;
            }
        });

        if (minDist < (chartW / (processedData.length || 1)) * 0.6) {
            setTooltip({
                index: closest,
                x: xScale(closest),
                yIncome: yScale(processedData[closest].income || 0),
                yExpense: yScale(processedData[closest].expenses || 0),
                income: processedData[closest].income || 0,
                expenses: processedData[closest].expenses || 0,
                label: processedData[closest].label || ''
            });
        } else {
            setTooltip(null);
        }
    };

    return (
        <div className="line-chart" ref={containerRef} style={{ height: initialHeight }}>
            {width > 0 && (
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${width} ${height}`}
                    className="line-chart__svg"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setTooltip(null)}
                >
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        
                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--chart-income)" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="var(--chart-income)" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--chart-expense)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--chart-expense)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {gridLines.map((line, i) => (
                        <g key={i} className="line-chart__grid-group">
                            <line
                                x1={padding.left}
                                x2={width - padding.right}
                                y1={line.y}
                                y2={line.y}
                                stroke="var(--chart-grid)"
                                strokeWidth="1"
                                strokeDasharray={i === 0 ? "0" : "4 4"}
                                opacity={i === 0 ? 1 : 0.5}
                            />
                            <text
                                x={padding.left - 15}
                                y={line.y + 4}
                                textAnchor="end"
                                fill="var(--text-muted)"
                                fontSize="11"
                                fontWeight="600"
                                className="line-chart__axis-label"
                            >
                                {line.label}
                            </text>
                        </g>
                    ))}

                    {/* X-Axis Month labels */}
                    {processedData.map((d, i) => (
                        <text
                            key={i}
                            x={xScale(i)}
                            y={height - 15}
                            textAnchor="middle"
                            fill={tooltip && tooltip.index === i ? 'var(--text-main)' : 'var(--text-muted)'}
                            fontSize="12"
                            fontWeight={tooltip && tooltip.index === i ? '700' : '500'}
                            style={{ transition: 'fill 0.2s, font-weight 0.2s' }}
                        >
                            {d.label}
                        </text>
                    ))}

                    {/* Area fills */}
                    {animated && (
                        <>
                            <path
                                d={`${incomePath} L ${xScale(processedData.length - 1)} ${padding.top + chartH} L ${xScale(0)} ${padding.top + chartH} Z`}
                                fill="url(#incomeGrad)"
                                className="line-chart__area"
                            />
                            <path
                                d={`${expensePath} L ${xScale(processedData.length - 1)} ${padding.top + chartH} L ${xScale(0)} ${padding.top + chartH} Z`}
                                fill="url(#expenseGrad)"
                                className="line-chart__area"
                                style={{ animationDelay: '0.2s' }}
                            />
                        </>
                    )}

                    {/* Income line */}
                    <path
                        d={incomePath}
                        fill="none"
                        stroke="var(--chart-income)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`line-chart__line ${animated ? 'animate' : ''}`}
                        filter="url(#glow)"
                    />

                    {/* Expense line */}
                    <path
                        d={expensePath}
                        fill="none"
                        stroke="var(--chart-expense)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`line-chart__line line-chart__line--expense ${animated ? 'animate' : ''}`}
                        filter="url(#glow)"
                    />

                    {/* Data points */}
                    {animated && processedData.map((d, i) => (
                        <g key={`dots-${i}`} className="line-chart__dots">
                            <circle
                                cx={xScale(i)}
                                cy={yScale(d.income || 0)}
                                r={tooltip && tooltip.index === i ? 6 : 4}
                                fill="var(--chart-income)"
                                stroke="var(--card-surface)"
                                strokeWidth="2.5"
                                style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            />
                            <circle
                                cx={xScale(i)}
                                cy={yScale(d.expenses || 0)}
                                r={tooltip && tooltip.index === i ? 6 : 4}
                                fill="var(--chart-expense)"
                                stroke="var(--card-surface)"
                                strokeWidth="2.5"
                                style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            />
                        </g>
                    ))}

                    {/* Active state Vertical Line */}
                    {tooltip && (
                        <line
                            x1={tooltip.x}
                            x2={tooltip.x}
                            y1={padding.top}
                            y2={padding.top + chartH}
                            stroke="var(--text-muted)"
                            strokeWidth="1.5"
                            strokeDasharray="5 5"
                            opacity="0.4"
                        />
                    )}
                </svg>
            )}

            {/* Premium Tooltip */}
            {tooltip && (
                <div
                    className="line-chart__tooltip"
                    style={{
                        left: tooltip.x,
                        top: Math.min(tooltip.yIncome, tooltip.yExpense) - 10,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <div className="line-chart__tooltip-header">
                        <span className="line-chart__tooltip-month">{tooltip.label}</span>
                    </div>
                    <div className="line-chart__tooltip-body">
                        <div className="line-chart__tooltip-row">
                            <div className="line-chart__tooltip-indicator" style={{ background: 'var(--chart-income)' }} />
                            <span className="line-chart__tooltip-label">Income</span>
                            <span className="line-chart__tooltip-value">₹{tooltip.income.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="line-chart__tooltip-row">
                            <div className="line-chart__tooltip-indicator" style={{ background: 'var(--chart-expense)' }} />
                            <span className="line-chart__tooltip-label">Expenses</span>
                            <span className="line-chart__tooltip-value">₹{tooltip.expenses.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                    <div className="line-chart__tooltip-arrow" />
                </div>
            )}
        </div>
    );
};

export default LineChart;
