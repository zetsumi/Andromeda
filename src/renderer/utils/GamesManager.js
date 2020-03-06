import fs from 'fs'
import path from 'path'
import SettingsManager from '@/utils/SettingsManager'

export default {
  isInstalled (gameId) {
    return fs.existsSync(path.join(SettingsManager.getInstallationPath(), gameId))
  }
}
