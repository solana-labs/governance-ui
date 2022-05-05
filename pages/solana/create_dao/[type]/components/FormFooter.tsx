import Button from 'components_2/Button'

export default function FormFooter({ isValid, prevClickHandler, faqTitle }) {
  return (
    <div className="flex flex-wrap items-center justify-between pt-20 md:pt-32">
      <Button type="button" tertiary>
        <div className="flex items-center">
          <img src="/1-Landing-v2/icon-faq.png" className="w-6 h-6 mx-2" />
          <div className="pr-3">{faqTitle}</div>
        </div>
      </Button>
      <div className="flex justify-between w-full mt-8 space-x-8 md:w-fit md:mt-0">
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
