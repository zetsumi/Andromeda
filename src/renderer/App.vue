<template>
    <div id="app">
        <nav-partial v-if="isOnline"/>
        <div id="patch-progress" v-if="isOnline">
            <patch-progress-component/>
        </div>
        <router-view id="main" v-if="isOnline" :key="$route.fullPath"/>
        <footer-partial v-if="isOnline"/>

        <error-modal/>
        <game-patch-complete-modal/>
        <offline-modal/>
        <missing-feature-modal/>
        <server-unavailable-modal/>
        <launcher-update-available-modal/>
        <launcher-update-ready-modal/>
        <launcher-update-error-modal/>
        <files-deletion-warning-modal/>
        <game-settings-modal/>

        <img class="nk-page-background-top" src="@/assets/bg-top.png">
        <img class="nk-page-background-bottom" src="@/assets/bg-bottom.png">
    </div>
</template>

<script>
  import NavPartial from './components/includes/Nav'
  import FooterPartial from './components/includes/Footer'
  import PatchProgressComponent from './components/includes/GameManager'
  import ErrorModal from './components/modals/Error'
  import GamePatchCompleteModal from './components/modals/GamePatchComplete'
  import OfflineModal from './components/modals/Offline'
  import MissingFeatureModal from './components/modals/MissingFeature'
  import ServerUnavailableModal from './components/modals/ServerUnavailable'
  import LauncherUpdateAvailableModal from './components/modals/LauncherUpdateAvailable'
  import LauncherUpdateReadyModal from './components/modals/LauncherUpdateReady'
  import LauncherUpdateErrorModal from './components/modals/LauncherUpdateError'
  import FilesDeletionWarningModal from './components/modals/FilesDeletionWarning'
  import GameSettingsModal from './components/modals/GameSettings'

  export default {
    components: {
      NavPartial,
      FooterPartial,
      PatchProgressComponent,
      ErrorModal,
      GamePatchCompleteModal,
      OfflineModal,
      MissingFeatureModal,
      ServerUnavailableModal,
      LauncherUpdateAvailableModal,
      LauncherUpdateReadyModal,
      LauncherUpdateErrorModal,
      FilesDeletionWarningModal,
      GameSettingsModal
    }
  }
</script>

<style lang="scss">
  @import "assets/goodgames/scss/_variables.scss";

  //TODO: override theme

  @import "assets/goodgames/scss/goodgames.scss";

  ::-webkit-scrollbar {
    background-color: transparent;
    width: .8em;
    height: .8em;
  }
  ::-webkit-scrollbar-thumb:window-inactive, ::-webkit-scrollbar-thumb {
      background: $color_main_1;
      border-radius: 20px;
  }
  #app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  #patch-progress {
    flex: 0;
    margin-top: 50px;
  }
  #main {
    flex: 1;
    overflow: auto;
    padding-top: 10px;
  }
</style>
