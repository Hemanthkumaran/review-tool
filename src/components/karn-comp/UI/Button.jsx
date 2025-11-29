const Button = ({ width, content, bgColor, border, textColor, marginRight, padding }) => {
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
        
      }}
    >
      {content}
    </button>
  );
};

export default Button;
