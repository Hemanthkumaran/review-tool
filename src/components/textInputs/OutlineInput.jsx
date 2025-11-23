import React from 'react'

function OutlineInput({ label, placeholder, type = "text", value, onChange, name, styles }) {
  return (
    <div>
        {label.length ?
        <label className="block text-sm font-medium mb-2 text-left">
            {label}
        </label> : <div style={{ marginTop:28 }}/>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-[#F9EF38] bg-[#131313]"
          style={{ borderColor:"#1A1A1A", borderRadius:10, height:40, ...styles }}
        />
    </div>
  )
}

export default OutlineInput