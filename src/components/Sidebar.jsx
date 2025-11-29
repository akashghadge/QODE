// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

// Material icons
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Assets
import MainLogo from '../assets/MainLogo.png';
import ProfilePic from '../assets/profile.png';

export default function Sidebar() {
    return (
        <aside className="sidebar" aria-label="Main navigation">
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={MainLogo} alt="CapitalMind" className="logo__img" />
            </div>

            <ul className="nav" role="navigation" aria-label="Primary">
                <li className="nav-item">
                    <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <span className="nav-icon"><HomeRoundedIcon fontSize="small" /></span>
                        <span className="nav-text">Home</span>
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink to="/portfolio" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <span className="nav-icon"><PieChartOutlineIcon fontSize="small" /></span>
                        <span className="nav-text">Portfolios</span>
                    </NavLink>
                </li>

                <li className="nav-item">
                    <a href="#experimental" className="nav-link">
                        <span className="nav-icon"><AutoAwesomeMosaicIcon fontSize="small" /></span>
                        <span className="nav-text">Experimentals</span>
                    </a>
                </li>

                <li className="nav-item">
                    <a href="#archives" className="nav-link">
                        <span className="nav-icon"><ArchiveOutlinedIcon fontSize="small" /></span>
                        <span className="nav-text">Slack Archives</span>
                    </a>
                </li>

                <li className="nav-item">
                    <a href="#account" className="nav-link">
                        <span className="nav-icon"><PersonOutlineIcon fontSize="small" /></span>
                        <span className="nav-text">Account</span>
                    </a>
                </li>

                <li className="nav-item">
                    <a href="#help" className="nav-link">
                        <span className="nav-icon"><HelpOutlineIcon fontSize="small" /></span>
                        <span className="nav-text">Help</span>
                    </a>
                </li>
            </ul>

            {/* Profile area — sticks to bottom */}
            <div className="sidebar__profile" role="region" aria-label="User">
                <img src={ProfilePic} alt="User" className="profile__avatar" />
                <div className="profile__meta">
                    <div className="profile__name">RN</div>
                    <div className="profile__meta-sm">Valid till Apr 19, 2025</div>
                </div>
            </div>
        </aside>
    );
}
