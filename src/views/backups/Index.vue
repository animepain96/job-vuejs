<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="7"><h3 :class="['mb-0']">Backups</h3></CCol>
            <CCol md="5">
              <CButton v-c-tooltip="'Manual Backup'" @click="manualHandler" :class="['ml-auto', 'float-md-right']"
                       color="success">
                <CIcon name="cil-plus"></CIcon>
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CDataTable
              :sorter-value="sortBy"
              :responsive="false"
              :tableFilter="{ placeholder: 'Search...'}"
              items-per-page-select
              sorter
              hover
              striped
              :items="backups"
              :fields="fields"
              :items-per-page="10"
              clickable-rows
              :active-page="1"
              :pagination="{ doubleArrows: false, align: 'center'}"
              @update:sorter-value="(e) => this.sortBy = e"
          >
            <template #checkbox-header="{item}">
              <CInputCheckbox :checked="checkedAll" :custom="true" @click="(e) => allCheckedHandler(e.target.checked)"/>
            </template>
            <template #checkbox="{item}">
              <td>
                <CInputCheckbox :custom="true" :checked.sync="item.checked > 0"
                                @click="(e) => itemCheckedHandler(e.target.checked)"/>
              </td>
            </template>
            <template #name="{item}">
              <td>
                <CLink class="font-weight-bold" v-text="item.name"/>
              </td>
            </template>
            <template #size="{item}">
              <td>
                <div v-text="item.size + ' KB'"/>
              </td>
            </template>
            <template #modified="{item}">
              <td>
                <div v-text="item.modified"/>
              </td>
            </template>
            <template #type="{item}">
              <td>
                <CBadge v-if="item.type === 'manual'" color="primary" v-text="'Manual'"/>
                <CBadge v-if="item.type === 'auto'" color="success" v-text="'Auto'"/>
              </td>
            </template>
            <template #action="{item}">
              <td>
                <CButtonGroup>
                  <CButton v-c-tooltip="'Download'" color="primary" size="sm">
                    <CIcon name="cil-cloud-download"/>
                  </CButton>
                  <CButton v-c-tooltip="'Delete'" color="danger" size="sm">
                    <CIcon name="cil-trash"/>
                  </CButton>
                </CButtonGroup>
              </td>
            </template>
          </CDataTable>
          <CButton v-if="multipleDelete" @click="deleteSelectedItems" class="delete-selected" color="danger" size="lg">
            <CIcon name="cil-trash"/>
            Delete Selected Items
          </CButton>
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
        {key: 'checkbox', name: 'Select', _style: 'width: 5%;'},
        {key: 'name', name: 'Name', _style: 'width: 25%;'},
        {key: 'action', name: 'Action', _style: 'width: 15%;'},
        {key: 'type', name: 'Type', _style: 'width: 15%;'},
        {key: 'modified', name: 'Modified', _style: 'width: 20%;'},
        {key: 'size', name: 'Size', _style: 'width: 10%;'},
      ],
      sortBy: {
        column: 'modified',
        asc: false,
      },
      multipleDelete: false,
      checkedAll: false,
    };
  },
  created() {
    this.$store.dispatch('backups/getBackups');
  },
  computed: {
    backups: {
      get() {
        return this.$store.state.backups.backups;
      },
      set(value) {
        this.$store.commit('backups/setBackups', value);
      },
    },
  },
  methods: {
    manualHandler() {
      this.$store.commit('app/setLoading', true);
      this.$store.dispatch('backups/manualBackup').finally(() => {
        this.$store.commit('app/setLoading', false);
      })
    },
    allCheckedHandler(checked) {
      this.backups = this.backups.map((backup) => {
        backup.checked = checked;
        return backup;
      });

      this.checkedAll = checked;
    },
    itemCheckedHandler(checked) {
      if (!checked) {
        this.checkedAll = false;
      } else {
        this.multipleDelete = true;
        for (let i = 0; i < this.backups.length; i++) {
          if (!this.backups[i].checked) {
            this.checkedAll = false;
            break;
          }

          if (i === this.backups.length - 1) {
            this.checkedAll = true;
            this.allCheckedHandler(this.checkedAll);
          }
        }
      }
    },
    deleteSelectedItems() {
      let items = this.backups.filter(backup => backup.checked === true)
          .map(backup => {
            return backup.name;
          });

      if (items.length) {
        this.$swal.fire({
          title: 'Are you sure to delete these backups file?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Confirm'
        }).then((result) => {
          if (result.isConfirmed) {
            this.performDelete(items);
          }
        })
      }
    },
    performDelete(items) {
      this.$store.commit('app/setLoading', true);
      this.$store.dispatch('backups/deleteBackup', {name: items}, {root: true})
          .then(() => this.$store.commit('app/setLoading', false));
    },
  },
  watch: {
    backups: function (newValue) {
      if (newValue && newValue.length) {
        for (let i = 0; i < newValue.length; i++) {
          if (newValue[i].checked) {
            this.multipleDelete = true;
            break;
          }

          if (i === newValue.length - 1) {
            this.multipleDelete = false;
          }
        }
      }

      this.backups = newValue;
    },
  },
}
</script>

<style scoped>
table tr, table td, table th {
  vertical-align: middle;
}

.delete-selected {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
}
</style>