export function getIndicatorAttribute(indicator, attribute) {
  if (indicator.AHNversie) {
    return attribute + 'AHN4'
  } else {
    return attribute
  }
}