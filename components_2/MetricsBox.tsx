export const MetricsBoxPlus = ({ numbers, symbol, text }) => {
  return (
    <div>
      <div className="flex items-center">
        <h1 className="inline text-7xl font-thin tracking-tigh">{numbers}</h1>
        <h1 className="inline text-5xl font-thin tracking-tight">{symbol}</h1>
      </div>
      <p className="text-lg font-thin opacity-70 mt-3 tracking-tight">{text}</p>
    </div>
  )
}

export const MetricsBoxDollar = ({ symbol, numbers, text }) => {
  return (
    <div>
      <div className="flex items-center">
        <h1 className="inline text-5xl font-thin tracking-tigh">{symbol}</h1>
        <h1 className="inline text-7xl font-thin tracking-tight">{numbers}</h1>
      </div>
      <p className="text-lg font-thin opacity-70 mt-3 tracking-tight">{text}</p>
    </div>
  )
}
