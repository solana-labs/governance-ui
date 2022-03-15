// import he from 'he';

// const he = (X) => X;

// export const decode = (string:string, lite?:boolean) => (he.decode(string.replaceAll('Tokr_',';').replaceAll('_RHOVE_','&#'), { 'encodeEverything': lite ? false: true })).toString();
// export const encode = (string:string, lite?:boolean) => he.encode(string, { 'encodeEverything': lite ? false: true }).replaceAll(';','Tokr_').replaceAll('&#','_RHOVE_').toString();
export const decode = (string:string, lite?:boolean) => (deconstructUri(string.replaceAll('Tokr_',';').replaceAll('_RHOVE_','&#'))).toString();
export const encode = (string:string, lite?:boolean) => encodeURI(string).replaceAll(';','Tokr_').replaceAll('&#','_RHOVE_').toString();

export const isUriArweave = (uri):string => uri.includes('arweave.net') || false;

export const constructUri = (uriPartialId:string, isEncoded?:boolean)  => {
	const id = isEncoded ? decode(uriPartialId) : uriPartialId.toString();
	const isAws = id.endsWith('.json') ? true : false;
	return isAws ? `https://d2hcdcila1xoq2.cloudfront.net/genericAssetDirectory/${id}` : `https://arweave.net/${id}`;
}

export const deconstructUri = (uri):string => isUriArweave(uri) ? uri.split('.net/')[1].toString() : uri.split('.net/genericAssetDirectory/')[1].toString();
