export const MetricsBoxPlus = ({ numbers, symbol, text }) => {
  return (
    <div>
      <div className="flex items-center">
        <h1 className="inline text-4xl font-light md:text-7xl tracking-tigh">
          {numbers}
        </h1>
        <h1 className="inline text-xl font-light tracking-tight md:text-5xl">
          {symbol}
        </h1>
      </div>
      <p className="mt-3 text-lg font-light tracking-tight opacity-70">
        {text}
      </p>
    </div>
  )
}

export const MetricsBoxDollar = ({ symbol, numbers, text }) => {
  return (
    <div>
      <div className="flex items-center">
        <h1 className="inline text-xl font-light md:text-5xl tracking-tigh">
          {symbol}
        </h1>
        <h1 className="inline text-4xl font-light tracking-tight md:text-7xl">
          {numbers}
        </h1>
      </div>
      <p className="mt-3 text-lg font-light tracking-tight opacity-70">
        {text}
      </p>
    </div>
  )
}
