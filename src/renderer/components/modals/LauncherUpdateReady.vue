<template>
    <b-modal ref="modalLauncherUpdateReady" class="align-center" :title="$t('modals.launcherUpdateSuccess.title')" centered hide-footer>
        <font-awesome-icon :icon="['fas', 'check']" size="3x" class="text-success"/>
        <hr>
        <p>{{$t('modals.launcherUpdateSuccess.message', {newVersion})}}</p>
        <button class="nk-btn nk-btn-xl nk-btn-rounded nk-btn-color-success" @click="restart()">
            <font-awesome-icon :icon="['fas', 'undo-alt']"/>
            {{$t('modals.launcherUpdateSuccess.restartButton')}}
        </button>
    </b-modal>
</template>

<script>
    import {ipcRenderer} from 'electron'

    export default {
      data () {
        return {
          newVersion: null
        }
      },
      methods: {
        restart () {
          ipcRenderer.sendSync('launcher-update-restart')
        }
      },
      mounted () {
        ipcRenderer.on('launcher-update-ready', (event, newVersion) => {
          this.newVersion = newVersion
          this.$refs.modalLauncherUpdateReady.show()
        })
      }
    }
</script>
