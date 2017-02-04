<template>
  <div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box">
          <h1 class="title">App 使用率</h1>
          <div class="block styles-box">
            <progress-bar :type="'info'" :value="45" :max="100" :show-label="true"></progress-bar>
          </div>
        </article>
      </div>
    </div>

    <div class="tile is-ancestor">
      <div class="tile is-parent is-4">
        <article class="tile is-child box">
          <h4 class="title">會眾報到</h4>
          <div class="content">
            <chart :type="'doughnut'" :data="CIData.attendees" :options="doughnutOption"></chart>
          </div>
        </article>
      </div>
      <div class="tile is-parent is-4">
        <article class="tile is-child box">
          <h4 class="title">講者報到</h4>
          <div class="content">
            <chart :type="'doughnut'" :data="CIData.speaker"></chart>
          </div>
        </article>
      </div>
      <div class="tile is-parent is-4">
        <article class="tile is-child box">
          <h4 class="title">工人報到</h4>
          <div class="content">
            <chart :type="'doughnut'" :data="CIData.staff"></chart>
          </div>
        </article>
      </div>
    </div>

    <div class="tile is-ancestor">
      <div class="tile is-parent is-4">
        <article class="tile is-child box">
          <h4 class="title">午餐葷素分佈</h4>
          <div class="content">
            <chart :type="'doughnut'" :data="kitData"></chart>
          </div>
        </article>
      </div>
      <div class="tile is-parent is-4">
        <article class="tile is-child box">
          <h4 class="title">午餐發放狀況（葷食）</h4>
          <div class="content">
            <chart :type="'doughnut'" :data="kitData"></chart>
          </div>
        </article>
      </div>
      <div class="tile is-parent is-4">
        <article class="tile is-child box">
          <h4 class="title">午餐發放狀況（素食）</h4>
          <div class="content">
            <chart :type="'doughnut'" :data="kitData"></chart>
          </div>
        </article>
      </div>
    </div>

  </div>
</template>

<script>
import Chart from '../modules/Chartjs'
import ProgressBar from '../modules/ProgressBar'

export default {
  components: {
    Chart,
    ProgressBar
  },

  data() {
    return {
      data: [300, 50, 100]
    }
  },

  computed: {
    CIData() {
      return {
        attendees: {
          labels: [
            'App報到',
            '人工報到',
            '未報到'
          ],
          datasets: [{
            data: this.data,
            backgroundColor: [
              '#36A2EB',
              '#FFCE56',
              '#FF6384'
            ]
          }]
        },
        staff: {
          labels: [
            'App報到',
            '人工報到',
            '未報到'
          ],
          datasets: [{
            data: this.data,
            backgroundColor: [
              '#36A2EB',
              '#FFCE56',
              '#FF6384'
            ]
          }]
        },
        speaker: {
          labels: [
            'App報到',
            '人工報到',
            '未報到'
          ],
          datasets: [{
            data: this.data,
            backgroundColor: [
              '#36A2EB',
              '#FFCE56',
              '#FF6384'
            ]
          }]
        }
      }
    },
    kitData() {
      return {
        labels: [
          '已領取',
          '報到但尚未領取',
          '未報到'
        ],
        datasets: [{
          data: this.data,
          backgroundColor: [
            '#36A2EB',
            '#FFCE56',
            '#FF6384'
          ]
        }]
      }
    },
    doughnutOption() {
      return {
        showAllTooltips: true
      }
    }
  },

  mounted() {
    this.$http.get('//' + this.$store.state.api + '/dashboard').then((res) => {
      console.log('successful')
      console.log(res.body)
      this.dashboard = res.body
    }, (err) => {
      console.error(err)
      if (err.status === 401) {
        window.location = '/'
      }
    })
  }
}
</script>

<style lang="scss" scoped>
</style>
