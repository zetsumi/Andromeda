<template>
    <b-modal ref="modalMissingFeature" class="align-center" :title="$t('modals.error.title')" centered hide-footer>
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" size="3x" class="text-danger"/>
        <hr>
        <p>{{$t('modals.error.message')}}</p>
		<hr>
		<pre class="text-left">{{error}}</pre>
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
	    EventBus.$on('error', payload => {
	      this.error = typeof payload === 'string' ? payload.toString() : payload
	      this.$refs.modalMissingFeature.show()
	    })
	  }
	}
</script>