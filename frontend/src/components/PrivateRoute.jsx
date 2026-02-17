import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

{
  /* <Outlet /> is rendered. */
}
// This means the child routes defined inside this PrivateRoute component (if any) will be rendered.
// This is particularly useful for nested routes where authentication is required.
// This component navigates the user to the /login route using React Router's <Navigate> component.
// The replace prop ensures that the current URL in the history stack is replaced, preventing users from navigating back to the protected route using the browser's back button after logging in.
