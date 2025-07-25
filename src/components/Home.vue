<template>
  <div class="home-container">
    <h1>{{ typedText }}</h1>

    <button class="btn add-task" @click="showAdd = true">
      Add task
    </button>

    <Addtask
      v-if="showAdd"
      @add-task="onAdd"
      @close="showAdd = false"
    />

    <Kanban
      :todo="todoTasks"
      :doing="doingTasks"
      :done="doneTasks"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/init.js'
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  onSnapshot
} from 'firebase/firestore'

import Addtask from './Addtask.vue'
import Kanban  from './Kanban.vue'

const authStore  = useAuthStore()

const fullName   = ref('')
const typedText  = ref('')
const showAdd    = ref(false)
const todoTasks  = ref([])
const doingTasks = ref([])
const doneTasks  = ref([])

let userDocRef = null
let unsubscribe = null
let timeouts = []

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
  timeouts.forEach(id => clearTimeout(id))
})

onMounted(async () => {
  const user = authStore.user
  if (!user?.email) return

  const usersRef = collection(db, 'users')
  const q        = query(usersRef, where('user_email', '==', user.email))
  const snap     = await getDocs(q)
  if (snap.empty) return

  userDocRef     = snap.docs[0].ref
  const data     = snap.docs[0].data()
  fullName.value = `${data.first_name} ${data.last_name}`.trim()

  unsubscribe = onSnapshot(userDocRef, docSnap => {
    const all = (docSnap.data() || {}).user_tasks || []
    const unique = Array.from(
      new Map(all.map(t => [`${t.task_id}-${t.created}`, t])).values()
    )
    todoTasks.value  = unique.filter(t => t.status === 'todo')
    doingTasks.value = unique.filter(t => t.status === 'doing')
    doneTasks.value  = unique.filter(t => t.status === 'done')
  })
})

watch(fullName, (name) => {
  if (!name) return

  const welcome     = `Welcome, ${name}!`
  const secondMsg   = 'Here are your tasks!'
  const typeInterval = 100
  const pauseAfter   = 3000
  const backInterval = 75

  timeouts.forEach(id => clearTimeout(id))
  timeouts = []
  typedText.value = ''

  // 1) Type welcome
  welcome.split('').forEach((char, i) => {
    const id = setTimeout(() => {
      typedText.value += char
    }, typeInterval * i)
    timeouts.push(id)
  })

  // 2) After typing + pause, backspace
  const startBack = typeInterval * welcome.length + pauseAfter
  for (let j = 1; j <= welcome.length; j++) {
    const id = setTimeout(() => {
      typedText.value = welcome.slice(0, welcome.length - j)
    }, startBack + backInterval * j)
    timeouts.push(id)
  }

  // 3) After backspacing, type second message
  const startSecond = startBack + backInterval * (welcome.length + 1)
  secondMsg.split('').forEach((char, k) => {
    const id = setTimeout(() => {
      typedText.value += char
    }, startSecond + typeInterval * k)
    timeouts.push(id)
  })
})

async function onAdd({ title, details, created, finished }) {
  if (!userDocRef) return

  const totalCount = todoTasks.value.length +
                     doingTasks.value.length +
                     doneTasks.value.length
  const nextId = totalCount + 1

  const newTask = {
    task_id:  nextId,
    status:   'todo',
    title,
    details,
    created,
    finished
  }

  await updateDoc(userDocRef, {
    user_tasks: arrayUnion(newTask),
    user_todo:  arrayUnion(nextId)
  })

  showAdd.value = false
}
</script>

<style scoped>
.home-container {
  max-width: 900px;
  margin: 2rem auto;
  text-align: center;
}
.btn {
  padding: 0.5rem 1rem;
  margin: 1rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.add-task {
  background: #3182ce;
  color: white;
}
.btn:hover {
  opacity: 0.9;
}
</style>
