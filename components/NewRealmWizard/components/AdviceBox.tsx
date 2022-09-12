import Text from '@components/Text'

export default function AdviceBox({ icon, title, children }) {
  return (
    <div className="relative flex flex-col items-center py-5 px-5 mt-4 rounded md:mt-10 md:px-10 md:py-8 md:flex-row bg-cover bg-center bg-no-repeat bg-[url('/img/bg-quorum-all-sizes.png')]">
      <div className="w-16 h-16">{icon}</div>
      <div className="flex flex-col w-full text-center md:text-left md:ml-10">
        <Text level="2" className="my-2 capitalize text-fgd-2 md:mt-0">
          {title}
        </Text>
        {children}
      </div>
    </div>
  )
}
