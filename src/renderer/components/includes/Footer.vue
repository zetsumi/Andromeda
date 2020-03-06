<template>
    <footer class="nk-footer">
        <b-container class="text-center">
            <span class="text-muted">Copyright © {{today.getFullYear()}} Astral-Studio</span>
            <div class="scroll-left" v-if="!isProduction">
                <p class="lead"><font-awesome-icon :icon="['fas', 'bug']"/> DEVELOPMENT BUILD - FOR TESTING PURPOSE ONLY</p>
            </div>
        </b-container>
    </footer>
</template>

<script>
    export default {
      data () {
        return {
          today: new Date()
        }
      },
      computed: {
        isProduction: () => {
          return process.env.NODE_ENV === 'production'
        }
      }
    }
</script>

<style scoped>
    footer {
        box-shadow: 0 0 5px black;
    }

    .scroll-left {
        height: 50px;
        overflow: hidden;
        position: relative;
    }

    .scroll-left p {
        position: absolute;
        width: 100%;
        height: 100%;
        margin: 0;
        line-height: 50px;
        text-align: center;
        transform: translateX(100%);
        animation: scroll-left 10s linear infinite;
    }

    @keyframes scroll-left {
        0% {
            transform: translateX(100%);
        }
        100% {
            transform: translateX(-100%);
        }
    }
</style>
