import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home/Home';
import Portfolio from './pages/Portfolio/Portfolio';
import './App.css';

export default function App() {
	return (
		<div className="app">
			<aside className="sidebar" aria-label="Main navigation">
				<div className="logo">CapitalMind · Demo</div>
				<ul className="nav">
					<li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
					<li><NavLink to="/portfolio" className={({ isActive }) => isActive ? 'active' : ''}>Portfolios</NavLink></li>
					<li><a href="#experimental">Experimentals</a></li>
					<li><a href="#account">Account</a></li>
				</ul>
			</aside>

			<main className="content">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/portfolio" element={<Portfolio />} />
				</Routes>
			</main>
		</div>
	);
}
