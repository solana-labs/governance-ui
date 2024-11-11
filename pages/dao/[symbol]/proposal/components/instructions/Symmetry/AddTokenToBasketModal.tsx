import Modal from "@components/Modal"
import Input from "@components/inputs/Input"
import { useEffect, useState } from "react"


const AddTokenToBasketModal = ({
  open,
  onClose,
  supportedTokens,
  onSelect
}:{
  open: boolean,
  onClose: any,
  supportedTokens: any,
  onSelect: any
}) => {
  const [allTokens, setAllTokens] = useState(supportedTokens);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if(searchValue.length > 0){
      const filteredTokens = supportedTokens.filter((token: any) => {
        return token.name.toLowerCase().includes(searchValue.toLowerCase()) || token.symbol.toLowerCase().includes(searchValue.toLowerCase())
      })
      setAllTokens(filteredTokens)
    } else {
      setAllTokens(supportedTokens)
    }

  }, [searchValue, supportedTokens])
  return <>
    {
      open &&
      <Modal
        isOpen={open}
        onClose={() => onClose()}
      >
        <h2 className="text-fgd-1 mb-8 text-center">Select a Token</h2>
        <input className="w-full p-2 text-lg rounded-md bg-bkg-1 text-fgd-1 text-center" placeholder="Search for tokens" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} type="text" />
        <div className='flex flex-col max-h-64 mt-2 overflow-scroll gap-2'>
          {
            allTokens.map((token, i) => {
              return (
                <div onClick={() => onSelect(token)} key={i} className='flex w-full gap-2 items-center justify-between bg-bkg-1 hover:bg-bkg-3 cursor-pointer p-2 rounded-md'>
                  <div className="flex flex-col">
                    <p className='text-xs text-fgd-3'>
                      {
                        token.name
                      }
                    </p>
                    <p className='text-sm font-bold'>
                      {
                        token.symbol
                      }
                    </p>
                  </div>
                  <a rel="noreferrer" href={`https://solscan.io/token/${token.tokenMint}`} target="_blank" className="text-xs text-blue-500 underline">
                    {
                      token.tokenMint.slice(0, 6) + '...' + token.tokenMint.slice(-6)
                    }
                  </a>
                </div>
              )
            })
          }
        </div>
      </Modal>
    }
  </>

}

export default AddTokenToBasketModal;