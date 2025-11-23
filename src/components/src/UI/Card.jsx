const Card = ({children, width, padding, borderRadius}) => {
    return (
      <div
        style={{
          padding: padding? padding:"0",
          width: width ? width: "auto",
          backgroundColor: "black",
          borderRadius:borderRadius? borderRadius: "24px"
        }}
      >
        {children}
      </div>
    );
}

export default Card;