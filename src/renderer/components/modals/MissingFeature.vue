<template>
    <b-modal id="modalMissingFeature" class="align-center" :title="$t('modals.missingFeature.title')" centered hide-footer>
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" size="3x" class="text-warning"/>
        <hr>
        <p>{{$t('modals.missingFeature.message')}}</p>
    </b-modal>
</template>
