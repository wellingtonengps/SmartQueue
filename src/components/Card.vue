<template>
  <div class="timer-card" :style="{ backgroundColor: backgroundColor }">
    <div class="card-content">
      <h3 class="card-title">{{ props.title }}</h3>
      <div class="timer">{{ formattedTime }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";

const props = defineProps({
  title: { type: String, default: "Atendimento" },
  initialTime: { type: Number, default: 0 }, // tempo inicial em segundos
  autoStart: { type: Boolean, default: true },
});

const elapsed = ref(props.initialTime);
let timerId: number | null = null;

const startTimer = () => {
  if (timerId) return;
  timerId = setInterval(() => {
    elapsed.value += 1;
  }, 1000);
};

const stopTimer = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
};

onMounted(() => {
  if (props.autoStart) startTimer();
});

onBeforeUnmount(() => stopTimer());

const formattedTime = computed(() => {
  const mins = Math.floor(elapsed.value / 60);
  const secs = elapsed.value % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
});

const backgroundColor = computed(() => {
  const minutes = Math.floor(elapsed.value / 60);
  if (minutes >= 5) return "#FF6B6B";
  if (minutes >= 3) return "#FFD166";
  return "#7AE582";
});
</script>

<style scoped>
.timer-card {
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease;
  color: #111;
  text-align: center;
  font-family: "Roboto", sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 5rem;
  font-weight: bold;
  line-height: 1.2;
  word-break: break-word;
}

.timer {
  font-size: 6rem;
  font-weight: bold;
}
</style>
