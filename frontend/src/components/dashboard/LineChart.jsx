import React, { useState, useRef, useEffect } from 'react';
import './LineChart.css';

const LineChart = ({ data = [], width = 700, height = 320 }) => {
    const svgRef = useRef(null);
    const [tooltip, setTooltip] = useState(null);
    const [animated, setAnimated] = useState(false);

    const padding = { top: 30, right: 30, bottom: 50, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!data || data.length === 0) {
        return (
            <div className="line-chart__empty">
                <p>No monthly data available yet.</p>
            </div>
        );
    }

    const allValues = data.flatMap(d => [d.income || 0, d.expenses || 0]);
    const maxVal = Math.max(...allValues, 1);
    const minVal = 0;
    const range = maxVal - minVal || 1;

    const xScale = (i) => padding.left + (i / (data.length - 1 || 1)) * chartW;
    const yScale = (v) => padding.top + chartH - ((v - minVal) / range) * chartH;

    // Generate smooth cubic bezier path
    const makePath = (key) => {
        const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d[key] || 0) }));
        if (points.length < 2) return `M ${points[0].x} ${points[0].y}`;

        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
            const cpx2 = prev.x + (curr.x - prev.x) * 0.6;
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
        return { y: yScale(val), label: `₹${Math.round(val).toLocaleString('en-IN')}` };
    });

    // Path length for animation
    const pathLength = chartW * 2;

    const handleMouseMove = (e) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const scaleX = width / rect.width;
        const scaledX = mouseX * scaleX;

        // Find closest data point
        let closest = 0;
        let minDist = Infinity;
        data.forEach((_, i) => {
            const dist = Math.abs(xScale(i) - scaledX);
            if (dist < minDist) {
                minDist = dist;
                closest = i;
            }
        });

        if (minDist < chartW / data.length) {
            setTooltip({
                index: closest,
                x: xScale(closest),
                income: data[closest].income || 0,
                expenses: data[closest].expenses || 0,
                month: data[closest].month || ''
            });
        } else {
            setTooltip(null);
        }
    };

    return (
        <div className="line-chart">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                className="line-chart__svg"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setTooltip(null)}
            >
                {/* Grid lines */}
                {gridLines.map((line, i) => (
                    <g key={i}>
                        <line
                            x1={padding.left}
                            x2={width - padding.right}
                            y1={line.y}
                            y2={line.y}
                            stroke="var(--chart-grid)"
                            strokeWidth="1"
                        />
                        <text
                            x={padding.left - 10}
                            y={line.y + 4}
                            textAnchor="end"
                            fill="var(--text-muted)"
                            fontSize="11"
                            fontWeight="500"
                        >
                            {line.label}
                        </text>
                    </g>
                ))}

                {/* Month labels */}
                {data.map((d, i) => (
                    <text
                        key={i}
                        x={xScale(i)}
                        y={height - 12}
                        textAnchor="middle"
                        fill="var(--text-muted)"
                        fontSize="12"
                        fontWeight={tooltip && tooltip.index === i ? '700' : '500'}
                    >
                        {d.month || ''}
                    </text>
                ))}

                {/* Area fills */}
                <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-income)" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="var(--chart-income)" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-expense)" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="var(--chart-expense)" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Income area */}
                <path
                    d={`${incomePath} L ${xScale(data.length - 1)} ${padding.top + chartH} L ${xScale(0)} ${padding.top + chartH} Z`}
                    fill="url(#incomeGrad)"
                    opacity={animated ? 1 : 0}
                    style={{ transition: 'opacity 0.8s ease' }}
                />

                {/* Expense area */}
                <path
                    d={`${expensePath} L ${xScale(data.length - 1)} ${padding.top + chartH} L ${xScale(0)} ${padding.top + chartH} Z`}
                    fill="url(#expenseGrad)"
                    opacity={animated ? 1 : 0}
                    style={{ transition: 'opacity 0.8s ease 0.2s' }}
                />

                {/* Income line */}
                <path
                    d={incomePath}
                    fill="none"
                    stroke="var(--chart-income)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={pathLength}
                    strokeDashoffset={animated ? 0 : pathLength}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />

                {/* Expense line */}
                <path
                    d={expensePath}
                    fill="none"
                    stroke="var(--chart-expense)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={pathLength}
                    strokeDashoffset={animated ? 0 : pathLength}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.15s' }}
                />

                {/* Data dots */}
                {animated && data.map((d, i) => (
                    <g key={`dots-${i}`}>
                        <circle
                            cx={xScale(i)}
                            cy={yScale(d.income || 0)}
                            r={tooltip && tooltip.index === i ? 5 : 3}
                            fill="var(--chart-income)"
                            stroke="#fff"
                            strokeWidth="2"
                            style={{ transition: 'r 0.2s ease' }}
                        />
                        <circle
                            cx={xScale(i)}
                            cy={yScale(d.expenses || 0)}
                            r={tooltip && tooltip.index === i ? 5 : 3}
                            fill="var(--chart-expense)"
                            stroke="#fff"
                            strokeWidth="2"
                            style={{ transition: 'r 0.2s ease' }}
                        />
                    </g>
                ))}

                {/* Tooltip line */}
                {tooltip && (
                    <line
                        x1={tooltip.x}
                        x2={tooltip.x}
                        y1={padding.top}
                        y2={padding.top + chartH}
                        stroke="var(--border-standard)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                )}
            </svg>

            {/* Tooltip overlay */}
            {tooltip && (
                <div
                    className="line-chart__tooltip"
                    style={{
                        left: `${(tooltip.x / width) * 100}%`,
                        top: '20px'
                    }}
                >
                    <div className="line-chart__tooltip-month">{tooltip.month}</div>
                    <div className="line-chart__tooltip-row">
                        <span className="line-chart__tooltip-dot" style={{ background: 'var(--chart-income)' }} />
                        ₹{tooltip.income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="line-chart__tooltip-row">
                        <span className="line-chart__tooltip-dot" style={{ background: 'var(--chart-expense)' }} />
                        ₹{tooltip.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LineChart;
