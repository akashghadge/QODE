import React, { useRef, useMemo } from 'react';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Area,
} from 'recharts';
import { format } from 'date-fns';
import { useData } from '../context/DataContext';
import { ReferenceLine } from 'recharts'; // add this to your imports at top

/**
 * ChartExporter
 * - shows a single chart with:
 *   - equity line (portfolio)
 *   - optional benchmark line
 *   - drawdown area (negative values) plotted on secondary Y axis (percent)
 *
 * Exports the whole chart node as PNG.
 */
export default function ChartExporter({ height = 420 }) {
    const { equitySeries = [], drawdownSeries = [], benchmarkSeries = [] } = useData();
    const nodeRef = useRef(null);

    // Merge series into unified chartData by date string (yyyy-MM-dd)
    const chartData = useMemo(() => {
        // helper to format date to 'YYYY-MM-DD'
        const toKey = (d) => {
            const dt = d instanceof Date ? d : new Date(d);
            return dt.toISOString().slice(0, 10);
        };

        const map = new Map();

        (equitySeries || []).forEach((p) => {
            const key = toKey(p.date);
            map.set(key, { date: key, equity: Number(p.equity) });
        });

        (benchmarkSeries || []).forEach((p) => {
            const key = toKey(p.date);
            const prev = map.get(key) || { date: key };
            prev.benchmark = Number(p.equity ?? p.nav ?? p.value ?? 0);
            map.set(key, prev);
        });

        (drawdownSeries || []).forEach((p) => {
            const key = toKey(p.date);
            const prev = map.get(key) || { date: key };
            // drawdownSeries drawdown is in decimal (e.g. -0.12). convert to percent
            prev.drawdownPct = Number((p.drawdown * 100).toFixed(2));
            map.set(key, prev);
        });

        // convert map ordered by date ascending
        const arr = Array.from(map.values()).sort((a, b) => (a.date > b.date ? 1 : -1));
        return arr;
    }, [equitySeries, drawdownSeries, benchmarkSeries]);

    // compute drawdown domain for right Y axis (minNegative to 0)
    const drawdownDomain = useMemo(() => {
        if (!chartData || !chartData.length) return [-40, 0];
        const min = Math.min(...chartData.map(d => (d.drawdownPct ?? 0)));
        // round down to nearest 5 for nicer ticks
        const floored = Math.floor(min / 5) * 5;
        return [floored, 0];
    }, [chartData]);

    // Export PNG of chart node
    const exportPNG = async () => {
        const node = nodeRef.current;
        if (!node) return alert('Chart is not ready');
        try {
            const dataUrl = await htmlToImage.toPng(node, {
                pixelRatio: 2,
                backgroundColor: '#ffffff'
            });
            download(dataUrl, 'equity-chart.png', 'image/png');
        } catch (err) {
            console.error('Export failed', err);
            alert('Export failed — check console.');
        }
    };

    // Tooltip label formatter
    const tooltipLabel = (label) => {
        try {
            const d = new Date(label);
            return format(d, 'MMM dd, yyyy');
        } catch {
            return label;
        }
    };

    // Tooltip value formatter
    const tooltipFormatter = (value, name) => {
        if (name === 'drawdownPct') return [`${value}%`, 'Drawdown'];
        if (name === 'equity') return [Number(value).toFixed(2), 'Equity'];
        if (name === 'benchmark') return [Number(value).toFixed(2), 'Benchmark'];
        return [value, name];
    };
    useMemo(() => {
        // debug: log summary of drawdown values (only runs when chartData changes)
        if (!chartData || !chartData.length) {
            console.info('chartData empty');
            return;
        }
        const drawVals = chartData.map(d => d.drawdownPct);
        const numericCount = drawVals.filter(v => typeof v === 'number' && !Number.isNaN(v)).length;
        const nonZeroCount = drawVals.filter(v => typeof v === 'number' && Math.abs(v) > 1e-6).length;
        const min = Math.min(...drawVals.map(v => (typeof v === 'number' && !Number.isNaN(v) ? v : Infinity)));
        const max = Math.max(...drawVals.map(v => (typeof v === 'number' && !Number.isNaN(v) ? v : -Infinity)));
        console.group('ChartExporter debug');
        console.log('rows:', chartData.length);
        console.log('numeric drawdown count:', numericCount);
        console.log('non-zero drawdown count:', nonZeroCount);
        console.log('drawdown min, max:', min, max);
        console.table(chartData.slice(0, 10));
        console.groupEnd();
    }, [chartData]);

    // inside component: compute chartDataPct (useMemo or inline)
    const chartDataPct = useMemo(() => {
        if (!chartData || !chartData.length) return [];
        // find first equity (for base)
        const firstEquity = chartData.find(d => d.equity !== undefined && d.equity !== null)?.equity ?? 1;
        return chartData.map(d => ({
            ...d,
            // equity index in percent (base 100)
            equityPct: d.equity == null ? null : (Number(d.equity) / Number(firstEquity)) * 100,
            // keep drawdownPct as-is (already percent like -3.21)
            drawdownPct: d.drawdownPct == null ? null : Number(d.drawdownPct)
        }));
    }, [chartData]);

    // compute domain for percent axis so it includes 0 and rounds nicely
    useMemo(() => {
        if (!chartDataPct || !chartDataPct.length) {
            console.info('chartDataPct empty');
            return;
        }
        const eqVals = chartDataPct.map(d => d.equityPct).filter(v => typeof v === 'number' && isFinite(v));
        const ddVals = chartDataPct.map(d => d.drawdownPct).filter(v => typeof v === 'number' && isFinite(v));
        console.group('ChartExporter DRAWDOWN DEBUG');
        console.log('rows:', chartDataPct.length);
        console.log('equityPct min/max:', Math.min(...eqVals), Math.max(...eqVals));
        console.log('drawdownPct min/max:', ddVals.length ? Math.min(...ddVals) : 'none', ddVals.length ? Math.max(...ddVals) : 'none');
        console.log('drawdown sample:', chartDataPct.slice(0, 10).map(r => ({ date: r.date, drawdownPct: r.drawdownPct })));
        console.groupEnd();
    }, [chartDataPct]);
    // Chart (single left axis)
    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataPct} margin={{ top: 16, right: 12, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(d) => d} minTickGap={30} />

                    {/* single left axis covering + and - */}
                    <YAxis
                        yAxisId="left"
                        tickFormatter={(v) => v}
                        domain={[
                            (dataMin) => Math.floor(dataMin / 10) * 10,
                            (dataMax) => Math.ceil(dataMax / 10) * 10
                        ]}
                        allowDecimals={true}
                        width={60}
                    />

                    <Tooltip labelFormatter={tooltipLabel} formatter={(value, name, props) => {
                        // if recharts passes scaled val for a visual-only series (see optional section), map back if needed
                        if (name === 'equityPct') return [Number(value).toFixed(2) + '%', 'Equity (%)'];
                        if (name === 'drawdownPct') return [`${value}%`, 'Drawdown (%)'];
                        if (name === 'drawdownScaled' && props && props.payload) {
                            // payload holds original drawdownPct (if you enable scaled mode below)
                            const orig = props.payload.drawdownPct;
                            return [`${orig}%`, 'Drawdown (%)'];
                        }
                        return [value, name];
                    }} />

                    {/* drawdown area (UNDER the lines) */}
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="drawdownPct"
                        stroke="rgba(165,15,43,0.95)"
                        strokeWidth={2}
                        fill="rgba(165,15,43,0.18)"
                        fillOpacity={1}
                        isAnimationActive={false}
                        connectNulls={true}
                        baseValue={0}
                        name="Drawdown (%)"
                    />

                    {/* equity line (over area) */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="equityPct"
                        stroke="#0f5132"
                        strokeWidth={2}
                        dot={false}
                        name="Equity (%)"
                        isAnimationActive={false}
                    />

                    {/* draw zero line ON TOP */}
                    <ReferenceLine y={0} stroke="#333" strokeWidth={1.5} strokeDasharray="6 4" alwaysShow />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
