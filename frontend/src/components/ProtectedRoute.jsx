import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";



const ProtectedRoute = ({ children, role }) => {
    const {user} = useSelector((state) => state.auth);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        // If user is authenticated but doesn't have the required role, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}


export default ProtectedRoute;
