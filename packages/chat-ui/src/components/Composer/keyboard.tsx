import React from 'react';

function Keyboard() {
  return (
    <svg width="56" height="56" viewBox="0 0 68 53" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d_1785_3947)">
        <path
          d="M64 30C64 46.5685 50.5685 60 34 60C17.4315 60 4 46.5685 4 30C4 13.4315 17.4315 0 34 0C50.5685 0 64 13.4315 64 30Z"
          fill="#219653"
        />
      </g>
      <path d="M51.5 22.5V40H16.5V22.5H51.5ZM54 20H14V42.5H54V20Z" fill="white" />
      <path
        d="M24 35H44V37.5H24V35ZM19 35H21.5V37.5H19V35ZM46.5 35H49V37.5H46.5V35ZM41.5 30H44V32.5H41.5V30ZM36.5 30H39V32.5H36.5V30ZM31.5 30H34V32.5H31.5V30ZM26.5 30H29V32.5H26.5V30ZM21.5 30H24V32.5H21.5V30ZM39 25H41.5V27.5H39V25ZM44 25V27.5H46.5V32.5H49V25H44ZM34 25H36.5V27.5H34V25ZM29 25H31.5V27.5H29V25ZM24 25H26.5V27.5H24V25ZM19 25H21.5V27.5H19V25Z"
        fill="white"
      />
      <defs>
        <filter
          id="filter0_d_1785_3947"
          x="0"
          y="0"
          width="68"
          height="68"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          {/* <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha" /> */}
          {/* <feOffset dy="4" /> */}
          <feGaussianBlur stdDeviation="2" />
          {/* <feComposite in2="hardAlpha" operator="out" /> */}
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" />
          {/* <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1785_3947" /> */}
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1785_3947"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default Keyboard;
