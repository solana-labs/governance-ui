export default function ({ bgColor = '', showTopGlow = false, children }) {
  return (
    <div className={`w-full ${bgColor} relative`}>
      {showTopGlow && (
        <img src="/1-Landing-v2/divider-glow.png" className="absolute w-full" />
      )}
      <div className="w-full px-5 mx-auto md:px-16 lg:w-5/6 lg:px-0 xl:px-20 max-w-[1440px]">
        {children}
      </div>
    </div>
  )
}
