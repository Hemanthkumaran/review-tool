const Button = ({ width, content, bgColor, border, textColor, marginRight, onClick }) => {
  return (
    <button
      style={{
        backgroundColor: bgColor,
        width: width,
        padding: "8px 0",
        border: border ? border : "none",
        borderRadius: "20px",
        color: textColor,
        marginRight: marginRight? marginRight:"0",
        cursor:'pointer',
        fontFamily:'Gilroy-Regular'
      }}
      onClick={onClick}
    >
      {content}
    </button>
  );
};

export default Button;
