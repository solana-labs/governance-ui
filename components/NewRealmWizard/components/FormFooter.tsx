import Header from '@components/Header'
import { LoadingDots } from '@components/Loading'
import React from 'react'
interface FormFooterProps {
  isValid?: boolean
  ctaText?: string
  loading?: boolean
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
  ctaText = '',
  loading = false,
  prevClickHandler,
  submitClickHandler,
}) => {
  return (
    <div className="absolute bottom-[50px] right-0 flex items-center sm:bottom-[80px]">
      <div className="flex justify-center w-full mt-8 space-x-4 md:justify-between md:w-fit md:mt-0">
        <button
          type="button"
          className="border rounded-full default-transition border-white/10 hover:border-white/70 active:border-transparent active:bg-white/10 disabled:bg-white/10 disabled:hover:border-white/10 hover:bg-white/5 disabled:active:border-none disabled:text-white/50 focus:border-white focus:bg-white/10 disabled:cursor-not-allowed"
          disabled={loading}
          onClick={prevClickHandler}
        >
          <ArrowRight className="m-4 rotate-180" />
        </button>
        <button
          type="submit"
          className="relative text-black rounded-full border-gradient focus:border-white hover:text-black default-transition bg-brand-gradient transition-from-gradient-background disabled:cursor-not-allowed"
          disabled={!isValid || loading}
          onClick={submitClickHandler}
        >
          {loading ? (
            <LoadingDots className="px-8" />
          ) : ctaText ? (
            <Header as="cta" className="relative z-20 px-8">
              {ctaText}
            </Header>
          ) : (
            <ArrowRight className="relative z-20 m-4" />
          )}
        </button>
      </div>
    </div>
  )
}

export default FormFooter
