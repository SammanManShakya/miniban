<template>
  <div class="home-container">
    <h1>Welcome, {{ fullName }}!</h1>

    <button class="btn add-task" @click="showAdd = true">
      Add task
    </button>

    <!-- popup -->
    <Addtask
      v-if="showAdd"
      @add-task="onAdd"
      @close="showAdd = false"
    />

    <!-- kanban board -->
    <Kanban
      :todo="todoTasks"
      :doing="doingTasks"
      :done="doneTasks"
    />

    <button class="btn signout" @click="signOut">
      Sign Out
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/init.js'
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion
} from 'firebase/firestore'

import Addtask from './Addtask.vue'
import Kanban  from './Kanban.vue'

const router    = useRouter()
const authStore = useAuthStore()

// user display name
const fullName = ref('')
// popup toggle
const showAdd  = ref(false)

// tasks by status
const todoTasks  = ref([])
const doingTasks = ref([])
const doneTasks  = ref([])

// Firestore doc ref for this user
let userDocRef = null

onMounted(async () => {
  // load user & name
  const user = authStore.user
  if (user?.email) {
    const usersRef = collection(db, 'users')
    const q        = query(usersRef, where('user_email', '==', user.email))
    const snap     = await getDocs(q)
    if (!snap.empty) {
      const docSnap = snap.docs[0]
      userDocRef = docSnap.ref
      const data = docSnap.data()
      fullName.value = `${data.first_name} ${data.last_name}`.trim()

      // populate tasks arrays
      const all = data.user_tasks || []
      todoTasks.value  = all.filter(t => t.status === 'todo')
      doingTasks.value = all.filter(t => t.status === 'doing')
      doneTasks.value  = all.filter(t => t.status === 'done')
    }
  }
})

async function onAdd({ title, details, created, finished }) {
  if (!userDocRef) return

  // fetch current tasks to compute next ID
  const snap = await getDocs(query(
    collection(db, 'users'),
    where('user_email', '==', authStore.user.email)
  ))
  const userDoc = snap.docs[0]
  const current = userDoc.data().user_tasks || []
  const nextId = current.length + 1

  const newTask = {
    task_id:  nextId,
    status:   'todo',
    title,
    details,
    created,
    finished
  }

  // append in Firestore
  await updateDoc(userDocRef, {
    user_tasks: arrayUnion(newTask)
  })

  // update local arrays
  todoTasks.value.push(newTask)

  // close popup
  showAdd.value = false
}

function signOut() {
  authStore.logout().then(() => {
    router.push({ name: 'login' })
  })
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
.signout {
  background: #e53e3e;
  color: white;
}
.btn:hover {
  opacity: 0.9;
}
</style>
