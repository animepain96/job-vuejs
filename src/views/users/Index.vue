<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="7"><h3 :class="['mb-0']">Users Management</h3></CCol>
            <CCol md="5">
              <CButton v-c-tooltip="'Create New'" @click="isCreate = true" :class="['ml-auto', 'float-md-right']" color="success">
                <CIcon name="cil-plus"></CIcon>
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CDataTable
              :sorterValue="sortBy"
              :tableFilter="{ placeholder: 'Search...'}"
              items-per-page-select
              sorter
              hover
              striped
              :items="users"
              :fields="fields"
              :items-per-page="10"
              clickable-rows
              :active-page="1"
              :pagination="{ doubleArrows: false, align: 'center'}"
              @update:sorter-value="(e) => this.sortBy = e"
          >
            <template #action="{item}">
              <td>
                <CButtonGroup>
                  <CButton @click="resetPassword(item)" v-c-tooltip="'Reset Password'" color="primary" size="sm"
                           v-if="item.id !== 1">
                    <CIcon name="cil-lock-locked"/>
                  </CButton>
                  <CButton @click="deleteUser(item)" v-c-tooltip="'Delete'" color="danger" size="sm"
                           v-if="item.id !== 1">
                    <CIcon name="cil-trash"/>
                  </CButton>
                </CButtonGroup>
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
                    v-if="isEdit && selected.id === item.id && editField === 'name'"
                    :custom="true"
                    v-model="user.name"
                    @keyup="updateUser"
                />
                <CButton v-c-tooltip="'Edit'" size="sm" color="secondary" :class="'inline-edit-button'"
                         @click="() => editUser(item, 'name')"
                         v-show="!(selected.id === item.id && isEdit && editField === 'name')">
                  <CIcon name="cil-pen" size="custom-size" :class="'inline-edit-icon'"/>
                </CButton>
              </td>
            </template>
            <template #email="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="item.email"></span>
              </td>
            </template>
            <template #role="{item}">
              <td :class="'inline-edit-wrap'">
                <CBadge v-show="!(isEdit && selected.id === item.id && editField === 'role')"
                        v-if="item.role === 'user'" color="primary" v-text="'User'"/>
                <CBadge v-show="!(isEdit && selected.id === item.id && editField === 'role')"
                        v-if="item.role === 'admin'" color="danger" v-text="'Admin'"/>
                <CSelect
                    v-if="isEdit && selected.id === item.id && editField === 'role'"
                    :custom="true"
                    :options="roles"
                    :value.sync="user.role"
                    @change="(e) => updateUser(e, true)"
                />
                <CButton v-c-tooltip="'Edit'" size="sm" color="secondary" :class="'inline-edit-button'"
                         @click="() => editUser(item, 'role')"
                         v-show="!(selected.id === item.id && isEdit && editField === 'role')">
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
        </CCardBody>
      </CCard>
    </CCol>
    <CreateUserModal title="Create Customer" :showModal="isCreate" @update:show="(value) => this.isCreate = value"/>
  </CRow>
</template>

<script>
import CreateUserModal from "@/views/users/CreateUserModal";
import {required, maxLength} from "vuelidate/lib/validators";

export default {
  components: {
    CreateUserModal,
  },
  data() {
    return {
      fields: [
        {key: 'id', name: 'ID', _style: "width: 10%;"},
        {key: 'action', name: 'Action', _style: "width: 12.5%;"},
        {key: 'name', name: 'Name', _style: "width: 25%;"},
        {key: 'email', name: 'Email', _style: "width: 25%;"},
        {key: 'role', name: 'Role', _style: "width: 20%;"},
        {key: 'active', name: 'Active', _style: "width: 12.5%;"},
      ],
      sortBy: {
        column: 'id',
        asc: false,
      },
      isCreate: false,
      roles: [
        {value: 'user', label: 'User'},
        {value: 'admin', label: 'Admin'},
      ],
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
    },
  },
  created() {
    this.$store.dispatch('users/getUsers');
  },
  computed: {
    users() {
      return this.$store.state.users.users;
    },
  },
  methods: {
    updateUser(e, onChangeUpdate = false) {
      if (!onChangeUpdate) {
        this.$v.user[this.editField].$touch();
      }
      if (onChangeUpdate || !this.$v.user[this.editField].$invalid) {
        if (e.keyCode === 13 || onChangeUpdate) {
          this.$store.commit('app/setLoading', true);
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
            if (status) {
              this.cancelEdit();
            } else {
              this.cancelEdit();
              e.target.checked = !e.target.checked;
            }
            this.$store.commit('app/setLoading', false);
          });
        } else if (e.keyCode === 27) {
          this.cancelEdit();
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
    resetPassword(item) {
      this.$swal.fire({
        title: 'Are you sure to reset password this user?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm'
      }).then((result) => {
        if (result.isConfirmed) {
          this.$store.commit('app/setLoading', true);
          this.$store.dispatch('users/resetPassword', item, {root: true})
              .then(() => this.$store.commit('app/setLoading', false));
        }
      });
    },
    deleteUser(item) {
      this.cancelEdit();
      this.$swal.fire({
        title: 'Are you sure to delete this user?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm'
      }).then((result) => {
        if (result.isConfirmed) {
          this.performDelete(item);
        }
      });
    },
    performDelete(item) {
      this.$store.commit('app/setLoading', true);
      this.$store.dispatch('users/deleteUser', item, {root: true})
          .then(() => this.$store.commit('app/setLoading', false));
    },
  }
}
</script>

<style scoped>
table th, table tr, table td {
  vertical-align: middle;
}
</style>