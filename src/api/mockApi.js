// Simple mock API that returns promise-wrapped data (simulate latency)
import navSeries from '../mocks/navSeries.json';
import benchmarkSeries from '../mocks/benchmarkSeries.json';
import blogs from '../mocks/blogs.json';

const wait = (ms = 600) => new Promise(res => setTimeout(res, ms));

export async function fetchNavSeries() {
    await wait(500);
    return {
        success: true,
        data: {
            navSeries,
            benchmarkSeries
        }
    };
}

export async function fetchMonthlyReturns() {
    await wait(250);
    // For demo we'll compute monthly on client; keep endpoint for completeness
    return {
        success: true,
        data: {
            // omitted — client will compute from navSeries
        }
    };
}

export async function fetchTrailingReturns() {
    await wait(150);
    return {
        success: true,
        data: {
            trailing: {
                YTD: -0.017,
                '1D': 0.001,
                '1W': 0.029,
                '1M': 0.076,
                '3M': 0.022,
                '6M': 0.101,
                '1Y': 0.435,
                '3Y': 0.239,
                SI: 0.225,
                DD: -0.028,
                MAXDD: -0.403
            }
        }
    };
}

export async function fetchBlogs() {
    await wait(200);
    return {
        success: true,
        data: blogs
    };
}
