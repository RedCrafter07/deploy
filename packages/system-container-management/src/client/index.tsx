import { createRoot } from 'react-dom/client';
import '@fontsource/figtree';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/home';

createRoot(document.getElementById('root')!).render(<App />);

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/'>
					<Route index element={<Home />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
