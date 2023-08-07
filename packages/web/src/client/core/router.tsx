import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const Login = lazy(() => import('../pages/login'));

export default function Router() {
	return (
		<BrowserRouter>
			<Paths />
		</BrowserRouter>
	);
}

function Paths() {
	return (
		<Routes>
			<Route path='/'>
				<Route path='login' element={<Login />} />
			</Route>
		</Routes>
	);
}
