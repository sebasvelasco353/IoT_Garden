<template>
  <section>
    <h1>IoT_Garden Dashboard</h1>
    <p>this is a test</p>
  </section>
</template>

<script>
  export default {
    async asyncData({ $axios }) {
      console.log("hello")
      const plants = await $axios.$get('http://localhost:3000/api/get_plants');
      return { plants }
    }
  }
</script>

<style>
  .container {
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
</style>
