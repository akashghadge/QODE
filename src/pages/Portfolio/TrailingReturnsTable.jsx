import React from 'react';

export default function TrailingReturnsTable({ trailing }) {
    if (!trailing) return (
        <div className="trailing-table card">
            <div className="kv">Trailing returns</div>
            <div style={{ height: 80 }}>Loading...</div>
        </div>
    );

    // order keys in useful sequence
    const rows = [
        ['YTD', trailing.YTD],
        ['1D', trailing['1D']],
        ['1W', trailing['1W']],
        ['1M', trailing['1M']],
        ['3M', trailing['3M']],
        ['6M', trailing['6M']],
        ['1Y', trailing['1Y']],
        ['3Y', trailing['3Y']],
        ['SI', trailing.SI],
        ['DD', trailing.DD],
        ['MAXDD', trailing.MAXDD]
    ];

    return (
        <div className="trailing-table">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Trailing Returns</div>
            {rows.map(([k, v]) => (
                <div key={k} className="row">
                    <div style={{ fontWeight: 600 }}>{k}</div>
                    <div>{typeof v === 'number' ? (v * 100).toFixed(1) + '%' : v}</div>
                </div>
            ))}
        </div>
    );
}
