<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="7"><h3 :class="['mb-0']">{{ this.$tc('views.types.title') }}</h3></CCol>
            <CCol md="5">
              <CButton v-c-tooltip="tc('buttons.crud.create')" @click="() => {this.isCreate = true; this.cancelEdit();}"
                       :class="['ml-auto', 'float-md-right']"
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
          <CDataTable
              :loading="this.$store.state.types.loading"
              responsive
              :tableFilter="{external: true, label: tc('table_tool.filter.title'), placeholder: tc('table_tool.filter.placeholder')}"
              :itemsPerPageSelect="{external: true, label: tc('table_tool.items_per_page.title')}"
              :sorter="{external: true}"
              hover
              striped
              :items="types"
              :fields="fields"
              clickable-rows
              :no-items-view="{ noResults: tc('table_tool.no_results'), noItems: tc('table_tool.no_items') }"
              @update:sorter-value="handleSortChange"
              @pagination-change="handlePaginationChange"
              @update:table-filter-value="handleFilterChange"
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
          </CDataTable>
          <CPagination
              :class="{'disabled': this.$store.state.types.loading}"
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
import {required, maxLength} from 'vuelidate/lib/validators';
import {debounce} from "debounce";
import {confirmAlert} from "../../helpers/alert";

export default {
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
    this.$store.commit('types/updateQuery', {per_page: 10, page: 1, order: null, sort_by: null, q: null});
    this.$store.dispatch('types/getList', this.$store.state.types.query);
    this.$store.watch(() => this.$store.state.types.query, () => {
          this.$store.dispatch('types/getList', this.$store.state.types.query);
        },
        {
          deep: true
        });
  },
  computed: {
    page: {
      get: function () {
        return this.$store.state.types.query.page;
      },
      set: function (value) {
        this.$store.commit('types/updateQuery', {page: value});
      }
    },
    totalPages() {
      return this.$store.state.types.total_page;
    },
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
    handlePageChange(page) {
      if (!isNaN(page) && this.page !== page) {
        this.$store.commit('types/updateQuery', {page: page});
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

      this.$store.commit('types/updateQuery', {order: order});
    },
    handleFilterChange: debounce(function (value) {
      if (value !== this.$store.state.types.query.q) {
        this.$store.commit('types/updateQuery', {q: value});
      }
    }, 300),
    handlePaginationChange(value) {
      if (!isNaN(value)) {
        this.$store.commit('types/updateQuery', {per_page: value});
      }
    },
    editType(item) {
      this.selected = item;
      this.isEdit = true;
      this.type.Name = item.Name;
    },
    updateType(e) {
      if (e.keyCode === 13) {
        this.$v.type.$touch();
        if (!this.$v.type.$invalid) {
          this.$store.dispatch('types/update', {ID: this.selected.ID, Name: this.type.Name}, {root: true})
              .then(status => {
                if (status) {
                  this.isEdit = false;
                  this.type = {
                    Name: '',
                  };
                  this.$v.type.$reset();
                  this.$store.dispatch('types/getList', this.$store.state.types.query);
                }
              });
        }
      } else if (e.keyCode === 27) {
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
                this.$store.dispatch('types/getList', this.$store.state.types.query);
              }
              this.$store.commit('app/setLoading', false);
            });
      }
    },
    async deleteType(item) {
      this.cancelEdit();
      this.selected = item;
      let result = await confirmAlert(this.$tc('alerts.types.delete'), this.$tc('buttons.crud.confirm'), this.$tc('buttons.crud.cancel'), 'warning').then((result) => {
        return result.isConfirmed;
      });

      if (result) {
        this.performDelete();
      }
    },
    performDelete() {
      this.$store.dispatch('types/delete', this.selected, {root: true})
          .then(() => this.$store.dispatch('types/getList', this.$store.state.types.query));
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
