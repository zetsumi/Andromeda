<template>
    <b-modal ref="modalGameSettings" class="align-center" :title="$t('modals.gameSettings.title')" centered hide-footer>
        <font-awesome-icon :icon="['fas', 'cog']" size="3x" class="text-info"/>
        <hr>
        <div class="text-left">
          <b-form v-if="gameSettings">
            <b-form-group :label="$t('modals.gameSettings.sections.resolution.label')">
              <b-form-select v-model="settings.resolution" :options="gameSettings.resolutions" size="sm" class="mt-3"></b-form-select>
            </b-form-group>

            <b-form-group :label="$t('modals.gameSettings.sections.fullscreen.label')">
              <b-form-checkbox switch v-model="settings.fullscreen" name="fullscreen"></b-form-checkbox>
            </b-form-group>
          </b-form>
        </div>
		<hr>
		<pre v-if="error">{{error}}</pre>
    <b-button variant="primary" @click="saveSettings()" class="nk-btn">
      <font-awesome-icon :icon="['fas', 'save']" size="lg"/> 
      {{$t('modals.gameSettings.saveButton')}}
    </b-button>
    </b-modal>
</template>

<script>
	import EventBus from '@/utils/EventBus'
	import SettingsManager from '@/utils/SettingsManager'
	import games from '@/const/games'
	import path from 'path'
	import fs from 'fs'
	import ini from 'ini'

	export default {
	  data () {
	    return {
	      games,
	      gameId: undefined,
	      gameExecutable: undefined,
	      gameSettings: undefined,
	      settings: {
	        resolution: undefined,
	        fullscreen: undefined
      },
	      error: undefined
	    }
	  },
	  methods: {
    getSettings () {
      let settingsFile = path.join(SettingsManager.getInstallationPath(), this.gameId, this.gameExecutable.settings)

      if (!fs.existsSync(settingsFile)) {
        let defaultSettings = ''
        defaultSettings += 'resolution 800 600\n'
        defaultSettings += 'fullscreen 0\n'
        fs.writeFileSync(settingsFile, defaultSettings)
      }

      let input = fs.readFileSync(settingsFile, 'utf-8')

      return ini.parse(input)
    },
	    loadSettings () {
      let parsed = this.getSettings()

      for (let key in parsed) {
        let values = key.split(' ')
        switch (values[0]) {
          case 'resolution':
            let ocurrence = this.gameSettings.resolutions.find((res) => res.value === `${values[1]} ${values[2]}`)
            this.settings.resolution = ocurrence ? `${values[1]} ${values[2]}` : this.gameSettings.resolutions[0].value
            break
          case 'fullscreen':
            this.settings.fullscreen = values[1] === 1
            break
        }
      }
    },
    saveSettings () {
      let settingsFile = path.join(SettingsManager.getInstallationPath(), this.gameId, this.gameExecutable.settings)
      let parsed = this.getSettings()

      if (!parsed) {
        parsed = {}
      }

      let output = ''
      for (let key in parsed) {
        let values = key.split(' ')
        switch (values[0]) {
          case 'resolution':
            output += `${values[0]} ${this.settings.resolution} \n`
            break
          case 'fullscreen':
            output += `${values[0]} ${this.settings.fullscreen ? '1' : '0'} \n`
            break
          default:
            output += `${key}\n`
        }
      }

      fs.writeFileSync(settingsFile, output)
	      this.$refs.modalGameSettings.hide()
    }
	  },
	  mounted () {
	    EventBus.$on('gameSettings', payload => {
      this.error = undefined
      this.gameId = payload.gameId
      this.gameExecutable = payload.gameExecutable
      this.gameSettings = payload.gameSettings

      this.loadSettings()

	      this.$refs.modalGameSettings.show()
	    })
	  }
	}
</script>