<template>
    <b-modal ref="modalOffline" class="align-center" :title="$t('modals.offline.title')" centered hide-footer hide-header-close no-close-on-esc no-close-on-backdrop v-model="isOffline">
        <font-awesome-icon :icon="['fas', 'unlink']" size="3x" class="text-danger"/>
        <hr>
        <p>{{$t('modals.offline.message')}}</p>
        <b-button @click="quit()" class="nk-btn nk-btn-rounded nk-btn-color-main-1">{{$t('modals.offline.exitButton')}}</b-button>
    </b-modal>
</template>

<script>
    import {remote} from 'electron'

    export default {
      methods: {
        quit () {
          remote.app.quit()
        }
      }
    }
</script>
