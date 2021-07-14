<template>
  <CContainer class="d-flex align-items-center min-vh-100">
    <CRow class="w-100 justify-content-center">
      <CCol md="6">
        <div class="w-100">
          <div class="clearfix">
            <h1 class="float-left display-3 mr-4">404</h1>
            <h4 class="pt-3">{{ this.$tc('views.page_404.oops') }}</h4>
            <p class="text-muted">{{ this.$tc('views.page_404.not_found') }}</p>
            <CLink to="/">
              <CIcon name="cil-arrow-left"/> {{ this.$tc('views.page_404.back_home') }}
            </CLink>
          </div>
        </div>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script>
export default {
}
</script>
