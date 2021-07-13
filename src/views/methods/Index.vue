<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="7"><h3 :class="['mb-0']">{{ this.$tc('views.methods.title') }}</h3></CCol>
            <CCol md="5">
              <CButton v-c-tooltip="{content: this.$tc('buttons.crud.create')}"
                       @click="() => {this.isCreate = true; this.cancelEdit();}" :class="['ml-auto', 'float-md-right']"
                       color="success">
                <CIcon name="cil-plus"></CIcon>
              </CButton>
              <CForm @submit.prevent="createMethod">
                <CModal
                    :close-on-backdrop="false"
                    color="primary"
                    :title="this.$tc('views.methods.create.title')"
                    :show.sync="isCreate"
                >
                  <CInput
                      v-model.trim="method.Name"
                      :label="this.$tc('views.methods.table.name')"
                      horizontal
                      :is-valid="this.$v.method.Name.$dirty ? !this.$v.method.Name.$error : null"
                      :invalid-feedback="!v.method.Name.required ? tc('validations.required') : tc('validations.max_length').replace(':value', 255)"
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
          <CDataTable
              :sorterValue="sortBy"
              responsive
              :tableFilter="{ label: tc('table_tool.filter.title'), placeholder: tc('table_tool.filter.placeholder')}"
              :itemsPerPageSelect="{ label: tc('table_tool.items_per_page.title')}"
              items-per-page-select
              sorter
              hover
              striped
              :items="methods"
              :fields="fields"
              :items-per-page="10"
              clickable-rows
              :active-page="1"
              :pagination="{ doubleArrows: false, align: 'center'}"
              @update:sorter-value="(e) => this.sortBy = e"
          >
            <template #Name="{item}">
              <td :class="'inline-edit-wrap'">
                <label v-text="item.Name" v-show="item.ID !== selected.ID || !isEdit"></label>
                <CInput
                    type="text"
                    v-model="method.Name"
                    v-if="item.ID === selected.ID && isEdit"
                    :is-valid="v.method.Name.$dirty ? !v.method.Name.$error : null"
                    :invalid-feedback="!v.method.Name.required ? tc('validations.required') : tc('validations.max_length').replace(':value', 255)"
                    @keyup="updateMethod"
                />
                <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary" :class="'inline-edit-button'"
                         @click="() => editMethod(item)"
                         v-show="!(selected.ID === item.ID && isEdit)">
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #action="{item}">
              <td>
                <CButton
                    v-c-tooltip="{content: tc('buttons.crud.delete')}"
                    size="sm"
                    color="danger"
                    @click="deleteMethod(item)"
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
import {required, maxLength} from 'vuelidate/lib/validators'

export default {
  data() {
    return {
      sortBy: {
        column: 'ID',
        asc: false,
      },
      method: {
        Name: '',
      },
      selected: {},
      isEdit: false,
      isCreate: false,
      isLoading: false,
      editField: '',
    };
  },
  validations: {
    method: {
      Name: {
        required,
        maxLength: maxLength(255),
      },
    },
  },
  created() {
    this.$store.dispatch('methods/getList');
  },
  computed: {
    fields() {
      return [
        {key: 'ID', label: this.$tc('views.methods.table.id'), _style: "width: 20%;"},
        {key: 'action', label: this.$tc('views.methods.table.action'), _style: "width: 20%;"},
        {key: 'Name', label: this.$tc('views.methods.table.name'), _style: "width: 60%;"},
      ];
    },
    tc() {
      return this.$tc;
    },
    v() {
      return this.$v;
    },
    methods() {
      return this.$store.state.methods.methods;
    }
  },
  methods: {
    editMethod(item) {
      this.selected = item;
      this.isEdit = true;
      this.method.Name = item.Name;
    },
    updateMethod(e) {
      if (e.keyCode === 13) {
        this.$v.method.$touch();
        if (!this.$v.method.$invalid) {
          this.$store.commit('app/setLoading', true);
          this.$store.dispatch('methods/update', {ID: this.selected.ID, Name: this.method.Name}, {root: true})
              .then(status => {
                if (status) {
                  this.isEdit = false;
                  this.$v.method.$reset();
                  this.method = {
                    Name: '',
                  };
                }
                this.$store.commit('app/setLoading', false);
              });
        }
      } else if (e.keyCode === 27) {
        this.cancelEdit();
      }
    },
    createMethod() {
      this.$v.method.$touch();
      if (!this.$v.method.$invalid) {
        this.$store.commit('app/setLoading', true);
        this.$store.dispatch('methods/create', this.method, {root: true})
            .then(status => {
              if (status) {
                this.isCreate = false;
                this.$v.method.$reset();
                this.method = {
                  Name: '',
                };
              }
              this.$store.commit('app/setLoading', false);
            });
      }
    },
    async deleteMethod(item) {
      this.cancelEdit();
      this.selected = item;
      let result = await this.$swal.fire({
        title: this.$tc('alerts.methods.delete'),
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
      this.$store.dispatch('methods/delete', this.selected, {root: true})
          .then(() => this.$store.commit('app/setLoading', false));
    },
    cancelEdit() {
      this.isEdit = false;
      this.method = {
        Name: '',
      };
      this.editField = '';
      this.$v.method.$reset();
    }
  }
}
</script>

<style scoped>

</style>
