import React from 'react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatCell(val) {
    if (typeof val !== 'number') return '—';
    const pct = (val * 100).toFixed(1) + '%';
    const cls = val >= 0 ? { color: '#0f5132' } : { color: '#a50f2b' };
    return <span style={cls}>{pct}</span>;
}

export default function MonthlyReturnsTable({ data }) {
    const years = Object.keys(data).sort((a, b) => b - a); // descending
    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="monthly-table">
                <thead>
                    <tr>
                        <th>Year</th>
                        {months.map(m => <th key={m}>{m}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {years.map(y => (
                        <tr key={y}>
                            <td style={{ fontWeight: 700 }}>{y}</td>
                            {months.map(m => <td key={m}>{formatCell((data[y] || {})[m])}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
