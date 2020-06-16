export function formatMoney(amount: number): string {
    const formattedAmount = amount.toFixed(amount % 1 === 0 ? 0 : 2)

    return `${formattedAmount} р`;
}
