<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="7"><h3 :class="['mb-0']">{{ this.$tc('views.customers.title') }}</h3></CCol>
            <CCol md="5">
              <CButton v-c-tooltip="{content: this.$tc('buttons.crud.create')}"
                       @click="() => {this.isCreate = true; this.cancelEdit(); }"
                       :class="['ml-auto', 'float-md-right']"
                       color="success">
                <CIcon name="cil-plus"></CIcon>
              </CButton>
              <CForm @submit.prevent="createCustomer">
                <CModal
                    :close-on-backdrop="false"
                    color="primary"
                    :title="tc('views.customers.create_customer.title')"
                    :show.sync="isCreate"
                >
                  <CInput
                      v-model.trim="customer.Name"
                      :label="tc('views.customers.create_customer.name')"
                      horizontal
                      :is-valid="this.$v.customer.Name.$dirty ? !this.$v.customer.Name.$error : null"
                      :invalid-feedback="!this.$v.customer.Name.required ? tc('validations.required') : tc('validations.max_length').replace(':value', 255)"
                  />
                  <template v-slot:footer>
                    <CButton @click="isCreate = false" color="secondary">{{ tc('buttons.crud.cancel') }}</CButton>
                    <CButton type="submit" color="primary">{{ tc('buttons.crud.save') }}</CButton>
                  </template>
                </CModal>
              </CForm>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol md="3">
              <CInput
                  v-model.number="unpaidThreshold"
                  :label="tc('views.customers.unpaid_threshold')"
                  addLabelClasses="font-weight-bold"
                  :is-valid="this.$v.unpaidThreshold.$dirty ? !this.$v.unpaidThreshold.$error : null"
                  :invalid-feedback="!this.$v.unpaidThreshold.required ? 'This field is required.' : 'This field required numeric value.'"
              >
                <template #append>
                  <CButton @click="updateUnpaidThreshold" color="primary" v-text="tc('buttons.crud.save')"/>
                </template>
              </CInput>
            </CCol>
            <CCol md="4" class="offset-md-5">
              <CRow>
                <CCol md="6">
                  <CSelect
                      :custom="true"
                      :label="tc('views.customers.sort_by.title')"
                      addLabelClasses="font-weight-bold"
                      :options="sortOptions"
                      :value.sync="sortBy"
                      @update:value="handleSortByChange"
                  />
                </CCol>
                <CCol md="6">
                  <CSelect
                      :custom="true"
                      :label="tc('views.customers.unpaid_list.title')"
                      addLabelClasses="font-weight-bold"
                      :options="unpaidOptions" :value.sync="unpaid"
                      @update:value="handleUnpaidChange"
                  />
                </CCol>
              </CRow>
            </CCol>
          </CRow>
          <CDataTable
              :loading="this.$store.state.customers.loading"
              addTableClasses="sp-table"
              :customerSort="true"
              :sort-by="sortBy"
              responsive
              :sorterValue="sortState"
              :tableFilter="{external: true, label: tc('table_tool.filter.title'), placeholder: tc('table_tool.filter.placeholder')}"
              :itemsPerPageSelect="{ label: tc('table_tool.items_per_page.title')}"
              items-per-page-select
              :sorter="{external: true}"
              hover
              striped
              :items="customers"
              :fields="fields"
              clickable-rows
              :no-items-view="{ noResults: tc('table_tool.no_results'), noItems: tc('table_tool.no_items') }"
              @update:sorter-value="handleSortChange"
              @pagination-change="handlePaginationChange"
              @update:table-filter-value="handleFilterChange"
          >
            <template #ID="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="item.ID" :data-title="tc('views.customers.table.id')"></span>
              </td>
            </template>
            <template #Name="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="item.Name" v-show="!(selected.ID === item.ID && isEdit && editField === 'Name')"></span>
                <CInput
                    type="text"
                    v-model="customer.Name"
                    v-if="item.ID === selected.ID && isEdit && editField === 'Name'"
                    :is-valid="v.customer.Name.$dirty ? !v.customer.Name.$error : null"
                    :invalid-feedback="!v.customer.Name.required ? tc('validations.required') : tc('validations.max_length').replace(':value', 255)"
                    @keyup="updateCustomer"
                />
                <CButton
                    v-c-tooltip="{content: tc('buttons.crud.edit')}"
                    size="sm"
                    color="secondary"
                    :class="'inline-edit-button'"
                    @click="() => editCustomer(item, 'Name')"
                    v-show="!(selected.ID === item.ID && isEdit && editField === 'Name')"
                >
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #Note="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="item.Note" v-show="!(selected.ID === item.ID && isEdit && editField === 'Note')"></span>
                <CTextarea
                    rows="4"
                    type="text"
                    v-model="customer.Note"
                    v-if="item.ID === selected.ID && isEdit && editField === 'Note'"
                    :is-valid="v.customer.Note.$dirty ? !v.customer.Note.$error : null"
                    :invalid-feedback="tc('validations.max_length').replace(':value', Number(10000).toLocaleString($i18n.locale))"
                    @keyup="updateCustomer"
                />
                <CButton
                    v-c-tooltip="{content: tc('buttons.crud.edit')}"
                    size="sm"
                    color="secondary"
                    :class="'inline-edit-button'"
                    @click="() => editCustomer(item, 'Note')"
                    v-show="!(selected.ID === item.ID && isEdit && editField === 'Note')"
                >
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #unpaid="{item}">
              <td>
                <span v-text="'$' + moneyConverter(item.unpaid)"></span>
              </td>
            </template>
            <template #action="{item}">
              <td>
                <CButton
                    v-c-tooltip="{content: tc('buttons.crud.delete')}"
                    size="sm"
                    color="danger"
                    @click="deleteCustomer(item)"
                >
                  <CIcon name="cil-trash"></CIcon>
                </CButton>
              </td>
            </template>
          </CDataTable>
          <CPagination
              :class="{'disabled': this.$store.state.customers.loading}"
              v-show="totalPages > 1"
              :activePage.sync="page"
              :pages="totalPages"
              @update:activePage="handlePageChange"
              align="center"
          />
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import {required, maxLength, integer, minValue} from 'vuelidate/lib/validators';
import {debounce} from "debounce";
import {confirmAlert} from "../../helpers/alert";

export default {
  data() {
    return {
      customer: {
        Name: '',
        Note: '',
      },
      selected: {},
      isEdit: false,
      isCreate: false,
      sortBy: 0,
      unpaid: 0,
      sortState: {
        column: 'ID',
        asc: false,
      },
      editField: '',
      unpaidThreshold: 0,
    };
  },
  validations: {
    customer: {
      Name: {
        required,
        maxLength: maxLength(255),
      },
      Note: {
        maxLength: maxLength(10000),
      },
    },
    unpaidThreshold: {
      required,
      integer,
      minValue: minValue(1),
    },
  },
  created() {
    this.$store.commit('jobs/updateQuery', {per_page: 10, page: 1, order: null, sort_by: null, q: null});
    this.$store.dispatch('customers/getList', this.$store.state.customers.query);
    this.$store.dispatch('app/getUnpaidThreshold')
        .then(() => {
          this.unpaidThreshold = this.$store.state.app.unpaidThreshold;
        });
    this.$store.watch(() => this.$store.state.customers.query, () => {
          this.$store.dispatch('customers/getList', this.$store.state.customers.query);
        },
        {
          deep: true
        });
  },
  computed: {
    page: {
      get: function () {
        return this.$store.state.customers.query.page;
      },
      set: function (value) {
        this.$store.commit('customers/updateQuery', {page: value});
      }
    },
    totalPages() {
      return this.$store.state.customers.total_page;
    },
    sortOptions() {
      return [
        {value: 0, label: this.$tc('views.customers.sort_by.most_recent')},
        {value: 1, label: this.$tc('views.customers.sort_by.newest')},
        {value: 2, label: this.$tc('views.customers.sort_by.oldest')},
      ];
    },
    unpaidOptions() {
      return [
        {value: 0, label: this.$tc('views.customers.unpaid_list.all')},
        {value: 1, label: this.$tc('views.customers.unpaid_list.unpaid')},
      ];
    },
    fields() {
      return [
        {key: 'ID', label: this.$tc('views.customers.table.id'), _style: "width: 10%;"},
        {key: 'action', label: this.$tc('views.customers.table.action'), _style: "width: 10%;", sorter: false},
        {key: 'Name', label: this.$tc('views.customers.table.name'), _style: "width: 30%;"},
        {key: 'Note', label: this.$tc('views.customers.table.note'), _style: "width: 30%;"},
        {key: 'unpaid', label: this.$tc('views.customers.table.unpaid'), _style: "width: 20%;"},
      ];
    },
    tc() {
      return this.$tc;
    },
    v() {
      return this.$v;
    },
    customers() {
      return this.$store.state.customers.customers;
    }
  },
  methods: {
    handleUnpaidChange(value) {
      this.$store.commit('customers/updateQuery', {unpaid: value});
    },
    handleSortByChange(value) {
      this.$store.commit('customers/updateQuery', {sort_by: value});
    },
    handlePageChange(page) {
      if (!isNaN(page) && this.page !== page) {
        this.$store.commit('customers/updateQuery', {page: page});
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

      this.$store.commit('customers/updateQuery', {order: order});
    },
    handleFilterChange: debounce(function (value) {
      if (value !== this.$store.state.customers.query.q) {
        this.$store.commit('customers/updateQuery', {q: value});
      }
    }, 300),
    handlePaginationChange(value) {
      if (!isNaN(value)) {
        this.$store.commit('customers/updateQuery', {per_page: value});
      }
    },
    moneyConverter(value) {
      if (!isNaN(value)) {
        return Number(value).toLocaleString(this.$i18n.locale);
      }
      return null;
    },
    editCustomer(item, field) {
      this.selected = item;
      this.isEdit = true;
      this.customer[field] = item[field];
      this.editField = field;
    },
    updateCustomer(e) {
      if (e.keyCode === 13) {
        this.$v.customer[this.editField].$touch();
        if (!this.$v.customer[this.editField].$invalid) {
          this.$store.dispatch('customers/update', {
            ID: this.selected.ID,
            field: this.editField,
            value: this.customer[this.editField]
          }, {root: true})
              .then(status => {
                if (status) {
                  this.isEdit = false;
                  this.$v.customer.$reset();
                  this.customer.Name = '';
                  this.editField = '';
                  this.$store.dispatch('customers/getList', this.$store.state.customers.query);
                }
              });
        }
      } else if (e.keyCode === 27) {
        this.cancelEdit();
      }
    },
    async deleteCustomer(item) {
      this.cancelEdit();
      this.selected = item;

      let result = await confirmAlert(this.$tc('alerts.customers.delete'), this.$tc('buttons.crud.confirm'), this.$tc('buttons.crud.cancel'), 'warning')
          .then(result => {
            return result.isConfirmed;
          });

      if (result) {
        this.performDelete();
      }
    },
    performDelete() {
      this.$store.dispatch('customers/delete', this.selected, {root: true})
          .then(() => this.$store.dispatch('customers/getList', this.$store.state.customers.query));
    },
    createCustomer() {
      this.$v.customer.$touch();
      if (!this.$v.customer.$invalid) {
        this.$store.commit('app/setLoading', true);
        this.$store.dispatch('customers/create', this.customer, {root: true})
            .then((status) => {
              if (status) {
                this.isCreate = false;
                this.customer = {
                  Name: '',
                };
                this.$v.customer.$reset();
                this.$store.dispatch('customers/getList', this.$store.state.customers.query);
              }
            })
            .finally(() => this.$store.commit('app/setLoading', false));
      }
    },
    cancelEdit() {
      this.isEdit = false;
      this.customer = {
        Name: '',
        Note: '',
      };
      this.editField = '';
      this.$v.customer.$reset();
    },
    updateUnpaidThreshold() {
      this.$v.unpaidThreshold.$touch();
      if (!this.$v.unpaidThreshold.$invalid) {
        this.$store.commit('app/setLoading', true);
        this.$store.dispatch('app/updateUnpaidThreshold', {value: this.unpaidThreshold}, {root: true})
            .then(() => {
              this.$store.commit('app/setLoading', false);
            });
      }
    },

  }
}
</script>

<style scoped>

</style>
