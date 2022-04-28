export const OptionsBox = ({ imgSrc, title, text, direction = 'ltr' }) => {
  return (
    <div
      className={`flex flex-col ${
        direction === 'rtl' ? 'sm:flex-row-reverse' : 'sm:flex-row'
      } align-middle`}
    >
      <div id="text" className="my-12 px-28 text-center">
        <h2 className="font-thin">{title}</h2>
        <p className="opacity-70">{text}</p>
      </div>
      <div
        id="image"
        className="h-40 relative p-16 border bg-[#131418] z-0 w-64 sm:w-9"
      >
        <img
          src="/img/realms-web/backgrounds/glow-round.svg"
          className="absolute z-5 left-0 top-0 mt-8"
          // className={shadowClass}
        />
        {/* <div id="glow"></div> */}
        <img
          src={`/img/realms-web/backgrounds/${imgSrc}.svg`}
          className="h-40 absolute z-10 left-0 top-0 mt-8"
          // className="my-2 h-40 absolute z-10"
        />
      </div>
    </div>
  )
}
