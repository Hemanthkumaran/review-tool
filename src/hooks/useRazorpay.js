export function useRazorpay() {
  const openCheckout = ({
    orderId,
    amount,
    currency,
    name,
    email,
    workspaceId,
    purpose = "upgrade",
    onSuccess,
    onFailure,
    brandingColor
  }) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // ✅ KEY ID only
      amount,
      currency,
      name: "CutJamm",
      description: "Workspace upgrade",
      order_id: orderId,

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
          console.log("Payment closed by user");
        },
      },
    };

    const razor = new window.Razorpay(options);

    razor.on("payment.failed", function (response) {
      console.error("Payment failed", response);
      onFailure?.(response);
    });

    razor.open();
  };

  return { openCheckout };
}