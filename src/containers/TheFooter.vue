<template>
  <CFooter :fixed="false">
    <div>
      <a href="https://coreui.io" target="_blank">Job Management</a>
      <span class="ml-1">&copy; {{new Date().getFullYear()}} BPOTech JSC.</span>
    </div>
    <div class="mfs-auto">
      <span class="mr-1">By</span>
      <a href="https://gitlab.com/daudangvan" target="_blank">AnimePain</a>
    </div>
  </CFooter>
</template>

<script>
export default {
  name: 'TheFooter'
}
</script>
