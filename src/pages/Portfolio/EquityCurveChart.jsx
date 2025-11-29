import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { format } from 'date-fns';

function toChartData(equitySeries) {
    if (!equitySeries) return [];
    return equitySeries.map(p => ({ date: format(new Date(p.date), 'yyyy-MM-dd'), equity: Number(p.equity.toFixed(2)) }));
}

export default function EquityCurveChart({ equitySeries = [] }) {
    const data = toChartData(equitySeries);

    return (
        <ResponsiveContainer width="100%" height={420}>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={30} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="equity" stroke="#0f5132" strokeWidth={2} dot={false} name="Equity (index)" />
            </LineChart>
        </ResponsiveContainer>
    );
}
