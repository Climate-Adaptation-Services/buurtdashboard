export const calcMedian = (array) => { 

  // is it a number
  const OnlyNumbers = array.filter(d => /\d/.test(d)).map(d => +d)

  OnlyNumbers.sort((a, b) => b - a); 
  const length = OnlyNumbers.length; 
  if (length % 2 == 0) { 
    return (OnlyNumbers[length / 2] + OnlyNumbers[(length / 2) - 1]) / 2; 
  } else { 
    return OnlyNumbers[Math.floor(length / 2)]; 
  }
}