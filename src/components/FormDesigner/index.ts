import FormDesigner from './src/designer/index.vue'
import FormViewer from './src/viewer/FormViewer.vue'

// Export types
export * from './src/types'

// Export field registry utilities
export { fieldTypeRegistry, getFieldTypeConfig, getFieldTypesByCategory, registerFieldType } from './src/fieldRegistry'

export { FormViewer }

// Export main component
export default FormDesigner
