// import useQueryContext from '@hooks/useQueryContext'
// import { RealmInfo } from '@models/registry/api'
// import { useRouter } from 'next/router'
// import React, { useMemo } from 'react'

// export default function RealmsDashboard({ realms, isLoading }: { realms: readonly RealmInfo[]; isLoading: boolean }) {
// 	const router = useRouter()
// 	const { fmtUrlWithCluster } = useQueryContext()

// 	const goToRealm = (realmInfo: RealmInfo) => {
// 		const symbol = realmInfo.isCertified && realmInfo.symbol ? realmInfo.symbol : realmInfo.realmId.toBase58()
// 		const url = fmtUrlWithCluster(`/dao/${symbol}`)
// 		router.push(url)
// 	}

// 	// const certifiedRealms = useMemo(() => realms?.filter((r) => r.isCertified), [realms])
// 	const certifiedRealms = useMemo(() => realms?.filter((r) => r), [realms])
// 	// const unchartedRealms = useMemo(() => realms?.filter((r) => !r.isCertified), [realms])

// 	return isLoading ? (
// 		<div className="grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
// 			<div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
// 			<div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
// 			<div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
// 			<div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
// 			<div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
// 			<div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
// 			<div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
// 			<div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
// 			<div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
// 			<div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
// 		</div>
// 	) : (
// 		<>
// 			<div className="grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
// 				{certifiedRealms?.length > 0 ? (
// 					certifiedRealms.map((realm: RealmInfo) => (
// 						<div onClick={() => goToRealm(realm)} className="bg-bkg-2 cursor-pointer default-transition flex flex-col items-center p-8 hover:bg-bkg-3" key={realm.realmId.toString()}>
// 							<div className="pb-5">
// 								{realm.ogImage ? (
// 									<div className="bg-[rgba(255,255,255,0.06)] h-16 w-16 flex items-center justify-center">
// 										<img className="w-10" src={realm.ogImage}></img>
// 									</div>
// 								) : (
// 									<div className="bg-[rgba(255,255,255,0.06)] h-16 w-16 flex font-bold items-center justify-center text-fgd-3">{realm.displayName?.charAt(0)}</div>
// 								)}
// 							</div>
// 							<h3 className="text-center ">{realm.displayName ?? realm.symbol}</h3>
// 						</div>
// 					))
// 				) : (
// 					<div className="bg-bkg-2 col-span-5 p-8 text-center">
// 						<p>No results</p>
// 					</div>
// 				)}
// 			</div>
// 		</>
// 	)
// }

import Loader from '@components/Loader'
import useQueryContext from '@hooks/useQueryContext'
import { RealmInfo } from '@models/registry/api'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'

export default function RealmsDashboard({ realms, isLoading }: { realms: readonly RealmInfo[]; isLoading: boolean }) {
	const router = useRouter()
	const { fmtUrlWithCluster } = useQueryContext()

	const goToRealm = (realmInfo: RealmInfo) => {
		const symbol = realmInfo.isCertified && realmInfo.symbol ? realmInfo.symbol : realmInfo.realmId.toBase58()
		const url = fmtUrlWithCluster(`/dao/${symbol}`)
		router.push(url)
	}

	const certifiedRealms = useMemo(() => realms?.filter((r) => r.isCertified), [realms])
	const unchartedRealms = useMemo(() => realms?.filter((r) => !r.isCertified), [realms])

	const [initalLoad, setInitalLoad] = useState<boolean>(false)

	useEffect(() => {
		setInitalLoad(false)
	}, [realms])

	return isLoading || initalLoad ? (
		<Loader />
	) : (
		<div className="space-y-16">
			<div className="grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
				{certifiedRealms?.length > 0 &&
					certifiedRealms.map((realm: RealmInfo) => (
						<div onClick={() => goToRealm(realm)} className="bg-bkg-2 cursor-pointer default-transition flex flex-col items-center p-8 hover:bg-bkg-3" key={realm.realmId.toString()}>
							<div className="pb-5">
								{realm.ogImage ? (
									<div className="bg-[rgba(255,255,255,0.06)] h-16 w-16 flex items-center justify-center">
										<img className="w-10" src={realm.ogImage}></img>
									</div>
								) : (
									<div className="bg-[rgba(255,255,255,0.06)] h-16 w-16 flex font-bold items-center justify-center text-fgd-3">{realm.displayName?.charAt(0)}</div>
								)}
							</div>
							<h3 className="text-center ">{realm.displayName ?? realm.symbol}</h3>
						</div>
					))}
			</div>

			{unchartedRealms?.length > 0 && (
				<div className="border-t border-t-green pt-16">
					<h2>
						<span className="text-lg">
							Additional DAOs
						</span>
					</h2>
					<ul className="-mt-px-children">
						{unchartedRealms.map((realm: RealmInfo) => (
							<li>
								<a
									href={`/dao/${realm.realmId.toString()}`}
									onClick={(e) => {
										goToRealm(realm)
										e.preventDefault()
									}}
									className="block border border-green cursor-pointer default-transition px-4 py-2 hover:bg-bkg-3"
									key={realm.realmId.toString()}
								>
									<span className="flex items-center justify-between">
										<span className="flex-grow">
											<h3 className="flex-grow flex justify-start items-center text-xs">{realm.displayName ?? realm.symbol}</h3>
										</span>
										<span className="default-transition h-6 ml-2 text-primary-light w-6 flex-shrink-0">&gt;</span>
									</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}

// import useQueryContext from '@hooks/useQueryContext'
// import { RealmInfo } from '@models/registry/api'
// import { useRouter } from 'next/router'
// import React, { useMemo } from 'react'

// export default function RealmsDashboard({
//   realms,
//   isLoading,
// }: {
//   realms: readonly RealmInfo[]
//   isLoading: boolean
// }) {
//   const router = useRouter()
//   const { fmtUrlWithCluster } = useQueryContext()

//   const goToRealm = (realmInfo: RealmInfo) => {
//     const symbol =
//       realmInfo.isCertified && realmInfo.symbol
//         ? realmInfo.symbol
//         : realmInfo.realmId.toBase58()
//     const url = fmtUrlWithCluster(`/dao/${symbol}`)
//     router.push(url)
//   }

//   const certifiedRealms = useMemo(() => realms?.filter((r) => r.isCertified), [
//     realms,
//   ])

//   const unchartedRealms = useMemo(() => realms?.filter((r) => !r.isCertified), [
//     realms,
//   ])

//   return isLoading ? (
//     <div className="grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//       <div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
//       <div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
//       <div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
//       <div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
//       <div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
//       <div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
//       <div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
//       <div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
//       <div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
//       <div className="animate-pulse bg-bkg-3 col-span-1 h-44" />
//     </div>
//   ) : (
//     <>
//       <div className="grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//         {certifiedRealms?.length > 0 ? (
//           certifiedRealms.map((realm: RealmInfo) => (
//             <div
//               onClick={() => goToRealm(realm)}
//               className="bg-bkg-2 cursor-pointer default-transition flex flex-col items-center p-8 hover:bg-bkg-3"
//               key={realm.realmId.toString()}
//             >
//               <div className="pb-5">
//                 {realm.ogImage ? (
//                   <div className="bg-[rgba(255,255,255,0.06)] h-16 w-16 flex items-center justify-center">
//                     <img className="w-10" src={realm.ogImage}></img>
//                   </div>
//                 ) : (
//                   <div className="bg-[rgba(255,255,255,0.06)] h-16 w-16 flex font-bold items-center justify-center text-fgd-3">
//                     {realm.displayName?.charAt(0)}
//                   </div>
//                 )}
//               </div>
//               <h3 className="text-center ">
//                 {realm.displayName ?? realm.symbol}
//               </h3>
//             </div>
//           ))
//         ) : (
//           <div className="bg-bkg-2 col-span-5 p-8 text-center">
//             <p>No results</p>
//           </div>
//         )}
//       </div>
//       <div className="pt-12">
//         <h2 className="mb-4">Unchartered DAOs</h2>
//         <div className="grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//           {unchartedRealms?.length > 0 ? (
//             unchartedRealms.map((realm: RealmInfo) => (
//               <div
//                 onClick={() => goToRealm(realm)}
//                 className="bg-bkg-2 cursor-pointer default-transition flex flex-col items-center p-8 hover:bg-bkg-3"
//                 key={realm.realmId.toString()}
//               >
//                 <div className="pb-5">
//                   {realm.ogImage ? (
//                     <div className="bg-[rgba(255,255,255,0.06)] h-16 w-16 flex items-center justify-center">
//                       <img className="w-10" src={realm.ogImage}></img>
//                     </div>
//                   ) : (
//                     <div className="bg-[rgba(255,255,255,0.06)] h-16 w-16 flex font-bold items-center justify-center text-fgd-3">
//                       {realm.displayName?.charAt(0)}
//                     </div>
//                   )}
//                 </div>
//                 <h3 className="text-center ">
//                   {realm.displayName ?? realm.symbol}
//                 </h3>
//               </div>
//             ))
//           ) : (
//             <div className="bg-bkg-2 col-span-5 p-8 text-center">
//               <p>No results</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   )
// }
