export const LoopIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M2.982 4.3h11.534c1.383 0 2.5 1.116 2.5 2.5v2.766"
    />
    <path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M5.616 1.667 2.982 4.3l2.634 2.633M17.016 15.7H5.482a2.497 2.497 0 0 1-2.5-2.5v-2.767"
    />
    <path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="m14.383 18.333 2.633-2.633-2.633-2.634"
    />
  </svg>
)
