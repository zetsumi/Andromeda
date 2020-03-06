<template>
    <div>
      <b-container>
        <h1 class='nk-decorated-h-2'>
            <span>{{$t('pages.library.title')}}</span>
        </h1>
      </b-container>

        <div class="text-center">
            <div class="games-list" v-dragscroll.x>
                <div v-for="(game, id) in games" :key="id">
                    <b-card no-body v-bind:class="{'active': game === games[currentGameId]}" class="games-list-item bg-dark-2 text-center">
                        <b-link :to="{name: 'my-games', params: {id}}">
                            <b-card-img-lazy :src="gameBanner(id)"
                              blank-src="https://imagizer.imageshack.com/img924/8418/lx48t9.gif"
                              onerror="this.onerror=null;this.src='https://imagizer.imageshack.com/img923/612/Isi8WO.png';" top></b-card-img-lazy>
                        </b-link>
                        <b-card-body>
                            <b-button v-if="isInstalled(id)" @click="patch(id)" :disabled="patchId !== null"
                                class="nk-btn nk-btn-xs nk-btn-rounded" :class="{'nk-btn-color-main-1' : patchId === null}">
                                <font-awesome-icon :icon="['fas', 'play']"/>
                                {{$t('pages.library.playButton')}}
                            </b-button>
                        </b-card-body>
                    </b-card>
                </div>
            </div>
        </div>

        <div class="nk-gap"></div>

        <b-container>
            <h2 class="nk-decorated-h">
                <span>
                  <span class="text-main-1">{{currentGame.name}}</span>
                  <span v-if="currentGameMedia && currentGameMedia.promotion && currentGameMedia.promotion.links">
                    <b-link v-if="currentGameMedia.promotion.links.website" @click="openLinkExternally(currentGameMedia.promotion.links.website)">
                      <font-awesome-icon :icon="['fas', 'globe']" class="color-web"/>
                    </b-link>
                    <b-link v-if="currentGameMedia.promotion.links.discord" @click="openLinkExternally(currentGameMedia.promotion.links.discord)">
                      <font-awesome-icon :icon="['fab', 'discord']" class="color-discrod"/>
                    </b-link>
                  </span>
                </span>
            </h2>

            <b-row>
                <b-col class="text-center" v-if="patchStatus <= 0">
                    <b-button-group>
                        <b-button v-if="isInstalled(currentGameId)" @click="patch(currentGameId)" :disabled="patchId !== null"
                            class="nk-btn nk-btn-x4 nk-btn-rounded" :class="{'nk-btn-color-main-1' : patchId === null}">
                            <font-awesome-icon :icon="['fas', 'play']"/>
                            {{$t('pages.library.playButton')}}
                        </b-button>
                        <b-button v-else-if="isAvailable" @click="patch(currentGameId)" :disabled="patchId !== null"
                            class="nk-btn nk-btn-x4 nk-btn-rounded" :class="{'nk-btn-color-main-3' : patchId === null}">
                            <font-awesome-icon :icon="['fas', 'download']"/>
                            {{$t('pages.library.installButton')}}
                        </b-button>
                        <b-button v-else disabled class="nk-btn nk-btn-x4 nk-btn-rounded nk-btn-disabled">
                            <font-awesome-icon :icon="['fas', 'hard-hat']"/>
                            {{$t('pages.library.soonButton')}}
                        </b-button>
                        <b-button class="nk-btn nk-btn-color-main-6" v-if="currentGameSettings && isInstalled(currentGameId)"
                            :disabled="patchId !== null" @click="openGameSettings(currentGameId, currentGameExecutable, currentGameSettings)">
                            <font-awesome-icon :icon="['fas', 'cog']" size="lg"/>
                        </b-button>
                    </b-button-group>
                </b-col>
                <b-col v-else-if="patchId === currentGameId">
                    <div class="nk-info-box text-info">
                        <div class="nk-info-box-icon">
                            <font-awesome-icon :icon="['fas', $t('pages.library.patchStatus.' + patchStatus + '.icon')]"/>
                        </div>
                        <h3>{{$t('pages.library.patchStatus.' + patchStatus + '.title')}}</h3>
                        <em>{{$t('pages.library.patchStatus.' + patchStatus + '.message')}}</em>
                    </div>
                </b-col>
                <b-col class="text-center" v-else>
                    <p>{{$t('pages.library.waitForUpdate', {name: games[patchId].name})}}</p>
                </b-col>
            </b-row>

            <div class="nk-gap-2"></div>

            <b-row v-if="currentGameMedia && currentGameMedia.promotion">
                <b-col cols="6" v-if="currentGameMedia.promotion.video">
                    <h4 class="nk-decorated-h-2"><span>{{$t('pages.library.sections.promotion.video.title')}}</span></h4>
                    <b-embed type="video"
                             aspect="16by9"
                             :src="currentGameMedia.promotion.video"
                             controls
                             controlsList="nodownload"
                             autoplay
                             loop
                             muted
                             class="promoted-video bg-dark-1 shadow"
                    ></b-embed>
                </b-col>

                <b-col cols="6" v-if="currentGameMedia.promotion.carousel">
                    <h4 class="nk-decorated-h-2"><span>{{$t('pages.library.sections.promotion.screenshots.title')}}</span></h4>
                    <b-embed aspect="16by9" type="div" class="shadow">
                        <b-carousel controls
                                    indicators
                                    :interval="4000"
                                    class="promoted-images bg-dark-1">
                            <b-carousel-slide v-for="item in currentGameMedia.promotion.carousel.items"
                                              :caption="item.title"
                                              :text="item.content"
                                              :img-src="item.image"></b-carousel-slide>
                        </b-carousel>
                    </b-embed>
                </b-col>
            </b-row>

            <div class="nk-gap-2"></div>

        </b-container>
    </div>
</template>

<script>
  import EventBus from '@/utils/EventBus'
  import GamesManager from '@/utils/GamesManager'
  import games from '@/const/games'
  import {shell} from 'electron'

  export default {
    data () {
      return {
        games,
        currentGameMedia: undefined,
        currentGameExecutable: undefined,
        currentGameSettings: undefined,
        isAvailable: undefined
      }
    },
    computed: {
      patchStatus () {
        return this.$store.state.patchStatus
      },
      patchId () {
        return this.$store.state.patchId
      },
      currentGameId () {
        return this.$route.params.id || this.games[Object.keys(this.games)[0]]
      },
      currentGame () {
        return this.games[this.currentGameId]
      }
    },
    methods: {
      isInstalled: GamesManager.isInstalled,
      patch (gameId) {
        EventBus.$emit('patch', gameId)
      },
      openLinkExternally: shell.openExternal,
      openGameSettings (gameId, gameExecutable, gameSettings) {
        EventBus.$emit('gameSettings', {
          gameId,
          gameExecutable,
          gameSettings
        })
      },
      gameBanner (gameId) {
        return `${this.games[gameId].cassiopeia.base}/${gameId}/media/banner.png`
      }
    },
    beforeCreate () {
      if (!this.$route.params.id) {
        this.$router.push({ name: 'my-games', params: { id: Object.keys(games)[0] } })
      }
    },
    mounted () {
      // probe server
      this.$http.head(`${this.games[this.currentGameId].cassiopeia.base}/andromeda`)
        .then((data) => {
          this.isAvailable = data.status === 200
        })
        .catch(() => {
          this.isAvailable = false
        })

      // retrieve promotional content
      this.$http.get(`${this.games[this.currentGameId].cassiopeia.base}/${this.currentGameId}/meta/media.json`)
        .then((data) => {
          this.currentGameMedia = data.data
        })
        .catch(() => {
          this.currentGameMedia = undefined
        })

      // retrieve settings
      this.$http.get(`${this.games[this.currentGameId].cassiopeia.base}/${this.currentGameId}/meta/executable.json`)
        .then((data) => {
          this.currentGameExecutable = data.data
        })
        .catch(() => {
          this.currentGameExecutable = undefined
        })
      this.$http.get(`${this.games[this.currentGameId].cassiopeia.base}/${this.currentGameId}/meta/settings.json`)
        .then((data) => {
          this.currentGameSettings = data.data
        })
        .catch(() => {
          this.currentGameSettings = undefined
        })
    }
  }
</script>

<style lang="scss" scoped>
    @import "../../assets/goodgames/scss/_variables.scss";

    .games-list {
        display: inline-flex;
        max-width: 100%;
        overflow-x: auto;
        margin: auto;
    }
    .games-list > * {
        flex: 0 0 auto;
        padding: 10px;
    }
    .games-list-item {
        box-shadow: 0 0 10px white;
        transition-duration: 0.5s;
    }
    .games-list-item.active {
        box-shadow: 0 0 10px $color_main_1;
    }
    .games-list-item img {
        width: 240px;
        height: 135px;
        object-fit: cover;
    }
    .games-list-item .card-body {
        padding: 0;
    }
    .games-list-item .card-body button {
        width: 100%;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }
    .promoted-video {
        width: 100%;
    }
    .promoted-images {
        width: 100%;
        height: 100%;
    }
    .color-web {
        color: #FFE57F;
    }
    .color-discrod {
        color: #7289DA;
    }
</style>