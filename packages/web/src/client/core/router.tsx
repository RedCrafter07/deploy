import { lazy } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const Login = lazy(() => import('../pages/login'));
const Dash = lazy(() => import('../pages/dash'));
const New = lazy(() => import('../pages/new'));

export default function Router() {
	return (
		<BrowserRouter>
			<Paths />
		</BrowserRouter>
	);
}

function Paths() {
	const location = useLocation();
	return (
		<AnimatePresence mode='wait' initial={false}>
			<motion.div
				key={location.pathname}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{
					duration: 0.2,
				}}
			>
				<Routes location={location}>
					<Route path='/'>
						<Route path='login' element={<Login />} />
						<Route path='new' element={<New />} />
						<Route index element={<Dash />} />
					</Route>
				</Routes>
			</motion.div>
		</AnimatePresence>
	);
}
