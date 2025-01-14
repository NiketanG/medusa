import * as React from "react"
import type { IconProps } from "../types"
const FeaturedBadge = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = "currentColor", ...props }, ref) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        fill="none"
        ref={ref}
        {...props}
      >
        <g filter="url(#a)">
          <circle cx={10} cy={8.903} r={7.806} fill="#3B82F6" />
          <circle
            cx={10}
            cy={8.903}
            r={7.806}
            fill="url(#b)"
            fillOpacity={0.2}
          />
          <circle
            cx={10}
            cy={8.903}
            r={7.556}
            stroke="#000"
            strokeOpacity={0.2}
            strokeWidth={0.5}
          />
        </g>
        <g clipPath="url(#c)">
          <path
            fill="#fff"
            d="M14.604 7.623a.43.43 0 0 0-.35-.295l-2.67-.388-1.195-2.421c-.146-.296-.632-.296-.778 0l-1.195 2.42-2.671.388a.434.434 0 0 0-.24.74L7.438 9.95l-.457 2.66a.434.434 0 0 0 .63.457l2.388-1.256 2.39 1.256a.43.43 0 0 0 .457-.032.43.43 0 0 0 .172-.425l-.457-2.66 1.933-1.884a.43.43 0 0 0 .11-.445"
          />
        </g>
        <defs>
          <linearGradient
            id="b"
            x1={10.089}
            x2={10.089}
            y1={1.142}
            y2={16.754}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#fff" />
            <stop offset={1} stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <clipPath id="c">
            <path fill="#fff" d="M4.796 3.699h10.408v10.408H4.796z" />
          </clipPath>
          <filter
            id="a"
            width={20}
            height={20}
            x={0}
            y={0}
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
          >
            <feFlood floodOpacity={0} result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feOffset dy={1.054} />
            <feGaussianBlur stdDeviation={1.054} />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
            <feBlend
              in2="BackgroundImageFix"
              result="effect1_dropShadow_8442_559"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow_8442_559"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feOffset dy={1.054} />
            <feGaussianBlur stdDeviation={1.054} />
            <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
            <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0" />
            <feBlend in2="shape" result="effect2_innerShadow_8442_559" />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feOffset dy={-1.054} />
            <feGaussianBlur stdDeviation={2.635} />
            <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
            <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0" />
            <feBlend
              in2="effect2_innerShadow_8442_559"
              result="effect3_innerShadow_8442_559"
            />
          </filter>
        </defs>
      </svg>
    )
  }
)
FeaturedBadge.displayName = "FeaturedBadge"
export default FeaturedBadge
