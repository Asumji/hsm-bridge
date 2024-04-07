export function shortenNumber(num: Number) {
    if (typeof num != "number") return false
    let sizes = ["", "k", "m", "b"]
    for (let i = 0; i < sizes.length; i++) {
        if (num/Math.pow(10,i*3) < 1) {
            return String((num/Math.pow(10,(i-1)*3)).toFixed(2))+sizes[i-1]
        }
    }
    return String((num/1000000000).toFixed(2))+"b"
}