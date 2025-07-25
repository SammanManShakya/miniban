<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark w-100">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" :to="{ name: 'home' }">
        <img src="@/assets/miniban_logo.png" alt="MiniBan logo" class="navbar-logo" />
      </RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        @click="collapsed = !collapsed"
        aria-controls="navbarNav"
        :aria-expanded="!collapsed"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" :class="{ show: !collapsed }" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'alltasks' }">Task History</RouterLink>
          </li>
        </ul>

        <div class="dropdown" ref="dropdownRef">
          <img
            :src="profilePicture"
            alt="Profile"
            class="rounded-circle avatar"
            @click="toggleMenu"
          />
          <ul v-if="showMenu" class="dropdown-menu dropdown-menu-end show">
            <li>
              <button class="dropdown-item" @click="signOut">
                Sign Out
              </button>
            </li>
            <li>
              <button class="dropdown-item text-danger" @click="deleteAccount">
                Delete Account
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { auth, db } from '@/firebase/init.js'
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore'
import { deleteUser, signOut as firebaseSignOut } from 'firebase/auth'

const router = useRouter()
const collapsed = ref(true)
const showMenu = ref(false)
const profilePicture = ref('')

// Toggle dropdown
function toggleMenu() {
  showMenu.value = !showMenu.value
}

// Sign out
async function signOut() {
  await firebaseSignOut(auth)
  router.push({ name: 'login' })
}

// Delete account
async function deleteAccount() {
  if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) {
    return
  }
  try {
    const user = auth.currentUser
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('user_email', '==', user.email))
    const snap = await getDocs(q)
    if (!snap.empty) {
      await deleteDoc(snap.docs[0].ref)
    }
    await deleteUser(user)
    router.push({ name: 'login' })
  } catch (err) {
    console.error('Error deleting account:', err)
    alert('Failed to delete account. Please try again.')
  }
}

// Close dropdown on outside click
const dropdownRef = ref(null)
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showMenu.value = false
  }
}

onMounted(async () => {
  const user = auth.currentUser
  if (user) {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('user_email', '==', user.email))
    const snap = await getDocs(q)
    if (!snap.empty) {
      profilePicture.value = snap.docs[0].data().profile_picture || ''
    }
  }
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.navbar {
  width: 100%;
}
.navbar-logo {
  height: 3rem; /* doubled size */
  width: auto;
}
.avatar {
  width: 40px;
  height: 40px;
  object-fit: cover;
  cursor: pointer;
}

/* make dropdown absolutely positioned */
.dropdown {
  position: relative;
}
.dropdown-menu {
  position: absolute !important;
  top: calc(100% + 0.5rem);
  right: 0;
  margin: 0;
  transform: none !important;
  white-space: nowrap;
  z-index: 2000;
}
</style>
