import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import tokenValidCheck from './tokenValidCheck';


function PrivateRoute() {
    const isAuthenticated = tokenValidCheck();
    if (isAuthenticated) {
        return <Outlet/>
    } else {
        return <Navigate to="/login" />;
    }
}

export default PrivateRoute;

