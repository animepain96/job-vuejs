<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="12"><h3 :class="['mb-0']" v-text="this.$tc('views.reports.title')"/></CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol md="3" lg="2">
              <label :class="'font-weight-bold'" v-text="this.$tc('views.reports.filter.from')"/>
              <div role="group" class="form-group">
                <DatePicker type="date" format="DD-MM-YYYY" v-model="query.from"/>
              </div>
            </CCol>
            <CCol md="3" lg="2">
              <label :class="'font-weight-bold'" v-text="this.$tc('views.reports.filter.to')"/>
              <div role="group" class="form-group">
                <DatePicker type="date" format="DD-MM-YYYY" v-model="query.to"/>
              </div>
            </CCol>
            <CCol md="3" lg="2">
              <label :class="'font-weight-bold'" v-text="this.$tc('views.reports.filter.mode')"/>
              <CSelect
                  :custom="true"
                  :options="modeOptions"
                  :value="query.mode"
                  @change="(e) => this.query.mode = e.target.value"/>
            </CCol>
            <CCol md="3" lg="2">
              <label :class="'font-weight-bold'" v-text="this.$tc('views.reports.filter.customer')"/>
              <CSelect :custom="true"
                       :options="[{value: 0, label: tc('views.reports.filter.options.all')}].concat(customers)"
                       :value="query.customer"
                       @change="(e) => this.query.customer = e.target.value"/>
            </CCol>
            <CCol md="3" lg="2">
              <label :class="'font-weight-bold'" v-text="this.$tc('views.reports.filter.type')"/>
              <CSelect :custom="true"
                       :options="[{value: 0, label: tc('views.reports.filter.options.all')}].concat(types)"
                       :value="query.type"
                       @change="(e) => this.query.type = e.target.value"/>
            </CCol>
            <CCol md="3" lg="2">
              <label :class="'font-weight-bold'" v-text="this.$tc('views.reports.filter.method')"/>
              <CSelect :custom="true"
                       :options="[{value: 0, label: tc('views.reports.filter.options.all')}].concat(methods)"
                       :value="query.method"
                       @change="(e) => this.query.method = e.target.value"/>
            </CCol>
            <CCol md="3" lg="2">
              <label :class="'font-weight-bold'" v-text="this.$tc('views.reports.filter.paid')"/>
              <CSelect :custom="true" :options="paidOptions" :value="query.paid"
                       @change="(e) => this.query.paid = e.target.value"/>
            </CCol>
            <CCol md="12">
              <CButton color="primary" v-text="this.$tc('buttons.crud.view')" @click="getList"/>
              <CButton :class="'ml-2'" color="dark" v-text="this.$tc('buttons.crud.chart')"
                       @click="showModal = !showModal"/>
            </CCol>
          </CRow>
          <hr/>
          <CRow>
            <CCol :class="'text-right'">
              <p :class="'font-weight-bold mb-1'">{{ this.$tc('views.reports.total') }}: <span style="font-size: 16px;"><span
                  :class="'text-danger'">{{ Number(totalRevenueUSD).toLocaleString($i18n.locale) }}USD</span> - <span
                  :class="'text-primary'">{{ Number(totalRevenueYen).toLocaleString($i18n.locale) }}JPY</span></span></p>
              <p :class="'font-weight-bold mb-1'">{{ this.$tc('views.reports.rate') }}: <span
                  style="font-size: 16px;"><span
                  :class="'text-danger'">1USD</span> - <span
                  :class="'text-primary'">{{ rate }}JPY</span></span></p>
            </CCol>
          </CRow>
          <CDataTable
              :sorter-value="sortBy"
              responsive
              :tableFilter="{ label: tc('table_tool.filter.title'), placeholder: tc('table_tool.filter.placeholder')}"
              :itemsPerPageSelect="{ label: tc('table_tool.items_per_page.title')}"
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
                <CButton
                    v-c-tooltip="{content: tc('buttons.crud.delete')}"
                    size="sm"
                    color="danger"
                    @click="deleteJob(item)"
                >
                  <CIcon name="cil-trash"></CIcon>
                </CButton>
              </td>
            </template>
            <template #name="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="item.name" v-show="!(selected.id === item.id && isEdit && editField === 'name')"></span>
                <CInput
                    v-if="selected.id === item.id && isEdit && editField === 'name'"
                    type="text"
                    v-model="job.name"
                    @keyup="(e) => updateJob(e)"
                    :is-valid="v.job.name.$dirty ? !v.job.name.$error : null"
                    :invalid-feedback="!v.job.name.required ? tc('validations.required') : tc('validations.max_length').replace(':value', 255)"
                />
                <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                         :class="'inline-edit-button'"
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
                <CInput
                    v-if="selected.id === item.id && isEdit && editField === 'price_yen'"
                    v-model="job.price_yen"
                    @keyup="(e) => updateJob(e)"
                    :is-valid="v.job.price_yen.$dirty ? !v.job.price_yen.$error : null"
                    :invalid-feedback="!v.job.price_yen.required ? tc('validations.required') : tc('validations.numeric')"
                />
                <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                         :class="'inline-edit-button'"
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
                <DatePicker
                    :class="{'is-invalid': v.job.start_date.$error }"
                    :inputClass="{'is-valid': !v.job.start_date.$error, 'is-invalid': v.job.start_date.$error, 'form-control': true}"
                    type="date" format="DD-MM-YYYY" v-model="job.start_date"
                    v-if="selected.id === item.id && isEdit && editField === 'start_date'"
                    @change="(e) => updateJob(e, true)"
                />
                <div class="invalid-feedback"
                     v-if="selected.id === item.id && v.job.start_date.$error && v.job.start_date.$dirty">
                  {{
                    tc('validations.required')
                  }}
                </div>
                <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                         :class="'inline-edit-button'"
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
                <DatePicker
                    :class="{'is-invalid': v.job.pay_date.$error }"
                    :inputClass="{'is-valid': !v.job.pay_date.$error, 'is-invalid': v.job.pay_date.$error, 'form-control': true}"
                    type="date" format="DD-MM-YYYY" v-model="job.pay_date"
                    v-if="selected.id === item.id && isEdit && editField === 'pay_date'"
                    @change="(e) => updateJob(e, true)"
                />
                <div class="invalid-feedback"
                     v-if="selected.id === item.id && v.job.pay_date.$error && v.job.pay_date.$dirty">
                  {{
                    tc('validations.required')
                  }}
                </div>
                <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                         :class="'inline-edit-button'"
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
                  {{ Boolean(item._toggled) ? tc('buttons.crud.hide') : tc('buttons.crud.show') }}
                </CButton>
              </td>
            </template>
            <template #details="{item}">
              <CCollapse :show="Boolean(item._toggled)" :duration="collapseDuration">
                <CCardBody class="collapse-block">
                  <CRow>
                    <CCol col="4" md="12">
                      <CRow>
                        <CCol md="3">
                          <div class="d-flex">
                        <span :style="'display:block;'" :class="'font-weight-bold'"
                              v-text="tc('views.jobs.table.customer')"/>
                            <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                                     :class="'inline-edit-button'"
                                     @click="() => editJob(item, 'customer')"
                                     v-show="!(selected.id === item.id && isEdit && editField === 'customer')">
                              <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                            </CButton>
                          </div>
                          <span class="mb-3" :style="'display:block;'" v-text="item.customer.name"
                                v-show="!(selected.id === item.id && isEdit && editField === 'customer')"></span>
                          <CSelect
                              :custom="true" :options="customers"
                              v-if="selected.id === item.id && isEdit && editField === 'customer'"
                              :value="item.customer_id"
                              @input="job.customer = $event.target.value"
                              @change="(e) => updateJob(e, true)"
                              :is-valid="v.job.customer.$dirty ? !v.job.customer.$error : null"
                              :invalid-feedback="tc('validations.required')"
                          />
                        </CCol>
                        <CCol md="3">
                          <div class="d-flex">
                        <span :style="'display:block;'" :class="'font-weight-bold'"
                              v-text="tc('views.jobs.table.type')"/>
                            <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                                     :class="'inline-edit-button'"
                                     @click="() => editJob(item, 'type')"
                                     v-show="!(selected.id === item.id && isEdit && editField === 'type')">
                              <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                            </CButton>
                          </div>
                          <span class="mb-3" :style="'display:block;'" v-text="item.type.name"
                                v-show="!(selected.id === item.id && isEdit && editField === 'type')"></span>
                          <CSelect
                              :custom="true" :options="types"
                              :value="item.type_id"
                              v-if="selected.id === item.id && isEdit && editField === 'type'"
                              @input="job.type = $event.target.value"
                              @change="(e) => updateJob(e, true)"
                              :is-valid="v.job.type.$dirty ? !v.job.type.$error : null"
                              :invalid-feedback="tc('validations.required')"
                          />
                        </CCol>
                        <CCol md="3">
                          <div class="d-flex">
                      <span :style="'display:block;'" :class="'font-weight-bold'"
                            v-text="tc('views.jobs.table.method')"/>
                            <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                                     :class="'inline-edit-button'"
                                     @click="() => editJob(item, 'method')"
                                     v-show="!(selected.id === item.id && isEdit && editField === 'method')">
                              <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                            </CButton>
                          </div>
                          <span class="mb-3" :style="'display:block;'" v-text="item.method.name"
                                v-show="!(selected.id === item.id && isEdit && editField === 'method')"></span>
                          <CSelect
                              :custom="true" :options="methods"
                              :value="item.method_id"
                              v-if="selected.id === item.id && isEdit && editField === 'method'"
                              @input="job.method = $event.target.value"
                              @change="(e) => updateJob(e, true)"
                              :is-valid="v.job.method.$dirty ? !v.job.method.$error : null"
                              :invalid-feedback="tc('validations.required')"
                          />
                        </CCol>
                        <CCol md="3">
                          <div class="form-group">
                            <div class="d-flex">
                        <span :style="'display:block;'" v-text="tc('views.jobs.table.deadline')"
                              :class="'font-weight-bold'"/>
                              <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                                       :class="'inline-edit-button'"
                                       @click="() => {editJob(item, 'deadline');}"
                                       v-show="!(selected.id === item.id && isEdit && editField === 'deadline')">
                                <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                              </CButton>
                            </div>
                            <span class="mb-3" :style="'display:block;'" v-text="formattedDate(item.deadline)"
                                  v-show="!(selected.id === item.id && isEdit && editField === 'deadline')"></span>
                            <DatePicker
                                :class="{'is-invalid': v.job.deadline.$error }"
                                :inputClass="{'is-valid': !v.job.deadline.$error, 'is-invalid': v.job.deadline.$error, 'form-control': true}"
                                type="date" format="DD-MM-YYYY" v-model="job.deadline"
                                v-if="selected.id === item.id && isEdit && editField === 'deadline'"
                                @change="(e) => updateJob(e, true)"
                            />
                            <div class="invalid-feedback"
                                 v-if="selected.id === item.id && v.job.deadline.$error && v.job.deadline.$dirty">
                              {{
                                tc('validations.required')
                              }}
                            </div>
                          </div>
                        </CCol>
                        <CCol md="3">
                          <div class="form-group">
                            <div class="d-flex">
                        <span :style="'display:block;'" v-text="tc('views.jobs.table.finish_date')"
                              :class="'font-weight-bold'"/>
                              <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                                       :class="'inline-edit-button'"
                                       @click="() => {editJob(item, 'finish_date');}"
                                       v-show="!(selected.id === item.id && isEdit && editField === 'finish_date')">
                                <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                              </CButton>
                            </div>
                            <span class="mb-3" :style="'display:block;'" v-text="formattedDate(item.finish_date)"
                                  v-show="!(selected.id === item.id && isEdit && editField === 'finish_date')"></span>
                            <DatePicker
                                :class="{'is-invalid': v.job.finish_date.$error }"
                                :inputClass="{'is-valid': !v.job.finish_date.$error, 'is-invalid': v.job.finish_date.$error, 'form-control': true}"
                                type="date" format="DD-MM-YYYY" v-model="job.finish_date"
                                v-if="selected.id === item.id && isEdit && editField === 'finish_date'"
                                @change="(e) => updateJob(e, true)"
                            />
                            <div :class="'invalid-feedback'" v-if="v.job.finish_date.$error && v.job.finish_date.$dirty">
                              {{
                                tc('validations.required')
                              }}
                            </div>
                          </div>
                        </CCol>
                        <CCol md="3">
                          <div class="form-group">
                            <div class="d-flex">
                        <span :style="'display:block;'" v-text="tc('views.jobs.table.note')"
                              :class="'font-weight-bold'"/>
                              <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                                       :class="'inline-edit-button'"
                                       @click="() => {editJob(item, 'note');}"
                                       v-show="!(selected.id === item.id && isEdit && editField === 'note')">
                                <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                              </CButton>
                            </div>
                            <span class="mb-3" :style="'display:block;'" v-text="item.note"
                                  v-show="!(selected.id === item.id && isEdit && editField === 'note')"></span>
                            <CTextarea
                                v-model="job.note"
                                v-if="selected.id === item.id && isEdit && editField === 'note'"
                                @keyup="(e) => updateJob(e)"
                                :is-valid="v.job.note.$dirty ? !v.job.note.$error : null"
                                :invalid-feedback="tc('validations.max_length').replace(':value', Number(10000).toLocaleString())"
                            />
                          </div>
                        </CCol>
                      </CRow>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCollapse>
            </template>
          </CDataTable>
        </CCardBody>
      </CCard>
    </CCol>
    <ChartModal :show-modal="showModal" :data="jobs" @update:show="(value) => this.showModal = value"/>
  </CRow>
</template>

<script>
import DatePicker from 'vue2-datepicker';
import ChartModal from "@/views/reports/ChartModal";

import moment from 'moment';
import {integer, maxLength, required} from "vuelidate/lib/validators";

export default {
  components: {
    DatePicker,
    ChartModal,
  },
  data() {
    return {
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
      showModal: false,
    };
  },
  validations: {
    job: {
      name: {
        required,
        maxLength: maxLength(255),
      },
      price_yen: {
        required,
        integer,
      },
      start_date: {
        required,
      },
      pay_date: {
        required,
      },
      customer: {
        required,
      },
      type: {
        required,
      },
      method: {
        required,
      },
      deadline: {
        required,
      },
      finish_date: {
        required,
      },
      note: {
        maxLength: maxLength(10000),
      },
    },
  },
  created() {
    this.$store.dispatch('reports/getList');
    this.$store.dispatch('jobs/getAdditionList');
    this.$store.dispatch('jobs/getRate');
  },
  computed: {
    modeOptions() {
      return [
        {
          value: 0,
          label: this.$tc('views.reports.filter.options.sale'),
        },
        {
          value: 1,
          label: this.$tc('views.reports.filter.options.payment'),
        },
      ];
    },
    paidOptions() {
      return [
        {
          value: 0,
          label: this.$tc('views.reports.filter.options.all'),
        },
        {
          value: 1,
          label: this.$tc('views.reports.filter.options.yes'),
        },
        {
          value: 2,
          label: this.$tc('views.reports.filter.options.no'),
        },
      ];
    },
    fields() {
      return [
        {key: 'id', label: this.$tc('views.jobs.table.id'), _style: 'width: 5%;'},
        {key: 'action', label: this.$tc('views.jobs.table.action'), _style: 'width: 7%;'},
        {key: 'name', label: this.$tc('views.jobs.table.name'), _style: 'width: 15%;'},
        {key: 'price', label: this.$tc('views.jobs.table.price'), _style: 'width: 15%;'},
        {key: 'price_yen', label: this.$tc('views.jobs.table.price_yen'), _style: 'width: 15%;'},
        {key: 'start_date', label: this.$tc('views.jobs.table.start_date'), _style: 'width: 15%;'},
        {key: 'pay_date', label: this.$tc('views.jobs.table.pay_date'), _style: 'width: 15%;'},
        {key: 'paid', label: this.$tc('views.jobs.table.paid'), _style: 'width: 8%;'},
        {key: 'show_details', label: this.$tc('views.jobs.table.details'), _style: 'width: 5%;'},
        /*{key: 'customer', name: 'Customer'},
        {key: 'type', name: 'Customer'},
        {key: 'method', name: 'Customer'},
        {key: 'deadline', name: 'Deadline'},
        {key: 'finish_date', name: 'Finish Date'},
        {key: 'note', name: 'Note'},*/
      ];
    },
    tc() {
      return this.$tc;
    },
    v() {
      return this.$v;
    },
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
      if (!onChangeUpdate && e.keyCode === 27) {
        this.cancelEdit();
      } else {
        //if (!onChangeUpdate) {
        this.$v.job[this.editField].$touch();
        //}
        if (!this.$v.job[this.editField].$invalid) {
          if (onChangeUpdate || e.keyCode === 13) {
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
          }
        }
      }
    },
    async deleteJob(item) {
      this.cancelEdit();
      this.selected = item;
      let result = await this.$swal.fire({
        title: this.$tc('alerts.jobs.delete'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.$tc('buttons.crud.confirm'),
        cancelButtonText: this.$tc('buttons.crud.cancel')
      }).then((result) => {
        return result.isConfirmed;
      });

      if (result) {
        this.performDelete();
      }
    },
    performDelete() {
      this.$store.commit('app/setLoading', true);
      this.$store.dispatch('reports/delete', this.selected, {root: true})
          .then(() => this.$store.commit('app/setLoading', false));
    },
    convertCurrency(value) {
      if (!isNaN(value)) {
        return Number(value).toLocaleString(this.$i18n.locale);
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
