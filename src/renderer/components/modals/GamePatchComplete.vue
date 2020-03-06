<template>
    <b-modal ref="modalGamePatchComplete" class="align-center" :title="$t('modals.gamePatchComplete.title')" centered hide-footer>
        <font-awesome-icon :icon="['fas', 'thumbs-up']" size="3x" class="text-success"/>
        <hr>
        <p v-if="game">{{$t('modals.gamePatchComplete.message', {title: game.name})}}</p>
				<hr>
				<button class="nk-btn nk-btn-xl nk-btn-rounded nk-btn-color-success" @click="launch(gameId)">
            <font-awesome-icon :icon="['fas', 'play']"/>
            {{$t('modals.gamePatchComplete.playButton')}}
        </button>
    </b-modal>
</template>

<script>
	import EventBus from '@/utils/EventBus'
	import games from '@/const/games'

	export default {
	  data: () => {
	    return {
	      gameId: null,
	      game: null
	    }
	  },
	  methods: {
    launch (gameId) {
      EventBus.$emit('launch', gameId)
      this.$refs.modalGamePatchComplete.hide()
    }
	  },
	  mounted () {
	    EventBus.$on('gamePatchComplete', payload => {
	      this.gameId = payload
	      this.game = games[this.gameId]
	      this.$refs.modalGamePatchComplete.show()
	    })
	  }
	}
</script>