import Settings from 'electron-settings'
import Electron from 'electron'
import path from 'path'

const INSTALLATION_PATH = 'installationPath'
const LOCALE = 'locale'
const ALLOW_FILES_DELETION = 'allowFilesDeletion'

export default {
  getInstallationPath () {
    return Settings.get(INSTALLATION_PATH, path.join(Electron.remote.app.getPath('desktop'), 'Astral Games'))
  },
  setInstallationPath (value) {
    Settings.set(INSTALLATION_PATH, value)
  },
  getLocale () {
    return Settings.get(LOCALE, Electron.remote.app.getLocale())
  },
  setLocale (value) {
    Settings.set(LOCALE, value)
  },
  getAllowFilesDeletion () {
    return Settings.get(ALLOW_FILES_DELETION, false)
  },
  setAllowFilesDeletion (value) {
    Settings.set(ALLOW_FILES_DELETION, value)
  }
}
