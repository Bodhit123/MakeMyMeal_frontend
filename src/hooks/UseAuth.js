import { useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext";

const UseAuth = () => {
  const accessToken  = useContext(AuthContext).authData?.token;
  return accessToken;
};

export default UseAuth;
