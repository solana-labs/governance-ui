export const DaoIcon = ({ imgSrc, daoName }) => {
  return (
    <div className="flex flex-col">
      <img src={`/img/realms-web/icons/${imgSrc}.svg`} className="my-2 h-7" />
      <p className="text-sm text-center opacity-70 max-w-[100px]">{daoName}</p>
    </div>
  )
}
