<template>
  <div class="c-app flex-row align-items-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol sm="8" md="6" xl="4">
          <CCardGroup>
            <CCard class="p-4">
              <CCardBody>
                <CForm @submit.prevent="login">
                  <h1>Login</h1>
                  <p class="text-muted">Sign In to your account</p>
                  <CInput
                      v-model="user.email"
                      placeholder="Email"
                      :is-valid="this.$v.user.email.$dirty ? !this.$v.user.email.$error : null"
                      :invalid-feedback="!this.$v.user.email.required ? 'This field is required.' : 'This field is not valid email.'"
                  >
                    <template #prepend-content>
                      <CIcon name="cil-user"/>
                    </template>
                  </CInput>
                  <CInput
                      v-model="user.password"
                      placeholder="Password"
                      type="password"
                      :is-valid="this.$v.user.password.$dirty ? !this.$v.user.password.$error : null"
                      :invalid-feedback="!this.$v.user.password.required ? 'This field is required.' : 'This field is require 6 minimum characters.'"
                  >
                    <template #prepend-content>
                      <CIcon name="cil-lock-locked"/>
                    </template>
                  </CInput>
                  <CRow>
                    <CCol class="text-left">
                      <CButton type="submit" color="primary" class="px-4">Login</CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
    <Overlay v-show="this.$store.state.app.isLoading"/>
  </div>
</template>

<script>
import {required, email, minLength} from 'vuelidate/lib/validators';
import Overlay from "@/views/custom/Overlay";

export default {
  components: {
    Overlay,
  },
  data() {
    return {
      user: {
        email: '',
        password: '',
      },
    };
  },
  validations: {
    user: {
      email: {
        required,
        email,
      },
      password: {
        required,
        minLength: minLength(6),
      },
    },
  },
  methods: {
    login() {
      this.$v.user.$touch();
      if(!this.$v.user.$invalid) {
        this.$store.commit('app/setLoading', true);
        this.$store.dispatch('auth/postLogin', this.user)
        .then((status) => {
          this.$store.commit('app/setLoading', false);
          if(status) {
            this.$router.push('/');
          }
        });
      }
    },
  },
}
</script>
