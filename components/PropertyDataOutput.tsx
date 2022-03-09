import { ExternalLinkIcon } from '@heroicons/react/outline'
import React, { useState, useLayoutEffect } from 'react'

export const titleCase = (string) =>
	string
		? string
				.toLowerCase()
				.split(' ')
				.map((word) => word.replace(word[0], word[0].toUpperCase()))
				.join(' ')
		: false;

const PropertyDataOutput = (props) => {
	const [propertyDetails, setPropertyDetails] = useState<any>()

	useLayoutEffect(() => {
		console.log("what?");
		if (props.propertyDetails) setPropertyDetails(props.propertyDetails)
	}, [props.propertyDetails])

	return (propertyDetails ?
		<>
			<div className="p-8 border bg-back text-white">
				<h3>
					<span className="text-lg">{propertyDetails.name} Information</span>
					{` `}({propertyDetails.symbol})
				</h3>
				<div className="pb-8">
					{propertyDetails.description}
					<br />
					<ul className="list-disc list-inside space-y-4 pt-4">
						{propertyDetails.property_address && (
							<li>
								<b>Property location:</b> {propertyDetails.property_address}
							</li>
						)}
						{propertyDetails.attributes && propertyDetails.attributes.map((attribute, index) => {
							if (attribute.trait_type !== 'name' && attribute.trait_type !== 'description') {
								return (
									<li key={`propertyDetails_attributes_${index}`} className="w-full flex">
										{attribute.trait_type === 'property_address' || attribute.trait_type === 'lat_long' ? (
											<>
												<span className="flex align-center flex-grow">
													<b className="inline mr-1 flex-shrink-0 text-green">{titleCase(attribute.trait_type?.replaceAll('_', ' '))}:</b>{' '}
													<span className="inline mr-1 flex-grow">
														<a className="inline" href={`https://www.google.com/maps/search/?api=1&query=${attribute.value.replaceAll(',', '%2C').replaceAll(' ', '+')}`} target="_blank">
															<span className="flex">
																{attribute.value} <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
															</span>
														</a>
													</span>
												</span>
											</>
										) : (
											<>
												<span className="flex align-center flex-grow">
													<b className="inline mr-1 flex-shrink-0  text-green">{titleCase(attribute.trait_type?.replaceAll('_', ' ')).replaceAll('Ein', 'EIN').replaceAll('Of', 'of').replaceAll('The', 'the')}:</b>{' '}
													<span className="inline mr-1 flex-grow">
														{attribute.value.startsWith('http://') || attribute.value.startsWith('https://') ? (
															<>
																<a className="inline" href={attribute.value} target="_blank">
																	<span className="flex">
																		View <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
																	</span>
																</a>
															</>
														) : (
															<>{attribute.value}</>
														)}
													</span>
												</span>
											</>
										)}
									</li>
								)
							}
						})}
					</ul>
				</div>
			</div>
		</> : <></>
	)
}

export default PropertyDataOutput
