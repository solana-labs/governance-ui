export const checkArDataKey = (keyName:string):boolean => (localStorage.getItem(keyName)) ? true : false;

export const convertToJson = (string) => JSON.parse(string);

export const getArData = (keyName:string, value?:string) => (checkArDataKey(keyName) === true) ? convertToJson(localStorage.getItem(keyName)) : (value) ? setArData(keyName, value) : {};

export const setArData = (keyName:string, value:string) => {
	if (checkArDataKey(keyName)) {
		return getArData(keyName)
	} else {
		localStorage.setItem(keyName, JSON.stringify(value));
		return value;
	}
}
