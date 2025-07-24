<template>
  <div
    v-if="!deleted"
    class="task-card"
    :class="{ expanded: open }"
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

const props = defineProps({
  task: { type: Object, required: true }
})

const isExpanded = ref(false)
const isHovered  = ref(false)
const deleted    = ref(false)

// open when hovered or toggled
const open = computed(() => isExpanded.value || isHovered.value)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

async function confirmDelete() {
  if (!confirm('Are you sure you want to delete this task?')) return

  try {
    // find user document by email
    const email = auth.currentUser.email
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('user_email', '==', email))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const userDoc = snap.docs[0].ref
      // remove this task object from the array
      await updateDoc(userDoc, {
        user_tasks: arrayRemove(props.task)
      })
    }
    // hide this card
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
  cursor: pointer;
  transform: scale(1);
  transition:
    transform 0.2s,
    background 0.2s,
    border-color 0.2s;
}
.task-card:hover {
  transform: scale(1.25);
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

/* place delete button at bottom */
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
