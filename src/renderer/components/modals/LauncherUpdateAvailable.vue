<template>
    <b-modal ref="modalLauncherUpdateAvailable" class="align-center" :title="$t('modals.launcherUpdateAvailable.title')" centered hide-footer>
        <font-awesome-icon :icon="['fas', 'cloud-download-alt']" size="3x" class="text-info"/>
        <hr>
        <p>{{$t('modals.launcherUpdateAvailable.message')}}</p>
    </b-modal>
</template>

<script>
    import {ipcRenderer} from 'electron'

    export default {
      mounted () {
        ipcRenderer.on('launcher-update-available', () => {
          this.$refs.modalLauncherUpdateAvailable.show()
        })
      }
    }
</script>
