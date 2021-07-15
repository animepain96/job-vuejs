<template>
  <CForm @submit.prevent="handleForm">
    <CModal
        :close-on-backdrop="false"
        :title="tc('views.jobs.create_job.title')"
        color="primary"
        :show.sync="show"
        size="xl"
    >
      <CRow>
        <CCol xl="6">
          <CInput
              v-model.trim="job.Name"
              :addLabelClasses="'font-weight-bold'"
              :label="tc('views.jobs.create_job.name')"
              :is-valid="this.$v.job.Name.$dirty ? !this.$v.job.Name.$error : null"
              :invalid-feedback="!this.$v.job.Name.required ? tc('validations.required') : tc('validations.max_length').replace(':value', 255)"
          />
        </CCol>
        <CCol xl="6">
          <CSelect
              :value.sync="job.Customer"
              :options="[{value: ' ', label: ' ', disabled: true}].concat(customers)"
              :addLabelClasses="'font-weight-bold'"
              :label="tc('views.jobs.create_job.customer')"
              :is-valid="this.$v.job.Customer.$dirty ? !this.$v.job.Customer.$error : null"
              :invalid-feedback="tc('validations.required')"
          />
        </CCol>
        <CCol xl="6">
          <CSelect
              :value.sync="job.Method"
              :options="[{value: ' ', label: ' ', disabled: true}].concat(methods)"
              :addLabelClasses="'font-weight-bold'"
              :label="this.$tc('views.jobs.create_job.method')"
              :is-valid="this.$v.job.Method.$dirty ? !this.$v.job.Method.$error : null"
              :invalid-feedback="tc('validations.required')"
          />
        </CCol>
        <CCol xl="6">
          <CSelect
              :value.sync="job.Type"
              :options="[{value: ' ', label: ' ', disabled: true}].concat(types)"
              :addLabelClasses="'font-weight-bold'"
              :label="tc('views.jobs.create_job.type')"
              :is-valid="this.$v.job.Type.$dirty ? !this.$v.job.Type.$error : null"
              :invalid-feedback="tc('validations.required')"
          />
        </CCol>
        <CCol xl="6">
          <div :class="'form-group'">
            <label :class="'font-weight-bold'" v-text="this.$tc('views.jobs.create_job.start_date')"/>
            <DatePicker
                :lang="this.$i18n.locale"
                :class="{'is-invalid': this.$v.job.StartDate.$error && this.$v.job.StartDate.$dirty}"
                :input-class="{'is-invalid': this.$v.job.StartDate.$error && this.$v.job.StartDate.$dirty, 'form-control': true, 'is-valid': !this.$v.job.StartDate.$error && this.$v.job.StartDate.$dirty}"
                v-model="job.StartDate" type="date" format="YYYY-MM-DD"/>
            <div :class="'invalid-feedback'" v-if="this.$v.job.StartDate.$error && this.$v.job.StartDate.$dirty">
              {{
                tc('validations.required')
              }}
            </div>
          </div>
        </CCol>
        <CCol xl="6">
          <div :class="'form-group'">
            <label :class="'font-weight-bold'" v-text="tc('views.jobs.create_job.finish_date')"/>
            <DatePicker
                :lang="this.$i18n.locale"
                :class="{'is-invalid': this.$v.job.FinishDate.$error && this.$v.job.FinishDate.$dirty}"
                :input-class="{'is-invalid': this.$v.job.FinishDate.$error && this.$v.job.FinishDate.$dirty, 'form-control': true, 'is-valid': !this.$v.job.FinishDate.$error && this.$v.job.FinishDate.$dirty}"
                v-model="job.FinishDate" type="date" format="YYYY-MM-DD"/>
            <div :class="'invalid-feedback'" v-if="this.$v.job.FinishDate.$error && this.$v.job.FinishDate.$dirty">
              {{
                tc('validations.required')
              }}
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
                    :label="this.$tc('views.jobs.create_job.price')"
                    v-model="job.Price"
                />
              </CCol>
              <CCol xl="6">
                <CInput
                    type="number"
                    :addLabelClasses="'font-weight-bold'"
                    :label="tc('views.jobs.create_job.price_yen')"
                    v-model="job.PriceYen"
                    @input="(value) => updatePrice(value)"
                    :is-valid="this.$v.job.PriceYen.$dirty ? !this.$v.job.PriceYen.$error : null"
                    :invalid-feedback="!this.$v.job.PriceYen.required ? tc('validations.required') : tc('validations.numeric')"
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
              v-model="job.Note"
              :rows="4"
              :addLabelClasses="'font-weight-bold'"
              label="Note"
              :is-valid="this.$v.job.Note.$dirty ? !this.$v.job.Note.$error : null"
              :invalid-feedback="tc('validations.max_length').replace(':value', Number(10000).toLocaleString())"
          />
        </CCol>
      </CRow>
      <template v-slot:footer>
        <CButton @click="show = false" color="secondary">{{ tc('buttons.crud.cancel') }}</CButton>
        <CButton type="submit" color="primary">{{ tc('buttons.crud.save') }}</CButton>
      </template>
    </CModal>
  </CForm>
</template>

<script>
import DatePicker from "vue2-datepicker";
import {required, integer, minValue, maxLength} from 'vuelidate/lib/validators';
import "vue2-datepicker/locale/vi";

export default {
  components: {
    DatePicker,
  },
  props: {
    showModal: Boolean,
    rate: Number,
    customers: Array,
    types: Array,
    methods: Array,
  },
  data() {
    return {
      job: {
        Name: '',
        Customer: ' ',
        Method: ' ',
        Type: ' ',
        StartDate: new Date(),
        FinishDate: new Date(),
        PriceYen: '',
        Price: '',
        Note: '',
      },
      initialValue: {
        Name: '',
        Customer: ' ',
        Method: ' ',
        Type: ' ',
        StartDate: new Date(),
        FinishDate: new Date(),
        PriceYen: '',
        Price: '',
        Note: '',
      },
    };
  },
  validations: {
    job: {
      Name: {
        required,
      },
      Customer: {
        required,
      },
      Method: {
        required,
      },
      Type: {
        required,
      },
      StartDate: {
        required,
      },
      FinishDate: {
        required,
      },
      PriceYen: {
        required,
        integer,
        minValue: minValue(1),
      },
      Note: {
        maxLength: maxLength(10000),
      },
    },
  },
  computed: {
    tc() {
      return this.$tc;
    },
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
        this.job.Price = Math.round((1 / this.rate) * this.job.PriceYen);
      }
      return 0;
    },
    handleForm() {
      this.$v.job.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('app/setLoading', true);
        this.$store.dispatch('jobs/create', this.job)
            .then((result) => {
              if (result) {
                this.resetInitialValues();
                this.$v.$reset();
                this.show = false;
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
