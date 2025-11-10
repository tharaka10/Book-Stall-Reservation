import { jwtDecode } from "jwt-decode";
import React from "react";
import { Navigate} from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

interface DecodedToken {
    role: string;
    exp: number;
}

const ProtectedRoute: React. FC<ProtectedRouteProps> = ({ children, allowedRoles}) => {
    const token = localStorage.getItem("token");

    if(!token) {
        return <Navigate to="/login" replace />;
    }
    try {
        const decoded: DecodedToken = jwtDecode(token);

        // check expiry
        if (decoded.exp * 1000 <Date.now()) {
            localStorage.removeItem("token");
            return <Navigate to="/login" replace />;
        }

        //check role
        if(allowedRoles && !allowedRoles.includes(decoded.role)) {
            return <Navigate to="" replace/>;
        }
        return <>{children}</>;
    }
    catch (error) {
        return <Navigate to="/login" replace/>;
    }
}; 

export default ProtectedRoute;