<template>
  <CFooter :fixed="false">
    <div>
      <a href="https://coreui.io" target="_blank">{{ this.$tc('app.title') }}</a>
      <span class="ml-1">&copy; {{new Date().getFullYear()}} BPOTech JSC.</span>
    </div>
    <div class="mfs-auto">
      <span class="mr-1">{{ this.$tc('footer.by') }}</span>
      <a href="https://gitlab.com/daudangvan" target="_blank">AnimePain</a>
    </div>
  </CFooter>
</template>

<script>
export default {
  name: 'TheFooter'
}
</script>
