import axios from "axios";

const Base_Url = "http://localhost:5000";

export default axios.create({
  baseURL: Base_Url,
});

export const axiosPrivate = axios.create({
  baseURL: Base_Url,
  headers: {
    "Content-type": "application/json",
  },
  withCredentials: true,
});
