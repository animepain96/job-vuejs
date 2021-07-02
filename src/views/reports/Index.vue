<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="12"><h3 :class="['mb-0']" v-text="'Report Management'"/></CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol md="3" lg="2">
              <label :class="'font-weight-bold'" v-text="'From'"/>
              <DatePicker type="date" format="DD-MM-YYYY" v-model="query.from"/>
            </CCol>
            <CCol md="3" lg="2">
              <label :class="'font-weight-bold'" v-text="'To'"/>
              <DatePicker type="date" format="DD-MM-YYYY" v-model="query.to"/>
            </CCol>
            <CCol md="3" lg="2">
              <label :class="'font-weight-bold'" v-text="'Mode'"/>
              <CSelect :custom="true" :options="modeOptions" :value="query.mode"
                       @change="(e) => this.query.mode = e.target.value"/>
            </CCol>
            <CCol md="3" lg="2">
              <label :class="'font-weight-bold'" v-text="'Customer'"/>
              <CSelect :custom="true" :options="[{value: 0, label: 'ALL'}].concat(customers)" :value="query.customer"
                       @change="(e) => this.query.customer = e.target.value"/>
            </CCol>
            <CCol md="3" lg="2">
              <label :class="'font-weight-bold'" v-text="'Type'"/>
              <CSelect :custom="true" :options="[{value: 0, label: 'ALL'}].concat(types)" :value="query.type"
                       @change="(e) => this.query.type = e.target.value"/>
            </CCol>
            <CCol md="3" lg="2">
              <label :class="'font-weight-bold'" v-text="'Method'"/>
              <CSelect :custom="true" :options="[{value: 0, label: 'ALL'}].concat(methods)" :value="query.method"
                       @change="(e) => this.query.method = e.target.value"/>
            </CCol>
            <CCol md="3" lg="2">
              <label :class="'font-weight-bold'" v-text="'Paid'"/>
              <CSelect :custom="true" :options="paidOptions" :value="query.paid"
                       @change="(e) => this.query.paid = e.target.value"/>
            </CCol>
            <CCol md="12">
              <CButton color="primary" v-text="'View'" @click="getList"/>
              <CButton :class="'ml-2'" color="dark" v-text="'Chart'" @click="showModal = !showModal"/>
            </CCol>
          </CRow>
          <hr/>
          <CRow>
            <CCol :class="'text-right'">
              <p :class="'font-weight-bold mb-1'">Total: <span style="font-size: 16px;"><span
                  :class="'text-danger'">{{ totalRevenueUSD.toLocaleString() }}USD</span> - <span
                  :class="'text-primary'">{{ totalRevenueYen.toLocaleString() }}JPY</span></span></p>
              <p :class="'font-weight-bold mb-1'">Rate: <span style="font-size: 16px;"><span
                  :class="'text-danger'">1USD</span> - <span
                  :class="'text-primary'">{{ rate }}JPY</span></span></p>
            </CCol>
          </CRow>
          <CDataTable
              :sorter-value="sortBy"
              :responsive="false"
              :tableFilter="{ placeholder: 'Search...'}"
              items-per-page-select
              sorter
              hover
              striped
              :items="jobs"
              :fields="fields"
              :items-per-page="10"
              clickable-rows
              :active-page="1"
              :pagination="{ doubleArrows: false, align: 'center'}"
              @update:sorter-value="(e) => this.sortBy = e"
          >
            <template #action="{item}">
              <td>
                <CButtonGroup class="mr-3">
                  <CButton
                      v-c-tooltip="'Delete'"
                      size="sm"
                      color="danger"
                      @click="deleteJob(item)"
                  >
                    <CIcon name="cil-trash"></CIcon>
                  </CButton>
                </CButtonGroup>
              </td>
            </template>
            <template #name="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="item.name" v-show="!(selected.id === item.id && isEdit && editField === 'name')"></span>
                <CInput v-if="selected.id === item.id && isEdit && editField === 'name'" type="text" v-model="job.name"
                        @keyup="(e) => updateJob(e)"/>
                <CButton size="sm" color="secondary" :class="'inline-edit-button'"
                         @click="() => editJob(item, 'name')"
                         v-show="!(selected.id === item.id && isEdit && editField === 'name')">
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #price="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="'$' + convertCurrency(item.price)"></span>
              </td>
            </template>
            <template #price_yen="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="'¥' + convertCurrency(item.price_yen)"
                      v-show="!(selected.id === item.id && isEdit && editField === 'price_yen')"></span>
                <CInput v-if="selected.id === item.id && isEdit && editField === 'price_yen'" type="text"
                        v-model="job.price_yen"
                        @keyup="(e) => updateJob(e)"/>
                <CButton v-c-tooltip="'Edit'" size="sm" color="secondary" :class="'inline-edit-button'"
                         @click="() => {editJob(item, 'price_yen');}"
                         v-show="!(selected.id === item.id && isEdit && editField === 'price_yen')">
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #start_date="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="formattedDate(item.start_date)"
                      v-show="!(selected.id === item.id && isEdit && editField === 'start_date')"></span>
                <DatePicker type="date" format="DD-MM-YYYY" v-model="job.start_date"
                            v-if="selected.id === item.id && isEdit && editField === 'start_date'"
                            @change="(e) => updateJob(e, true)"
                            @keypress="(e) => updateJob(e)"/>
                <CButton v-c-tooltip="'Edit'" size="sm" color="secondary" :class="'inline-edit-button'"
                         @click="() => editJob(item, 'start_date')"
                         v-show="!(selected.id === item.id && isEdit && editField === 'start_date')">
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #pay_date="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="formattedDate(item.pay_date)"
                      v-show="!(selected.id === item.id && isEdit && editField === 'pay_date')"></span>
                <DatePicker type="date" format="DD-MM-YYYY" v-model="job.pay_date"
                            v-if="selected.id === item.id && isEdit && editField === 'pay_date'"
                            @change="(e) => updateJob(e, true)"
                            @keypress="(e) => updateJob(e)"/>
                <CButton v-c-tooltip="'Edit'" size="sm" color="secondary" :class="'inline-edit-button'"
                         @click="() => editJob(item, 'pay_date')"
                         v-show="!(selected.id === item.id && isEdit && editField === 'pay_date')">
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #paid="{item}">
              <td>
                <CInputCheckbox :checked="item.paid > 0" :custom="true"
                                @click="(e) => { editJob(item, 'paid'); updateJob(e, true); }"/>
              </td>
            </template>
            <template #show_details="{item, index}">
              <td class="py-2">
                <CButton
                    color="primary"
                    variant="outline"
                    square
                    size="sm"
                    @click="toggleDetails(item, index)"
                >
                  {{ Boolean(item._toggled) ? 'Hide' : 'Show' }}
                </CButton>
              </td>
            </template>
            <template #details="{item}">
              <CCollapse :show="Boolean(item._toggled)" :duration="collapseDuration">
                <CCardBody>
                  <CRow>
                    <CCol md="3">
                      <span :style="'display:block;'" :class="'font-weight-bold'" v-text="'Customer'"/>
                      <span :style="'display:block;'" v-text="item.customer.name"
                            v-show="!(selected.id === item.id && isEdit && editField === 'customer')"></span>
                      <CSelect :custom="true" :options="customers"
                               v-if="selected.id === item.id && isEdit && editField === 'customer'"
                               :value="item.customer_id"
                               @input="job.customer = $event.target.value"
                               @change="(e) => updateJob(e, true)"/>
                      <CButton v-c-tooltip="'Edit'" size="sm" color="secondary" :class="'inline-edit-button'"
                               @click="() => editJob(item, 'customer')"
                               v-show="!(selected.id === item.id && isEdit && editField === 'customer')">
                        <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                      </CButton>
                    </CCol>
                    <CCol md="3">
                      <span :style="'display:block;'" :class="'font-weight-bold'" v-text="'Type'"/>
                      <span :style="'display:block;'" v-text="item.type.name"
                            v-show="!(selected.id === item.id && isEdit && editField === 'type')"></span>
                      <CSelect :custom="true" :options="types"
                               :value="item.type_id"
                               v-if="selected.id === item.id && isEdit && editField === 'type'"
                               @input="job.type = $event.target.value"
                               @change="(e) => updateJob(e, true)"/>
                      <CButton v-c-tooltip="'Edit'" size="sm" color="secondary" :class="'inline-edit-button'"
                               @click="() => editJob(item, 'type')"
                               v-show="!(selected.id === item.id && isEdit && editField === 'type')">
                        <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                      </CButton>
                    </CCol>
                    <CCol md="3">
                      <span :style="'display:block;'" :class="'font-weight-bold'" v-text="'Method'"/>
                      <span :style="'display:block;'" v-text="item.method.name"
                            v-show="!(selected.id === item.id && isEdit && editField === 'method')"></span>
                      <CSelect :custom="true" :options="methods"
                               :value="item.method_id"
                               v-if="selected.id === item.id && isEdit && editField === 'method'"
                               @input="job.method = $event.target.value"
                               @change="(e) => updateJob(e, true)"/>
                      <CButton v-c-tooltip="'Edit'" size="sm" color="secondary" :class="'inline-edit-button'"
                               @click="() => editJob(item, 'method')"
                               v-show="!(selected.id === item.id && isEdit && editField === 'method')">
                        <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                      </CButton>
                    </CCol>
                    <CCol md="3">
                      <div class="form-group">
                        <span :style="'display:block;'" v-text="'Deadline'" :class="'font-weight-bold'"></span>
                        <span :style="'display:block;'" v-text="formattedDate(item.deadline)"
                              v-show="!(selected.id === item.id && isEdit && editField === 'deadline')"></span>
                        <DatePicker type="date" format="DD-MM-YYYY" v-model="job.deadline"
                                    v-if="selected.id === item.id && isEdit && editField === 'deadline'"
                                    @change="(e) => updateJob(e, true)"
                                    @keypress="(e) => updateJob(e)"/>
                        <CButton v-c-tooltip="'Edit'" size="sm" color="secondary" :class="'inline-edit-button'"
                                 @click="() => {editJob(item, 'deadline');}"
                                 v-show="!(selected.id === item.id && isEdit && editField === 'deadline')">
                          <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                        </CButton>
                      </div>
                    </CCol>
                    <CCol md="3">
                      <div class="form-group">
                        <span :style="'display:block;'" v-text="'Finish Date'" :class="'font-weight-bold'"></span>
                        <span :style="'display:block;'" v-text="formattedDate(item.finish_date)"
                              v-show="!(selected.id === item.id && isEdit && editField === 'finish_date')"></span>
                        <DatePicker type="date" format="DD-MM-YYYY" v-model="job.finish_date"
                                    v-if="selected.id === item.id && isEdit && editField === 'finish_date'"
                                    @change="(e) => updateJob(e, true)"
                                    @keypress="(e) => updateJob(e)"/>
                        <CButton v-c-tooltip="'Edit'" size="sm" color="secondary" :class="'inline-edit-button'"
                                 @click="() => {editJob(item, 'finish_date');}"
                                 v-show="!(selected.id === item.id && isEdit && editField === 'finish_date')">
                          <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                        </CButton>
                      </div>
                    </CCol>
                    <CCol md="3">
                      <div class="form-group">
                        <span :style="'display:block;'" v-text="'Note'" :class="'font-weight-bold'"></span>
                        <span :style="'display:block;'" v-text="item.note"
                              v-show="!(selected.id === item.id && isEdit && editField === 'note')"></span>
                        <CTextarea v-model="job.note" v-if="selected.id === item.id && isEdit && editField === 'note'"
                                   @keyup="(e) => updateJob(e)"/>
                        <CButton v-c-tooltip="'Edit'" size="sm" color="secondary" :class="'inline-edit-button'"
                                 @click="() => {editJob(item, 'note');}"
                                 v-show="!(selected.id === item.id && isEdit && editField === 'note')">
                          <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                        </CButton>
                      </div>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCollapse>
            </template>
          </CDataTable>
        </CCardBody>
      </CCard>
    </CCol>
    <ChartModal :title="'Chart'" :show-modal="showModal" :data="jobs" @update:show="(value) => this.showModal = value"/>
  </CRow>
</template>

<script>
import DatePicker from 'vue2-datepicker';
import ChartModal from "@/views/reports/ChartModal";

import moment from 'moment';

export default {
  components: {
    DatePicker,
    ChartModal,
  },
  data() {
    return {
      fields: [
        {key: 'id', name: 'ID', _style: 'width: 5%;'},
        {key: 'action', name: 'Action', _style: 'width: 7%;'},
        {key: 'name', name: 'Name', _style: 'width: 15%;'},
        {key: 'price', name: 'Price', _style: 'width: 15%;'},
        {key: 'price_yen', name: 'Price Yen', _style: 'width: 15%;'},
        {key: 'start_date', name: 'Start Date', _style: 'width: 15%;'},
        {key: 'pay_date', name: 'Pay Date', _style: 'width: 15%;'},
        {key: 'paid', name: 'Paid', _style: 'width: 8%;'},
        {key: 'show_details', name: 'Detail', _style: 'width: 5%;'},
        /*{key: 'customer', name: 'Customer'},
        {key: 'type', name: 'Customer'},
        {key: 'method', name: 'Customer'},
        {key: 'deadline', name: 'Deadline'},
        {key: 'finish_date', name: 'Finish Date'},
        {key: 'note', name: 'Note'},*/
      ],
      sortBy: {
        column: 'id',
        asc: false,
      },
      job: {
        name: '',
        price_yen: '',
        start_date: '',
        pay_date: '',
        customer: '',
        type: '',
        method: '',
        deadline: '',
        finish_date: '',
        note: '',
      },
      selected: {},
      isEdit: false,
      editField: '',
      isCreate: false,
      isLoading: false,
      collapseDuration: 0,
      paidOptions: [
        {
          value: 0,
          label: 'ALL',
        },
        {
          value: 1,
          label: 'YES',
        },
        {
          value: 2,
          label: 'NO',
        },
      ],
      modeOptions: [
        {
          value: 0,
          label: 'Sale',
        },
        {
          value: 1,
          label: 'Payment',
        },
      ],
      showModal: false,
    };
  },
  created() {
    this.$store.dispatch('reports/getList');
    this.$store.dispatch('jobs/getAdditionList');
    this.$store.dispatch('jobs/getRate');
  },
  computed: {
    query() {
      return this.$store.state.reports.query;
    },
    totalRevenueYen() {
      return this.$store.state.reports.jobs.reduce((total, item) => {
        return total + item.price_yen;
      }, 0);
    },
    totalRevenueUSD() {
      return this.$store.state.reports.jobs.reduce((total, item) => {
        return total + item.price;
      }, 0);
    },
    rate() {
      return Math.round(this.$store.state.jobs.rate);
    },
    jobs() {
      return this.$store.state.reports.jobs;
    },
    customers() {
      return this.$store.state.jobs.customers.map((item) => {
        return {value: item.id, label: item.name};
      });
    },
    methods() {
      return this.$store.state.jobs.methods.map((item) => {
        return {value: item.id, label: item.name};
      });
    },
    types() {
      return this.$store.state.jobs.types.map((item) => {
        return {value: item.id, label: item.name};
      });
    }
  },
  methods: {
    getList() {
      this.$store.commit('app/setLoading', true);
      this.$store.dispatch('reports/getList', this.query).then(result => {
        if (result) {
          this.$store.commit('app/setLoading', false);
        }
      });
    },
    formattedDate(value) {
      if (moment(value).isValid()) {
        return moment(value).format('DD-MM-YYYY');
      }
      return null;
    },
    editJob(item, field = 'name') {
      this.selected = item;
      this.isEdit = true;
      this.editField = field;
      if (['start_date', 'pay_date', 'deadline', 'finish_date'].includes(field)) {
        this.job[field] = new Date(this.selected[field]);
      } else if (['customer', 'type', 'method'].includes(field)) {
        this.job[field] = this.selected[field].id;
      } else {
        this.job[field] = this.selected[field];
      }
    },
    updateJob(e, onChangeUpdate = false) {
      if (e.keyCode === 13 || onChangeUpdate) {
        this.$store.commit('app/setLoading', true);
        var payload = {
          id: this.selected.id,
          data: {
            field: this.editField,
            value: this.job[this.editField],
          }
        };

        if (['start_date', 'pay_date', 'deadline', 'finish_date'].includes(this.editField)) {
          payload.data.value = moment(this.job[this.editField]).format('DD-MM-YYYY');
        }

        if (this.editField === 'paid') {
          payload.data.value = e.target.checked;
        }

        if (['customer', 'type', 'method'].includes(this.editField)) {
          payload.data.value = parseInt(this.job[this.editField]);
        }

        this.$store.dispatch('reports/updateJob',
            payload,
        ).then(status => {
          if (status) {
            this.cancelEdit();
          }
          this.$store.commit('app/setLoading', false);
        });
      } else if (e.keyCode === 27) {
        this.cancelEdit();
      }
    },
    deleteJob(item) {
      this.cancelEdit();
      this.$swal.fire({
        title: 'Are you sure to delete this job?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm'
      }).then((result) => {
        if (result.isConfirmed) {
          this.performDelete(item);
        }
      })
    },
    performDelete(item) {
      this.$store.commit('app/setLoading', true);
      this.$store.dispatch('reports/delete', item, {root: true})
          .then(() => this.$store.commit('app/setLoading', false));
    },
    convertCurrency(value) {
      if (!isNaN(value)) {
        return value.toLocaleString();
      }
      return 0;
    },
    toggleDetails(job) {
      this.$set(this.jobs[this.jobs.findIndex(item => item.id === job.id)], '_toggled', !job._toggled);
      this.collapseDuration = 300;
      this.$nextTick(() => {
        this.collapseDuration = 0;
      })
    },
    cancelEdit() {
      this.isEdit = false;
      this.selected = {};
      this.editField = '';
      this.job = {
        name: '',
        price_yen: '',
        start_date: '',
        pay_date: '',
        customer: '',
        type: '',
        method: '',
        deadline: '',
        finish_date: '',
        note: '',
      };
    },
  },
}
</script>

<style scoped>
.table th, .table td {
  vertical-align: middle;
}
</style>