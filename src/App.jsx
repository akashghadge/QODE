import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home/Home';
import Portfolio from './pages/Portfolio/Portfolio';
import './App.css';
import Sidebar from './components/Sidebar';


export default function App() {
	return (
		<div className="app">
			<Sidebar></Sidebar>
			<main className="content">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/portfolio" element={<Portfolio />} />
				</Routes>
			</main>
		</div>
	);
}
