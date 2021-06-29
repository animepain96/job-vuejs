<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="7"><h3 :class="['mb-0']">Customer Management</h3></CCol>
            <CCol md="5">
              <CButton @click="isCreate = true" :class="['ml-auto', 'float-md-right']" color="success">
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
                  <CSelect :custom="true" label="Sort By" addLabelClasses="font-weight-bold" :options="sortOptions"
                           :value.sync="sortBy"/>
                </CCol>
                <CCol md="6">
                  <CSelect :custom="true" label="Unpaid List" addLabelClasses="font-weight-bold"
                           :options="unpaidOptions" :value.sync="unpaid"/>
                </CCol>
              </CRow>
            </CCol>
          </CRow>
          <CDataTable
              :sorterValue="{column: 'id', asc: false}"
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
              :pagination="{ doubleArrows: false, align: 'center'}"
          >
            <template #name="{item}">
              <td>
                <span v-text="item.name" v-show="item.id !== selected.id || !isEdit"></span>
                <CInput
                    type="text"
                    v-model="customer.name"
                    v-if="item.id === selected.id && isEdit"
                    :is-valid="v.customer.name.$dirty ? !v.customer.name.$error : null"
                    :invalid-feedback="!v.customer.name.required ? 'This field is required.' : 'This field required 255 maximum characters.'"
                />
              </td>
            </template>
            <template #unpaid="{item}">
              <td>
                <span v-text="'$' + item.unpaid.toLocaleString()"></span>
              </td>
            </template>
            <template #action="{item}">
              <td>
                <CButtonGroup class="mr-3" v-show="! isEdit || selected.id !== item.id">
                  <CButton
                      size="sm"
                      color="primary"
                      @click="editCustomer(item)"
                  >
                    <CIcon name="cil-pencil"></CIcon>
                  </CButton>
                  <CButton
                      size="sm"
                      color="danger"
                      @click="deleteCustomer(item)"
                  >
                    <CIcon name="cil-trash"></CIcon>
                  </CButton>
                </CButtonGroup>
                <CButtonGroup class="mr-3" v-show="isEdit && selected.id === item.id">
                  <CButton
                      size="sm"
                      color="success"
                      @click="updateCustomer"
                  >
                    <CIcon name="cil-save"></CIcon>
                  </CButton>
                  <CButton
                      size="sm"
                      color="secondary"
                      @click="cancelEdit"
                  >
                    <CIcon name="cil-x-circle"></CIcon>
                  </CButton>
                </CButtonGroup>
              </td>
            </template>
          </CDataTable>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import {required, maxLength, numeric} from 'vuelidate/lib/validators';

export default {
  data() {
    return {
      fields: [
        {key: 'id', name: 'ID', _style: "width: 20%;"},
        {key: 'name', name: 'Name', _style: "width: 30%;"},
        {key: 'unpaid', name: 'Unpaid', _style: "width: 30%;"},
        {key: 'action', _style: "width: 20%;"},
      ],
      customer: {
        name: '',
      },
      selected: {
        name: '',
      },
      isEdit: false,
      isCreate: false,
      isLoading: false,
      sortBy: 0,
      unpaid: 0,
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
    };
  },
  validations: {
    customer: {
      name: {
        required,
        maxLength: maxLength(255),
      },
    },
    unpaidThreshold: {
      required,
      numeric,
    },
  },
  created() {
    this.$store.dispatch('customers/getList', null, {root: true});
  },
  computed: {
    unpaidThresholdComputed: {
      get()
      {
        return this.$store.state.app.unpaidThreshold;
      },
      set(value)
      {
        this.unpaidThreshold = value;
      },
    },
    v() {
      return this.$v;
    },
    customers() {
      return this.$store.state.customers.customers.map((customer) => {
        customer.unpaid = customer.jobs.reduce((total, job) => {
          if(!job.paid) {
            return total + job.price;
          }
          return total + 0;
        }, 0);

        return customer;
      });
    },
  },
  methods: {
    editCustomer(item) {
      this.selected = item;
      this.isEdit = true;
      this.customer.name = item.name;
    },
    updateCustomer() {
      this.$v.customer.$touch();
      if (!this.$v.customer.$invalid) {
        this.$store.commit('app/setLoading', true);
        this.$store.dispatch('customers/update', {id: this.selected.id, name: this.customer.name}, {root: true})
            .then(status => {
              if (status) {
                this.isEdit = false;
                this.$v.customer.$reset();
                this.customer.name = '';
              }
              this.$store.commit('app/setLoading', false);
            });
      }
    },
    deleteCustomer(item) {
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
          this.$store.commit('app/setLoading', true);
          this.$store.dispatch('customers/delete', this.selected, {root: true})
              .then(() => this.$store.commit('app/setLoading', false));
        }
      })
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
      this.customer.name = '';
      this.$v.customer.$reset();
    },
    updateUnpaidThreshold() {
      this.$v.unpaidThreshold.$touch();
      if(!this.$v.unpaidThreshold.$invalid) {
        this.$store.commit('app/setLoading', true);
        this.$store.dispatch('app/updateUnpaidThreshold', {unpaid_threshold: this.unpaidThreshold}, {root: true})
            .then(() => {
              this.$store.commit('app/setLoading', false);
            });
      }
    }
  }
}
</script>

<style scoped>

</style>