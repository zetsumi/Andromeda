import NeDB from 'nedb-promise'

let databases = {}

export default {
  getDatabase (gameId) {
    let filename = `${gameId}.db`

    if (!databases[gameId]) {
      databases[gameId] = NeDB({
        filename,
        autoload: true
      })
    }

    return databases[gameId]
  },
  async getInventory (gameId) {
    return this.getDatabase(gameId).cfind({}).exec()
  },
  async findFile (gameId, path) {
    return this.getDatabase(gameId).findOne({path})
  },
  async insertFile (gameId, path, size, date, checksum) {
    return this.getDatabase(gameId).insert({
      path,
      size,
      date,
      checksum
    })
  },
  async updateFile (gameId, path, size, date, checksum) {
    return this.getDatabase(gameId).update({
      path
    },
    {
      path,
      size,
      date,
      checksum
    })
  },
  async removeFile (gameId, path) {
    return this.getDatabase(gameId).remove({
      path
    })
  }
}
