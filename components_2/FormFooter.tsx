import React from 'react'
import Button from 'components_2/Button'

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
      {/* <Button type="button" tertiary>
        <div className="flex items-center">
          <img src="/1-Landing-v2/icon-faq.png" className="w-6 h-6 mx-2" />
          <div className="pr-3">{faqTitle}</div>
        </div>
      </Button> */}
      <div className="flex justify-center w-full mt-8 space-x-8 md:justify-between md:w-fit md:mt-0">
        <Button type="button" onClick={prevClickHandler}>
          <img
            src="/1-Landing-v2/icon-arrow-black.png"
            className="w-6 h-6 mx-2 rotate-180"
          />
        </Button>
        <Button
          type="submit"
          disabled={!isValid}
          bgOverride={!isValid ? `bg-[#201f27]` : ''}
          onClick={submitClickHandler}
        >
          <img
            src="/1-Landing-v2/icon-arrow-black.png"
            className="w-6 h-6 mx-2"
          />
        </Button>
      </div>
    </div>
  )
}

export default FormFooter
