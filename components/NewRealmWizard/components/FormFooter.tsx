import React from 'react'
interface FormFooterProps {
  isValid?: boolean
  prevClickHandler: React.MouseEventHandler<HTMLButtonElement>
  submitClickHandler?: React.MouseEventHandler<HTMLButtonElement>
}

function ArrowRight({ className }) {
  return (
    <div className={className}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m12.75 3 9.75 9m0 0-9.75 9.75M22.5 12h-21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

const FormFooter: React.FC<FormFooterProps> = ({
  isValid,
  prevClickHandler,
  submitClickHandler,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-end pt-10 sm:pt-12 md:pt-16">
      <div className="flex justify-center w-full mt-8 space-x-8 md:justify-between md:w-fit md:mt-0">
        <button
          type="button"
          className="rounded-full outline outline-white/10 hover:outline-white active:outline-none active:bg-white/10 focused:outline-white focused:bg-white/10 disabled:cursor-not-allowed"
          onClick={prevClickHandler}
        >
          <ArrowRight className="m-4 rotate-180" />
        </button>
        <button
          type="submit"
          className="relative text-black rounded-full hover:text-black default-transition bg-brand-gradient transition-from-gradient-background disabled:cursor-not-allowed"
          disabled={!isValid}
          onClick={submitClickHandler}
        >
          <ArrowRight className="relative z-20 m-4" />
        </button>
      </div>
    </div>
  )
}

export default FormFooter
