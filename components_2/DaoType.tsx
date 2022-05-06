import Header from './Header'
import Text from './Text'
export const DaoType = ({ imgSrc, daoTheme, text }) => {
  return (
    <div className="flex flex-col items-center md:items-start">
      <img src={imgSrc} className="max-w-[220px]" alt="icon" />
      <Header as="h3" className="mb-2 md:text-left md:mb-5">
        {daoTheme}
      </Header>
      <Text className="text-center text-white/70 md:text-left">{text}</Text>
    </div>
  )
}
