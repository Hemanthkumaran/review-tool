import React from 'react'

function OutlineInput({ disabled = false, label, placeholder, type = "text", value="", onChange, name, styles }) {
  return (
    <div>
        {label?.length ?
        <label style={{ fontFamily:'Gilroy-Regular' }} className="block font-medium mb-2 text-left">
            {label}
        </label> : <div style={{ marginTop:28 }}/>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
          disabled={disabled}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-[var(--brand-color)]"
          style={{ fontFamily:'Gilroy-Regular', opacity: disabled ? 0.5 : 1, borderColor:"#1A1A1A", borderRadius:10, height:40, ...styles }}
        />
    </div>
  )
}

export default OutlineInput