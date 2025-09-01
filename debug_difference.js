// Quick debug test for difference mode
import { getDifferenceValue, getAHNSelection } from './src/lib/noncomponents/valueRetrieval.js'

// Test with a mock feature and indicator
const mockFeature = {
  properties: {
    'BKB_AHN3': 25.5,
    'BKB_AHN4': 28.2,
    'BKB_AHN5': 30.1
  }
}

const mockIndicator = {
  title: 'Boomkroonoppervlakte',
  attribute: 'BKB',
  numerical: true
}

console.log('=== DIFFERENCE MODE DEBUG ===')
console.log('Mock feature properties:', mockFeature.properties)
console.log('Mock indicator:', mockIndicator)

// Test difference calculation
try {
  const diffValue = getDifferenceValue(mockFeature, mockIndicator, {
    baseYear: 'AHN3',
    compareYear: 'AHN4'
  })
  console.log('Difference value (AHN4 - AHN3):', diffValue)
  console.log('Expected:', 28.2 - 25.5, '=', 2.7)
} catch (error) {
  console.error('Error calculating difference:', error)
}

// Test AHN selection
try {
  const ahnSelection = getAHNSelection(mockIndicator)
  console.log('AHN Selection:', ahnSelection)
} catch (error) {
  console.error('Error getting AHN selection:', error)
}
