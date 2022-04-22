export const DaoIcon = ({ imgSrc, daoName }) => {
  return (
    <div className="grid justify-items-center">
      <img src={`/img/realms-web/icons/${imgSrc}.svg`} className="my-2 h-7" />
      <p className="opacity-70 text-xs text-center">{daoName}</p>
    </div>
  )
}
