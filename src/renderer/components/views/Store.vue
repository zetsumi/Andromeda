<template>
    <b-container>
        <h1 class='nk-decorated-h-2'>
            <span>{{$t('pages.store.title')}}</span>
        </h1>

        <div class="games-list">
            <div v-for="(game, id) in games" :key="id">
                <b-card no-body class="games-list-item bg-dark-2 text-center">
                    <b-link :to="{name: 'my-games', params: {id}}">
                        <b-card-img-lazy :src="gameBanner(id)"
                              blank-src="https://imagizer.imageshack.com/img924/8418/lx48t9.gif"
                              onerror="this.onerror=null;this.src='https://imagizer.imageshack.com/img923/612/Isi8WO.png';"
                              top></b-card-img-lazy>
                    </b-link>
                    <b-card-body v-if="isInstalled(id)">
                        <button @click="patch(id)" :disabled="patchId !== null"
                            class="nk-btn nk-btn-xs nk-btn-rounded" :class="{'nk-btn-color-main-1' : patchId === null}">
                            <font-awesome-icon :icon="['fas', 'play']"/>
                            {{$t('pages.store.playButton')}}
                        </button>
                    </b-card-body>
                </b-card>
            </div>
        </div>
    </b-container>
</template>

<script>
    import EventBus from '@/utils/EventBus'
    import GamesManager from '@/utils/GamesManager'
    import games from '@/const/games'

    export default {
      data () {
        return {
          games
        }
      },
      computed: {
        patchId () {
          return this.$store.state.patchId
        }
      },
      methods: {
        isInstalled: GamesManager.isInstalled,
        patch (gameId) {
          EventBus.$emit('patch', gameId)
        },
        gameBanner (gameId) {
          return `${this.games[gameId].cassiopeia.base}/${gameId}/media/banner.png`
        }
      }
    }
</script>

<style scoped>
    .games-list {
        display: inline-flex;
        flex-direction: row;
        justify-content: center;
        flex-wrap: wrap;
    }
    .games-list > * {
        flex: 0 0 auto;
        padding: 10px;
    }
    .games-list-item img {
        width: 320px;
        height: 180px;
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
</style>