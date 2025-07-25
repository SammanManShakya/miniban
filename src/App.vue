<template>
  <!-- only show navbar when there’s a user in the auth store -->
  <Navbar v-if="showNavbar" />

  <!-- the routed page -->
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()

// show the navbar only when there's a logged-in user
const showNavbar = computed(() => !!authStore.user)
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  background-color: #2e2e2e; /* dark grey */
  color: #ffffff;
}
</style>
