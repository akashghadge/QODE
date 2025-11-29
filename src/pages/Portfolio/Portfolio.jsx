import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import TrailingReturnsTable from './TrailingReturnsTable';
import MonthlyReturnsTable from './MonthlyReturnsTable';
import EquityCurveChart from './EquityCurveChart';
import DrawdownChart from './DrawdownChart';
import { format } from 'date-fns';

export default function Portfolio() {
    const { monthlyReturnsByYear, equitySeries, drawdownSeries, trailing, loading } = useData();
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // If user sets dates, we could filter equity/drawdown; for demo keep full series.

    return (
        <div>
            <h1 style={{ margin: 0 }}>Focused Portfolio</h1>
            <div className="portfolio-top">
                <TrailingReturnsTable trailing={trailing} />
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div className="kv">Live since 2019-01-01</div>
                        <div className="controls">
                            <label className="kv">From
                                <input className="small" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                            </label>
                            <label className="kv">To
                                <input className="small" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                            </label>
                        </div>
                    </div>

                    <div className="chart-card">
                        <div className="chart-area">
                            <EquityCurveChart equitySeries={equitySeries} />
                        </div>
                        <div style={{ marginTop: 12 }}>
                            <DrawdownChart drawdownSeries={drawdownSeries} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 18 }} className="card">
                <h3 style={{ marginTop: 0 }}>Monthly returns (by year)</h3>
                {loading && <p className="kv">Loading...</p>}
                <MonthlyReturnsTable data={monthlyReturnsByYear} />
            </div>
        </div>
    );
}
