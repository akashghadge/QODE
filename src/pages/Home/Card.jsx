import React from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
export default function Card({ title, content }) {
    return (
        <>
            <div className="card">
                <h3 style={{ marginTop: 0 }}>{title}<OpenInNewIcon></OpenInNewIcon></h3>
                <p className="kv">{content}</p>
            </div>
        </>
    );
}
