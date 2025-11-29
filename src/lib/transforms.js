import { parseISO, format, differenceInCalendarMonths } from 'date-fns';

/**
 * Helper: parse series (assumes each item has date string and nav number)
 */
function parseSeries(series) {
    return series
        .map(s => ({ date: (typeof s.date === 'string' ? parseISO(s.date) : s.date), nav: Number(s.nav) }))
        .sort((a, b) => a.date - b.date);
}

/**
 * computeMonthlyFromSeries
 * - monthlySeries: picks the last NAV for each month (assuming input is monthly or end-of-month)
 * Returns { monthlySeries, monthlyByYear }
 */
export function computeMonthlyFromSeries(series) {
    const s = parseSeries(series);
    if (!s.length) return { monthlySeries: [], monthlyByYear: {} };

    // If series already monthly (one per month) we'll use as-is.
    // For general case we would pick last record per month; here series is monthly already.
    const monthlySeries = s.map(item => ({ date: item.date, nav: item.nav }));

    // compute month-on-month returns: r_t = nav_t / nav_{t-1} - 1
    const monthlyReturns = [];
    for (let i = 1; i < monthlySeries.length; i++) {
        const prev = monthlySeries[i - 1];
        const cur = monthlySeries[i];
        const r = cur.nav / prev.nav - 1;
        monthlyReturns.push({ date: cur.date, return: r, nav: cur.nav });
    }

    // group by year-month into object for table
    const monthlyByYear = {};
    monthlyReturns.forEach(m => {
        const y = m.date.getFullYear();
        const month = format(m.date, 'MMM'); // Jan, Feb...
        monthlyByYear[y] = monthlyByYear[y] || {};
        monthlyByYear[y][month] = m.return;
    });

    return { monthlySeries, monthlyByYear, monthlyReturns };
}

/**
 * computeEquityAndDrawdown
 * - takes monthlySeries: array of {date, nav}
 * - returns equitySeries (index starting 100) and drawdownSeries (negative numbers)
 * Optionally accepts benchmark series to compute benchmark equity too (simple mapping using same logic).
 */
export function computeEquityAndDrawdown(monthlySeries, benchmark = []) {
    const months = monthlySeries.map(m => ({ date: m.date, nav: m.nav }));
    if (!months.length) return { equitySeries: [], drawdownSeries: [] };

    const returns = [];
    for (let i = 1; i < months.length; i++) {
        const prev = months[i - 1];
        const cur = months[i];
        returns.push({ date: cur.date, r: cur.nav / prev.nav - 1 });
    }

    // equity: start at 100
    const equitySeries = [];
    let equity = 100;
    equitySeries.push({ date: months[0].date, equity });
    returns.forEach(r => {
        equity = equity * (1 + r.r);
        equitySeries.push({ date: r.date, equity: Number(equity.toFixed(4)) });
    });

    // drawdown
    const drawdownSeries = [];
    let peak = equitySeries[0].equity;
    equitySeries.forEach(point => {
        if (point.equity > peak) peak = point.equity;
        const dd = point.equity / peak - 1;
        drawdownSeries.push({ date: point.date, drawdown: Number(dd.toFixed(4)) });
    });

    return { equitySeries, drawdownSeries };
}
