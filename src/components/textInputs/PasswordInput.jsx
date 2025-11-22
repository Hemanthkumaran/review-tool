import React, { useState } from "react";

function PasswordInput({ label, placeholder, value, onChange, name }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2 text-left">
        {label}
      </label>

      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        name={name}
        onChange={onChange}
        className="
          w-full px-4 pr-10 py-2 border rounded-lg 
          focus:outline-none focus:border-indigo-600 
          focus:ring-2 focus:ring-[#F9EF38]
        "
        style={{ borderColor: "#1A1A1A", borderRadius: 10, height: 40 }}
      />

      {/* Eye icon */}
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-[48px] transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
      >
        {show ? (
          // eye-off icon
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
               viewBox="0 0 24 24" strokeWidth="1.5" stroke="#BFBFBF"
               className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" 
              d="M3 3l18 18m-2.12-4.88A9.97 9.97 0 0112 18c-4.41 
                 0-8.19-2.87-9.54-6.86a1 1 0 010-.28A10.05 10.05 
                 0 017.91 6.1m4.12-.94a10.05 10.05 0 018.51 
                 7.7c.02.09.02.19 0 .28a9.97 9.97 0 01-1.23 
                 2.64M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ) : (
          // eye-on icon
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
               viewBox="0 0 24 24" strokeWidth="1.5" stroke="#BFBFBF"
               className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" 
              d="M2.458 12C3.732 7.943 7.522 5 12 
                 5c4.477 0 8.268 2.943 9.542 7a10.05 
                 10.05 0 01-1.111 2.695C18.732 16.057 
                 14.943 19 12 19c-2.943 0-6.732-2.943-8.089-6.305A9.97 
                 9.97 0 012.458 12z" />
            <path strokeLinecap="round" strokeLinejoin="round" 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default PasswordInput;
