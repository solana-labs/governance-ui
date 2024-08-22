import Modal from "@components/Modal"
import { PublicKey } from "@solana/web3.js";
import { BasketsSDK } from "@symmetry-hq/baskets-sdk";
import { useEffect, useState } from "react"


export const SelectBasketModal = ({
  open,
  onClose,
  managedBaskets,
  sdk,
  onSelect
}:{
  open: boolean,
  onClose: any,
  managedBaskets: any,
  sdk: BasketsSDK | undefined,
  onSelect: any
}) => {
  const [searchValue, setSearchValue] = useState('');
  useEffect(() => {
    if(searchValue.length > 40){
      try {
        const basketAddress = new PublicKey(searchValue);
        sdk?.loadFromPubkey(basketAddress).then((basket) => {
          if(basket){
            onSelect({
              basket: basket
            })
          }
        });
      } catch (e) {
        console.error(e)
      }
    }
  }, [searchValue]);

  return <>
    {
      open &&
      <Modal
        isOpen={open}
        onClose={() => onClose()}
      >
        <h2 className="text-fgd-1 mb-4 text-center">Select a Basket</h2>
        <p className="text-fgd-1 text-center">Enter Basket Address 
          <a href="https://docs.symmetry.fi" target="_blank" rel="noreferrer" className="text-blue-500 underline"> 
            (How to find address)
          </a>
        </p>
        <input className="w-full p-2 text-lg rounded-md bg-bkg-1 text-fgd-1 text-center" placeholder="Search for tokens" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} type="text" />
        <p className="text-fgd-1 text-center mt-2">Or Select a Basket governed by the DAO</p>

        <div className='flex flex-col max-h-64 mt-2 overflow-scroll gap-2'>
          { (managedBaskets && managedBaskets.length > 0) ?
            managedBaskets.map((basket, i:number) => {
              return (
                <div onClick={() => onSelect(basket)} key={i} className='flex w-full gap-2 items-center justify-between bg-bkg-1 hover:bg-bkg-3 cursor-pointer p-2 rounded-md'>
                  <div className="flex flex-col">
                    <p className='text-xs text-fgd-3'>
                      {
                        String.fromCharCode.apply(null, basket.basket.data.name)
                      }
                    </p>
                    <p className='text-sm font-bold'>
                      {
                        String.fromCharCode.apply(null, basket.basket.data.symbol)
                      }
                    </p>
                  </div>
                  <a rel="noreferrer" href={`https://solscan.io/token/${basket.basket.ownAddress.toBase58()}`} target="_blank" className="text-xs text-blue-500 underline">
                    {
                      basket.basket.ownAddress.toBase58()
                    }
                  </a>
                </div>
              )
            })
            :
              <p className='text-fgd-1 text-center'>The DAO manages no baskets</p>
          }
        </div>
      </Modal>
    }
  </>

}

