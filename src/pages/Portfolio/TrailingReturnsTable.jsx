import React from 'react';

export default function TrailingReturnsTable({ trailing }) {
    if (!trailing) return (
        <div className="trailing-table">
            <div className="trailing-table-heading">Trailing returns</div>
            <div style={{ height: 80 }}>Loading...</div>
        </div>
    );

    const tableData = [
        {
            name: "Focused",
            metrics: {
                YTD: -0.017,
                "1M": 0.076,
                "3M": 0.022,
                "6M": 0.101,
                "1Y": 0.435,
                "3Y": 0.239,
                SI: 0.225,
                DD: -0.028,
                MAXDD: -0.403
            }
        },
        {
            name: "NIFTY 50",
            metrics: {
                YTD: 0.037,
                "1M": 0.012,
                "3M": 0.082,
                "6M": 0.153,
                "1Y": 0.284,
                "3Y": 0.192,
                SI: 0.164,
                DD: -0.012,
                MAXDD: -0.322
            }
        }
    ];

    return (
        <div className="trailing-table">
            <div style={{ fontWeight: 700, marginBottom: 8 }} className="trailing-table-heading">Trailing Returns</div>
            <table className="comparison-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        {Object.keys(tableData[0].metrics).map((key) => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {tableData.map((row) => (
                        <tr key={row.name}>
                            <td className="name-cell">{row.name}</td>

                            {Object.values(row.metrics).map((val, idx) => (
                                <td key={idx}>
                                    {(val * 100).toFixed(1)}%
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <text className='trailingTableText'>Note: Returns above 1 year are annualized</text>
        </div>
    );
}
