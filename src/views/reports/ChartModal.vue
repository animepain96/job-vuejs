<template>
  <CModal
      :title="tc('views.reports.chart.title')"
      color="primary"
      :show.sync="show"
      size="xl"
  >
    <CRow>
      <CCol xl="6">
        <CChartPie
            style="height: 380px;"
            :datasets="datasets"
            :labels="labels"
            :options="options"
        />
      </CCol>
      <CCol xl="6">
        <CDataTable
            :sorter-value="{column: 'Price', asc: false}"
            :responsive="false"
            :itemsPerPageSelect="{ label: tc('table_tool.items_per_page.title')}"
            sorter
            hover
            striped
            :items="items"
            :fields="fields"
            :items-per-page="5"
            clickable-rows
            :active-page="1"
            :pagination="{ doubleArrows: false, align: 'center'}"
        >
          <template #Price="{item}">
            <td>
              {{'$' + convertCurrency(item.Price)}}
            </td>
          </template>
          <template #PriceYen="{item}">
            <td>
              {{'¥' + convertCurrency(item.PriceYen)}}
            </td>
          </template>
        </CDataTable>
      </CCol>
    </CRow>
    <template v-slot:footer>
      <CButton @click="show = false" color="secondary">{{ tc('buttons.crud.cancel') }}</CButton>
    </template>
  </CModal>
</template>

<script>
import {CChartPie} from "@coreui/vue-chartjs";

export default {
  components: {
    CChartPie,
  },
  props: {
    showModal: {
      type: Boolean,
    },
    data: {
      type: Array,
    },
  },
  computed: {
    tc() {
      return this.$tc;
    },
    colors() {
      let colorArray = [];
      for(let i = 0; i < this.items.length; i++) {
        colorArray.push(this.randomColor());
      }

      return colorArray;
    },
    fields() {
      return [
        {key: 'Name', label: this.$tc('views.reports.chart.table.name'), _style: 'width: 40%;'},
        {key: 'Price', label: this.$tc('views.reports.chart.table.price'), _style: 'width: 30%;'},
        {key: 'PriceYen', label: this.$tc('views.reports.chart.table.price_yen'), _style: 'width: 30%;'},
      ];
    },
    show: {
      get() {
        return this.showModal;
      },
      set(value) {
        this.$emit('update:show', value);
      },
    },
    items() {
      let result = [];

      this.data.reduce((res, item) => {
        if (!res[`${item.customer.ID}`]) {
          res[`${item.customer.ID}`] = {ID: item.customer.ID, Name: item.customer.Name, Price: 0, PriceYen: 0};
          result.push(res[`${item.customer.ID}`]);
        }
        res[`${item.customer.ID}`].Price += item.Price;
        res[`${item.customer.ID}`].PriceYen += item.PriceYen;
        return res;
      }, {});

      return result;
    },
    datasets() {
      return [
        {
          data: this.items.map((item) => {
            return item.Price;
          }),
          backgroundColor: this.colors,
        },
      ];
    },
    labels() {
      return this.items.map((item) => {
        return item.Name;
      });
    },
    options() {
      return {
        maintainAspectRatio: false,
        title: {
          display: true,
          text: this.$tc('views.reports.chart.chart_title'),
        },
        legend: {
          display: false,
        },
        tooltips: {
          callbacks: {
            label: (tooltip,data) => {
              return data.labels[tooltip.index] + ': $' + parseInt(data.datasets[tooltip.datasetIndex].data[tooltip.index]).toLocaleString();
            },
          },
        },
      };
    }
  },
  methods: {
    convertCurrency(value) {
      if (!isNaN(value)) {
        return Number(value).toLocaleString(this.$i18n.locale);
      }
      return 0;
    },
    randomColor() {
      let letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
  },
}
</script>

<style scoped>

</style>
