import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchNavSeries, fetchBlogs, fetchTrailingReturns } from '../api/mockApi';
import { computeMonthlyFromSeries, computeEquityAndDrawdown } from '../lib/transforms';

const DataContext = createContext();

export function DataProvider({ children }) {
    const [navSeries, setNavSeries] = useState([]);
    const [benchmarkSeries, setBenchmarkSeries] = useState([]);
    const [monthlyReturnsByYear, setMonthlyReturnsByYear] = useState({});
    const [equitySeries, setEquitySeries] = useState([]);
    const [drawdownSeries, setDrawdownSeries] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [trailing, setTrailing] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const navResp = await fetchNavSeries();
                if (navResp.success) {
                    const nav = navResp.data.navSeries || [];
                    setNavSeries(nav);
                    setBenchmarkSeries(navResp.data.benchmarkSeries || []);
                    // compute monthly returns and equity/drawdown from given series
                    const monthly = computeMonthlyFromSeries(nav);
                    setMonthlyReturnsByYear(monthly.monthlyByYear);
                    const { equitySeries, drawdownSeries } = computeEquityAndDrawdown(monthly.monthlySeries, navResp.data.benchmarkSeries || []);
                    setEquitySeries(equitySeries);
                    setDrawdownSeries(drawdownSeries);
                }

                const blogResp = await fetchBlogs();
                if (blogResp.success) setBlogs(blogResp.data);

                const trailingResp = await fetchTrailingReturns();
                if (trailingResp.success) setTrailing(trailingResp.data.trailing);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <DataContext.Provider value={{
            loading,
            navSeries,
            benchmarkSeries,
            monthlyReturnsByYear,
            equitySeries,
            drawdownSeries,
            blogs,
            trailing
        }}>
            {children}
        </DataContext.Provider>
    );
}

export const useData = () => useContext(DataContext);
