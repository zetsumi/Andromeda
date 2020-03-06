<template>
    <b-container>
        <h1 class='nk-decorated-h-2'>
            <span>{{$t('pages.about.title')}}</span>
        </h1>

        <table class='nk-table text-center'>
            <thead>
            <th>
                <font-awesome-icon :icon="['fas', 'drafting-compass']"/>
                {{$t('pages.about.sections.application.title')}}
            </th>
            </thead>
            <tbody>
            <tr>
                <td>
                    <img src="@/assets/logo.png" height="100px"/>
                    <p>Andromeda {{versions.app}}</p>
                    <b-card-group>
                        <b-card class="bg-dark-2">
                            <p class="card-text">
                                Node
                                <font-awesome-icon :icon="['fab', 'node-js']" size="lg"/>
                                {{versions.node}}
                            </p>
                        </b-card>
                        <b-card class="bg-dark-2">
                            <p class="card-text">
                                Electron
                                <font-awesome-icon :icon="['fas', 'atom']" size="lg"/>
                                {{versions.electron}}
                            </p>
                        </b-card>
                        <b-card class="bg-dark-2">
                            <p class="card-text">
                                Vue
                                <font-awesome-icon :icon="['fab', 'vuejs']" size="lg"/>
                                {{versions.vue}}
                            </p>
                        </b-card>
                    </b-card-group>
                </td>
            </tr>
            </tbody>
        </table>
    </b-container>
</template>

<script>
    import {remote} from 'electron'

    export default {
      computed: {
        versions () {
          return {
            app: remote.app.getVersion(),
            electron: process.versions.electron,
            vue: require('vue/package.json').version,
            node: process.versions.node
          }
        }
      }
    }
</script>
