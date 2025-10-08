<template>
  <div class="app">
    <div class="grid">
      <Card
        v-for="box in visibleBoxes"
        :key="box.id"
        :title="box.title"
        :time="box.time"
        :isMax="box.id === maxBoxId"
        :status="box.status"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import Card from "./components/Card.vue";

type BoxStatus = "livre" | "aguardando" | "atendimento";

interface Box {
  id: number;
  title: string;
  time: number;
  status: BoxStatus;
}

const boxes = ref<Box[]>([]);
let socket: WebSocket | null = null;

function getStatusByMinutes(mins: number) {
  if (mins >= 5) return 3;
  if (mins >= 3) return 2;
  return 1;
}

const sortedBoxes = computed(() => {
  return [...boxes.value].sort((a, b) => {
    if (a.status === "aguardando" && b.status !== "aguardando") return -1;
    if (b.status === "aguardando" && a.status !== "aguardando") return 1;

    if (a.status === "aguardando" && b.status === "aguardando") {
      return b.time - a.time;
    }

    const aStatus = getStatusByMinutes(Math.floor(a.time / 60));
    const bStatus = getStatusByMinutes(Math.floor(b.time / 60));

    if (aStatus !== bStatus) return bStatus - aStatus;
    return b.time - a.time;
  });
});

const maxBoxId = computed(() => {
  const aguardando = boxes.value.filter((b) => b.status === "aguardando");

  if (!aguardando.length) return null;
  return aguardando.reduce((max, curr) => (curr.time > max.time ? curr : max))
    .id;
});

const visibleBoxes = computed(() => {
  return sortedBoxes.value.filter((box) => box.status !== "livre");
});

function saveBoxToLocalStorage() {
  localStorage.setItem("SmartQueue", JSON.stringify(boxes.value));
}

function loadBoxesFromLocalStorage() {
  const boxData = localStorage.getItem("SmartQueue");
  if (boxData) {
    try {
      const parsed: Box[] = JSON.parse(boxData);
      boxes.value = parsed;
    } catch {
      console.warn("Erro ao parsear boxes do localStorage");
    }
  }
}

function connectWebSocket() {
  const socketUrl = "ws://localhost:4000";
  socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    console.log("WebSocket conectado com sucesso.");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (Array.isArray(data)) {
        data.forEach((item) => {
          const receivedId = item.id;
          const boxTitle =
            item.nr_seq_local_pa ||
            `BOX ${String(receivedId).padStart(2, "0")}`;
          const newStatus: BoxStatus = item.status ?? "livre";

          const localData = localStorage.getItem("SmartQueue");
          let storedBoxes: Box[] = [];
          if (localData) {
            try {
              storedBoxes = JSON.parse(localData);
            } catch {
              console.warn("Erro ao parsear SmartQueue do localStorage");
            }
          }

          const storedBox = storedBoxes.find((b) => b.title === boxTitle);

          const statusToUse: BoxStatus = storedBox?.status ?? newStatus;

          const boxToUpdate = boxes.value.find((b) => b.title === boxTitle);
          if (boxToUpdate) {
            boxToUpdate.status = newStatus;
          } else {
            boxes.value.push({
              id: receivedId,
              title: boxTitle.toUpperCase(),
              time: 0,
              status: statusToUse,
            });
          }
        });

        saveBoxToLocalStorage();

        const boxesSummary = boxes.value.map((b) => ({
          id: b.id,
          title: b.title,
          status: b.status,
        }));
        console.log("Resumo dos boxes:", boxesSummary);
      }
    } catch (error) {
      console.error("Erro ao processar mensagem do WebSocket:", error);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket desconectado. Tentando reconectar em 5 segundos...");
    setTimeout(connectWebSocket, 5000);
  };

  socket.onerror = (error) => {
    console.error("Erro no WebSocket:", error);
    socket?.close();
  };
}

onMounted(() => {
  loadBoxesFromLocalStorage();

  // conecta ao WebSocket
  connectWebSocket();

  // contador de tempo
  const timer = setInterval(() => {
    let changed = false;
    boxes.value.forEach((box) => {
      if (box.status !== "livre") {
        box.time += 1;
        changed = true;
      }
    });
    if (changed) {
      saveBoxToLocalStorage();
    }
  }, 1000);

  onBeforeUnmount(() => {
    clearInterval(timer);
    if (socket) {
      socket.onclose = null;
      socket.close();
    }
  });
});

onBeforeUnmount(() => {
  if (socket) {
    socket.onclose = null;
    socket.close();
  }
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

.empty-background {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f8f8;
}

.logo {
  max-width: 600px;
  width: 50%;
  height: auto;
  opacity: 0.8;
}
</style>
