import * as React from "react";
const SvgArchive = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 122.88 122.88"
    
    
    {...props}
   {...(props.size ? { width: props.size, height: props.size } : { width: "1em", height: "1em" })}>
    <path
      d="M61.44 0A61.44 61.44 0 1 1 0 61.44 61.44 61.44 0 0 1 61.44 0m10.9 49.72a3.63 3.63 0 1 1 5.09 5.18l-13.8 13.63a3.64 3.64 0 0 1-5.1 0L44.93 55.1A3.63 3.63 0 0 1 50 49.91l7.49 7.42.08-26.13a3.64 3.64 0 0 1 7.27.06l-.08 25.93 7.56-7.47ZM32.5 83.09V68.87a3.64 3.64 0 0 1 7.27.07v10.35h43.3V68.87a3.64 3.64 0 1 1 7.27.07v14.15a3.64 3.64 0 0 1-3.6 3.47H36.15a3.63 3.63 0 0 1-3.6-3.47Z"
      style={{
        fillRule: "evenodd",
      }}
    />
  </svg>
);
export default SvgArchive;
