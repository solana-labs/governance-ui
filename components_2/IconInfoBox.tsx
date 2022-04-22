export const IconInfoBox = ({ imgSrc, title, text }) => {
  return (
    <div>
      <img
        src={`/img/realms-web/icons/${imgSrc}.svg`}
        className="my-2 h-7"
        alt=""
      />
      <h3>{title}</h3>
      <p className="opacity-70">{text}</p>
    </div>
  )
}
