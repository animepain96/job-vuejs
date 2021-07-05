<template>
  <CModal
      :title="title"
      color="success"
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
            :responsive="false"
            items-per-page-select
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
          <template #price="{item}">
            <td>
              {{'$' + convertCurrency(item.price)}}
            </td>
          </template>
          <template #price_yen="{item}">
            <td>
              {{'¥' + convertCurrency(item.price_yen)}}
            </td>
          </template>
        </CDataTable>
      </CCol>
    </CRow>
    <template v-slot:footer>
      <CButton @click="show = false" color="secondary">Cancel</CButton>
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
    title: {
      type: String,
    },
    showModal: {
      type: Boolean,
    },
    data: {
      type: Array,
    },
  },
  computed: {
    colors() {
      let colorArray = [];
      for(let i = 0; i < this.items.length; i++) {
        colorArray.push(this.randomColor());
      }

      return colorArray;
    },
    fields() {
      return [
        {key: 'name', name: 'Name', _style: 'width: 40%;'},
        {key: 'price', name: 'Price', _style: 'width: 30%;'},
        {key: 'price_yen', name: 'Price Yen', _style: 'width: 30%;'},
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
        if (!res[`${item.customer.id}`]) {
          res[`${item.customer.id}`] = {id: item.customer.id, name: item.customer.name, price: 0, price_yen: 0};
          result.push(res[`${item.customer.id}`]);
        }
        res[`${item.customer.id}`].price += item.price;
        res[`${item.customer.id}`].price_yen += item.price_yen;
        return res;
      }, {});

      return result;
    },
    datasets() {
      return [
        {
          data: this.items.map((item) => {
            return item.price;
          }),
          backgroundColor: this.colors,
        },
      ];
    },
    labels() {
      return this.items.map((item) => {
        return item.name;
      });
    },
    options() {
      return {
        maintainAspectRatio: false,
        title: {
          display: true,
          text: 'Revenue by Customer',
        },
        legend: {
          display: true,
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
        return value.toLocaleString();
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