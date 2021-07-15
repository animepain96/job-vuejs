<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow :class="['align-items-center']">
            <CCol md="7"><h3 :class="['mb-0']">{{ tc('views.backups.title') }}</h3></CCol>
            <CCol md="5">
              <CButton v-c-tooltip="{content: tc('buttons.crud.manual_backup')}" @click="manualHandler"
                       :class="['ml-auto', 'float-md-right']"
                       color="success">
                <CIcon name="cil-plus"></CIcon>
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol md="12" class="mb-2" v-if="currentUser.id !== 1">
              <span v-text="tc('views.backups.keep_days')" class="font-weight-bold"/>: <span
                class="font-weight-bold text-danger" v-text="keepDays"/>
            </CCol>
            <CCol md="3" v-if="currentUser.id === 1">
              <CInput
                  v-model="keepDays"
                  :label="tc('views.backups.keep_days')"
                  addLabelClasses="font-weight-bold"
                  :is-valid="this.$v.keepDays.$dirty ? !this.$v.keepDays.$error : null"
                  :invalid-feedback="!this.$v.keepDays.required ? tc('validations.required') : tc('validations.numeric')"
              >
                <template #append>
                  <CButton @click="updateKeepDays" color="primary" v-text="tc('buttons.crud.save')"/>
                </template>
              </CInput>
            </CCol>
          </CRow>
          <CDataTable
              :sorter-value="sortBy"
              responsive
              :tableFilter="{ label: tc('table_tool.filter.title'), placeholder: tc('table_tool.filter.placeholder')}"
              :itemsPerPageSelect="{ label: tc('table_tool.items_per_page.title')}"
              items-per-page-select
              sorter
              hover
              striped
              :items="backups"
              :fields="fieldItems"
              :items-per-page="10"
              clickable-rows
              :active-page="1"
              :pagination="{ doubleArrows: false, align: 'center'}"
              @update:sorter-value="(e) => this.sortBy = e"
          >
            <template v-if="currentUser.id === 1" #checkbox-header>
              <CInputCheckbox :checked.sync="checkedAll" :custom="true"
                              @update:checked="allCheckedHandler"/>
            </template>
            <template v-if="currentUser.id === 1" #checkbox="{item}">
              <td>
                <CInputCheckbox :custom="true" :checked.sync="item._checked"
                                @update:checked="(e) => itemCheckedHandler(e, item.id)"/>
              </td>
            </template>
            <template #name="{item}">
              <td>
                <span class="font-weight-bold text-primary" v-text="item.name"/>
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
                <CBadge v-if="item.type === 'manual'" color="primary" v-text="tc('views.backups.types.manual')"/>
                <CBadge v-if="item.type === 'auto'" color="success" v-text="tc('views.backups.types.auto')"/>
              </td>
            </template>
            <template #action="{item}">
              <td>
                <CButtonGroup>
                  <CButton @click="downloadFile(item.name)" v-c-tooltip="{content: tc('buttons.crud.download')}"
                           color="primary"
                           size="sm">
                    <CIcon name="cil-cloud-download"/>
                  </CButton>
                  <CButton v-if="currentUser.id === 1" @click="deleteItem(item.name)"
                           v-c-tooltip="{content: tc('buttons.crud.delete')}" color="danger" size="sm">
                    <CIcon name="cil-trash"/>
                  </CButton>
                </CButtonGroup>
              </td>
            </template>
          </CDataTable>
          <CButton v-if="multipleDelete && currentUser.id === 1" @click="deleteSelectedItems" class="delete-selected"
                   color="danger" size="lg">
            <CIcon name="cil-trash"/>
            {{ tc('buttons.crud.delete_items') }}
          </CButton>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import {required, integer, minValue} from 'vuelidate/lib/validators';

export default {
  data() {
    return {
      sortBy: {
        column: 'modified',
        asc: false,
      },
      multipleDelete: false,
      checkedAll: false,
      keepDays: 0,
    };
  },
  validations: {
    keepDays: {
      required,
      integer,
      minValue: minValue(1),
    },
  },
  created() {
    this.$store.dispatch('backups/getBackups');
    this.$store.dispatch('app/getKeepDays')
        .then(() => {
          this.keepDays = this.$store.state.app.keepDays;
        });
  },
  computed: {
    fields() {
      return [
        {key: 'checkbox', _style: 'width: 5%;'},
        {key: 'name', label: this.$tc('views.backups.table.name'), _style: 'width: 25%;'},
        {key: 'action', label: this.$tc('views.backups.table.action'), _style: 'width: 15%;'},
        {key: 'type', label: this.$tc('views.backups.table.type'), _style: 'width: 15%;'},
        {key: 'modified', label: this.$tc('views.backups.table.modified'), _style: 'width: 20%;'},
        {key: 'size', label: this.$tc('views.backups.table.size'), _style: 'width: 10%;'},
      ];
    },
    tc() {
      return this.$tc;
    },
    fieldItems() {
      return this.fields.filter(item => {
        return !(this.currentUser.id !== 1 && item.key === 'checkbox');

      });
    },
    currentUser() {
      return this.$store.state.auth.user;
    },
    backups() {
      return this.$store.state.backups.backups.map((backup, key) => {
        backup.id = key;
        return backup;
      });
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
      this.multipleDelete = checked;

      this.backups.forEach(item => {
        this.$set(this.backups[item.id], '_checked', checked);
      });
    },
    itemCheckedHandler(checked, id) {
      this.$set(this.backups[this.backups.findIndex(item => item.id === id)], '_checked', checked);
      this.checkedAll = !this.backups.some(backup => !backup._checked);
      this.multipleDelete = this.backups.some(backup => backup._checked);
    },
    deleteSelectedItems() {
      let items = this.backups.filter(backup => backup._checked === true)
          .map(backup => {
            return backup.name;
          });

      if (items.length) {
        this.$swal.fire({
          title: this.$tc('alerts.backups.multi_delete'),
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: this.$tc('buttons.crud.confirm'),
          cancelButtonText: this.$tc('buttons.crud.cancel')
        }).then((result) => {
          if (result.isConfirmed) {
            this.performDelete(items);
          }
        })
      }
    },
    async deleteItem(name) {
      if (name) {
        let result = await this.$swal.fire({
          title: this.$tc('alerts.backups.delete'),
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: this.$tc('buttons.crud.confirm'),
          cancelButtonText: this.$tc('buttons.crud.cancel')
        }).then(result => {
          return result.isConfirmed;
        });

        if (result) {
          this.performDelete(new Array(name));
        }
      }
    },
    performDelete(items) {
      this.$store.commit('app/setLoading', true);
      this.$store.dispatch('backups/deleteBackup', {name: items}, {root: true})
          .then(status => {
                if (status) {
                  this.multipleDelete = false
                }
              }
          ).finally(() => this.$store.commit('app/setLoading', false));
    },
    downloadFile(name) {
      this.$store.commit('app/setLoading', true);
      this.$store.dispatch('backups/downloadBackup', {name: name}, {root: true})
          .then(() => this.$store.commit('app/setLoading', false));
    },
    updateKeepDays() {
      this.$v.keepDays.$touch();
      if (!this.$v.keepDays.$invalid) {
        this.$store.commit('app/setLoading', true);
        this.$store.dispatch('app/updateKeepDays', {value: this.keepDays}, {root: true})
            .then(() => {
              this.$store.commit('app/setLoading', false);
            });
      }
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
