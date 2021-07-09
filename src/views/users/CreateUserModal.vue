<template>
  <CForm @submit.prevent="handleForm">
    <CModal
        :closeOnBackdrop="false"
        :title="tc('views.users.create_user.title')"
        color="primary"
        :show.sync="show"
        size="lg"
    >
      <CRow>
        <CCol md="6">
          <CInput
              v-model="user.name"
              addLabelClasses="font-weight-bold"
              :label="tc('views.users.create_user.name')"
              :is-valid="this.$v.user.name.$dirty ? !this.$v.user.name.$error : null"
              :invalid-feedback="!this.$v.user.name.required ? tc('validations.required') : tc('validations.max_length').replace(':value', 255)"
          />
        </CCol>
        <CCol md="6">
          <CInput
              v-model="user.username"
              addLabelClasses="font-weight-bold"
              :label="tc('views.users.create_user.username')"
              :is-valid="this.$v.user.username.$dirty ? !this.$v.user.username.$error : null"
              :invalid-feedback="!this.$v.user.username.required ? tc('validations.required') :  tc('validations.max_length').replace(':value', 50)"
          />
        </CCol>
        <CCol md="6">
          <CInput
              v-model="user.email"
              addLabelClasses="font-weight-bold"
              :label="tc('views.users.create_user.email')"
              :is-valid="this.$v.user.email.$dirty ? !this.$v.user.email.$error : null"
              :invalid-feedback="!this.$v.user.email.required ? tc('validations.required') : tc('validations.email')"
          />
        </CCol>
        <CCol md="6">
          <CInput
              v-model="user.password"
              type="password"
              addLabelClasses="font-weight-bold"
              :label="tc('views.users.create_user.password')"
              :is-valid="this.$v.user.password.$dirty ? !this.$v.user.password.$error : null"
              :invalid-feedback="!this.$v.user.password.required ? tc('validations.required') : tc('validations.min_length').replace(':value', 6)"
          />
        </CCol>
        <CCol md="6">
          <CInput
              v-model="user.password_confirmation"
              type="password"
              addLabelClasses="font-weight-bold"
              :label="tc('views.users.create_user.confirm_password')"
              :is-valid="this.$v.user.password_confirmation.$dirty ? !this.$v.user.password_confirmation.$error : null"
              :invalid-feedback="!this.$v.user.password_confirmation.required ? tc('validations.required') : tc('validations.same')"
          />
        </CCol>
        <CCol md="6">
          <CInputCheckbox
              v-model="user.active"
              class="mb-2" :custom="true"
              addLabelClasses="font-weight-bold"
              :label="tc('views.users.create_user.active')"
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
import {required, maxLength, email, minLength, sameAs} from "vuelidate/lib/validators";

export default {
  props: {
    showModal: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      user: {
        name: '',
        username: '',
        email: '',
        active: false,
        password: '',
        password_confirmation: '',
      },
    };
  },
  validations: {
    user: {
      name: {
        required,
        maxLength: maxLength(255),
      },
      username: {
        required,
        maxLength: maxLength(255),
      },
      email: {
        email,
        required,
      },
      password: {
        required,
        minLength: minLength(6),
      },
      password_confirmation: {
        required,
        sameAs: sameAs(function () {
          return this.user.password;
        }),
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
    },
  },
  methods: {
    handleForm() {
      this.$v.user.$touch();
      if (!this.$v.user.$invalid) {
        this.$store.commit('app/setLoading', true);
        this.$store.dispatch('users/createUser', this.user)
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
      this.user = {
        name: '',
        username: '',
        email: '',
        active: false,
        password: '',
        password_confirmation: '',
      };
    },
  },
}
</script>

<style scoped>

</style>
