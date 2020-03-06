<template>
    <b-container>
        <h1 class='nk-decorated-h-2'>
            <span>{{$t('pages.monitor.title')}}</span>
        </h1>

        <div class="text-center" v-if="!systemInformation">
            <div style="height: 300px">
                <loading-image></loading-image>
            </div>
            <em>{{$t('pages.monitor.loading')}}</em>
        </div>
        <table class='nk-table text-center' v-else>
            <thead>
            <th>
                <font-awesome-icon :icon="osIcon"/>
                {{$t('pages.monitor.sections.os.title')}}
            </th>
            </thead>
            <tbody>
            <tr>
                <td>
                    {{systemInformation.os.distro}} ({{systemInformation.os.release}})
                </td>
            </tr>
            </tbody>
            <thead>
            <th>
                <font-awesome-icon :icon="['fas', 'memory']"/>
                {{$t('pages.monitor.sections.ram.title')}}
            </th>
            </thead>
            <tbody>
            <tr>
                <td>
                    <p>
                        {{$t('pages.monitor.sections.ram.text', {quantity: convertOrderOfMagnitude(systemInformation.mem.total, 3)})}}
                    </p>
                    <b-card-group deck>
                        <b-card class="bg-dark-2" :title="$t('pages.monitor.sections.ram.layout.item.title', {index: index + 1})"
                                v-for="(ram, index) in systemInformation.memLayout" :key="index">
                            <p class="card-text">{{$t('pages.monitor.sections.ram.layout.item.text', {manufacturer: ram.manufacturer,
                                type: ram.type})}}</p>
                            <em>{{$t('pages.monitor.sections.ram.layout.item.secondary', {quantity: convertOrderOfMagnitude(ram.size,
                                3), clockSpeed: ram.clockSpeed})}}</em>
                        </b-card>
                    </b-card-group>
                </td>
            </tr>
            </tbody>
            <thead>
            <th>
                <font-awesome-icon :icon="['fas', 'tv']"/>
                {{$t('pages.monitor.sections.graphics.title')}}
            </th>
            </thead>
            <tbody>
            <tr>
                <td>
                    <b-card-group deck>
                        <b-card class="bg-dark-2"
                                :title="$t('pages.monitor.sections.graphics.gpu.layout.item.title', {index: index + 1})"
                                v-for="(controller, index) in systemInformation.graphics.controllers" :key="index">
                            <p class="card-text">{{controller.model}}</p>
                            <em>{{$t('pages.monitor.sections.graphics.gpu.layout.item.text', {quantity:
                                convertOrderOfMagnitude(controller.vram, 1)})}}</em>
                        </b-card>
                    </b-card-group>
                </td>
            </tr>
            <tr>
                <td>
                    <b-card-group deck>
                        <b-card class="bg-dark-3"
                                :title="$t('pages.monitor.sections.graphics.display.layout.item.title', {index: index + 1})"
                                v-for="(display, index) in systemInformation.graphics.displays" :key="index">
                            <p class="card-text">{{$t('pages.monitor.sections.graphics.display.layout.item.text', {width:
                                display.resolutionx, height: display.resolutiony, depth: display.pixeldepth})}}</p>
                            <em>{{display.model}}</em>
                        </b-card>
                    </b-card-group>
                </td>
            </tr>
            </tbody>
            <thead>
            <th>
                <font-awesome-icon :icon="['fas', 'microchip']"/>
                {{$t('pages.monitor.sections.cpu.title')}}
            </th>
            </thead>
            <tbody>
            <tr>
                <td>
                    <p>{{systemInformation.cpu.manufacturer}} {{systemInformation.cpu.brand}}</p>
                    <b-card-group>
                        <b-card class="bg-dark-2">
                            <p class="card-text">{{$t('pages.monitor.sections.cpu.baseClock', {clock:
                                systemInformation.cpu.speed})}}</p>
                        </b-card>
                        <b-card class="bg-dark-2">
                            <p class="card-text">{{$t('pages.monitor.sections.cpu.turboClock', {clock:
                                systemInformation.cpu.speedmax})}}</p>
                        </b-card>
                        <b-card class="bg-dark-2">
                            <p class="card-text">{{$t('pages.monitor.sections.cpu.physicalCores', {count:
                                systemInformation.cpu.physicalCores})}}</p>
                        </b-card>
                        <b-card class="bg-dark-2">
                            <p class="card-text">{{$t('pages.monitor.sections.cpu.logicalCores', {count:
                                systemInformation.cpu.cores})}}</p>
                        </b-card>
                    </b-card-group>
                    <br>
                    <cpu-chart :chartData="cpuUsage.data" :options="cpuUsage.options" style="height: 200px"></cpu-chart>
                </td>
            </tr>
            </tbody>
            <thead>
            <th>
                <font-awesome-icon :icon="['fas', 'network-wired']"/>
                {{$t('pages.monitor.sections.network.title')}}
            </th>
            </thead>
            <tbody>
            <tr>
                <td>
                    <b-card-group deck>
                        <b-card class="bg-dark-2" :title="$t('pages.monitor.sections.network.layout.item.title', {index: index + 1})"
                                v-for="(network, index) in systemInformation.net" :key="index">
                            <p class="card-text">{{network.iface}}</p>
                            <em>{{network.ip4}}</em>
                        </b-card>
                    </b-card-group>
                </td>
            </tr>
            </tbody>
            <thead>
            <th>
                <font-awesome-icon :icon="['fas', 'hdd']"/>
                {{$t('pages.monitor.sections.disk.title')}}
            </th>
            </thead>
            <tbody>
            <tr>
                <td>
                    <b-card-group deck>
                        <b-card class="bg-dark-2" :title="$t('pages.monitor.sections.disk.layout.item.title', {index: index + 1})"
                                v-for="(disk, index) in systemInformation.diskLayout" :key="index">
                            <p class="card-text">{{$t('pages.monitor.sections.disk.layout.item.text', {size: disk.size, type:
                                disk.type})}}</p>
                            <em>{{disk.interfaceType}}</em>
                        </b-card>
                    </b-card-group>
                </td>
            </tr>
            </tbody>
        </table>
    </b-container>
</template>

<script>
    import osUtils from 'os-utils'
    import systeminformation from 'systeminformation'
    import Loading from '@/components/includes/Loading'
    import LineChart from '@/components/charts/Line'

    export default {
      components: {
        Loading,
        'loading-image': Loading,
        'cpu-chart': LineChart
      },
      data: function () {
        return {
          systemInformation: undefined,
          cpuUsage: {
            data: {
              labels: ['', '', '', '', '', '', '', '', '', ''],
              datasets: [
                {
                  label: this.$i18n.t('pages.monitor.sections.cpu.chart.title'),
                  backgroundColor: '#dd163b',
                  data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                yAxes: [
                  {
                    ticks: {
                      min: 0,
                      max: 100,
                      stepSize: 20
                    }
                  }
                ]
              },
              elements: {
                point: {
                  radius: 0
                }
              }
            }
          }
        }
      },
      methods: {
        convertOrderOfMagnitude: function (quantity, factor) {
          return Number(quantity / Math.pow(1024, factor)).toFixed(1)
        },
        monitorCpuUsage: function () {
          var data = this.$data

          osUtils.cpuUsage(function callback (usage) {
            var labels = data.cpuUsage.data.labels
            var datasets = data.cpuUsage.data.datasets

            datasets[0].data.push(usage * 100)
            datasets[0].data.shift()

            data.cpuUsage.data = {
              labels,
              datasets
            }

            osUtils.cpuUsage(callback)
          })
        }
      },
      computed: {
        osIcon: function () {
          switch (this.systemInformation.os.platform) {
            case 'darwin':
              return ['fab', 'apple']
            case 'win32':
              return ['fab', 'windows']
            case 'linux':
              return ['fab', 'linux']
            default:
              return ['fas', 'laptop-code']
          }
        }
      },
      created: function () {
        systeminformation.getAllData((data) => {
          this.systemInformation = data
        })
        this.monitorCpuUsage()
      }
    }
</script>
