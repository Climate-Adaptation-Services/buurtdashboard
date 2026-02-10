import { getNoDataReason } from './valueRetrieval.js'

export function getClassByIndicatorValue(indicator, value) {

  if (value === null || value === '') { return 'No data' }

  // Check for specific no-data codes (-9991, -9995, -9999)
  const noDataReason = getNoDataReason(value)
  if (noDataReason && noDataReason !== 'no_data') {
    // Return the specific no-data reason as the class name
    return noDataReason
  }
  if (noDataReason === 'no_data') {
    return 'No data'
  }

  let kl = ''
  Object.keys(indicator.classes).reverse().forEach(klasse => {
    if (+value < +indicator.classes[klasse]) {
      kl = klasse;
    }
  });

  return kl;
}