import React from 'react'
import { ArrowLeftIcon } from '@heroicons/react/solid'
interface FormFooterProps {
  isValid?: boolean
  prevClickHandler: React.MouseEventHandler<HTMLButtonElement>
  submitClickHandler?: React.MouseEventHandler<HTMLButtonElement>
  faqTitle: string
}

const FormFooter: React.FC<FormFooterProps> = ({
  isValid,
  prevClickHandler,
  submitClickHandler,
  // faqTitle,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-end pt-10 sm:pt-12 md:pt-16">
      <div className="flex justify-center w-full mt-8 space-x-8 md:justify-between md:w-fit md:mt-0">
        <button
          type="button"
          className="rounded-full outline outline-white/10 hover:outline-white active:outline-none active:bg-white/10 focused:outline-white focused:bg-white/10 disabled:cursor-not-allowed"
          onClick={prevClickHandler}
        >
          <ArrowLeftIcon className="w-6 m-4" />
        </button>
        <button
          type="submit"
          className="text-black default-transition rounded-full bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] transition-from-gradient-background"
          disabled={!isValid}
          onClick={submitClickHandler}
        >
          <ArrowLeftIcon className="w-6 m-4 rotate-180" />
        </button>
      </div>
    </div>
  )
}

export default FormFooter
