<template>
  <section class="container">
    <h1>IoT_Garden Dashboard</h1>
    <p>this is a test</p>
    <div v-for="(plant, index) in plants" :key="index" class="plant_content">
      <p>the plant is: {{ plant.id }} </p>
      <div>
        {{plant.content}}
      </div>
    </div>
  </section>
</template>

<script>
export default {
  async asyncData({ $axios }) {
    const plants = await $axios.$get('http://localhost:3000/api/get_plants');
    console.log(plants);
    return {
      plants: plants.response,
    };
  },
};
</script>

<style scoped>
  .container {
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;

    align-items: center;
    text-align: center;
  }
  .plant_content {
    padding: 50px;
    border: solid lightgray 1px;
    margin: 10px auto;
  }
</style>
