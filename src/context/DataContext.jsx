import React, { createContext, useContext, useEffect, useState } from "react";
import { loadExcelFromPublic } from "../utils/readExcel";
import { computeEquityAndDrawdown, computeMonthlyReturns, computeTrailing } from "../lib/transforms";
import { DataObjectOutlined } from "@mui/icons-material";
import { fetchNavSeries, fetchBlogs, fetchTrailingReturns } from '../api/mockApi';

const DataContext = createContext();
export const useData = () => useContext(DataContext);

export function DataProvider({ children }) {
    const [loading, setLoading] = useState(true);
    const [navSeries, setNavSeries] = useState([]);
    const [equitySeries, setEquitySeries] = useState([]);
    const [drawdownSeries, setDrawdownSeries] = useState([]);
    const [monthlyReturnsByYear, setMonthlyReturnsByYear] = useState({});
    const [trailing, setTrailing] = useState({});
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        async function load() {
            try {
                const excelRows = await loadExcelFromPublic("/data/nav_new.xlsx");
                const cleaned = excelRows
                    .map(r => {
                        return ({
                            date: parseExcelDate(r['NAV Date']),
                            nav: Number(r['NAV (Rs)'])
                        })
                    })
                    .sort((a, b) => a.date - b.date);

                const navData = cleaned.map(r => ({
                    date: r.date,
                    nav: r.nav
                }));


                setNavSeries(navData);

                // compute all metrics
                const { equitySeries, drawdownSeries } =
                    computeEquityAndDrawdown(navData);

                setEquitySeries(equitySeries);
                setDrawdownSeries(drawdownSeries);

                setMonthlyReturnsByYear(computeMonthlyReturns(navData));
                setTrailing(computeTrailing(navData, equitySeries, drawdownSeries));

                const blogResp = await fetchBlogs();
                if (blogResp.success) setBlogs(blogResp.data);

            } catch (err) {
                console.error("Excel Load Error", err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);
    /**
     * parseExcelDate(value)
     * - value can be:
     *    - Date object -> returned
     *    - number -> treated as Excel serial date (e.g. 44350)
     *    - string -> tries ISO, then DD-MM-YYYY or DD/MM/YYYY, then fallback Date.parse
     * - returns a JS Date or null
     */
    function parseExcelDate(value) {
        if (value == null) return null;

        // already a Date
        if (value instanceof Date && !isNaN(value)) return value;

        // numeric -> Excel serial date (days since 1899-12-31 with a bug for 1900)
        if (typeof value === 'number' && Number.isFinite(value)) {
            // Excel's serial 1 => 1900-01-01, but Excel incorrectly treats 1900 as leap year.
            // Standard conversion (handles the "leap year bug"):
            // For Excel on Windows (1900 system):
            const serial = value;
            // Excel epoch (1900-01-01) is serial 1, but JS epoch is 1970 — compute by ms.
            // Use Excel serial -> JS date (UTC)
            const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // 1899-12-30
            // If serial >= 61, Excel includes the fake Feb 29 1900, so subtract 1 day
            const days = serial >= 61 ? serial - 1 : serial;
            const ms = days * 24 * 60 * 60 * 1000;
            const d = new Date(excelEpoch.getTime() + ms);
            return isNaN(d) ? null : d;
        }

        // string: trim
        if (typeof value === 'string') {
            const s = value.trim();

            // ISO (YYYY-MM-DD or YYYY/MM/DD) -> safe
            const isoMatch = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(s);
            if (isoMatch) {
                const d = new Date(s.replace(/-/g, '/')); // replace to be safer
                if (!isNaN(d)) return d;
            }

            // Common DD-MM-YYYY or DD/MM/YYYY or D-M-YYYY
            const dm = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/.exec(s);
            if (dm) {
                let day = parseInt(dm[1], 10);
                let month = parseInt(dm[2], 10);
                let year = parseInt(dm[3], 10);
                // if year given as 2-digit, normalize (optional)
                if (year < 100) {
                    year += year > 50 ? 1900 : 2000;
                }
                // JS Date: months are 0-indexed
                const d = new Date(year, month - 1, day);
                if (!isNaN(d)) return d;
            }

            // Try Date.parse fallback (may be unreliable in some browsers)
            const d2 = new Date(s);
            if (!isNaN(d2)) return d2;
        }

        // not parseable
        return null;
    }

    return (
        <DataContext.Provider
            value={{
                loading,
                navSeries,
                equitySeries,
                drawdownSeries,
                monthlyReturnsByYear,
                trailing, blogs
            }}
        >
            {children}
        </DataContext.Provider>
    );
}
