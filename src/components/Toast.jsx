import { toast } from "react-toastify";
import "../css/toast.css";

const defaultOptions = {
  position: "top-right",
  autoClose: 2000,
  CloseButton:false,
  pauseOnHover: false,
  hideProgressBar: false,
  closeOnClick: true,
  draggable: true,
  progress: undefined,
};

export const successToast = (message, options = {}) => {
  toast.success(`🦄 ${message}`, { ...defaultOptions, ...options });
};

export const errorToast = (message, options = {}) => {
  toast.error(message, { ...defaultOptions, ...options });
};

//alternative for the above methods
export const infoToast = (message, {...options}) => {
    const toastOption = {...defaultOptions,...options}
    toast.info(`🦄 ${message}`, toastOption);
  };
  