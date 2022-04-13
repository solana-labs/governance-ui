const ModalHeader = ({
  apy,
  protocolLogoURI,
  strategy,
  protocolName,
  TokenName,
}) => {
  return (
    <div className="border-b border-fgd-4 flex items-center mb-4 pb-4">
      <img src={protocolLogoURI} className="w-10 h-10 mr-3"></img>
      <div>
        <h1 className="text-xl">{`${strategy} ${TokenName} on ${protocolName}`}</h1>
        <p>
          Interest Rate: <span className="text-green">{apy}</span>
        </p>
      </div>
    </div>
  )
}

export default ModalHeader
