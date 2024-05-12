import "./css/main.css";
import "./css/toast.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Calender from "./pages/Calender";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddUser from "./pages/AddUser";
import { AuthProvider } from "./Contexts/AuthProvider";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route path="/signup" element={<AddUser />} />
          <Route path="/home" element={<Home />} />
          <Route path="/calender" element={<Calender />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
