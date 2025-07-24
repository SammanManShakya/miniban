<template>
  <div class="kanban-column">
    <h3>Done</h3>
    <Task
      v-for="t in tasks"
      :key="t.task_id"
      :task="t"
    />
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import Task from './Task.vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] }
})
</script>

<style scoped>
.kanban-column {
  flex: 1;
  --column-bg: #96DD99;
  background: var(--column-bg);
  border-radius: 4px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  min-width: 200px;
}
.kanban-column h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #ffffff;
}
</style>
