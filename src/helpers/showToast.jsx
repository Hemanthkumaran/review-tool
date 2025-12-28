import { toast } from "react-toastify";
import SuccessToast from "../components/common/SuccessToast";

export const showSuccessToast = (message) => {
  toast(
    ({ closeToast }) => (
      <SuccessToast
        message={message}
        closeToast={closeToast}
      />
    ),
    {
      autoClose: 4000,
    }
  );
};
