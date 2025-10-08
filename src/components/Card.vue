<template>
  <div
    class="timer-card"
    :class="[{ big: props.isMax }]"
    :style="{ backgroundColor: backgroundColor }"
  >
    <div class="card-content">
      <h3 class="card-title">{{ props.title }}</h3>
      <div class="timer">{{ formattedTime }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";

const props = defineProps({
  title: { type: String, default: "BOX" },
  time: { type: Number, default: 0 }, // tempo inicial em segundos
  autoStart: { type: Boolean, default: true },
  isMax: { type: Boolean, default: false },
  status: {
    type: String,
    default: "livre" as "livre" | "aguardando" | "atendimento",
  },
});

const elapsed = ref(props.time);
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

const minutes = computed(() => Math.floor(elapsed.value / 60));

const backgroundColor = computed(() => {
  if (props.status === "aguardando" && minutes.value >= 5) return "#FF6B6B";
  if (props.status === "aguardando" && minutes.value >= 3) return "#FFD166";
  if (props.status === "atendimento") return "#8c8c8c";
  return "#7AE582";
});
</script>

<style scoped>
.timer-card {
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  color: #111;
  text-align: center;
  font-family: "Roboto", sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
}

.small {
  grid-column: span 1;
  grid-row: span 1;
}

.medium {
  grid-column: span 1;
  grid-row: span 1;
}

.big {
  font-size: 2rem;
  grid-column: span 2;
  grid-row: span 2;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 5em;
  font-weight: bold;
  line-height: 1.2;
  word-break: break-word;
}

.timer {
  font-size: 4em;
}
</style>
