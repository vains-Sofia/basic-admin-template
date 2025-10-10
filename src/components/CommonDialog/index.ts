import CommonDialog from './src/index.vue'
import { type DialogOptions, usePluginStore } from '@/stores/Plugins.ts'

const dialog = usePluginStore()

const openDialog = (options: DialogOptions) => dialog.openDialog(options)
const closeDialog = (id: string | undefined) => dialog.closeDialog(id)
export { CommonDialog, openDialog, closeDialog }

export default CommonDialog
