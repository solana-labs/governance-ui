export const OptionsBox = ({ imgSrc, title, text }) => {
  return (
    <div className="flex flex-col align-middle">
      <div className="my-12 px-28 text-center">
        <h2 className="font-thin">{title}</h2>
        <p className="opacity-70">{text}</p>
      </div>
      <div className="p-16 border bg-[#131418] z-0">
        {/* <img
          src="/img/realms-web/backgrounds/glow-round.svg"
          className={shadowClass}
        /> */}
        <div id="glow"></div>
        <img
          src={`/img/realms-web/backgrounds/${imgSrc}.svg`}
          className="my-2 h-40 absolute z-10"
          // className="my-2 h-40 absolute z-10"
        />
      </div>
    </div>
  )
}
