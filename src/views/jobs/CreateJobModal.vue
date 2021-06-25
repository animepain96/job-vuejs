<template>
  <CForm @submit.prevent="handleForm">
    <CModal
        :title="title"
        color="primary"
        :show.sync="show"
        size="xl"
    >
      <CRow :class="'pl-3 pr-3'">
        <CCol xl="6">
          <CInput
              v-model.trim="job.name"
              :addLabelClasses="'font-weight-bold'"
              label="Name"
              :is-valid="this.$v.job.name.$dirty ? !this.$v.job.name.$error : null"
              invalid-feedback="This field is required."
          />
        </CCol>
        <CCol xl="6">
          <CSelect
              :value.sync="job.customer"
              :options="[{value: ' ', label: ' ', disabled: true}].concat(customers)"
              :addLabelClasses="'font-weight-bold'"
              label="Customer"
              :is-valid="this.$v.job.customer.$dirty ? !this.$v.job.customer.$error : null"
              invalid-feedback="This field is required."
          />
        </CCol>
        <CCol xl="6">
          <CSelect
              :value.sync="job.method"
              :options="[{value: ' ', label: ' ', disabled: true}].concat(methods)"
              :addLabelClasses="'font-weight-bold'"
              label="Method"
              :is-valid="this.$v.job.method.$dirty ? !this.$v.job.method.$error : null"
              invalid-feedback="This field is required."
          />
        </CCol>
        <CCol xl="6">
          <CSelect
              :value.sync="job.type"
              :options="[{value: ' ', label: ' ', disabled: true}].concat(types)"
              :addLabelClasses="'font-weight-bold'"
              label="Type"
              :is-valid="this.$v.job.type.$dirty ? !this.$v.job.type.$error : null"
              invalid-feedback="This field is required."
          />
        </CCol>
        <CCol xl="6">
          <div :class="'form-group'">
            <label :class="'font-weight-bold'" v-text="'Start Date'"/>
            <DatePicker :class="{'is-invalid': this.$v.job.start_date.$error && this.$v.job.start_date.$dirty}"
                        :input-class="{'is-invalid': this.$v.job.start_date.$error && this.$v.job.start_date.$dirty, 'form-control': true, 'is-valid': !this.$v.job.start_date.$error && this.$v.job.start_date.$dirty}"
                        v-model="job.start_date" type="date" format="DD-MM-YYYY"/>
            <div :class="'invalid-feedback'" v-if="this.$v.job.start_date.$error && this.$v.job.start_date.$dirty">This
              field is required.
            </div>
          </div>
        </CCol>
        <CCol xl="6">
          <div :class="'form-group'">
            <label :class="'font-weight-bold'" v-text="'Finish Date'"/>
            <DatePicker :class="{'is-invalid': this.$v.job.finish_date.$error && this.$v.job.finish_date.$dirty}"
                        :input-class="{'is-invalid': this.$v.job.finish_date.$error && this.$v.job.finish_date.$dirty, 'form-control': true, 'is-valid': !this.$v.job.finish_date.$error && this.$v.job.finish_date.$dirty}"
                        v-model="job.finish_date" type="date" format="DD-MM-YYYY"/>
            <div :class="'invalid-feedback'" v-if="this.$v.job.finish_date.$error && this.$v.job.finish_date.$dirty">
              This field is required.
            </div>
          </div>
        </CCol>
        <CCol xl="6">
          <div :class="'form-group'">
            <CRow>
              <CCol xl="6">
                <CInput
                    type="number"
                    :disabled="true"
                    :addLabelClasses="'font-weight-bold'"
                    label="Price USD"
                    v-model="job.price"
                />
              </CCol>
              <CCol xl="6">
                <CInput
                    type="number"
                    :addLabelClasses="'font-weight-bold'"
                    label="Price YEN"
                    v-model="job.price_yen"
                    @input="(value) => updatePrice(value)"
                    :is-valid="this.$v.job.price_yen.$dirty ? !this.$v.job.price_yen.$error : null"
                    invalid-feedback="This field is required."
                />
              </CCol>
              <CCol xl="12">
                <p :class="'font-weight-bold'"><span :class="'text-danger'">1USD</span> - <span :class="'text-primary'">{{
                    this.rate
                  }}JPY</span>
                </p>
              </CCol>
            </CRow>
          </div>
        </CCol>
        <CCol xl="6">
          <CTextarea
              v-model="job.note"
              :rows="4"
              :addLabelClasses="'font-weight-bold'"
              label="Note"
          />
        </CCol>
      </CRow>
      <template v-slot:footer>
        <CButton @click="show = false" color="secondary">Cancel</CButton>
        <CButton type="submit" color="primary">Save</CButton>
      </template>
    </CModal>
  </CForm>
</template>

<script>
import DatePicker from "vue2-datepicker";
import {required} from 'vuelidate/lib/validators';

const date_gt = (value, vm) => value >= vm.start_date;
const date_lt = (value, vm) => value <= vm.finish_date;

export default {
  components: {
    DatePicker,
  },
  props: {
    showModal: Boolean,
    title: String,
    rate: Number,
    customers: Array,
    types: Array,
    methods: Array,
  },
  data() {
    return {
      job: {
        name: '',
        customer: ' ',
        method: ' ',
        type: ' ',
        start_date: new Date(),
        finish_date: new Date(),
        price_yen: '',
        price: '',
        note: '',
      },
      initialValue: {
        name: '',
        customer: ' ',
        method: ' ',
        type: ' ',
        start_date: new Date(),
        finish_date: new Date(),
        price_yen: '',
        price: '',
        note: '',
      },
    };
  },
  validations: {
    job: {
      name: {
        required,
      },
      customer: {
        required,
      },
      method: {
        required,
      },
      type: {
        required,
      },
      start_date: {
        required,
        date_lt,
      },
      finish_date: {
        required,
        date_gt,
      },
      price_yen: {
        required,
      },
    },
  },
  computed: {
    show: {
      get() {
        return this.showModal;
      },
      set(value) {
        this.$emit('update:show', value);
      },
    }
  },
  methods: {
    updatePrice(priceYen) {
      if (!isNaN(priceYen)) {
        this.job.price = Math.round((1 / this.rate) * this.job.price_yen);
      }
      return 0;
    },
    handleForm() {
      this.$v.job.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('app/setLoading', true);
        this.$store.dispatch('jobs/create', this.job)
            .then((result) => {
              if(result) {
                this.resetInitialValues();
                this.$v.$reset();
              }
              this.$store.commit('app/setLoading', false)
            });
      }
    },
    resetInitialValues() {
      Object.assign(this.job, this.initialValue);
    }
  },
  watch: {
    show() {
      this.resetInitialValues();
    },
  },
}
</script>

<style scoped>

</style>