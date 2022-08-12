import React from 'react'

type Props = React.SVGAttributes<SVGElement>

export default function CouncilMintIcon(props: Props) {
  return (
    <svg
      {...props}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.6667 14V3.33333C12.6667 2.59695 12.0697 2 11.3333 2H4.66667C3.93029 2 3.33333 2.59695 3.33333 3.33333V14M12.6667 14L14 14M12.6667 14H9.33333M3.33333 14L2 14M3.33333 14H6.66667M6 4.66665H6.66667M6 7.33332H6.66667M9.33333 4.66665H10M9.33333 7.33332H10M6.66667 14V10.6667C6.66667 10.2985 6.96514 9.99999 7.33333 9.99999H8.66667C9.03486 9.99999 9.33333 10.2985 9.33333 10.6667V14M6.66667 14H9.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
