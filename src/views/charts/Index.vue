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
          <CRow class="mb-3">
            <CCol md="3" class="mb-2 mb-md-2">
              <DatePicker
                  :lang="this.$i18n.locale"
                  v-model="from"
                  :inputClass="'form-control'"
                  type="month" format="MM-YYYY"
              />
            </CCol>
            <CCol md="3" class="mb-2 mb-md-2">
              <DatePicker
                  :lang="this.$i18n.locale"
                  v-model="to"
                  :inputClass="'form-control'"
                  type="month" format="MM-YYYY"
              />
            </CCol>
            <CCol md="6" class="mb-2 mb-md-2">
              <CButton @click="getChartData" color="primary" v-text="this.$tc('buttons.crud.view')"/>
            </CCol>
          </CRow>
          <CChartLine
              style="height:340px"
              :datasets="datasets"
              :labels="months"
              :options="options"
          />
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import {CChartLine} from '@coreui/vue-chartjs';
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/locale/vi";
import {format} from "date-fns";

const now = new Date();

export default {
  components: {
    CChartLine,
    DatePicker,
  },
  data() {
    return {
      from: new Date(now.getFullYear(), 0, 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  },
  created() {
    this.$store.dispatch('summary/getAnnualRevenue');
  },
  computed: {
    options() {
      return {
        maintainAspectRatio: false,
        title: {
          display: true,
          text: this.$tc('views.chart_report.chart_title'),
        },
        legend: {
          display: true,
        },
        tooltips: {
          callbacks: {
            label: (tooltip, data) => {
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
              beginAtZero: true,
            },
          }],
          xAxes: [{
            ticks: {
              autoSkip: true,
              maxTicksLimit: 20
            }
          }]
        },
      };
    },
    datasets() {
      return [
        {
          data: this.annualSales,
          label: this.$tc('views.chart_report.sale'),
          borderColor: 'rgb(129, 189, 162)',
          backgroundColor: 'rgb(129, 189, 162)',
          fill: false,
        },
        {
          data: this.annualPayments,
          label: this.$tc('views.chart_report.payment'),
          borderColor: 'rgb(220, 53, 69)',
          backgroundColor: 'rgb(220, 53, 69)',
          fill: false,
        }
      ];
    },
    months() {
      return this.$store.state.summary.annualRevenue.months;
    },
    annualPayments() {
      return this.$store.state.summary.annualRevenue.payments;
    },
    annualSales() {
      return this.$store.state.summary.annualRevenue.sales;
    },
  },
  methods: {
    getChartData() {
      this.$store.commit('app/setLoading', true);
      this.$store.dispatch('summary/getAnnualRevenue', {from: format(this.from, 'yyyy-MM-dd'), to: format(new Date(this.to.getFullYear(), this.to.getMonth() + 1, 0), 'yyyy-MM-dd')})
          .then(() => this.$store.commit('app/setLoading', false));
    }
  }
}
</script>

<style scoped>

</style>
