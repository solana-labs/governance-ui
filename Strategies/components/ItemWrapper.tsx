const ItemWrapper = ({ children, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="grid grid-cols-6 p-4 border-fgd-4 border rounded-md mb-4 items-center mb-3 hover:bg-bkg-3 hover:cursor-pointer"
    >
      {children}
    </div>
  )
}
export default ItemWrapper
