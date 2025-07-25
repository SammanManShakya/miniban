<template>
  <div
    v-if="!deleted"
    class="task-card"
    :class="{ expanded: open, dragging: isDragging }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="toggleExpand"
  >
    <div class="task-header">
      <span class="title">{{ task.title }}</span>
      <button class="toggle-btn">{{ open ? '▼' : '▶' }}</button>
    </div>

    <transition name="details">
      <ul v-if="open" class="details">
        <li v-for="(d, i) in task.details" :key="i">{{ d }}</li>
      </ul>
    </transition>

    <button
      v-if="open"
      class="delete-btn"
      @click.stop="confirmDelete"
    >
      Delete
    </button>
  </div>
</template>

<script setup>
import { defineProps, ref, computed } from 'vue'
import { auth, db } from '@/firebase/init.js'
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayRemove
} from 'firebase/firestore'

const emit = defineEmits(['move-task'])
const props = defineProps({
  task: { type: Object, required: true }
})

const isExpanded = ref(false)
const isHovered  = ref(false)
const isDragging = ref(false)
const deleted    = ref(false)

// open when hovered or permanently expanded
const open = computed(() => isExpanded.value || isHovered.value)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function onDragStart(e) {
  isDragging.value = true
  e.dataTransfer.setData('application/json', JSON.stringify(props.task))
  e.dataTransfer.effectAllowed = 'move'
}

function onDragEnd() {
  isDragging.value = false
  emit('move-task', null)
}

async function confirmDelete() {
  if (!confirm('Are you sure you want to delete this task?')) return

  try {
    // 1) Fetch the user doc
    const email = auth.currentUser.email
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('user_email', '==', email))
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('User document not found')

    const userDocRef = snap.docs[0].ref
    const data = snap.docs[0].data()
    const currentTasks = data.user_tasks || []

    // 2) Remove from user_tasks
    const updatedTasks = currentTasks.filter(
      t => !(t.task_id === props.task.task_id && t.created === props.task.created)
    )

    // 3) Determine which status-array to update
    //    e.g. 'todo' → 'user_todo'
    const statusField = `user_${props.task.status}`

    // 4) Build the payload
    const payload = { user_tasks: updatedTasks }
    if (data[statusField]) {
      payload[statusField] = arrayRemove(props.task.task_id)
    }

    // 5) Commit update
    await updateDoc(userDocRef, payload)

    // 6) Hide locally
    deleted.value = true

  } catch (err) {
    console.error('Failed to delete task:', err)
    alert('Could not delete task. Please try again.')
  }
}
</script>

<style scoped>
.task-card {
  background: inherit;
  color: #ffffff;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ffffff;
  cursor: grab;
  transform: scale(1);
  transition:
    transform 0.2s,
    background 0.2s,
    border-color 0.2s,
    opacity 0.2s;
}
.task-card:hover {
  transform: scale(1.25);
}
.task-card.dragging {
  opacity: 0.6;
  cursor: grabbing;
}
.task-card.expanded {
  background: #ffffff;
  border-color: #000000;
  transform: scale(1) !important;
}
.task-card.expanded .title {
  color: var(--column-bg);
}
.task-card.expanded .details {
  color: #000000;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 1rem;
  cursor: pointer;
}

.details {
  margin-top: 0.5rem;
  padding-left: 1.25rem;
}

.delete-btn {
  margin-top: 0.75rem;
  background: #e53e3e;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}
.delete-btn:hover {
  opacity: 0.9;
}

/* collapse/expand animation */
.details-enter-active,
.details-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
}
.details-enter-from,
.details-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
.details-enter-to,
.details-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
