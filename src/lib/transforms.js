// src/lib/transforms.js
// Utilities to transform NAV timeseries into equity, drawdown, monthly returns and trailing stats.
//
// Exports:
//  - parseSeries(series)
//  - computeEquityAndDrawdown(series)
//  - computeMonthlyReturns(series)
//  - computeTrailing(series, opts)
//
// Notes:
//  - Input 'series' can have date as string (ISO) or Date object.
//  - All percentages are returned as decimals (e.g. 0.076 = 7.6%).
//  - Uses plain JS Date and small helpers (no heavy deps).

/* eslint-disable no-restricted-globals */
function toDate(d) {
    if (!d) return null;
    if (d instanceof Date) return d;
    // try ISO parse first
    const parsed = new Date(String(d));
    if (!isNaN(parsed)) return parsed;
    // fallback: try Date.parse
    const ms = Date.parse(String(d));
    if (!isNaN(ms)) return new Date(ms);
    return null;
}

export function parseSeries(series = []) {
    // Returns sorted array of { date: Date, nav: Number }
    if (!Array.isArray(series)) return [];
    const out = [];
    for (let i = 0; i < series.length; i++) {
        const item = series[i];
        if (!item) continue;
        const date = toDate(item.date ?? item.Date ?? item.dt);
        const nav = Number(item.nav ?? item.Nav ?? item.value ?? item.close ?? item[Object.keys(item).find(k => /nav|close|value|price/i.test(k))]);
        if (!date || Number.isNaN(nav)) continue;
        out.push({ date, nav });
    }
    // sort ascending
    out.sort((a, b) => a.date - b.date);
    return out;
}

/**
 * computeEquityAndDrawdown
 * - series: parsed or raw series [{date, nav}, ...]
 * Returns:
 *  {
 *    equitySeries: [{ date: 'YYYY-MM-DD', equity: number }, ...],
 *    drawdownSeries: [{ date: 'YYYY-MM-DD', drawdown: decimal }, ...],
 *    chartData: [{ date: 'YYYY-MM-DD', equity: number, drawdownPct: number }, ...]
 *  }
 */
export function computeEquityAndDrawdown(series = []) {
    const s = parseSeries(series);
    if (!s.length) return { equitySeries: [], drawdownSeries: [], chartData: [] };

    // compute period returns and equity (index starts at 100)
    const equitySeries = [];
    let equity = 100.0;
    equitySeries.push({ date: s[0].date.toISOString().slice(0, 10), equity: Number(equity.toFixed(6)) });

    for (let i = 1; i < s.length; i++) {
        const prevNav = s[i - 1].nav;
        const curNav = s[i].nav;
        const r = prevNav === 0 ? 0 : (curNav / prevNav) - 1;
        equity = equity * (1 + r);
        equitySeries.push({ date: s[i].date.toISOString().slice(0, 10), equity: Number(equity.toFixed(6)) });
    }

    // compute drawdown
    const drawdownSeries = [];
    let peak = equitySeries[0].equity;
    for (let i = 0; i < equitySeries.length; i++) {
        const e = equitySeries[i].equity;
        if (e > peak) peak = e;
        const dd = (e / peak) - 1; // negative or zero
        drawdownSeries.push({ date: equitySeries[i].date, drawdown: Number(dd.toFixed(6)) });
    }

    // merged chartData: drawdown as percent for plotting
    const chartData = equitySeries.map((p, idx) => ({
        date: p.date,
        equity: Number(p.equity.toFixed(4)),
        drawdownPct: Number((drawdownSeries[idx].drawdown * 100).toFixed(2)) // percent for charts
    }));

    return { equitySeries, drawdownSeries, chartData };
}

/**
 * computeMonthlyReturns
 * - series: raw or parsed nav series
 * Returns:
 *  {
 *    monthlySeries: [{ date: 'YYYY-MM-DD', nav }, ...]  // month-end points
 *    monthlyReturns: [{ date: 'YYYY-MM-DD', month: 'Jan', year: 2020, return: decimal }, ...]
 *    monthlyByYear: { '2020': { Jan: 0.012, Feb: -0.02, ... }, ... }
 *  }
 */
export function computeMonthlyReturns(series = []) {
    const s = parseSeries(series);
    if (s.length === 0) return { monthlySeries: [], monthlyReturns: [], monthlyByYear: {} };

    // pick last point of each month (month-end). We'll iterate and track last per month.
    const lastPerMonth = [];
    let currentKey = null;
    for (let i = 0; i < s.length; i++) {
        const item = s[i];
        const key = `${item.date.getFullYear()}-${item.date.getMonth()}`; // year-month key
        currentKey = key;
        // push/replace lastPerMonth entry for this key
        if (lastPerMonth.length === 0 || lastPerMonth[lastPerMonth.length - 1].key !== key) {
            lastPerMonth.push({ key, date: item.date, nav: item.nav });
        } else {
            // replace with later date
            lastPerMonth[lastPerMonth.length - 1] = { key, date: item.date, nav: item.nav };
        }
    }

    const monthlySeries = lastPerMonth.map(x => ({ date: x.date.toISOString().slice(0, 10), nav: x.nav }));
    const monthlyReturns = [];
    for (let i = 1; i < lastPerMonth.length; i++) {
        const prev = lastPerMonth[i - 1];
        const cur = lastPerMonth[i];
        const r = prev.nav === 0 ? 0 : (cur.nav / prev.nav) - 1;
        monthlyReturns.push({
            date: cur.date.toISOString().slice(0, 10),
            month: cur.date.toLocaleString('en', { month: 'short' }),
            year: cur.date.getFullYear(),
            return: Number(r.toFixed(6))
        });
    }

    const monthlyByYear = {};
    for (let i = 0; i < monthlyReturns.length; i++) {
        const m = monthlyReturns[i];
        const y = String(m.year);
        monthlyByYear[y] = monthlyByYear[y] || {};
        monthlyByYear[y][m.month] = m.return;
    }

    return { monthlySeries, monthlyReturns, monthlyByYear };
}

/**
 * computeTrailing
 * - series: raw/parsed nav series (ascending dates)
 * - opts: { referenceDate: Date | string } optional override for "now"
 *
 * Returns object with keys:
 *  { '1D', '1W', '1M','3M','6M','1Y','3Y','YTD','SI','DD','MAXDD' }
 * Values are decimals (e.g. 0.076)
 */
export function computeTrailing(series = [], opts = {}) {
    const s = parseSeries(series);
    if (!s.length) return {};

    const referenceDate = opts.referenceDate ? toDate(opts.referenceDate) : s[s.length - 1].date;
    // helper to find nav on or before a date (string or Date)
    function navOnOrBefore(date) {
        const dStr = (date instanceof Date) ? date.toISOString().slice(0, 10) : toDate(date).toISOString().slice(0, 10);
        // linear scan from end (series sorted asc)
        for (let i = s.length - 1; i >= 0; i--) {
            const item = s[i];
            if (item.date.toISOString().slice(0, 10) <= dStr) return item.nav;
        }
        return null;
    }

    function pctBetween(fromDate, toDate) {
        const fromNav = navOnOrBefore(fromDate);
        const toNav = navOnOrBefore(toDate);
        if (fromNav === null || toNav === null || fromNav === 0) return null;
        return (toNav / fromNav) - 1;
    }

    // helper to subtract months safely (keeps day <= 28)
    function dateMinusMonths(dt, months) {
        let y = dt.getFullYear();
        let m = dt.getMonth() + 1; // 1..12
        m -= months;
        while (m <= 0) {
            m += 12;
            y -= 1;
        }
        const d = Math.min(dt.getDate(), 28);
        return new Date(y, m - 1, d);
    }

    // helper to minus days
    function dateMinusDays(dt, days) {
        const res = new Date(dt);
        res.setDate(res.getDate() - days);
        return res;
    }

    const lastDt = referenceDate;
    const trailing = {};

    // periods in months
    const periods = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '3Y': 36 };
    for (const [k, months] of Object.entries(periods)) {
        const fromDt = dateMinusMonths(lastDt, months);
        const val = pctBetween(fromDt, lastDt);
        trailing[k] = (val === null) ? null : Number(val.toFixed(6));
    }

    // YTD
    const ytdFrom = new Date(lastDt.getFullYear(), 0, 1);
    const ytdVal = pctBetween(ytdFrom, lastDt);
    trailing['YTD'] = (ytdVal === null) ? null : Number(ytdVal.toFixed(6));

    // 1D & 1W
    const v1d = pctBetween(dateMinusDays(lastDt, 1), lastDt);
    trailing['1D'] = (v1d === null) ? null : Number(v1d.toFixed(6));
    const v1w = pctBetween(dateMinusDays(lastDt, 7), lastDt);
    trailing['1W'] = (v1w === null) ? null : Number(v1w.toFixed(6));

    // SI: since inception (first available date)
    const si = pctBetween(s[0].date, lastDt);
    trailing['SI'] = (si === null) ? null : Number(si.toFixed(6));

    // DD: latest drawdown and MAXDD
    // compute equity & drawdown quickly
    const { equitySeries, drawdownSeries } = computeEquityAndDrawdown(s);
    trailing['DD'] = (drawdownSeries.length > 0) ? Number(drawdownSeries[drawdownSeries.length - 1].drawdown.toFixed(6)) : null;
    const maxdd = (drawdownSeries.length > 0) ? Math.min(...drawdownSeries.map(d => d.drawdown)) : null;
    trailing['MAXDD'] = (maxdd === null) ? null : Number(maxdd.toFixed(6));

    // also include lastDate used
    trailing['asOf'] = lastDt.toISOString().slice(0, 10);

    return trailing;
}

// Default export (optional)
export default {
    parseSeries,
    computeEquityAndDrawdown,
    computeMonthlyReturns,
    computeTrailing
};
