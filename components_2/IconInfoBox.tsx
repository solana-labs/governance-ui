export const IconInfoBox = ({ imgSrc, title, children }) => {
  return (
    <div className="flex items-start space-x-4 md:flex-col md:space-x-0">
      <img
        src={`/img/realms-web/icons/${imgSrc}.svg`}
        className="mt-1 md:mt-2 md:mb-4 h-7"
        alt="icon"
      />
      <div>
        <h3 className="text-lg font-normal md:text-xl">{title}</h3>
        {children}
      </div>
    </div>
  )
}
