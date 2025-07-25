<template>
  <div class="alltasks-container">
    <!-- Filters -->
    <div class="filters">
      <label>
        Status:
        <select v-model="statusFilter">
          <option value="">All</option>
          <option value="todo">Todo</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>
      </label>
      <label>
        Created On:
        <input type="date" v-model="dateFilter" />
      </label>
    </div>

    <!-- Task list -->
    <div class="tasks-list">
      <div
        v-for="task in filteredTasks"
        :key="`${task.task_id}-${task.created}`"
        :class="['task-item', task.status]"
      >
        <Task :task="task" />
        <div v-if="task.status === 'done'" class="completed-info">
          Completed at: {{ formatDate(task.finished) }}
        </div>
      </div>
      <p v-if="filteredTasks.length === 0" class="no-tasks">
        No tasks match the selected filters.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/init.js'
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot
} from 'firebase/firestore'
import Task from './Task.vue'

const authStore    = useAuthStore()
const tasksRaw     = ref([])
const statusFilter = ref('')
const dateFilter   = ref('')
let unsubscribe    = null

onMounted(async () => {
  const user = authStore.user
  if (!user?.email) return

  // Find the user doc
  const usersRef = collection(db, 'users')
  const q        = query(usersRef, where('user_email', '==', user.email))
  const snap     = await getDocs(q)
  if (snap.empty) return

  const userDocRef = snap.docs[0].ref

  // Listen in real time
  unsubscribe = onSnapshot(userDocRef, docSnap => {
    const all = docSnap.data()?.user_tasks || []
    // dedupe by task_id+created
    tasksRaw.value = Array.from(
      new Map(all.map(t => [`${t.task_id}-${t.created}`, t])).values()
    )
  })
})

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
})

const filteredTasks = computed(() => {
  return tasksRaw.value.filter(task => {
    if (statusFilter.value && task.status !== statusFilter.value) {
      return false
    }
    if (dateFilter.value) {
      // compare YYYY-MM-DD
      return task.created.slice(0, 10) === dateFilter.value
    }
    return true
  })
})

function formatDate(iso) {
  const d = new Date(iso)
  return isNaN(d) ? '' : d.toLocaleString()
}
</script>

<style scoped>
.alltasks-container {
  max-width: 900px;
  margin: 2rem auto;
  color: #fff;
}

/* filter controls */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}
.filters label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* grid of tasks */
.tasks-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

/* per-status styling via CSS variable */
.task-item {
  padding: 0.5rem;
  border-radius: 4px;
  background: var(--column-bg);
}
.task-item.todo   { --column-bg: #1c7ab4; }
.task-item.doing  { --column-bg: #c23b22; }
.task-item.done   { --column-bg: #96DD99; }

.completed-info {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #000;
}

.no-tasks {
  grid-column: 1/-1;
  text-align: center;
  font-style: italic;
}
</style>
