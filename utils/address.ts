export const shortenAddress = (address: string, chars = 5): string => `${address.substring(0, chars)}...${address.substring(
    address.length - chars
)}`;