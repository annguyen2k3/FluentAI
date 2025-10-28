export const generateOTP = (length: number) => {
    return Math.floor(10 ** (length - 1) + Math.random() * 9 * 10 ** (length - 1)).toString()
}