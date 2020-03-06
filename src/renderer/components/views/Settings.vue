<template>
    <b-container>
        <h1 class='nk-decorated-h-2'>
            <span>{{$t('pages.settings.title')}}</span>
        </h1>

        <div class="nk-info-box text-warning" v-if="restartRequired">
            <div class="nk-info-box-icon">
                <font-awesome-icon :icon="['fas', 'exclamation']"/>
            </div>
            <div class="nk-info-box-close nk-info-box-close-btn">
                <i class="ion-close-round"></i>
            </div>
            <h3>{{$t('pages.settings.restartPending.title')}}</h3>
            <em>{{$t('pages.settings.restartPending.message')}}</em>
        </div>

        <b-card class="bg-dark-1">
            <b-form-group :description="$t('pages.settings.sections.locale.description')" :label="$t('pages.settings.sections.locale.label')">
                <b-form-select v-model="locale" :options="locales" :state="true"></b-form-select>
            </b-form-group>
            <b-form-group :description="$t('pages.settings.sections.installationPath.description')" :label="$t('pages.settings.sections.installationPath.label')">
                <b-form-input directory v-model="installationPath" :state="installationPathState" @click.native="selectInstallationPath()"></b-form-input>
                <b-form-invalid-feedback>{{$t('pages.settings.sections.installationPath.invalid')}}</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group :description="$t('pages.settings.sections.allowFilesDeletion.description')" :label="$t('pages.settings.sections.allowFilesDeletion.label')">
              <b-form-checkbox switch v-model="allowFilesDeletion" name="check-button">
                {{ $t('pages.settings.boolean.' + allowFilesDeletion) }}
              </b-form-checkbox>
            </b-form-group>
        </b-card>
    </b-container>
</template>

<script>
    import SettingsManager from '@/utils/SettingsManager'
    import {remote} from 'electron'
    import fs from 'fs'

    export default {
      data: function () {
        return {
          locales: [
            {
              value: 'de',
              text: 'Deutsch'
            },
            {
              value: 'en',
              text: 'English'
            },
            {
              value: 'fr',
              text: 'Français'
            }
          ],
          locale: null,
          installationPath: null,
          allowFilesDeletion: null
        }
      },
      computed: {
        restartRequired: function () {
          return this.$i18n.locale !== this.locale
        },
        installationPathState: function () {
          return fs.existsSync(this.installationPath)
        }
      },
      methods: {
        selectInstallationPath: function () {
          let result = remote.dialog.showOpenDialog({
            title: this.$t('settings.installationPath.dialog.title'),
            message: this.$t('settings.installationPath.dialog.message'),
            defaultPath: SettingsManager.getInstallationPath(),
            properties: ['openDirectory']
          })

          if (result) {
            this.installationPath = result[0]
          }
        }
      },
      mounted: function () {
        this.locale = SettingsManager.getLocale()
        this.installationPath = SettingsManager.getInstallationPath()
        this.allowFilesDeletion = SettingsManager.getAllowFilesDeletion()
      },
      watch: {
        locale: function () {
          SettingsManager.setLocale(this.locale)
        },
        installationPath: function () {
          if (this.installationPathState) {
            SettingsManager.setInstallationPath(this.installationPath)
          }
        },
        allowFilesDeletion: function () {
          SettingsManager.setAllowFilesDeletion(this.allowFilesDeletion)
        }
      }
    }
</script>

<style>
.big-checkbox {width: 30px; height: 30px;}
</style>
