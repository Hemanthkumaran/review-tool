import React from 'react'

export default function PrimaryButton({ label, onClick, type="button", loading }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      style={{ borderRadius:25 }}
      className="w-full bg-[#F9EF38] text-black font-semibold py-2 rounded-lg 
                 transition-opacity disabled:opacity-50 flex items-center justify-center cursor-pointer"
    >
      {loading ? (
        <div className="h-5 w-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        label
      )}
    </button>
  );
}