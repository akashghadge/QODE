// src/components/Topbar.jsx
import React from 'react';
import MenuIcon from '@mui/icons-material/Menu';

export default function Topbar({ onMenuClick }) {
    return (
        <header className="topbar" role="banner" aria-hidden={false}>
            <button
                className="topbar__menu-btn"
                onClick={onMenuClick}
                aria-label="Open navigation menu"
            >
                <MenuIcon />
            </button>
            <div className="topbar__title">CapitalMind · Demo</div>
        </header>
    );
}
