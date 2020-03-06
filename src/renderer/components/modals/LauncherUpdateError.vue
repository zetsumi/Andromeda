<template>
    <b-modal ref="modalLauncherUpdateError" class="align-center" :title="$t('modals.launcherUpdateError.title')" centered hide-footer>
        <font-awesome-icon :icon="['fas', 'bolt']" size="3x" class="text-danger"/>
        <hr>
        <p>{{$t('modals.launcherUpdateError.message')}}</p>
        <pre class="text-left">{{error}}</pre>
    </b-modal>
</template>

<script>
    import {ipcRenderer} from 'electron'

    export default {
      data () {
        return {
          error: null
        }
      },
      mounted () {
        ipcRenderer.on('launcher-update-error', (event, error) => {
          this.error = error
          this.$refs.modalLauncherUpdateError.show()
        })
      }
    }
</script>
