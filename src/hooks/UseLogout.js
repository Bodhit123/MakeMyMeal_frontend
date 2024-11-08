import axios from "../api/axios";

const UseLogout = () => {

  const logout = async () => {
   
    try {
      const response = await axios("/logout", {
        withCredentials: true,
      });
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return logout;
};

export default UseLogout;
