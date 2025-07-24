<template>
  <div class="kanban-board">
    <Todo :tasks="todo" />
    <Doing :tasks="doing" />
    <Done :tasks="done" />
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import Todo  from './Todo.vue'
import Doing from './Doing.vue'
import Done  from './Done.vue'

const props = defineProps({
  todo:  { type: Array, default: () => [] },
  doing: { type: Array, default: () => [] },
  done:  { type: Array, default: () => [] }
})
</script>

<style scoped>
.kanban-board {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  overflow-x: auto;
}
</style>
