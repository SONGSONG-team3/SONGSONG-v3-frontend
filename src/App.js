
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './views/main';
import Login from './views/login';
import Mypage from './views/mypage';
import Signup from './views/signup';
import Myplaylist from './views/myplaylist';
import Otherplaylist from './views/otherplaylist';
import PrivateRoute from './auth/PrivateRoute'; // Adjust the import based on your file structure

const App = () => {
	return (
		<div className='App'>
			<BrowserRouter>
				<Routes>
          <Route path="/" element={<Main />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/login" element={<Login />} />

					{/* 인증이 필요한 라우터 */}
					<Route element={<PrivateRoute />}>
						<Route path="/mypage" element={<Mypage />} />
						<Route path="/myplaylist" element={<Myplaylist />} />
						<Route path="/otherplaylist/:userNo" element={<Otherplaylist />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</div>
	);
};

export default App;