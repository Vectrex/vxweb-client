<script>
export default {
  name: "AuthFailedView",
  emits: ['notify'],
  async created () {
    this.$emit('notify', { success: false, message: 'Authentifizierung nicht mehr gültig.' });
    await this.$router.replace({ name: 'login' });
  }
}
</script>