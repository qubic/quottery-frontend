// format number input to 100,000,000 format
export const formatQubicAmount = (amount, seperator = ',') => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, seperator);
}