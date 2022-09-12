import { FunctionComponent } from 'react'

export const LoadingDots = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className="w-2 h-2 mx-[2px] bg-primary-dark rounded-full animate-loader"></span>
      <span
        className="w-2 h-2 mx-[2px] bg-primary-dark rounded-full animate-loader"
        style={{ animationDelay: '0.2s' }}
      ></span>
      <span
        className="w-2 h-2 mx-[2px] bg-primary-dark rounded-full animate-loader"
        style={{ animationDelay: '0.4s' }}
      ></span>
    </div>
  )
}

interface LoadingProps {
  className?: string
  w?: string
  h?: string
}

const Loading: FunctionComponent<LoadingProps> = ({
  className,
  w = 5,
  h = 5,
}) => {
  return (
    <div className="flex justify-center w-full">
      <svg
        className={`${className} animate-spin h-${w} w-${h}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className={`opacity-25`}
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className={`opacity-90`}
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  )
}

export default Loading
