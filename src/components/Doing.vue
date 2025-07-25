<template>
  <div
    class="kanban-column"
    @dragover.prevent
    @drop="onDrop"
  >
    <h3>Doing</h3>
    <Task
      v-for="t in tasks"
      :key="`${t.task_id}-${t.created}`"
      :task="t"
    />
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import Task from './Task.vue'
import { auth, db } from '@/firebase/init.js'
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayRemove,
  arrayUnion
} from 'firebase/firestore'

const props = defineProps({
  tasks: { type: Array, default: () => [] }
})

async function onDrop(e) {
  const raw = e.dataTransfer.getData('application/json')
  if (!raw) return
  const task = JSON.parse(raw)

  const oldStatus = task.status
  const newStatus = 'doing'

  const email = auth.currentUser.email
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('user_email', '==', email))
  const snap = await getDocs(q)
  if (snap.empty) return
  const userDocRef = snap.docs[0].ref

  await updateDoc(userDocRef, { user_tasks: arrayRemove(task) })

  task.status = newStatus
  task.finished = null

  const payload = {
    user_tasks: arrayUnion(task),
    [`user_${oldStatus}`]: arrayRemove(task.task_id),
    [`user_${newStatus}`]: arrayUnion(task.task_id)
  }

  await updateDoc(userDocRef, payload)
}
</script>

<style scoped>
.kanban-column {
  flex: 1;
  --column-bg: #c23b22;
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
