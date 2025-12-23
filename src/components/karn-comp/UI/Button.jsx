const Button = ({ width, content, bgColor, border, textColor, marginRight, padding, contentSize, fontFamily }) => {
  return (
    <button
      style={{
        backgroundColor: bgColor,
        width: width,
        padding: padding? padding: "8px 0",
        border: border ? border : "none",
        borderRadius: "20px",
        color: textColor,
        marginRight: marginRight? marginRight:"0",
        cursor:"pointer",
        fontSize:contentSize? contentSize:"12px",
        fontFamily:fontFamily? fontFamily:"sans-serif"
        
      }}
    >
      {content}
    </button>
  );
};

export default Button;
