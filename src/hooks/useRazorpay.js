import { showErrorToast } from "../helpers/showToast";

export function useRazorpay() {
  const openCheckout = ({
    orderId,
    amount,
    subscriptionId,
    currency,
    name,
    email,
    workspaceId,
    purpose = "upgrade",
    onSuccess,
    onFailure,
    onDismiss,
    brandingColor
  }) => {
    if (!window.Razorpay) {
      showErrorToast("Payment service is not ready. Please refresh and try again.");
      return;
    }

    if (!orderId && !subscriptionId) {
      showErrorToast("Payment details are missing. Please try again.");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // ✅ KEY ID only
      name: "CutJamm",
      description: "Workspace upgrade",

      prefill: {
        name,
        email,
      },

      notes: {
        workspaceID: workspaceId,
        purpose,
      },

      theme: {
        color: brandingColor,
      },

      handler(response) {
        // payment success
        onSuccess?.(response);
      },

      modal: {
        ondismiss() {
          onDismiss?.();
        },
      },
    };

    if (orderId) {
      options.order_id = orderId;
      options.amount = amount;
      options.currency = currency;
    }

    if (subscriptionId) {
      options.subscription_id = subscriptionId;
    }

    const razor = new window.Razorpay(options);

    razor.on("payment.failed", function (response) {
      console.error("Payment failed", response);
      onFailure?.(response);
    });

    razor.open();
  };

  return { openCheckout };
}
