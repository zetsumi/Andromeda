<template>
    <b-modal ref="modalServerUnavailable" class="align-center" :title="$t('modals.serverUnavailable.title')" centered hide-footer>
        <font-awesome-icon :icon="['fas', 'ghost']" size="3x" class="text-danger"/>
        <hr>
        <p>{{$t('modals.serverUnavailable.message')}}</p>
    </b-modal>
</template>

<script>
	import EventBus from '@/utils/EventBus'

	export default {
	  data: () => {
	    return {
	      error: null
	    }
	  },
	  mounted () {
	    EventBus.$on('serverUnavailable', this.$refs.modalServerUnavailable.show)
	  }
	}
</script>