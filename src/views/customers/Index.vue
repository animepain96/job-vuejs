<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="7"><h3 :class="['mb-0']">Customer Management</h3></CCol>
            <CCol md="5">
              <CButton v-c-tooltip="'Create New'" @click="() => {this.isCreate = true; this.cancelEdit(); }" :class="['ml-auto', 'float-md-right']"
                       color="success">
                <CIcon name="cil-plus"></CIcon>
              </CButton>
              <CForm @submit.prevent="createCustomer">
                <CModal
                    title="Create Customer"
                    :show.sync="isCreate"
                >
                  <CInput
                      v-model.trim="customer.name"
                      label="Customer name"
                      horizontal
                      :is-valid="this.$v.customer.name.$dirty ? !this.$v.customer.name.$error : null"
                      :invalid-feedback="!this.$v.customer.name.required ? 'This field is required.' : 'This field required 255 maximum characters.'"
                  />
                  <template v-slot:footer>
                    <CButton @click="isCreate = false" color="secondary">Cancel</CButton>
                    <CButton type="submit" color="success">Save</CButton>
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
                  v-model="unpaidThresholdComputed"
                  label="Unpaid Threshold"
                  addLabelClasses="font-weight-bold"
                  :is-valid="this.$v.unpaidThreshold.$dirty ? !this.$v.unpaidThreshold.$error : null"
                  :invalid-feedback="!this.$v.unpaidThreshold.required ? 'This field is required.' : 'This field required numeric value.'"
              >
                <template #append>
                  <CButton @click="updateUnpaidThreshold" color="primary" v-text="'Save'"/>
                </template>
              </CInput>
            </CCol>
            <CCol md="4" class="offset-md-5">
              <CRow>
                <CCol md="6">
                  <CSelect :custom="true" label="Sort By" addLabelClasses="font-weight-bold"
                           :options="sortOptions"
                           :value.sync="sortBy"/>
                </CCol>
                <CCol md="6">
                  <CSelect :custom="true" label="Unpaid List" addLabelClasses="font-weight-bold"
                           :options="unpaidOptions" :value.sync="unpaid"/>
                </CCol>
              </CRow>
            </CCol>
          </CRow>
          <CCustomDataTable
              :loading="loading"
              :sort-by="sortBy"
              :responsive="true"
              :sorterValue="sortState"
              :tableFilter="{ placeholder: 'Search...'}"
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
          >

            <template #name="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="item.name" v-show="!(selected.id === item.id && isEdit && editField === 'name')"></span>
                <CInput
                    type="text"
                    v-model="customer.name"
                    v-if="item.id === selected.id && isEdit && editField === 'name'"
                    :is-valid="v.customer.name.$dirty ? !v.customer.name.$error : null"
                    :invalid-feedback="!v.customer.name.required ? 'This field is required.' : 'This field required 255 maximum characters.'"
                    @keyup="updateCustomer"
                />
                <CButton
                    v-c-tooltip="'Edit'"
                    size="sm"
                    color="secondary"
                    :class="'inline-edit-button'"
                    @click="() => editCustomer(item, 'name')"
                    v-show="!(selected.id === item.id && isEdit && editField === 'name')"
                >
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #note="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="item.note" v-show="!(selected.id === item.id && isEdit && editField === 'note')"></span>
                <CTextarea
                    rows="4"
                    type="text"
                    v-model="customer.note"
                    v-if="item.id === selected.id && isEdit && editField === 'note'"
                    :is-valid="v.customer.note.$dirty ? !v.customer.note.$error : null"
                    :invalid-feedback="!v.customer.note.required ? 'This field is required.' : 'This field required 10000 maximum characters.'"
                    @keyup="updateCustomer"
                />
                <CButton
                    v-c-tooltip="'Edit'"
                    size="sm"
                    color="secondary"
                    :class="'inline-edit-button'"
                    @click="() => editCustomer(item, 'note')"
                    v-show="!(selected.id === item.id && isEdit && editField === 'note')"
                >
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #unpaid="{item}">
              <td>
                <span v-text="'$' + item.unpaid.toLocaleString()"></span>
              </td>
            </template>
            <template #action="{item}">
              <td>
                <CButton
                    v-c-tooltip="'Delete'"
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
import {required, maxLength, numeric} from 'vuelidate/lib/validators';
import CCustomDataTable from "@/views/custom/CCustomDataTable";

export default {
  components: {
    CCustomDataTable,
  },
  data() {
    return {
      fields: [
        {key: 'id', name: 'ID', _style: "width: 10%;"},
        {key: 'action', _style: "width: 10%;"},
        {key: 'name', name: 'Name', _style: "width: 30%;"},
        {key: 'note', name: 'Note', _style: "width: 30%;"},
        {key: 'unpaid', name: 'Unpaid', _style: "width: 20%;"},
      ],
      customer: {
        name: '',
        note: '',
      },
      selected: {
        name: '',
      },
      isEdit: false,
      isCreate: false,
      isLoading: false,
      sortBy: 0,
      unpaid: 0,
      sortState: {
        column: 'id',
        asc: false,
      },
      sortOptions: [
        {value: 0, label: 'Most Recent'},
        {value: 1, label: 'Newest'},
        {value: 2, label: 'Oldest'},
      ],
      unpaidOptions: [
        {value: 0, label: 'All List'},
        {value: 1, label: 'Unpaid List'},
      ],
      unpaidThreshold: 0,
      editField: '',
    };
  },
  validations: {
    customer: {
      name: {
        required,
        maxLength: maxLength(255),
      },
      note: {
        maxLength: maxLength(10000),
      },
    },
    unpaidThreshold: {
      required,
      numeric,
    },
  },
  created() {
    this.$store.commit('app/setTableLoading', true);
    this.$store.dispatch('customers/getList', null, {root: true})
        .finally(() => this.$store.commit('app/setTableLoading', false));
  },
  computed: {
    loading() {
      return this.$store.state.app.tableLoading;
    },
    unpaidThresholdComputed: {
      get() {
        return this.$store.state.app.unpaidThreshold;
      },
      set(value) {
        this.unpaidThreshold = value;
      },
    },
    v() {
      return this.$v;
    },
    customers() {
      let result = this.$store.state.customers.customers;
      result = result.map((customer) => {
        //get unpaid
        customer.unpaid = customer.jobs.reduce((total, job) => {
          if (!job.paid) {
            return total + job.price;
          }
          return total + 0;
        }, 0);

        return customer;
      });

      if (this.unpaid === 1) {
        result = result.filter((customer) => {
          if (customer.unpaid > this.unpaidThresholdComputed) {
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
            id: this.selected.id,
            field: this.editField,
            value: this.customer[this.editField]
          }, {root: true})
              .then(status => {
                if (status) {
                  this.isEdit = false;
                  this.$v.customer.$reset();
                  this.customer.name = '';
                  this.editField = '';
                }
                this.$store.commit('app/setLoading', false);
              });
        }
      } else if (e.keyCode === 27) {
        this.cancelEdit();
      }
    },
    deleteCustomer(item) {
      this.cancelEdit();
      this.selected = item;
      this.$swal.fire({
        title: 'Are you sure to delete this customer?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm'
      }).then((result) => {
        if (result.isConfirmed) {
          this.performDelete();
        }
      })
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
                  name: '',
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
        name: '',
        note: '',
      };
      this.editField = '';
      this.$v.customer.$reset();
    },
    updateUnpaidThreshold() {
      this.$v.unpaidThreshold.$touch();
      if (!this.$v.unpaidThreshold.$invalid) {
        this.$store.commit('app/setLoading', true);
        this.$store.dispatch('app/updateUnpaidThreshold', {unpaid_threshold: this.unpaidThreshold}, {root: true})
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