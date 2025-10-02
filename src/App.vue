<template>
  <div class="app">
    <div class="grid">
      <Card
        v-for="box in sortedBoxes"
        :key="box.id"
        :title="box.title"
        :initialTime="box.initialTime"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Card from "./components/Card.vue";

const boxes = ref([
  { id: 4, title: "BOX 04", initialTime: 0 },
  { id: 5, title: "BOX 05", initialTime: 120 },
  { id: 6, title: "BOX 06", initialTime: 180 },
  { id: 6, title: "BOX 06", initialTime: 180 },
  { id: 6, title: "BOX 06", initialTime: 180 },
  { id: 6, title: "BOX 06", initialTime: 180 },
]);

function getStatusByMinutes(mins: number) {
  if (mins >= 5) return 3;
  if (mins >= 3) return 2;
  return 1;
}

const sortedBoxes = computed(() => {
  return [...boxes.value].sort((a, b) => {
    const aStatus = getStatusByMinutes(Math.floor(a.initialTime / 60));
    const bStatus = getStatusByMinutes(Math.floor(b.initialTime / 60));

    if (aStatus !== bStatus) return bStatus - aStatus;
    return b.initialTime - a.initialTime;
  });
});
</script>

<style scoped>
.app {
  height: 100vh;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(250px, 1fr));
  max-width: 100%;
  height: 100%;
  gap: 10px;

  grid-auto-rows: 1fr;
}
</style>
