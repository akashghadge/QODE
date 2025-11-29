import React from 'react';
import { useData } from '../../context/DataContext';
import Card from './Card.jsx';
import { format } from "date-fns";


export default function Home() {
    const { blogs, loading } = useData();

    return (
        <div>
            <h1 style={{ margin: 0, marginBottom: 18 }}>Home</h1>
            <div className="grid-3">
                <Card title="Get started" content="Read our getting started guide to get the most out of your subscription."></Card>
                <Card title="Visit website" content="Keep up with our latest content on our website."></Card>
                <Card title="Community" content="Join the conversation on our Slack for Capitalmind Premium subscribers."></Card>
            </div>

            <h2 style={{ marginTop: 20 }}>Latest Posts</h2>
            {loading && <p className="kv">Loading posts...</p>}
            <div className='grid-2'>
                {blogs && blogs.map(b => (
                    <article key={b.id} className="post" aria-labelledby={`post-${b.id}`}>
                        <div className="kv">{format(new Date(b.date), "MMM dd, yyyy")}</div>
                        <h3 id={`post-${b.id}`} className="blog-title">{b.title}</h3>
                        <p className="blog-excerpt">{b.excerpt.length > 200 ? b.excerpt.substr(0, 200) + " Read more..." : b.excerpt}</p>
                        <a className="read-link" href={b.url}>Read full post</a>
                    </article>
                ))}
            </div>
        </div>
    );
}
