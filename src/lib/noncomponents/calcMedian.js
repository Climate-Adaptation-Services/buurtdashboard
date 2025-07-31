export const calcMedian = (array) => { 
  // Handle empty array
  if (!array || array.length === 0) {
    return "Geen data"
  }

  // FIXED: Filter for valid numbers (including negatives) and convert to numbers
  const OnlyNumbers = array
    .filter(d => d !== null && d !== undefined && !isNaN(+d) && isFinite(+d))
    .map(d => +d)

  // Handle case where no valid numbers remain after filtering
  if (OnlyNumbers.length === 0) {
    return "Geen data"
  }

  // Sort numbers (ascending order for proper median calculation)
  OnlyNumbers.sort((a, b) => a - b)
  const length = OnlyNumbers.length
  
  if (length % 2 === 0) { 
    return (OnlyNumbers[length / 2] + OnlyNumbers[(length / 2) - 1]) / 2
  } else { 
    return OnlyNumbers[Math.floor(length / 2)]
  }
}