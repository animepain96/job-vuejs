<template>
  <CRow>
    <CCol col="12">
      <CCard>
        <CForm @submit.prevent="changePassword">
          <CCardHeader>
            <CRow :class="['align-items-center']">
              <CCol md="12"><h3 :class="['mb-0']" v-text="'Change Password'"/></CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md="6">
                <CInput
                    v-model="password.password"
                    type="password"
                    addLabelClasses="font-weight-bold"
                    label="New Password"
                    :is-valid="this.$v.password.password.$dirty ? !this.$v.password.password.$error : null"
                    :invalid-feedback="!this.$v.password.password.required ? 'This field is required.' : 'This field required 6 minimum characters.'"
                />
                <CInput
                    v-model="password.password_confirmation"
                    type="password"
                    addLabelClasses="font-weight-bold"
                    label="Confirm Password"
                    :is-valid="this.$v.password.password_confirmation.$dirty ? !this.$v.password.password_confirmation.$error : null"
                    :invalid-feedback="!this.$v.password.password_confirmation.required ? 'This field is required.' : 'This field is same as password.'"
                />
              </CCol>
            </CRow>
          </CCardBody>
          <CCardFooter>
            <CButton type="submit" color="primary" v-text="'Save'" />
            <CButton class="float-right" color="secondary" v-text="'Back'" />
          </CCardFooter>
        </CForm>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import {required, sameAs, minLength} from 'vuelidate/lib/validators';

export default {
  data() {
    return {
      password: {
        password: '',
        password_confirmation: '',
      },
    };
  },
  validations: {
    password: {
      password: {
        required,
        minLength: minLength(6),
      },
      password_confirmation: {
        required,
        sameAs: sameAs(function() {
          return this.password.password;
        }),
      },
    },
  },
  methods: {
    changePassword() {
      this.$v.password.$touch();
      if(!this.$v.password.$invalid) {
        this.$store.commit('app/setLoading', true);
        this.$store.dispatch('auth/changePassword', this.password)
            .then(() => this.$store.commit('app/setLoading', false));
      }
    },
  },
}
</script>

<style scoped>
</style>