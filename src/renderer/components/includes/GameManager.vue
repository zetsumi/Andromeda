<template>
  <div v-show="patchId">
    <b-progress :max="maxProgress" height="16px" animated v-if="patchStatus >= 5">
      <b-progress-bar :value="downloadProgress" variant="success">
        <span v-if="downloadProgress > 0">{{downloadProgress}} / {{maxDownload}}</span>
      </b-progress-bar>
      <b-progress-bar :value="updateProgress" variant="warning">
        <span v-if="updateProgress > 0">{{updateProgress}} / {{maxUpdate}}</span>
      </b-progress-bar>
      <b-progress-bar :value="removeProgress" variant="danger">
        <span v-if="removeProgress > 0">{{removeProgress}} / {{maxRemove}}</span>
      </b-progress-bar>
    </b-progress>
    <b-progress :max="1" height="16px" animated v-else>
      <b-progress-bar :value="1" variant="info">
        <span>{{$t('includes.gameManager.loading')}}</span>
      </b-progress-bar>
    </b-progress>
  </div>
</template>

<script>
    import EventBus from '@/utils/EventBus'
    import Request from 'request'
    import SettingsManager from '@/utils/SettingsManager'
    import path from 'path'
    import fs from 'fs'
    import fsExtra from 'fs-extra'
    import mkdirp from 'mkdirp'
    import Unzip from 'node-unzip-2'
    import ChildProcess from 'child_process'
    import games from '@/const/games'
    import DatabaseManager from '@/utils/DatabaseManager'
    import glob from 'glob'
    import crypto from 'crypto'
    import ignore from 'ignore'

    const PATCH_STATE = Object.seal({
      ERRORED: -1,
      IDLE: 0,
      POOLING_SERVER: 1,
      FETCHING_METADATA: 2,
      VERIFYING_LOCAL: 3,
      VERIFYING_REMOTE: 4,
      PATCHING: 5
    })

    export default {
      data: () => {
        return {
          maxDownload: 0,
          downloadQueue: [],
          maxUpdate: 0,
          updateQueue: [],
          maxRemove: 0,
          removeQueue: []
        }
      },
      computed: {
        patchStatus () {
          return this.$store.state.patchStatus
        },
        patchId () {
          return this.$store.state.patchId
        },
        maxProgress () {
          return this.maxDownload + this.maxUpdate + this.maxRemove
        },
        downloadProgress () {
          return this.maxDownload - this.downloadQueue.length
        },
        updateProgress () {
          return this.maxUpdate - this.updateQueue.length
        },
        removeProgress () {
          return this.maxRemove - this.removeQueue.length
        }
      },
      methods: {
        handleError (error) {
          this.$store.state.patchStatus = PATCH_STATE.ERRORED
          this.$store.state.patchId = null
          EventBus.$emit('error', error)
        },
        async launch (gameId) {
          let executable
          try {
            executable = (await this.$http.get(`${games[gameId].cassiopeia.base}/${gameId}/meta/executable.json`)).data
          } catch (error) {
            this.handleError(error)
            return
          }

          let cwd = path.join(SettingsManager.getInstallationPath(), gameId, path.dirname(executable.binary))
          ChildProcess.exec(`".\\${executable.binary}" ${executable.arguments}`,
            {
              cwd
            },
            (error, stdout, stderr) => {
              if (error) {
                this.handleError(error)
              }

              console.log(`stdout: ${stdout}`)
              console.log(`stderr: ${stderr}`)
            })
        },
        async patch (gameId) {
          this.$store.state.patchId = gameId

          try {
            this.$store.state.patchStatus = PATCH_STATE.POOLING_SERVER
            if ((await this.$http.head(`${games[gameId].cassiopeia.base}/andromeda`)).status !== 200) {
              throw new Error('Cassiopeia did not get the reference.')
            }
          } catch (error) {
            this.$store.state.patchStatus = PATCH_STATE.ERRORED
            this.$store.state.patchId = null
            EventBus.$emit('serverUnavailable')
            return -1
          }

          try {
            this.$store.state.patchStatus = PATCH_STATE.FETCHING_METADATA
            let remoteInventory = (await this.$http.get(`${games[gameId].cassiopeia.base}/${gameId}/meta/inventory.json`)).data
            let ignored = (await this.$http.get(`${games[gameId].cassiopeia.base}/${gameId}/meta/ignored.json`)).data
            let ignoreEngine = ignore().add(ignored)
            let installationPath = SettingsManager.getInstallationPath()

            this.downloadQueue = []
            this.updateQueue = []
            this.removeQueue = []

            this.$store.state.patchStatus = PATCH_STATE.VERIFYING_LOCAL
            await this.checkLocalToLocal(gameId, ignoreEngine)
            this.$store.state.patchStatus = PATCH_STATE.VERIFYING_REMOTE
            await this.checkLocalToRemote(gameId, remoteInventory, ignoreEngine)

            this.maxDownload = this.downloadQueue.length
            this.maxUpdate = this.updateQueue.length
            this.maxRemove = this.removeQueue.length

            if (this.maxRemove > 0 && !SettingsManager.getAllowFilesDeletion()) {
              this.$store.state.patchStatus = PATCH_STATE.ERRORED
              this.$store.state.patchId = null
              EventBus.$emit('filesDeletionWarning', this.removeQueue)
            } else {
              this.$store.state.patchStatus = PATCH_STATE.PATCHING
              this.processQueues(gameId, installationPath, remoteInventory)
            }
          } catch (error) {
            this.$store.state.patchStatus = PATCH_STATE.ERRORED
            this.$store.state.patchId = null
          }
        },
        async checkLocalToLocal (gameId, ignoreEngine) {
          let installationPath = path.join(SettingsManager.getInstallationPath(), gameId)

          if (!fs.existsSync(installationPath)) {
            mkdirp.sync(installationPath)
          }

          let localFiles = {}
          glob.sync(path.join(installationPath, '**', '*'), {
            nodir: true
          })
            .forEach(file => {
              let normalizedFile = path.normalize(file)
              localFiles[normalizedFile.replace(installationPath, '')] = fs.statSync(normalizedFile)
            })

          for (let file in localFiles) {
            let inventoryEntry = await DatabaseManager.findFile(gameId, file)

            if (inventoryEntry) {
              if (!ignoreEngine.ignores(file.replace(/\\/g, '/').replace('/', '')) && (localFiles[file].size !== inventoryEntry.size || localFiles[file].mtimeMs !== inventoryEntry.date)) {
                this.updateQueue.push(file.replace(/\\/g, '/'))
              }
            } else {
              let checksum = crypto.createHash('sha256').update(fs.readFileSync(path.join(installationPath, file))).digest('hex')
              await DatabaseManager.insertFile(gameId, file, localFiles[file].size, localFiles[file].mtimeMs, checksum)
            }
          }

          let localInventory = await DatabaseManager.getInventory(gameId) || []
          localInventory.forEach(async (file) => {
            if (!localFiles[file.path]) {
              await DatabaseManager.removeFile(gameId, path.normalize(file.path))
            }
          })
        },
        async checkLocalToRemote (gameId, remoteInventory, ignoreEngine) {
          let localInventory = await DatabaseManager.getInventory(gameId)

          for (let file in remoteInventory) {
            let inventoryEntry = await DatabaseManager.findFile(gameId, file.replace(/\//g, '\\'))

            if (!inventoryEntry) {
              this.downloadQueue.push(file)
            } else {
              if (!ignoreEngine.ignores(file.replace(/\\/g, '/').replace('/', '')) && inventoryEntry.checksum !== remoteInventory[file].checksum) {
                this.updateQueue.push(file)
              }
            }
          }

          for (const file of localInventory) {
            let formattedPath = file.path.replace(/\\/g, '/')
            if (!remoteInventory[formattedPath] && !ignoreEngine.ignores(formattedPath.replace('/', ''))) {
              this.removeQueue.push(formattedPath)
            }
          }
        },
        processDownload (gameId, installationPath, remoteInventory) {
          let file = this.downloadQueue[0]
          let url = `${games[gameId].cassiopeia.base}/${gameId}/update${file}.zip`
          let localFile = path.normalize(path.join(installationPath, gameId, file))
          let localFilePath = path.dirname(localFile)

          if (!fs.existsSync(localFilePath)) {
            mkdirp.sync(localFilePath)
          }

          Request.get(url)
            .pipe(Unzip.Extract({path: localFilePath}))
            .on('close', async () => {
              let checksum = remoteInventory[file].checksum
              let stats = fs.statSync(localFile)
              await DatabaseManager.insertFile(gameId, path.normalize(file), stats.size, stats.mtimeMs, checksum)
              delete this.downloadQueue.shift()
              this.processQueues(gameId, installationPath, remoteInventory)
            })
            .on('error', error => {
              this.handleError({
                message: `Download failed for: ${file}`,
                error: error.toString()
              })
            })
        },
        processUpdate (gameId, installationPath, remoteInventory) {
          let file = this.updateQueue[0]
          let url = `${games[gameId].cassiopeia.base}/${gameId}/update${file}.zip`
          let localFile = path.normalize(path.join(installationPath, gameId, file))
          let localFilePath = path.dirname(localFile)

          if (!fs.existsSync(localFilePath)) {
            mkdirp.sync(localFilePath)
          }

          Request.get(url)
            .pipe(Unzip.Extract({path: localFilePath}))
            .on('close', async () => {
              let checksum = remoteInventory[file].checksum
              let stats = fs.statSync(localFile)
              await DatabaseManager.updateFile(gameId, path.normalize(file), stats.size, stats.mtimeMs, checksum)
              this.updateQueue.shift()
              this.processQueues(gameId, installationPath, remoteInventory)
            })
            .on('error', error => {
              this.handleError({
                message: `Update failed for: ${file}`,
                error: error.toString()
              })
            })
        },
        processRemove (gameId, installationPath, remoteInventory) {
          let file = this.removeQueue[0]
          let localFile = path.join(installationPath, gameId, path.normalize(file))

          fsExtra.removeSync(localFile)

          DatabaseManager.removeFile(gameId, path.normalize(file))
          this.removeQueue.shift()
          this.processQueues(gameId, installationPath, remoteInventory)
        },
        async processQueues (gameId, installationPath, remoteInventory) {
          if (this.downloadQueue.length > 0) {
            this.processDownload(gameId, installationPath, remoteInventory)
          } else if (this.updateQueue.length > 0) {
            this.processUpdate(gameId, installationPath, remoteInventory)
          } else if (this.removeQueue.length > 0) {
            this.processRemove(gameId, installationPath, remoteInventory)
          } else {
            setTimeout(() => {
              this.$store.state.patchStatus = PATCH_STATE.IDLE
              this.$store.state.patchId = null
              EventBus.$emit('gamePatchComplete', gameId)
            }, 1000)
          }
        }
      },
      mounted () {
        EventBus.$on('patch', gameId => {
          this.patch(gameId)
        })

        EventBus.$on('launch', gameId => {
          this.launch(gameId)
        })
      }
    }
</script>

<style>
  .progress {
    border-radius: 0;
    box-shadow: 0 0 5px black;
  }

  .progress span {
    text-shadow: 0 0 3px black;
  }
</style>
