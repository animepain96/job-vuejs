<template>
  <CForm @submit.prevent="handleForm">
    <CModal
        :closeOnBackdrop="false"
        :title="title"
        color="primary"
        :show.sync="show"
    >
      <CRow>
        <CCol class="ml-3 mr-3">
          <CInput
              v-model="user.name"
              addLabelClasses="font-weight-bold"
              label="Name"
              :is-valid="this.$v.user.name.$dirty ? !this.$v.user.name.$error : null"
              :invalid-feedback="!this.$v.user.name.required ? 'This field is required.' : 'This field require 255 maximum characters.'"
          />
          <CInput
              v-model="user.email"
              addLabelClasses="font-weight-bold"
              label="Email"
              :is-valid="this.$v.user.email.$dirty ? !this.$v.user.email.$error : null"
              :invalid-feedback="!this.$v.user.email.required ? 'This field is required.' : 'Invalid email address.'"
          />
          <CInputCheckbox
              v-model="user.active"
              class="mb-2" :custom="true"
              addLabelClasses="font-weight-bold"
              label="Active"
          />
          <CInput
              v-model="user.password"
              type="password"
              addLabelClasses="font-weight-bold"
              label="Password"
              :is-valid="this.$v.user.password.$dirty ? !this.$v.user.password.$error : null"
              :invalid-feedback="!this.$v.user.password.required ? 'This field is required.' : 'This field require 6 minimum characters.'"
          />
          <CInput
              v-model="user.password_confirmation"
              type="password"
              addLabelClasses="font-weight-bold"
              label="Confirm Password"
              :is-valid="this.$v.user.password_confirmation.$dirty ? !this.$v.user.password_confirmation.$error : null"
              :invalid-feedback="!this.$v.user.password_confirmation.required ? 'This field is required.' : 'Please type password again.'"
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
import {required, maxLength, email, minLength, sameAs} from "vuelidate/lib/validators";

export default {
  props: {
    showModal: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "Modal",
    },
  },
  data() {
    return {
      user: {
        name: '',
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
        sameAs: sameAs(function() {
          return this.user.password;
        }),
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
    },
  },
  methods: {
    handleForm()
    {
      this.$v.user.$touch();
      if(!this.$v.user.$invalid) {
        this.$store.commit('app/setLoading', true);
        this.$store.dispatch('users/createUser', this.user)
            .then((result) => {
              if(result) {
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