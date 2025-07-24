// src/stores/auth.js
import { defineStore } from 'pinia';
import { auth } from '@/firebase/init';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    ready: false,    // we’ll flip this once Firebase tells us who you are
  }),
  actions: {
    init() {
      // subscribe once, and update `user` whenever auth state changes
      onAuthStateChanged(auth, (u) => {
        this.user  = u;
        this.ready = true;
      });
    },
    logout() {
      return signOut(auth).then(() => {
        this.user = null;
      });
    }
  }
});
