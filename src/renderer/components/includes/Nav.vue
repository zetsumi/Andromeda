<template>
  <b-navbar type="dark" fixed="top" class="nk-navbar nk-navbar-fixed">
    <div class="nk-nav-table">
      <b-navbar-brand class="nk-nav-logo">
        <img src="@/assets/logo.png">
      </b-navbar-brand>

      <b-navbar-nav class="nk-nav nk-nav-left" v-if="isOnline">
        <b-nav-item :to="{name: 'my-games', params: {id: patchId}}" v-if="patchId">
          <font-awesome-icon :icon="['fas', 'download']"/>
        </b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav class="nk-nav nk-nav-right navbar-actions">
        <b-nav-item to="/my-games" v-if="isOnline">{{$t('includes.nav.menus.library')}}</b-nav-item>
        <b-nav-item to="/store" v-if="isOnline">{{$t('includes.nav.menus.store')}}</b-nav-item>
        <b-nav-item to="/settings" v-if="isOnline">{{$t('includes.nav.menus.settings')}}</b-nav-item>
        <b-nav-item to="/monitor" v-if="isOnline && !isProduction">{{$t('includes.nav.menus.monitor')}}</b-nav-item>
        <b-nav-item to="/about" v-if="isOnline">{{$t('includes.nav.menus.about')}}</b-nav-item>
        <b-nav-item class="window-control" @click="minimizeWindow()">
          <font-awesome-icon :icon="['fas', 'minus']" size="lg" class="text-warning" />
        </b-nav-item>
        <b-nav-item class="window-control" @click="toggleMaximizeWindow()">
          <font-awesome-icon :icon="toggleMaximizeIcon" size="lg" class="text-success" />
        </b-nav-item>
        <b-nav-item class="window-control" @click="closeWindow()">
          <font-awesome-icon :icon="['fas', 'times']" size="lg" class="text-danger" />
        </b-nav-item>
      </b-navbar-nav>
    </div>
  </b-navbar>
</template>

<script>
  export default {
    data: function () {
      return {
        toggleMaximizeIcon: ['fas', 'expand']
      }
    },
    computed: {
      patchId () {
        return this.$store.state.patchId
      },
      isProduction () {
        return process.env.NODE_ENV === 'production'
      }
    },
    methods: {
      minimizeWindow: function () {
        this.$electron.remote.getCurrentWindow().minimize()
      },
      toggleMaximizeWindow: function () {
        let currentWindow = this.$electron.remote.getCurrentWindow()
        currentWindow.isMaximized() ? currentWindow.unmaximize() : currentWindow.maximize()
        this.$data.toggleMaximizeIcon = this.getToggleMaximizeIcon()
      },
      closeWindow: function () {
        this.$electron.remote.getCurrentWindow().close()
      },
      getToggleMaximizeIcon: function () {
        return this.$electron.remote.getCurrentWindow().isMaximized() ? ['fas', 'compress'] : ['fas', 'expand']
      }
    }
  }
</script>

<style scoped>
.nk-navbar {
  -webkit-app-region: drag;
  padding: 0 20px;
  box-shadow: 0 0 5px black;
}

.nk-navbar .navbar-actions li:last-child {
  margin-right: 0px !important;
}

.nk-nav-logo {
  height: 50px;
  padding: 5px;
}

.nk-nav-logo img {
  max-height: 100%;
}

.nav-link {
  -webkit-app-region: no-drag;
}

.window-control > a {
  padding-left: 0 !important;
}
</style>
