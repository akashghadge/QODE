import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { format } from 'date-fns';

function toChartData(drawdownSeries) {
    if (!drawdownSeries) return [];
    return drawdownSeries.map(p => ({ date: format(new Date(p.date), 'yyyy-MM-dd'), drawdown: Number((p.drawdown * 100).toFixed(2)) }));
}

export default function DrawdownChart({ drawdownSeries = [] }) {
    const data = toChartData(drawdownSeries);
    return (
        <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" hide />
                    <YAxis tickFormatter={(v) => v + '%'} />
                    <Tooltip formatter={(v) => v + '%'} />
                    <Area type="monotone" dataKey="drawdown" stroke="#a50f2b" fill="#fcebe9" name="Drawdown (%)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
