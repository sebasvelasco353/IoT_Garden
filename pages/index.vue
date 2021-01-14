<template>
  <section class="container">
    <div>
      <h1>IoT_Garden Dashboard</h1>
      <p>this is a test</p>
    </div>
    <div class="plants">
        <div class="plant_content" v-for="(plant, index) in plants" :key="index">
          <a href="plant-data">
            <h3>Id:</h3>
            <p>{{plant.plant_id}}</p>
            <h5>Air Humidity:</h5>
            <p>{{ plant.air_humidity  }}</p>
          </a>
        </div>
    </div>
  </section>
</template>

<script>
export default {
  async asyncData({ $axios }) {
    const plants = await $axios.$get('http://localhost:3000/api/get_plants_today');
    console.log(plants);
    return {
      plants,
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
  .plants {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .plant_content {
    width: 45vw;
    padding: 50px;
    border: solid lightgray 1px;
    margin: 10px auto;
  }
</style>
