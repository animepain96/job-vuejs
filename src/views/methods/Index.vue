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
              :loading="this.$store.state.methods.loading"
              responsive
              :tableFilter="{external: true, label: tc('table_tool.filter.title'), placeholder: tc('table_tool.filter.placeholder')}"
              :itemsPerPageSelect="{external: true, label: tc('table_tool.items_per_page.title')}"
              :sorter="{external: true}"
              hover
              striped
              :items="methods"
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
                    v-model="method.Name"
                    v-if="item.ID === selected.ID && isEdit"
                    :is-valid="v.method.Name.$dirty ? !v.method.Name.$error : null"
                    :invalid-feedback="!v.method.Name.required ? tc('validations.required') : tc('validations.max_length').replace(':value', 255)"
                    @keyup="updateMethod"
                />
                <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                         :class="'inline-edit-button'"
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
          <CPagination
              :class="{'disabled': this.$store.state.methods.loading}"
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
    this.$store.commit('methods/updateQuery', {per_page: 10, page: 1, order: null, sort_by: null, q: null});
    this.$store.dispatch('methods/getList', this.$store.state.methods.query);
    this.$store.watch(() => this.$store.state.methods.query, () => {
          this.$store.dispatch('methods/getList', this.$store.state.methods.query);
        },
        {
          deep: true
        });
  },
  computed: {
    page: {
      get: function () {
        return this.$store.state.methods.query.page;
      },
      set: function (value) {
        this.$store.commit('methods/updateQuery', {page: value});
      }
    },
    totalPages() {
      return this.$store.state.methods.total_page;
    },
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
    handlePageChange(page) {
      if (!isNaN(page) && this.page !== page) {
        this.$store.commit('methods/updateQuery', {page: page});
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

      this.$store.commit('methods/updateQuery', {order: order});
    },
    handleFilterChange: debounce(function (value) {
      if (value !== this.$store.state.methods.query.q) {
        this.$store.commit('methods/updateQuery', {q: value});
      }
    }, 300),
    handlePaginationChange(value) {
      if (!isNaN(value)) {
        this.$store.commit('methods/updateQuery', {per_page: value});
      }
    },
    editMethod(item) {
      this.selected = item;
      this.isEdit = true;
      this.method.Name = item.Name;
    },
    updateMethod(e) {
      if (e.keyCode === 13) {
        this.$v.method.$touch();
        if (!this.$v.method.$invalid) {
          this.$store.dispatch('methods/update', {ID: this.selected.ID, Name: this.method.Name}, {root: true})
              .then(status => {
                if (status) {
                  this.isEdit = false;
                  this.$v.method.$reset();
                  this.method = {
                    Name: '',
                  };
                }
                this.$store.dispatch('methods/getList', this.$store.state.methods.query);
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
                this.$store.dispatch('methods/getList', this.$store.state.methods.query);
              }
              this.$store.commit('app/setLoading', false);
            });
      }
    },
    async deleteMethod(item) {
      this.cancelEdit();
      this.selected = item;
      let result = await confirmAlert(this.$tc('alerts.methods.delete'), this.$tc('buttons.crud.confirm'), this.$tc('buttons.crud.cancel'), 'warning').then((result) => {
        return result.isConfirmed;
      });

      if (result) {
        this.performDelete();
      }
    },
    performDelete() {
      this.$store.dispatch('methods/delete', this.selected, {root: true})
          .then(() => this.$store.dispatch('methods/getList', this.$store.state.methods.query));
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
