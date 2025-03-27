
export function getClassByIndicatorValue(indicator, value) {
  if (value === null || value === '') { return 'No data' }
  let kl = ''
  Object.keys(indicator.classes).reverse().forEach(klasse => {
    console.log(value, klasse, indicator.classes, indicator.classes[klasse])
    if (value < indicator.classes[klasse]) {
      kl = klasse;
    }
  });

  return kl;
}