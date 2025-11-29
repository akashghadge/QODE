import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar.jsx'

function App() {
	const [count, setCount] = useState(0)
	return (
		<>
			<div className="row">
				<div className='col-3'><Sidebar></Sidebar></div>
				<div className='col-9'>Content</div>
			</div>
		</>
	)
}

export default App