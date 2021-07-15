<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="7"><h3 :class="['mb-0']">{{ this.$tc('views.types.title') }}</h3></CCol>
            <CCol md="5">
              <CButton v-c-tooltip="tc('buttons.crud.create')" @click="() => {this.isCreate = true; this.cancelEdit();}" :class="['ml-auto', 'float-md-right']"
                       color="success">
                <CIcon name="cil-plus"></CIcon>
              </CButton>
              <CForm @submit.prevent="createType">
                <CModal
                    :close-on-backdrop="false"
                    color="primary"
                    :title="tc('views.types.create_type.title')"
                    :show.sync="isCreate"
                >
                  <CInput
                      v-model.trim="type.Name"
                      :label="tc('views.types.create_type.name')"
                      horizontal
                      :is-valid="this.$v.type.Name.$dirty ? !this.$v.type.Name.$error : null"
                      :invalid-feedback="!this.$v.type.Name.required ? tc('validations.required') : tc('validations.max_length').replace(':value', 255)"
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
          <CCustomDataTable
              :sorterValue="sortBy"
              responsive
              :tableFilter="{ label: tc('table_tool.filter.title'), placeholder: tc('table_tool.filter.placeholder')}"
              :itemsPerPageSelect="{ label: tc('table_tool.items_per_page.title')}"
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
              :no-items-view="{ noResults: tc('table_tool.no_results'), noItems: tc('table_tool.no_items') }"
          >
            <template #Name="{item}">
              <td :class="'inline-edit-wrap'">
                <label v-text="item.Name" v-show="item.ID !== selected.ID || !isEdit"></label>
                <CInput
                    type="text"
                    v-model="type.Name"
                    v-show="item.ID === selected.ID && isEdit"
                    :is-valid="v.type.Name.$dirty ? !v.type.Name.$error : null"
                    :invalid-feedback="!v.type.Name.required ? tc('validations.required') : tc('validations.max_length').replace(':value', 255)"
                    @keyup="updateType"
                />
                <CButton v-c-tooltip="'Edit'" size="sm" color="secondary" :class="'inline-edit-button'"
                         @click="() => editType(item)"
                         v-show="!(selected.ID === item.ID && isEdit)">
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
          </CCustomDataTable>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import {required, maxLength} from 'vuelidate/lib/validators';
import CCustomDataTable from "@/views/custom/CCustomDataTable";

export default {
  components: {
    CCustomDataTable,
  },
  data() {
    return {
      sortBy: {
        column: 'ID',
        asc: false,
      },
      type: {
        Name: '',
      },
      selected: {},
      isEdit: false,
      isCreate: false,
      isLoading: false,
    };
  },
  validations: {
    type: {
      Name: {
        required,
        maxLength: maxLength(255),
      },
    },
  },
  created() {
    this.$store.dispatch('types/getList');
  },
  computed: {
    fields() {
      return [
        {key: 'ID', label: this.$tc('views.types.table.id'), _style: "width: 20%;"},
        {key: 'action', label: this.$tc('views.types.table.action'), _style: "width: 20%;"},
        {key: 'Name', label: this.$tc('views.types.table.name'), _style: "width: 60%;"},
      ];
    },
    tc() {
      return this.$tc;
    },
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
      this.type.Name = item.Name;
    },
    updateType(e) {
      if(e.keyCode === 13) {
        this.$v.type.$touch();
        if (!this.$v.type.$invalid) {
          this.$store.commit('app/setLoading', true);
          this.$store.dispatch('types/update', {ID: this.selected.ID, Name: this.type.Name}, {root: true})
              .then(status => {
                if (status) {
                  this.isEdit = false;
                  this.type = {
                    Name: '',
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
                  Name: '',
                };
                this.$v.type.$reset();
              }
              this.$store.commit('app/setLoading', false);
            });
      }
    },
    async deleteType(item) {
      this.cancelEdit();
      this.selected = item;
      let result = await this.$swal.fire({
        title: this.$tc('alerts.types.delete'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.$tc('buttons.crud.confirm'),
        cancelButtonText: this.$tc('buttons.crud.cancel'),
      }).then((result) => {
        return result.isConfirmed;
      });

      if(result) {
        this.performDelete();
      }
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
      this.type.Name = '';
      this.editField = '';
      this.$v.type.$reset();
    },
  }
}
</script>

<style scoped>

</style>
