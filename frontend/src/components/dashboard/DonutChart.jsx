import React, { useState, useEffect } from 'react';
import './DonutChart.css';

const COLORS = [
    'var(--donut-1)',
    'var(--donut-2)',
    'var(--donut-3)',
    'var(--donut-4)',
    'var(--donut-5)',
    'var(--donut-6)',
];

const DonutChart = ({ data = [], size = 200 }) => {
    const [animated, setAnimated] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 200);
        return () => clearTimeout(timer);
    }, []);

    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

    const cx = size / 2;
    const cy = size / 2;
    const outerR = (size / 2) - 10;
    const innerR = outerR * 0.62;
    const circumference = 2 * Math.PI * ((outerR + innerR) / 2);

    // Build segments
    let cumAngle = -90; // start from top
    const segments = data.map((d, i) => {
        const pct = d.value / total;
        const angle = pct * 360;
        const startAngle = cumAngle;
        cumAngle += angle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = ((startAngle + angle) * Math.PI) / 180;

        const x1Outer = cx + outerR * Math.cos(startRad);
        const y1Outer = cy + outerR * Math.sin(startRad);
        const x2Outer = cx + outerR * Math.cos(endRad);
        const y2Outer = cy + outerR * Math.sin(endRad);
        const x1Inner = cx + innerR * Math.cos(endRad);
        const y1Inner = cy + innerR * Math.sin(endRad);
        const x2Inner = cx + innerR * Math.cos(startRad);
        const y2Inner = cy + innerR * Math.sin(startRad);

        const largeArc = angle > 180 ? 1 : 0;

        const path = [
            `M ${x1Outer} ${y1Outer}`,
            `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
            `L ${x1Inner} ${y1Inner}`,
            `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}`,
            'Z'
        ].join(' ');

        return { ...d, path, pct, color: COLORS[i % COLORS.length], index: i };
    });

    const activeItem = activeIndex !== null ? data[activeIndex] : null;

    return (
        <div className="donut-chart">
            <div className="donut-chart__visual">
                <svg
                    viewBox={`0 0 ${size} ${size}`}
                    className={`donut-chart__svg ${animated ? 'animated' : ''}`}
                    width={size}
                    height={size}
                >
                    {segments.map((seg, i) => (
                        <path
                            key={i}
                            d={seg.path}
                            fill={seg.color}
                            opacity={activeIndex === null || activeIndex === i ? 1 : 0.3}
                            className="donut-chart__segment"
                            onMouseEnter={() => setActiveIndex(i)}
                            onMouseLeave={() => setActiveIndex(null)}
                        />
                    ))}
                </svg>

                <div className="donut-chart__center">
                    {activeItem ? (
                        <>
                            <span className="donut-chart__center-label">{activeItem.name}</span>
                            <span className="donut-chart__center-value">
                                ₹{activeItem.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="donut-chart__center-label">Total</span>
                            <span className="donut-chart__center-value">
                                ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="donut-chart__legend">
                {segments.map((seg, i) => (
                    <div
                        key={i}
                        className={`donut-chart__legend-item ${activeIndex === i ? 'active' : ''}`}
                        onMouseEnter={() => setActiveIndex(i)}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        <span className="donut-chart__legend-dot" style={{ background: seg.color }} />
                        <span className="donut-chart__legend-name">{seg.name}</span>
                        <span className="donut-chart__legend-pct">{(seg.pct * 100).toFixed(0)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonutChart;
