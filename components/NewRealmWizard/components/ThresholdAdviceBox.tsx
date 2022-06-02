import Text from '@components/Text'

export default function ThresholdAdviceBox({ title, children }) {
  return (
    <div className="flex flex-col items-start py-4 pl-4 pr-4 mt-4 rounded md:mt-10 md:space-x-4 md:pr-2 md:pl-8 md:py-8 md:flex-row bg-night-grey">
      <div className="w-16 px-2 py-5 mx-auto bg-black rounded-lg md:w-fit md:mx-0">
        <img src="/icons/threshold-icon.svg" alt="voting icon" />
      </div>
      <div className="flex flex-col w-full text-center md:text-left">
        <Text level="3" className="pt-3 pb-3 uppercase opacity-50 md:pt-0">
          {title}
        </Text>
        {children}
      </div>
    </div>
  )
}
