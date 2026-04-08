export const reactSelectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#131313",
    fontFamily:'Gilroy-Light',
    borderRadius: 9999,
    borderColor: '#181A1C',
    boxShadow: "none",
    cursor:'pointer',
    minHeight: 34,
    paddingLeft: 4,
    paddingRight: 4,
    fontSize:14,
    "&:hover": {
      borderColor: "#181A1C",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 4px",
  }),
  input: (base) => ({
    ...base,
    color: "#fff",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#fff",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#050506",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 6,
    border: "1px solid #26262B",
    zIndex: 40,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: "transparent",
    color: state.isFocused ? "#F9EF38" : "#fff",
    fontFamily:'Gilroy-Light',
    fontSize:14,
    paddingTop: 8,
    paddingBottom: 8,
    cursor: "pointer",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#6B6B72",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: 4,
    color: "#A0A0AA",
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: 4,
    color: "#A0A0AA",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#26262C",
    borderRadius: 9999,
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#E5E5E8",
    fontSize: 12,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#A0A0AA",
    ":hover": {
      backgroundColor: "transparent",
      color: "#fff",
    },
  }),
};

export const reactSelectStyles2 = {
  menuPortal: (base) => ({
  ...base,
  zIndex: 9999 
}),
placeholder: (base) => ({
  ...base,
  position: "absolute",   // 🔥 key fix
  left: 0,
  margin: 0,
  pointerEvents: "none",
}),
  control: (base) => ({
    ...base,
    backgroundColor: "#101013",
    fontFamily: "Gilroy-Light",
    borderRadius: 10,
    borderColor: "#181A1C",
    boxShadow: "none",
    minHeight: 40,
    paddingLeft: 8,
    paddingRight: 4,
    fontSize: 14,
    "&:hover": {
      borderColor: "#3A3A42",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "2px 0",
    gap: 6,
    display: "flex",
    flexWrap: "wrap",
    position: "relative",
  }),
  input: (base) => ({
    ...base,
    color: "#fff",
    fontFamily: "Gilroy-Light",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#fff",
  }),
  menu: (base) => ({
  ...base,
  backgroundColor: "#050506",
  borderRadius: 12,
  overflow: "hidden",
  marginTop: 6,
  border: "1px solid #26262B",
  zIndex: 40,
}),
menuList: (base) => ({
  ...base,
  padding: 0,
  maxHeight: 180,
  overflowY: "auto",
}),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#151518" : "transparent",
    color: "#E5E5E8",
    paddingTop: 8,
    paddingBottom: 8,
    cursor: "pointer",
  }),
  dropdownIndicator: () => null,  // ❌ no chevron
  clearIndicator: () => null,     // ❌ no global clear
  IndicatorSeparator: () => null,
  multiValue: (base) => ({
    ...base,
    backgroundColor: "transparent",
    borderRadius: 9999,
    margin: 0,
    padding: 0,
  }),
  multiValueLabel: (base) => ({
    ...base,
    padding: 0,
  }),
  multiValueRemove: (base) => ({
    ...base,
    padding: 0,
  }),
};