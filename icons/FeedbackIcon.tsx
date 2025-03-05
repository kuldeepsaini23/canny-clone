import React from "react";

type Props = {
  fill?:string
};

const FeedbackIcon = ({fill}: Props) => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.5">
        <path
          d="M0 6C0 2.68629 2.68629 0 6 0H34C37.3137 0 40 2.68629 40 6V34C40 37.3137 37.3137 40 34 40H6C2.68629 40 0 37.3137 0 34V6Z"
          fill={fill || "#0A0A0A"}
        />
        <path
          d="M18 23.3333L14.6666 20M14.6666 20L18 16.6667M14.6666 20H22.6666C23.3739 20 24.0521 20.2809 24.5522 20.781C25.0523 21.2811 25.3333 21.9594 25.3333 22.6667V24"
          stroke="#7A7775"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default FeedbackIcon;
