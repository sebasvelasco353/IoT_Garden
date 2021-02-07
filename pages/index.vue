<template>
  <section class="container">
    <div>
      <h1>IoT_Garden Dashboard</h1>
      <p>this is a test</p>
    </div>
    <div class="plants">
      <div
        v-for="(plant, plantsKey) in plants"
        :key="plantsKey"
        class="plant_content"
      >
        <h1>{{ plantsKey }}</h1>
        <div
          v-for="(time, momentKey) in plant"
          :key="momentKey"
          class="plant_content--moment"
        >
          <h2>{{ time.moment }}</h2>
          <a href="plant-data">
            <h5>Air Humidity:</h5>
            <p>{{ time.air_humidity }}</p>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  async asyncData({ $axios }) {
    const plants = await $axios.$get('http://localhost:3000/api/get_plants_today');
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
  .plant_content--moment {
    padding: 50px;
    border: solid lightgray 1px;
    margin: 10px auto;
  }
</style>
