const ModalHeader = ({ logoURI, strategy, protocolName }) => {
  return (
    <div className="flex flex-items mb-5">
      <img src={logoURI} className="w-16 h-16 mr-3"></img>
      <div className="flex-items">
        <h1>{strategy}</h1>
        <h2>{protocolName}</h2>
      </div>
    </div>
  )
}

export default ModalHeader
