<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="7"><h3 :class="['mb-0']">Type Management</h3></CCol>
            <CCol md="5">
              <CButton v-c-tooltip="'Create New'" @click="() => {this.isCreate = true; this.cancelEdit();}" :class="['ml-auto', 'float-md-right']"
                       color="success">
                <CIcon name="cil-plus"></CIcon>
              </CButton>
              <CForm @submit.prevent="createType">
                <CModal
                    color="primary"
                    title="Create Type"
                    :show.sync="isCreate"
                >
                  <CInput
                      v-model.trim="type.name"
                      label="Type name"
                      horizontal
                      :is-valid="this.$v.type.name.$dirty ? !this.$v.type.name.$error : null"
                      :invalid-feedback="!this.$v.type.name.required ? 'This field is required.' : 'This field required 255 maximum characters.'"
                  />
                  <template v-slot:footer>
                    <CButton @click="isCreate = false" color="secondary">Cancel</CButton>
                    <CButton type="submit" color="primary">Save</CButton>
                  </template>
                </CModal>
              </CForm>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CDataTable
              :sorterValue="sortBy"
              :responsive=false
              :tableFilter="{ placeholder: 'Search...'}"
              items-per-page-select
              sorter
              hover
              striped
              :items="types"
              :fields="fields"
              :items-per-page="10"
              clickable-rows
              :active-page="1"
              :pagination="{ doubleArrows: false, align: 'center'}"
              @update:sorter-value="(e) => this.sortBy = e"
          >
            <template #name="{item}">
              <td :class="'inline-edit-wrap'">
                <label v-text="item.name" v-show="item.id !== selected.id || !isEdit"></label>
                <CInput
                    type="text"
                    v-model="type.name"
                    v-show="item.id === selected.id && isEdit"
                    :is-valid="v.type.name.$dirty ? !v.type.name.$error : null"
                    :invalid-feedback="!v.type.name.required ? 'This field is required.' : 'This field required 255 maximum characters.'"
                    @keyup="updateType"
                />
                <CButton v-c-tooltip="'Edit'" size="sm" color="secondary" :class="'inline-edit-button'"
                         @click="() => editType(item)"
                         v-show="!(selected.id === item.id && isEdit)">
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #action="{item}">
              <td>
                <CButton
                    v-c-tooltip="'Delete'"
                    size="sm"
                    color="danger"
                    @click="deleteType(item)"
                >
                  <CIcon name="cil-trash"></CIcon>
                </CButton>
              </td>
            </template>
          </CDataTable>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import {required, maxLength} from 'vuelidate/lib/validators';

export default {
  data() {
    return {
      fields: [
        {key: 'id', name: 'ID', _style: "width: 20%;"},
        {key: 'action', _style: "width: 30%;"},
        {key: 'name', name: 'Name', _style: "width: 50%;"},
      ],
      sortBy: {
        column: 'id',
        asc: false,
      },
      type: {
        name: '',
      },
      selected: {},
      isEdit: false,
      isCreate: false,
      isLoading: false,
    };
  },
  validations: {
    type: {
      name: {
        required,
        maxLength: maxLength(255),
      },
    },
  },
  created() {
    this.$store.dispatch('types/getList');
  },
  computed: {
    v() {
      return this.$v;
    },
    types() {
      return this.$store.state.types.types;
    }
  },
  methods: {
    editType(item) {
      this.selected = item;
      this.isEdit = true;
      this.type.name = item.name;
    },
    updateType(e) {
      if(e.keyCode === 13) {
        this.$v.type.$touch();
        if (!this.$v.type.$invalid) {
          this.$store.commit('app/setLoading', true);
          this.$store.dispatch('types/update', {id: this.selected.id, name: this.type.name}, {root: true})
              .then(status => {
                if (status) {
                  this.isEdit = false;
                  this.type = {
                    name: '',
                  };
                  this.$v.type.$reset();
                }
                this.$store.commit('app/setLoading', false);
              });
        }
      } else if(e.keyCode === 27) {
        this.cancelEdit();
      }
    },
    createType() {
      this.$v.type.$touch();
      if (!this.$v.type.$invalid) {
        this.$store.commit('app/setLoading', true);
        this.$store.dispatch('types/create', this.type, {root: true})
            .then(status => {
              if (status) {
                this.isCreate = false;
                this.type = {
                  name: '',
                };
                this.$v.type.$reset();
              }
              this.$store.commit('app/setLoading', false);
            });
      }
    },
    deleteType(item) {
      this.cancelEdit();
      this.selected = item;
      this.$swal.fire({
        title: 'Are you sure to delete this type?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm'
      }).then((result) => {
        if (result.isConfirmed) {
          this.performDelete();
        }
      });
    },
    performDelete() {
      this.$store.commit('app/setLoading', true);
      this.$store.dispatch('types/delete', this.selected, {root: true})
          .then(() => {
            this.$store.commit('app/setLoading', false);
          });
    },
    cancelEdit() {
      this.isEdit = false;
      this.type.name = '';
      this.editField = '';
      this.$v.type.$reset();
    },
  }
}
</script>

<style scoped>

</style>