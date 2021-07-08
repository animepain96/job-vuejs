<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="12"><h3 :class="['mb-0']">{{ this.$tc('views.chart_report.title') }}</h3></CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CChartLine
              style="height:340px"
              :datasets="datasets"
              :labels="this.$t('views.chart_report.months')"
              :options="options"
          />
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import {CChartLine} from '@coreui/vue-chartjs'

export default {
  components: {
    CChartLine,
  },
  created() {
    this.$store.dispatch('summary/getAnnualRevenue');
  },
  data() {
    return {
      options: {
        maintainAspectRatio: false,
        title: {
          display: true,
          text: this.$tc('views.chart_report.chart_title'),
        },
        legend: {
          display: false,
        },
        tooltips: {
          callbacks: {
            label: (tooltip,data) => {
                return data.datasets[tooltip.datasetIndex].label + ': $' + parseInt(tooltip.value).toLocaleString();
            },
          },
        },
        scales: {
          yAxes: [{
            ticks: {
              callback: value => {
                return '$' + value.toLocaleString();
              },
              beginAtZero:true,
            },
          }],
        },
      },
    };
  },
  computed: {
    datasets() {
      return [
        {
          labels: this.months,
          data: this.revenues,
          label: 'Annual Revenue',
          backgroundColor: 'rgb(228,102,81,0.9)',
          borderColor: 'rgb(228,102,81)',
        }
      ];
    },
    months() {
      return this.annualRevenue.map((item) => {
        return item.month;
      });
    },
    revenues() {
      return this.annualRevenue.map((item) => {
        return item.revenue;
      });
    },
    annualRevenue() {
      return this.$store.state.summary.annualRevenue;
    },
  },
}
</script>

<style scoped>

</style>