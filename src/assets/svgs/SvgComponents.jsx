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

export const TrashIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <path
      fill={props.color}
      d="M12.605 5.498a.6.6 0 0 1 .561.638l-.434 6.713v.003c-.017.252-.037.54-.091.81a1.994 1.994 0 0 1-.358.836c-.43.559-1.152.772-2.142.772H5.86c-.99 0-1.714-.213-2.143-.772a1.995 1.995 0 0 1-.359-.837c-.054-.268-.073-.557-.09-.81v-.002l-.434-6.713a.6.6 0 0 1 1.197-.078l.434 6.71.028.363c.01.107.024.204.042.293.035.171.08.274.133.343.084.109.322.303 1.191.303h4.28c.869 0 1.107-.194 1.191-.303a.815.815 0 0 0 .134-.343c.036-.178.051-.385.07-.655l.433-6.711a.6.6 0 0 1 .637-.56Zm-3.499 4.905a.6.6 0 1 1 0 1.2h-2.22a.6.6 0 0 1 0-1.2h2.22Zm.561-2.667a.6.6 0 0 1 0 1.2H6.334a.6.6 0 1 1 0-1.2h3.333Zm-.793-6.9c.623 0 1.105.137 1.419.499.284.327.343.76.387 1.031l.146.866.001.016c1.076.056 2.15.138 3.222.244a.5.5 0 0 1-.098.995 67.322 67.322 0 0 0-6.63-.33c-1.304 0-2.608.065-3.91.197h-.002l-1.36.133a.501.501 0 0 1-.098-.995L3.31 3.36c.622-.062 1.244-.11 1.867-.144l.143-.856c.047-.276.106-.713.393-1.038.316-.358.798-.485 1.414-.485h1.747Zm-1.747 1c-.51 0-.632.11-.664.146-.061.07-.096.187-.156.543l-.11.648c.375-.01.749-.017 1.123-.017.829 0 1.658.015 2.488.046l-.114-.67V2.53c-.056-.34-.091-.464-.156-.539-.036-.041-.162-.154-.664-.154H7.127Z"
    />
  </svg>
)

export const PenIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <path
      fill={props.color}
      d="M10.081 1.916c.68-.087 1.368.146 2.065.709l.3.262c.803.76 1.167 1.53 1.113 2.313-.053.757-.493 1.398-.994 1.927l-.851.9a.498.498 0 0 1-.125.133l-4.491 4.754v.001c-.154.17-.363.313-.56.419-.2.107-.432.198-.648.236h-.003l-2.147.367c-.52.089-1.019-.04-1.374-.377-.355-.337-.512-.828-.454-1.351v-.001l.247-2.16.001-.01c.029-.215.109-.449.203-.651.094-.202.223-.417.375-.578l.001-.001 5.474-5.793v-.001c.5-.53 1.117-1.002 1.868-1.098ZM3.466 9.492v.001c-.054.058-.13.172-.196.317a1.377 1.377 0 0 0-.119.36l-.245 2.151c-.028.256.051.421.148.513.096.091.265.162.517.118l2.146-.367c.083-.015.212-.06.348-.133.138-.073.242-.154.294-.21l.007-.008 3.943-4.173A4.586 4.586 0 0 1 7.41 5.318L3.466 9.492Zm6.742-6.584c-.408.053-.823.323-1.269.793l-.736.778A3.58 3.58 0 0 0 11.1 7.224l.74-.784c.446-.47.694-.899.723-1.31.026-.383-.132-.88-.802-1.515-.667-.627-1.17-.756-1.552-.707Z"
    />
  </svg>
)

export const PlusIcon = (props) => (
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
      strokeWidth={1.2}
      d="M5 10h10M10 15V5"
    />
  </svg>
)

export const ChevronDown = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={12}
    fill="none"
    {...props}
  >
    <path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeOpacity={0.6}
      d="M9.96 4.477 6.7 7.737a.993.993 0 0 1-1.4 0l-3.26-3.26"
    />
  </svg>
)

export const Confetti = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={100}
    height={100}
    fill="none"
    {...props}
  >
    <circle cx={50} cy={50} r={50} fill="#F9EF38" opacity={0.1} />
    <path
      stroke="#F9EF38"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="m39.665 48.836-6.333 17.833 17.833-6.316m-14.5-25.35h.017m29.983 8.333h.017m-11.683-10h.016m11.65 30h.017m-.017-30-3.733 1.25a4.834 4.834 0 0 0-3.267 5.2 2.435 2.435 0 0 1-2.416 2.717h-.634c-1.433 0-2.666 1-2.933 2.4l-.35 1.766m13.333 5-1.366-.55a2.446 2.446 0 0 0-3.3 1.85 2.417 2.417 0 0 1-2.384 2.034h-1.283m-10-21.667.55 1.367a2.446 2.446 0 0 1-1.85 3.3c-1.167.166-2.033 1.2-2.033 2.383v1.283"
    />
    <path
      stroke="#F9EF38"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M48.333 51.669c3.217 3.217 4.717 6.95 3.333 8.333-1.383 1.383-5.116-.117-8.333-3.333-3.217-3.217-4.717-6.95-3.334-8.333 1.384-1.384 5.117.116 8.334 3.333Z"
    />
  </svg>
)

export const AssignIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 8a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.667ZM2.273 14.667C2.273 12.087 4.84 10 8 10c.64 0 1.26.087 1.84.247"
    />
    <path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      d="M14.667 12c0 .214-.027.42-.08.62a2.49 2.49 0 0 1-.307.754A2.646 2.646 0 0 1 12 14.667c-.687 0-1.307-.26-1.773-.686-.2-.174-.374-.38-.507-.607a2.614 2.614 0 0 1-.387-1.373A2.666 2.666 0 0 1 12 9.334c.787 0 1.5.34 1.98.887.427.473.687 1.1.687 1.78ZM12.993 11.986h-1.986M12 11.014v1.993"
    />
  </svg>
)

export const ShareIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.75}
      d="M11.307 4.113a5.753 5.753 0 0 1 2.44 4.1M2.327 8.246a5.734 5.734 0 0 1 2.4-4.1M5.46 13.96a5.682 5.682 0 0 0 2.58.614c.893 0 1.733-.2 2.487-.566M8.04 5.132a1.853 1.853 0 1 0 0-3.706 1.853 1.853 0 0 0 0 3.706ZM3.22 13.28a1.853 1.853 0 1 0 0-3.706 1.853 1.853 0 0 0 0 3.707ZM12.78 13.28a1.853 1.853 0 1 0 0-3.706 1.853 1.853 0 0 0 0 3.707Z"
    />
  </svg>
)

export const ShareLinkIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      stroke="#BFBFBF"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
      d="m10.834 9.166 6.833-6.833M18.334 5.667v-4h-4M9.166 1.667H7.499c-4.166 0-5.833 1.667-5.833 5.833v5c0 4.167 1.667 5.834 5.833 5.834h5c4.167 0 5.834-1.667 5.834-5.834v-1.666"
    />
  </svg>
)

export const CopyIcon = (props) => (
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
      strokeWidth={1.2}
      d="M13.333 10.75v3.5c0 2.917-1.167 4.084-4.084 4.084h-3.5c-2.916 0-4.083-1.167-4.083-4.084v-3.5c0-2.916 1.167-4.083 4.083-4.083h3.5c2.917 0 4.084 1.167 4.084 4.083Z"
    />
    <path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
      d="M18.333 5.75v3.5c0 2.917-1.167 4.084-4.084 4.084h-.916V10.75c0-2.916-1.167-4.083-4.084-4.083H6.666V5.75c0-2.916 1.167-4.083 4.083-4.083h3.5c2.917 0 4.084 1.167 4.084 4.083Z"
    />
  </svg>
)