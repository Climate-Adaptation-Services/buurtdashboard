
export function getClassByIndicatorValue(indicator, value) {
  console.log(indicator, value)
  if (value === null || value === '') { return 'No data' }
  let kl = ''
  Object.keys(indicator.classes).reverse().forEach(klasse => {
    if (+value < +indicator.classes[klasse]) {
      kl = klasse;
    }
  });

  console.log(kl)

  return kl;
}