<script setup>
import BlobModal from "./BlobModal.vue"
import ConfirmationModal from "./ConfirmationModal.vue"
import RawDataModal from "./RawDataModal.vue"
import ConstantsModal from "./ConstantsModal.vue"
import QRCodeModal from "./QRCodeModal.vue"
import ImportBookmarksModal from "./ImportBookmarksModal.vue"
import EditBookmarkAliasModal from "./EditBookmarkAliasModal.vue"
import SendModal from "./SendModal.vue"
import PayForBlobModal from "./PayForBlobModal.vue"

/**
 * Store
 */
import { useModalsStore } from "@/store/modals"
const modalsStore = useModalsStore()
</script>

<template>
	<BlobModal :show="modalsStore.modals.blob" @onClose="modalsStore.close('blob')" />
	<ConfirmationModal :show="modalsStore.modals.confirmation" @onClose="modalsStore.close('confirmation')" />
	<RawDataModal :show="modalsStore.modals.rawData" @onClose="modalsStore.close('rawData')" />
	<ConstantsModal :show="modalsStore.modals.constants" @onClose="modalsStore.close('constants')" />
	<QRCodeModal :show="modalsStore.modals.qr" @onClose="modalsStore.close('qr')" />
	<ImportBookmarksModal :show="modalsStore.modals.import" @onClose="modalsStore.close('import')" />
	<EditBookmarkAliasModal :show="modalsStore.modals.edit_alias" @onClose="modalsStore.close('edit_alias')" />
	<SendModal :show="modalsStore.modals.send" @onClose="modalsStore.close('send')" />
	<PayForBlobModal :show="modalsStore.modals.pfb" @onClose="modalsStore.close('pfb')" />
</template>
