<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="7"><h3 :class="['mb-0']">Users Management</h3></CCol>
            <CCol md="5">
              <CButton @click="isCreate = true" :class="['ml-auto', 'float-md-right']" color="success">
                <CIcon name="cil-plus"></CIcon>
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CDataTable
              :sorterValue="{column: 'id', asc: false}"
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
          >
            <template #id="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="item.id"></span>
              </td>
            </template>
            <template #name="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="item.name"></span>
              </td>
            </template>
            <template #email="{item}">
              <td :class="'inline-edit-wrap'">
                <span v-text="item.email"></span>
              </td>
            </template>
            <template #active="{item}">
              <td :class="'inline-edit-wrap'">
                <CInputCheckbox :custom="true" :disabled="item.id === 1" />
              </td>
            </template>
            <template #action="{item}">
              <td>
                <CButton color="danger" size="sm" v-if="item.id !== 1">
                  <CIcon name="cil-trash" />
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

export default {
  data() {
    return {
      fields: [
        {key: 'id', name: 'ID', _style: "width: 10%;"},
        {key: 'name', name: 'Name', _style: "width: 25%;"},
        {key: 'email', name: 'Email', _style: "width: 25%;"},
        {key: 'active', name: 'Active', _style: "width: 25%;"},
        {key: 'action', name: 'Action', _style: "width: 15%;"},
      ],
    };
  },
  validations: {

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

  }
}
</script>

<style scoped>
  table th, table tr, table td {
    vertical-align: middle;
  }
</style>