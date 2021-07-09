<template>
  <div class="c-app flex-row align-items-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol sm="8" md="6" xl="4">
          <CCardGroup>
            <CCard class="p-4">
              <CCardBody>
                <CForm @submit.prevent="login">
                  <h1>{{ this.$tc('views.login.title') }}</h1>
                  <p class="text-muted">{{ this.$tc('views.login.description') }}</p>
                  <CInput
                      v-model="user.username"
                      :placeholder="this.$tc('views.login.username')"
                      :is-valid="this.$v.user.username.$dirty ? !this.$v.user.username.$error : null"
                      :invalid-feedback="!this.$v.user.username.required ? 'This field is required.' : 'This field is require 3 minimum characters.'"
                  >
                    <template #prepend-content>
                      <CIcon name="cil-user"/>
                    </template>
                  </CInput>
                  <CInput
                      v-model="user.password"
                      :placeholder="this.$tc('views.login.password')"
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
                      <CButton type="submit" color="primary" class="px-4">{{ this.$tc('views.login.submit') }}</CButton>
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
import {required, minLength} from 'vuelidate/lib/validators';
import Overlay from "@/views/custom/Overlay";

export default {
  components: {
    Overlay,
  },
  data() {
    return {
      user: {
        username: '',
        password: '',
      },
    };
  },
  validations: {
    user: {
      username: {
        required,
        minLength: minLength(3),
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
