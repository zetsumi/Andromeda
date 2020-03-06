<template>
    <b-modal ref="modalFilesDeletionWarning" class="align-center" :title="$t('modals.filesDeletionWarning.title')" centered hide-footer>
        <font-awesome-icon :icon="['fas', 'eraser']" size="3x" class="text-danger"/>
        <hr>
        <p>{{$t('modals.filesDeletionWarning.message')}}</p>
				<hr>
				<div class="text-left">
					<p>{{$t('modals.filesDeletionWarning.details')}}</p>
					<ul>
						<li v-for="item in list">{{item}}</li>
					</ul>
				</div>
    </b-modal>
</template>

<script>
	import EventBus from '@/utils/EventBus'

	export default {
	  data: () => {
	    return {
	      list: []
	    }
	  },
	  mounted () {
	    EventBus.$on('filesDeletionWarning', payload => {
	      this.list = payload
	      this.$refs.modalFilesDeletionWarning.show()
	    })
	  }
	}
</script>

<style scoped>
ul {
	max-height: 200px;
	overflow-y: scroll
}
</style>
