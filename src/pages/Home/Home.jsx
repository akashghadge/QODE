import React from 'react';
import { useData } from '../../context/DataContext';

export default function Home() {
    const { blogs, loading } = useData();

    return (
        <div>
            <h1 style={{ margin: 0, marginBottom: 18 }}>Home</h1>

            <div className="grid-2">
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Get started</h3>
                    <p className="kv">Read our getting started guide to get the most out of your subscription.</p>
                </div>
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Community</h3>
                    <p className="kv">Join the conversation on our Slack for Capitalmind Premium subscribers.</p>
                </div>
            </div>

            <h2 style={{ marginTop: 20 }}>Latest Posts</h2>
            {loading && <p className="kv">Loading posts...</p>}
            <div>
                {blogs && blogs.map(b => (
                    <article key={b.id} className="card" aria-labelledby={`post-${b.id}`}>
                        <h3 id={`post-${b.id}`} className="blog-title">{b.title}</h3>
                        <div className="kv">{b.date}</div>
                        <p className="blog-excerpt">{b.excerpt}</p>
                        <a className="read-link" href={b.url}>Read full post</a>
                    </article>
                ))}
            </div>
        </div>
    );
}
