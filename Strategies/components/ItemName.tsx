const ItemName = ({ imgSrc, name }) => {
  return (
    <div className="flex flex-items items-center">
      {imgSrc && <img src={imgSrc} className="w-10 h-10 mr-3"></img>} {name}
    </div>
  )
}

export default ItemName
