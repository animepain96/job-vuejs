<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="7"><h3 :class="['mb-0']">{{ tc('views.users.title') }}</h3></CCol>
            <CCol md="5">
              <CButton v-c-tooltip="{content: tc('buttons.crud.create')}" @click="isCreate = true"
                       :class="['ml-auto', 'float-md-right']"
                       color="success">
                <CIcon name="cil-plus"></CIcon>
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CDataTable
              :loading="this.$store.state.users.loading"
              responsive
              :sorterValue="sortBy"
              :tableFilter="{external: true, label: tc('table_tool.filter.title'), placeholder: tc('table_tool.filter.placeholder')}"
              :itemsPerPageSelect="{external: true, label: tc('table_tool.items_per_page.title')}"
              :sorter="{external: true}"
              hover
              striped
              :items="users"
              :fields="fields"
              clickable-rows
              :no-items-view="{ noResults: tc('table_tool.no_results'), noItems: tc('table_tool.no_items') }"
              @update:sorter-value="handleSortChange"
              @pagination-change="handlePaginationChange"
              @update:table-filter-value="handleFilterChange"
          >
            <template #action="{item}">
              <td>
                <CButtonGroup v-if="item.id !== 1 && currentUser.id === 1">
                  <CButton @click="resetPassword(item)" v-c-tooltip="{content: tc('buttons.crud.reset_password')}"
                           color="primary" size="sm">
                    <CIcon name="cil-lock-locked"/>
                  </CButton>
                  <CButton @click="deleteUser(item)" v-c-tooltip="{content: tc('buttons.crud.delete')}" color="danger"
                           size="sm">
                    <CIcon name="cil-trash"/>
                  </CButton>
                </CButtonGroup>
                <CBadge color="secondary" v-text="tc('views.users.unavailable')"
                        v-if="!(item.id !== 1 && currentUser.id === 1)"/>
              </td>
            </template>
            <template #id="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="item.id"></span>
              </td>
            </template>
            <template #name="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-show="!(isEdit && selected.id === item.id && editField === 'name')" v-text="item.name"></span>
                <CInput
                    v-if="isEdit && selected.id === item.id && editField === 'name' && item.id !== 1"
                    :custom="true"
                    v-model="user.name"
                    @keyup="updateUser"
                    :is-valid="v.user.name.$dirty ? !v.user.name.$error : null"
                    :invalid-feedback="!v.user.name.required ? tc('validations.required') : tc('validations.max_length').replace(':value', 255)"
                />
                <CButton
                    v-c-tooltip="{content: tc('buttons.crud.edit')}"
                    size="sm"
                    color="secondary"
                    :class="'inline-edit-button'"
                    @click="() => editUser(item, 'name')"
                    v-if="item.id !== 1"
                    v-show="!(selected.id === item.id && isEdit && editField === 'name') && item.id !== 1"
                >
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #email="{item}">
              <td>
                <span v-text="item.email"></span>
              </td>
            </template>
            <template #role="{item}">
              <td :class="'inline-edit-wrap'">
                <CBadge v-show="!(isEdit && selected.id === item.id && editField === 'role')"
                        v-if="item.role === 'user'" color="primary" v-text="tc('views.users.roles.user')"/>
                <CBadge v-show="!(isEdit && selected.id === item.id && editField === 'role')"
                        v-if="item.role === 'admin'" color="danger"
                        v-text="item.id === 1 ? tc('views.users.roles.super_admin') : tc('views.users.roles.admin')"/>
                <CSelect
                    :disabled="item.id === 1"
                    v-if="isEdit && selected.id === item.id && editField === 'role'"
                    :custom="true"
                    :options="roles"
                    :value.sync="user.role"
                    @change="(e) => updateUser(e, true)"
                    :is-valid="v.user.role.$dirty ? !v.user.role.$error : null"
                    :invalid-feedback="!v.user.role.required ? 'This field is required.' : 'This field is invalid format.'"
                />
                <CButton v-c-tooltip="{content: tc('buttons.crud.edit')}" size="sm" color="secondary"
                         :class="'inline-edit-button'"
                         @click="() => editUser(item, 'role')"
                         v-if="item.id !== 1 && currentUser.id === 1"
                         v-show="!(selected.id === item.id && isEdit && editField === 'role' && item.id !== 1)">
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #active="{item}">
              <td :class="'inline-edit-wrap'">
                <CInputCheckbox
                    :checked="item.active > 0"
                    :custom="true"
                    :disabled="item.id === 1"
                    @change="(e) => {editUser(item, 'active'); updateUser(e, true);}"
                />
              </td>
            </template>
          </CDataTable>
          <CPagination
              :class="{'disabled': this.$store.state.users.loading}"
              v-show="totalPages > 1"
              :activePage.sync="page"
              :pages="totalPages"
              @update:activePage="handlePageChange"
              align="center"
          />
        </CCardBody>
      </CCard>
    </CCol>
    <CreateUserModal :showModal="isCreate" @update:show="(value) => this.isCreate = value"/>
  </CRow>
</template>

<script>
import CreateUserModal from "@/views/users/CreateUserModal";
import {required, maxLength} from "vuelidate/lib/validators";
import {debounce} from "debounce";
import {confirmAlert} from "../../helpers/alert";

export default {
  components: {
    CreateUserModal,
  },
  data() {
    return {
      sortBy: {
        column: 'id',
        asc: false,
      },
      isCreate: false,
      user: {
        name: '',
        role: '',
      },
      isEdit: false,
      editField: '',
      selected: {},
    };
  },
  validations: {
    user: {
      name: {
        required,
        maxLength: maxLength(255),
      },
      role: {
        required,
      },
      active: {}
    },
  },
  created() {
    this.$store.commit('users/updateQuery', {per_page: 10, page: 1, order: null, sort_by: null, q: null});
    this.$store.dispatch('users/getList', this.$store.state.users.query);
    this.$store.watch(() => this.$store.state.users.query, () => {
          if (!this.$store.state.users.loading) {
            this.$store.dispatch('users/getList', this.$store.state.users.query);
          }
        },
        {
          deep: true
        });
  },
  computed: {
    page: {
      get: function () {
        return this.$store.state.users.query.page;
      },
      set: function (value) {
        this.$store.commit('users/updateQuery', {page: value});
      }
    },
    totalPages() {
      return this.$store.state.users.total_page;
    },
    roles() {
      return [
        {value: 'user', label: this.$tc('views.users.roles.user')},
        {value: 'admin', label: this.$tc('views.users.roles.admin')},
      ];
    },
    fields() {
      return [
        {key: 'id', label: this.$tc('views.users.table.id'), _style: "width: 5%;"},
        {key: 'action', label: this.$tc('views.users.table.action'), _style: "width: 10%;"},
        {key: 'name', label: this.$tc('views.users.table.name'), _style: "width: 20%;"},
        {key: 'username', label: this.$tc('views.users.table.username'), _style: "width: 10%;"},
        {key: 'email', label: this.$tc('views.users.table.email'), _style: "width: 20%;"},
        {key: 'role', label: this.$tc('views.users.table.role'), _style: "width: 15%;"},
        {key: 'active', label: this.$tc('views.users.table.active'), _style: "width: 10%;"},
      ];
    },
    tc() {
      return this.$tc;
    },
    v() {
      return this.$v;
    },
    users() {
      return this.$store.state.users.users;
    },
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    handlePageChange(page) {
      if (!isNaN(page) && this.page !== page) {
        this.$store.commit('users/updateQuery', {page: page});
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

      this.$store.commit('users/updateQuery', {order: order});
    },
    handleFilterChange: debounce(function (value) {
      if (value !== this.$store.state.users.query.q) {
        this.$store.commit('users/updateQuery', {q: value});
      }
    }, 300),
    handlePaginationChange(value) {
      if (!isNaN(value)) {
        this.$store.commit('users/updateQuery', {per_page: value});
      }
    },
    updateUser(e, onChangeUpdate = false) {
      if (e.keyCode === 27) {
        this.cancelEdit();
      } else {
        this.$v.user[this.editField].$touch();
        if (onChangeUpdate || !this.$v.user[this.editField].$invalid) {
          if (e.keyCode === 13 || onChangeUpdate) {
            var payload = {
              id: this.selected.id,
              data: {
                field: this.editField,
                value: this.user[this.editField],
              }
            };
            if (this.editField === 'active') {
              payload.data.value = e.target.checked;
            }

            this.$store.dispatch('users/updateUser',
                payload,
            ).then(status => {
              if (!status) {
                e.target.checked = !e.target.checked;
              } else {
                this.$store.dispatch('users/getList', this.$store.state.users.query);
              }
              this.cancelEdit();
            });
          } else if (e.keyCode === 27) {
            this.cancelEdit();
          }
        }
      }
    },
    cancelEdit() {
      this.editField = '';
      this.isEdit = false;
      this.user = {
        name: '',
        role: '',
      };
    },
    editUser(item, field) {
      this.selected = item;
      this.editField = field;
      this.isEdit = true;
      this.user[field] = item[field];
    },
    async resetPassword(item) {
      let result = await confirmAlert(this.$tc('alerts.users.password'), this.$tc('buttons.crud.confirm'), this.$tc('buttons.crud.cancel'), 'warning')
          .then((result) => {
            return result.isConfirmed;
          });

      if (result) {
        this.$store.dispatch('users/resetPassword', item, {root: true})
            .then(() => this.$store.dispatch('users/getList', this.$store.state.users.query));
      }
    },
    async deleteUser(item) {
      this.cancelEdit();
      this.selected = item;
      let result = await confirmAlert(this.$tc('alerts.users.delete'), this.$tc('buttons.crud.confirm'), this.$tc('buttons.crud.cancel'), 'warning').then(result => {
        return result.isConfirmed;
      });

      if (result) {
        this.performDelete();
      }
    },
    performDelete() {
      this.$store.dispatch('users/deleteUser', this.selected, {root: true})
          .then(() => this.$store.dispatch('users/getList', this.$store.state.users.query));
    },
  }
}
</script>

<style scoped>
table th, table tr, table td {
  vertical-align: middle;
}
</style>
