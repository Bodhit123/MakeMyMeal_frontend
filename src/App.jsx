import "./css/main.css";
import "./css/toast.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Calender from "./pages/Calender";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import AddUser from "./pages/AddUser";
import { AuthProvider } from "./Contexts/AuthProvider";
import { fetchDisabledDates } from "./app/disabledSlice";
import PrivateRoutes from "./components/PrivateRoute";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import axios from "axios";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Dispatch the thunk with axiosPrivate when the app starts
    dispatch(fetchDisabledDates(axios));
  }, [dispatch]);
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route path="/signup" element={<AddUser />} />
          <Route
            element={
              <PrivateRoutes>
                <AuthorizedPages />
              </PrivateRoutes>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/calender" element={<Calender />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

function AuthorizedPages() {
  return (
    <div>
      <Outlet />
      {/*Outlet returns child of the given parent.
      If you remove this it won't show anything to user because we have not defined <Outlet/> in privateRoutes.
      Either define it there or here*/}
    </div>
  );
}

export default App;