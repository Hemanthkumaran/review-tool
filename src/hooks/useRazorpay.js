export function useRazorpay() {
  const openCheckout = ({ orderId, amount, currency, name, email, onSuccess }) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount,
      currency,
      name: "Cutjamm",
      description: "Storage upgrade",
      order_id: orderId,
      prefill: {
        name,
        email
      },
      theme: {
        color: "#FEEA3B"
      },
      handler: function (response) {
        onSuccess(response);
      },
      modal: {
        ondismiss() {
          console.log("Payment closed");
        }
      }
    };

    const razor = new window.Razorpay(options);
    razor.open();
  };

  return { openCheckout };
}
