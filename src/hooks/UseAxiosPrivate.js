import { axiosPrivate } from "../api/axios";
import { useEffect} from "react";
import useRefreshToken from "./UseRefreshToken";
import useAuth from "../hooks/UseAuth";

const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const token = useAuth();
 
  useEffect(() => {
    const requestInterceptor = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers["authorization"]) {
          config.headers["authorization"] = `Bearer ${token}`;
          // console.log("Request Token:", config.headers["authorization"]);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true;
          const newAccessToken = await refresh();
          prevRequest.headers["authorization"] = `Bearer ${newAccessToken}`;
          return axiosPrivate(prevRequest);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestInterceptor);
      axiosPrivate.interceptors.response.eject(responseInterceptor);
    };
  }, [refresh, token]);

  return axiosPrivate;
};

export default useAxiosPrivate;
