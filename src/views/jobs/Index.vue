<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="7"><h3 :class="['mb-0']">{{ this.$tc('views.jobs.title') }}</h3></CCol>
            <CCol md="5">
              <CButton v-c-tooltip="this.$tc('buttons.crud.create')" @click="showModal = true"
                       :class="['ml-auto', 'float-md-right']"
                       color="success">
                <CIcon name="cil-plus"></CIcon>
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol :class="'text-right'">
              <p :class="'font-weight-bold mb-1'">{{ this.$tc('views.jobs.total_monthly') }}: <span
                  style="font-size: 16px;"><span
                  :class="'text-danger'">{{ convertCurrency(monthlyRevenue.price) }}USD</span> - <span
                  :class="'text-primary'">{{ convertCurrency(monthlyRevenue.price_yen) }}JPY</span></span></p>
              <p :class="'font-weight-bold mb-1'">{{ this.$tc('views.jobs.rate') }}: <span
                  style="font-size: 16px;"><span
                  :class="'text-danger'">1USD</span> - <span
                  :class="'text-primary'">{{ rate }}JPY</span></span></p>
            </CCol>
          </CRow>
          <CDataTable
              :loading="this.$store.state.jobs.loading"
              :sorterValue="sortBy"
              :responsive="true"
              :tableFilter="{external: true, label: tc('table_tool.filter.title'), placeholder: tc('table_tool.filter.placeholder')}"
              :itemsPerPageSelect="{ label: tc('table_tool.items_per_page.title')}"
              :sorter="{external: true}"
              hover
              striped
              :items="jobs"
              :fields="fields"
              clickable-rows
              :no-items-view="{ noResults: tc('table_tool.no_results'), noItems: tc('table_tool.no_items') }"
              @update:sorter-value="handleSortChange"
              @pagination-change="handlePaginationChange"
              @update:table-filter-value="handleFilterChange"
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
            <template #Name="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="item.Name" v-show="!(selected.ID === item.ID && isEdit && editField === 'Name')"></span>
                <CInput
                    v-if="selected.ID === item.ID && isEdit && editField === 'Name'"
                    type="text"
                    v-model="job.Name"
                    @keyup="(e) => updateJob(e)"
                    :is-valid="v.job.Name.$dirty ? !v.job.Name.$error : null"
                    :invalid-feedback="!v.job.Name.required ? tc('validations.required') : tc('validations.max_length').replace(':value', 255)"
                />
                <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                         :class="'inline-edit-button'"
                         @click="() => editJob(item, 'Name')"
                         v-show="!(selected.ID === item.ID && isEdit && editField === 'Name')">
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #Price="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="'$' + convertCurrency(item.Price)"></span>
              </td>
            </template>
            <template #PriceYen="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="'¥' + convertCurrency(item.PriceYen)"
                      v-show="!(selected.ID === item.ID && isEdit && editField === 'PriceYen')"></span>
                <CInput
                    v-if="selected.ID === item.ID && isEdit && editField === 'PriceYen'"
                    v-model="job.PriceYen"
                    @keyup="(e) => updateJob(e)"
                    :is-valid="v.job.PriceYen.$dirty ? !v.job.PriceYen.$error : null"
                    :invalid-feedback="!v.job.PriceYen.required ? tc('validations.required') : tc('validations.numeric')"
                />
                <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                         :class="'inline-edit-button'"
                         @click="() => {editJob(item, 'PriceYen');}"
                         v-show="!(selected.ID === item.ID && isEdit && editField === 'PriceYen')">
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #StartDate="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="formattedDate(item.StartDate)"
                      v-show="!(selected.ID === item.ID && isEdit && editField === 'StartDate')"></span>
                <DatePicker
                    :lang="i18n.locale"
                    :class="{'is-invalid': v.job.StartDate.$error }"
                    :inputClass="{'is-valid': !v.job.StartDate.$error, 'is-invalid': v.job.StartDate.$error, 'form-control': true}"
                    type="date" format="YYYY-MM-DD" v-model="job.StartDate"
                    v-if="selected.ID === item.ID && isEdit && editField === 'StartDate'"
                    @change="(e) => updateJob(e, true)"
                />
                <div class="invalid-feedback"
                     v-if="selected.ID === item.ID && v.job.StartDate.$error && v.job.StartDate.$dirty">
                  {{
                    tc('validations.required')
                  }}
                </div>
                <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                         :class="'inline-edit-button'"
                         @click="() => editJob(item, 'StartDate')"
                         v-show="!(selected.ID === item.ID && isEdit && editField === 'StartDate')">
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #Paydate="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="formattedDate(item.Paydate)"
                      v-show="!(selected.ID === item.ID && isEdit && editField === 'Paydate')"></span>
                <DatePicker
                    :lang="i18n.locale"
                    :class="{'is-invalid': v.job.Paydate.$error }"
                    :inputClass="{'is-valid': !v.job.Paydate.$error, 'is-invalid': v.job.Paydate.$error, 'form-control': true}"
                    type="date" format="YYYY-MM-DD" v-model="job.Paydate"
                    v-if="selected.ID === item.ID && isEdit && editField === 'Paydate'"
                    @change="(e) => updateJob(e, true)"
                />
                <div class="invalid-feedback"
                     v-if="selected.ID === item.ID && v.job.Paydate.$error && v.job.Paydate.$dirty">
                  {{
                    tc('validations.required')
                  }}
                </div>
                <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                         :class="'inline-edit-button'"
                         @click="() => editJob(item, 'Paydate')"
                         v-show="!(selected.ID === item.ID && isEdit && editField === 'Paydate')">
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #Paid="{item}">
              <td>
                <CInputCheckbox :checked="item.Paid > 0" :custom="true"
                                @click="(e) => { editJob(item, 'Paid'); updateJob(e, true); }"/>
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
                                     @click="() => editJob(item, 'Customer')"
                                     v-show="!(selected.ID === item.ID && isEdit && editField === 'Customer')">
                              <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                            </CButton>
                          </div>
                          <span class="mb-3" :style="'display:block;'" v-text="item.customer.Name"
                                v-show="!(selected.ID === item.ID && isEdit && editField === 'Customer')"></span>
                          <CSelect
                              :custom="true" :options="customers"
                              v-if="selected.ID === item.ID && isEdit && editField === 'Customer'"
                              :value="item.CustomerID"
                              @input="job.Customer = $event.target.value"
                              @change="(e) => updateJob(e, true)"
                              :is-valid="v.job.Customer.$dirty ? !v.job.Customer.$error : null"
                              :invalid-feedback="tc('validations.required')"
                          />
                        </CCol>
                        <CCol md="3">
                          <div class="d-flex">
                        <span :style="'display:block;'" :class="'font-weight-bold'"
                              v-text="tc('views.jobs.table.type')"/>
                            <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                                     :class="'inline-edit-button'"
                                     @click="() => editJob(item, 'Type')"
                                     v-show="!(selected.ID === item.ID && isEdit && editField === 'Type')">
                              <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                            </CButton>
                          </div>
                          <span class="mb-3" :style="'display:block;'" v-text="item.type.Name"
                                v-show="!(selected.ID === item.ID && isEdit && editField === 'Type')"></span>
                          <CSelect
                              :custom="true" :options="types"
                              :value="item.TypeID"
                              v-if="selected.ID === item.ID && isEdit && editField === 'Type'"
                              @input="job.Type = $event.target.value"
                              @change="(e) => updateJob(e, true)"
                              :is-valid="v.job.Type.$dirty ? !v.job.Type.$error : null"
                              :invalid-feedback="tc('validations.required')"
                          />
                        </CCol>
                        <CCol md="3">
                          <div class="d-flex">
                      <span :style="'display:block;'" :class="'font-weight-bold'"
                            v-text="tc('views.jobs.table.method')"/>
                            <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                                     :class="'inline-edit-button'"
                                     @click="() => editJob(item, 'Method')"
                                     v-show="!(selected.ID === item.ID && isEdit && editField === 'Method')">
                              <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                            </CButton>
                          </div>
                          <span class="mb-3" :style="'display:block;'" v-text="item.method.Name"
                                v-show="!(selected.ID === item.ID && isEdit && editField === 'Method')"></span>
                          <CSelect
                              :custom="true" :options="methods"
                              :value="item.MethodID"
                              v-if="selected.ID === item.ID && isEdit && editField === 'Method'"
                              @input="job.Method = $event.target.value"
                              @change="(e) => updateJob(e, true)"
                              :is-valid="v.job.Method.$dirty ? !v.job.Method.$error : null"
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
                                       @click="() => {editJob(item, 'Deadline');}"
                                       v-show="!(selected.ID === item.ID && isEdit && editField === 'deadline')">
                                <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                              </CButton>
                            </div>
                            <span class="mb-3" :style="'display:block;'" v-text="formattedDate(item.Deadline)"
                                  v-show="!(selected.ID === item.ID && isEdit && editField === 'Deadline')"></span>
                            <DatePicker
                                :lang="i18n.locale"
                                :class="{'is-invalid': v.job.Deadline.$error }"
                                :inputClass="{'is-valid': !v.job.Deadline.$error, 'is-invalid': v.job.Deadline.$error, 'form-control': true}"
                                type="date" format="YYYY-MM-DD" v-model="job.Deadline"
                                v-if="selected.ID === item.ID && isEdit && editField === 'Deadline'"
                                @change="(e) => updateJob(e, true)"
                            />
                            <div class="invalid-feedback"
                                 v-if="selected.ID === item.ID && v.job.Deadline.$error && v.job.Deadline.$dirty">
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
                                       @click="() => {editJob(item, 'FinishDate');}"
                                       v-show="!(selected.ID === item.ID && isEdit && editField === 'FinishDate')">
                                <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                              </CButton>
                            </div>
                            <span class="mb-3" :style="'display:block;'" v-text="formattedDate(item.FinishDate)"
                                  v-show="!(selected.ID === item.ID && isEdit && editField === 'FinishDate')"></span>
                            <DatePicker
                                :lang="i18n.locale"
                                :class="{'is-invalid': v.job.FinishDate.$error }"
                                :inputClass="{'is-valid': !v.job.FinishDate.$error, 'is-invalid': v.job.FinishDate.$error, 'form-control': true}"
                                type="date" format="YYYY-MM-DD" v-model="job.FinishDate"
                                v-if="selected.ID === item.ID && isEdit && editField === 'FinishDate'"
                                @change="(e) => updateJob(e, true)"
                            />
                            <div :class="'invalid-feedback'" v-if="v.job.FinishDate.$error && v.job.FinishDate.$dirty">
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
                                       @click="() => {editJob(item, 'Note');}"
                                       v-show="!(selected.ID === item.ID && isEdit && editField === 'Note')">
                                <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                              </CButton>
                            </div>
                            <span class="mb-3" :style="'display:block;'" v-text="item.Note"
                                  v-show="!(selected.ID === item.ID && isEdit && editField === 'Note')"></span>
                            <CTextarea
                                v-model="job.Note"
                                v-if="selected.ID === item.ID && isEdit && editField === 'Note'"
                                @keyup="(e) => updateJob(e)"
                                :is-valid="v.job.Note.$dirty ? !v.job.Note.$error : null"
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
          <CPagination
              :class="{'disabled': this.$store.state.jobs.loading}"
              v-show="totalPages > 1"
              :activePage.sync="page"
              :pages="totalPages"
              @update:activePage="handlePageChange"
              align="center"
          />
        </CCardBody>
      </CCard>
    </CCol>
    <CreateJobModal
        :show-modal="showModal"
        :rate="rate"
        @update:show="(value) => this.showModal = value"
        :customers="customers"
        :types="types"
        :methods="methods"
    />
  </CRow>
</template>

<script>
import {required, maxLength, integer} from 'vuelidate/lib/validators';
import DatePicker from 'vue2-datepicker';
import CreateJobModal from "@/views/jobs/CreateJobModal";
import {format, isValid, parse} from "date-fns";
import "vue2-datepicker/locale/vi";
import {debounce} from "debounce";
import {confirmAlert} from "../../helpers/alert";

export default {
  components: {
    DatePicker,
    CreateJobModal,
  },
  data() {
    return {
      sortBy: {column: 'ID', asc: false},
      job: {
        Name: '',
        PriceYen: '',
        StartDate: '',
        Paydate: '',
        Customer: '',
        Type: '',
        Method: '',
        Deadline: '',
        FinishDate: '',
        Note: '',
      },
      selected: {},
      isEdit: false,
      editField: '',
      editValue: '',
      isCreate: false,
      isLoading: false,
      collapseDuration: 0,
      showModal: false,
    };
  },
  validations: {
    job: {
      Name: {
        required,
        maxLength: maxLength(255),
      },
      PriceYen: {
        required,
        integer,
      },
      StartDate: {
        required,
      },
      Paydate: {
        required,
      },
      Customer: {
        required,
      },
      Type: {
        required,
      },
      Method: {
        required,
      },
      Paid: {},
      Deadline: {
        required,
      },
      FinishDate: {
        required,
      },
      Note: {
        maxLength: maxLength(10000),
      },
    },
  },
  created() {
    this.$store.commit('jobs/updateQuery', {per_page: 10, page: 1, order: null, q: null});
    this.$store.dispatch('jobs/getList', this.$store.state.jobs.query);
    this.$store.dispatch('jobs/getAdditionList');
    this.$store.dispatch('jobs/getMonthlyRevenue');
    this.$store.dispatch('jobs/getRate');
    this.$store.watch(() => this.$store.state.jobs.query, () => {
          this.$store.dispatch('jobs/getList', this.$store.state.jobs.query);
        },
        {
          deep: true
        });
  },
  computed: {
    totalPages() {
      return this.$store.state.jobs.total_page;
    },
    page: {
      get: function () {
        return this.$store.state.jobs.query.page;
      },
      set: function (page) {
        this.$store.commit('jobs/updateQuery', {page: page});
      },
    },
    i18n() {
      return this.$i18n;
    },
    fields() {
      return [
        {key: 'ID', label: this.$tc('views.jobs.table.id'), _style: 'width: 5%;'},
        {key: 'action', label: this.$tc('views.jobs.table.action'), _style: 'width: 7%;'},
        {key: 'Name', label: this.$tc('views.jobs.table.name'), _style: 'width: 15%;'},
        {key: 'Price', label: this.$tc('views.jobs.table.price'), _style: 'width: 15%;'},
        {key: 'PriceYen', label: this.$tc('views.jobs.table.price_yen'), _style: 'width: 15%;'},
        {key: 'StartDate', label: this.$tc('views.jobs.table.start_date'), _style: 'width: 15%;'},
        {key: 'Paydate', label: this.$tc('views.jobs.table.pay_date'), _style: 'width: 15%;'},
        {key: 'Paid', label: this.$tc('views.jobs.table.paid'), _style: 'width: 8%;'},
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
    monthlyRevenue() {
      return this.$store.state.jobs.monthly_revenue;
    },
    rate() {
      return Math.round(this.$store.state.jobs.rate);
    },
    jobs() {
      return this.$store.state.jobs.jobs;
    },
    customers() {
      return this.$store.state.jobs.customers.map((item) => {
        return {value: item.ID, label: item.Name};
      });
    },
    methods() {
      return this.$store.state.jobs.methods.map((item) => {
        return {value: item.ID, label: item.Name};
      });
    },
    types() {
      return this.$store.state.jobs.types.map((item) => {
        return {value: item.ID, label: item.Name};
      });
    }
  },
  methods: {
    handlePageChange(page) {
      if (!isNaN(page) && this.page !== page) {
        this.$store.commit('jobs/updateQuery', {page: page});
      }
    },
    handleSortChange(sorter) {
      let order = {asc: false, column: 'ID'};
      if (sorter.asc) {
        order.asc = sorter.asc;
      }
      if (sorter.column) {
        order.column = sorter.column;
      }

      this.$store.commit('jobs/updateQuery', {order: order});
    },
    handleFilterChange: debounce(function (value) {
      if (value !== this.$store.state.jobs.query.q) {
        this.$store.commit('jobs/updateQuery', {q: value});
      }
    }, 300),
    handlePaginationChange(value) {
      if (!isNaN(value)) {
        this.$store.commit('jobs/updateQuery', {per_page: value});
      }
    },
    formattedDate(value) {
      return value;
    },
    editJob(item, field = 'Name') {
      this.selected = item;
      this.isEdit = true;
      this.editField = field;
      if (['StartDate', 'Paydate', 'Deadline', 'FinishDate'].includes(field)) {
        this.job[field] = new Date(this.selected[field]);
      } else if (['Customer', 'Type', 'Method'].includes(field)) {
        this.job[field] = this.selected[field.toLowerCase()].ID;
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
            let payload = {
              ID: this.selected.ID,
              data: {
                field: this.editField,
                value: this.job[this.editField],
              }
            };

            if (['StartDate', 'Paydate', 'Deadline', 'FinishDate'].includes(this.editField)) {
              payload.data.value = format(this.job[this.editField], 'yyyy-MM-dd');
            }

            if (this.editField === 'Paid') {
              payload.data.value = e.target.checked;
            }

            if (['Customer', 'Type', 'Method'].includes(this.editField)) {
              payload.data.value = parseInt(this.job[this.editField]);
            }

            this.$store.dispatch('jobs/updateJob',
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
    cancelEdit() {
      this.isEdit = false;
      this.editField = '';
      this.editValue = '';
      this.job = {
        Name: '',
        PriceYen: '',
        StartDate: '',
        Paydate: '',
        Customer: '',
        Type: '',
        Method: '',
        Deadline: '',
        FinishDate: '',
        Note: '',
      };
    },
    async deleteJob(item) {
      this.cancelEdit();
      this.selected = item;

      let result = await confirmAlert(this.$tc('alerts.jobs.delete'), this.$tc('buttons.crud.confirm'), this.$tc('buttons.crud.cancel'), 'warning').then(result => {
        return result.isConfirmed;
      });

      if (result) {
        this.performDelete();
      }
    },
    performDelete() {
      this.$store.dispatch('jobs/delete', this.selected, {root: true})
          .then(() => this.$store.dispatch('jobs/getList'), this.$store.state.jobs.query);
    },
    convertCurrency(value) {
      if (!isNaN(value)) {
        return Number(value).toLocaleString(this.$i18n.locale);
      }
      return 0;
    },
    toggleDetails(job) {
      this.$set(this.jobs[this.jobs.findIndex(item => item.ID === job.ID)], '_toggled', !job._toggled);
      this.collapseDuration = 300;
      this.$nextTick(() => {
        this.collapseDuration = 0;
      })
    },
  },
}
</script>

<style scoped>
.table th, .table td {
  vertical-align: middle;
}
</style>
