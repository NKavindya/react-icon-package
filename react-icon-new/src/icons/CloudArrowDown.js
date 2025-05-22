import * as React from "react";
const SvgCloudArrowDown = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    
    
    
    viewBox="0 0 24 24"
    {...props}
   {...(props.size ? { width: props.size, height: props.size } : { width: "1em", height: "1em" })}>
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5.256 16A5.33 5.33 0 0 1 3 11.65C3 9.2 4.8 6.937 7.5 6.5 8.347 4.486 10.351 3 12.69 3c2.994 0 5.442 2.323 5.61 5.25 1.59.695 2.7 2.4 2.7 4.247a4.5 4.5 0 0 1-2 3.745M12 21V11m0 10-3-3m3 3 3-3"
    />
  </svg>
);
export default SvgCloudArrowDown;
