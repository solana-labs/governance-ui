import React from 'react';

const ArrowButton = ({
  title,
  children=<></>
}) => {
  return (
    <button className="group relative overflow-hidden flex items-center justify-center max-w-fit py-2 px-6 bg-blue-700 hover:bg-blue-800 text-white rounded-md transition-colors">
      <div className="flex items-center justify-center w-full transition-transform duration-200 ease-[cubic-bezier(.21,.98,.21,.99)]">
        {
          children
        }
        <p className="text-sm group-hover:-translate-x-2 transition-transform duration-200 ease-[cubic-bezier(.21,.98,.21,.99)]">
          {
            title
          }
        </p>
        <svg
          className="absolute -right-12 w-4 h-4 transform -translate-x-0 opacity-0 transition-all duration-200 ease-[cubic-bezier(.21,.98,.21,.99)] group-hover:-translate-x-14 group-hover:opacity-100"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </div>
    </button>
  )
}

export default ArrowButton;