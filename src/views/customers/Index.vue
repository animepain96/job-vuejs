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
                  <CSelect :custom="true" :label="tc('views.customers.sort_by.title')"
                           addLabelClasses="font-weight-bold"
                           :options="sortOptions"
                           :value.sync="sortBy"/>
                </CCol>
                <CCol md="6">
                  <CSelect :custom="true" :label="tc('views.customers.unpaid_list.title')"
                           addLabelClasses="font-weight-bold"
                           :options="unpaidOptions" :value.sync="unpaid"/>
                </CCol>
              </CRow>
            </CCol>
          </CRow>
          <CCustomDataTable
              :customerSort="true"
              :sort-by="sortBy"
              responsive
              :sorterValue="sortState"
              :tableFilter="{ label: tc('table_tool.filter.title'), placeholder: tc('table_tool.filter.placeholder')}"
              :itemsPerPageSelect="{ label: tc('table_tool.items_per_page.title')}"
              items-per-page-select
              sorter
              hover
              striped
              :items="customers"
              :fields="fields"
              :items-per-page="10"
              clickable-rows
              :active-page="1"
              :pagination="{ doubleArrows: true, align: 'center'}"
              @update:sorter-value="(e) => this.sortState = e"
              :no-items-view="{ noResults: tc('table_tool.no_results'), noItems: tc('table_tool.no_items') }"
          >
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
            <template #Unpaid="{item}">
              <td>
                <span v-text="'$' + item.Unpaid.toLocaleString($i18n.locale)"></span>
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
          </CCustomDataTable>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import {required, maxLength, integer, minValue} from 'vuelidate/lib/validators';
import CCustomDataTable from "@/views/custom/CCustomDataTable";

export default {
  components: {
    CCustomDataTable,
  },
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
    this.$store.dispatch('customers/getList');
    this.$store.dispatch('app/getUnpaidThreshold')
        .then(() => {
          this.unpaidThreshold = this.$store.state.app.unpaidThreshold;
        });
  },
  computed: {
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
        {key: 'action', label: this.$tc('views.customers.table.action'), _style: "width: 10%;"},
        {key: 'Name', label: this.$tc('views.customers.table.name'), _style: "width: 30%;"},
        {key: 'Note', label: this.$tc('views.customers.table.note'), _style: "width: 30%;"},
        {key: 'Unpaid', label: this.$tc('views.customers.table.unpaid'), _style: "width: 20%;"},
      ];
    },
    tc() {
      return this.$tc;
    },
    v() {
      return this.$v;
    },
    customers() {
      let result = this.$store.state.customers.customers;
      result = result.map((customer) => {
        //get unpaid
        customer.Unpaid = customer.jobs.reduce((total, job) => {
          if (!job.Paid) {
            return total + job.Price;
          }
          return total + 0;
        }, 0);

        return customer;
      });

      if (this.unpaid === 1) {
        result = result.filter((customer) => {
          if (customer.Unpaid > this.unpaidThreshold) {
            return customer;
          }
        });
      }

      return result;
    },
  },
  methods: {
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
          this.$store.commit('app/setLoading', true);
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
                }
                this.$store.commit('app/setLoading', false);
              });
        }
      } else if (e.keyCode === 27) {
        this.cancelEdit();
      }
    },
    async deleteCustomer(item) {
      this.cancelEdit();
      this.selected = item;
      let result = await this.$swal.fire({
        title: this.$tc('alerts.customers.delete'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.$tc('buttons.crud.confirm'),
        cancelButtonText: this.$tc('buttons.crud.cancel')
      }).then(result => {
        return result.isConfirmed;
      });

      if (result) {
        this.performDelete();
      }
    },
    performDelete() {
      this.$store.commit('app/setLoading', true);
      this.$store.dispatch('customers/delete', this.selected, {root: true})
          .then(() => this.$store.commit('app/setLoading', false));
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
              }
              this.$store.commit('app/setLoading', false);
            });
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
