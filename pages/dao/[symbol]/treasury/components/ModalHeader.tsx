const ModalHeader = ({
  protocolLogoURI,
  strategy,
  protocolName,
  TokenName,
}) => {
  return (
    <div className="flex flex-items mb-5">
      <img src={protocolLogoURI} className="w-16 h-16 mr-3"></img>
      <div className="flex-items">
        <h1>
          {TokenName} {strategy}
        </h1>
        <h2>{protocolName}</h2>
      </div>
    </div>
  )
}

export default ModalHeader
