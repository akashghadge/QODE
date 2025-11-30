import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import TrailingReturnsTable from './TrailingReturnsTable';
import MonthlyReturnsTable from './MonthlyReturnsTable';
import ChartExporter from '../../components/ChartExporter';

import { format } from 'date-fns';
import { RestartAlt } from '@mui/icons-material';

export default function Portfolio() {
    const { monthlyReturnsByYear, equitySeries, drawdownSeries, trailing, loading } = useData();
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // If user sets dates, we could filter equity/drawdown; for demo keep full series.

    return (
        <div className='portfolio-container'>
            <h1>Focused Portfolio</h1>
            <div className="portfolio-top">
                <TrailingReturnsTable trailing={trailing} />

                {/* equeity curve */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div>
                                <div style={{ fontWeight: 700, marginBottom: "8px" }} className="trailing-table-heading">Equity Curve</div>
                                <span className='kv' style={{ fontSize: 11 }}>
                                    Live since 2019-01-01
                                </span>
                            </div>
                            <div style={{ fontSize: "10px", color: "green", cursor: "pointer", marginLeft: 12, display: 'flex', alignItems: 'end' }}>
                                <RestartAlt fontSize='20px' color='green' style={{ marginBottom: "2px" }}></RestartAlt>Reset
                            </div>
                        </div>
                        <div className="controls">
                            <label className="kv">
                                <span style={{ display: 'block' }}>
                                    From date
                                </span>
                                <input className="small" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                            </label>
                            <label className="kv">
                                <span style={{ display: "block" }}>
                                    To date
                                </span>
                                <input className="small" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                            </label>
                        </div>
                    </div>

                    {/* chart exporter */}
                    <ChartExporter />
                </div>
            </div>

            {/* <div style={{ marginTop: 18 }} className="card">
                <h3 style={{ marginTop: 0 }}>Monthly returns (by year)</h3>
                {loading && <p className="kv">Loading...</p>}
                <MonthlyReturnsTable data={monthlyReturnsByYear} />
            </div> */}
        </div >
    );
}
