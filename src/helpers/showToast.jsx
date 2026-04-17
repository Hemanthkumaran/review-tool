import { toast } from "react-toastify";
import SuccessToast from "../components/common/SuccessToast";

const showAppToast = (message, variant = "success") => {
  toast(
    ({ closeToast }) => (
      <SuccessToast
        message={message}
        closeToast={closeToast}
        variant={variant}
      />
    ),
    {
      autoClose: 4000,
    }
  );
};

export const showSuccessToast = (message) => {
  showAppToast(message, "success");
};

export const showErrorToast = (message) => {
  showAppToast(message, "error");
};

export const getApiErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (typeof error === "string") return error;

  const data = error?.response?.data;

  if (typeof data === "string") return data;

  return (
    data?.error ||
    data?.message ||
    error?.message ||
    fallback
  );
};
