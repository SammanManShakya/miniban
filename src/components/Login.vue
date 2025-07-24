<template>
  <div class="login-container">
    <h2>Welcome – please sign in</h2>

    <button class="btn google" @click="loginWithGoogle">
      Sign in with Google
    </button>

    <button class="btn facebook" @click="loginWithFacebook">
      Sign in with Facebook
    </button>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut
} from "firebase/auth";
import { auth } from "../firebase/init.js";
import db from "../firebase/init.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "firebase/firestore";

export default {
  name: "Login",
  data() {
    return { error: null };
  },
  methods: {
    async handleOAuthLogin(provider) {
      this.error = null;

      try {
        // 1) Sign in with popup
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const email = user.email;

        // 2) Look up existing user doc
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("user_email", "==", email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          // 3) If provider mismatch, block
          const data = snapshot.docs[0].data();
          if (data.authProvider && data.authProvider !== provider.providerId) {
            // sign them right back out
            await firebaseSignOut(auth);
            this.error = `Please sign in with ${
              data.authProvider === "facebook.com" ? "Facebook" : "Google"
            }.`;
            return;
          }
        }

        // 4) Create user doc if new (and store authProvider)
        if (snapshot.empty) {
          const profile = result.additionalUserInfo?.profile || {};
          const [firstName, lastName] = (() => {
            if (profile.given_name || profile.first_name) {
              return [
                profile.given_name || profile.first_name,
                profile.family_name || profile.last_name || ""
              ];
            }
            const parts = (user.displayName || "").split(" ");
            return [parts[0] || "", parts.slice(1).join(" ")];
          })();

          await addDoc(usersRef, {
            user_email: email,
            first_name: firstName,
            last_name: lastName,
            authProvider: provider.providerId,
            user_tasks: [],
            user_todo: [],
            user_doing: [],
            user_done: []
          });
        }

        // 5) All good → redirect
        return this.$router.push({ name: "home" });
      } catch (err) {
        this.error = err.message;
      }
    },

    loginWithGoogle() {
      this.handleOAuthLogin(new GoogleAuthProvider());
    },

    loginWithFacebook() {
      this.handleOAuthLogin(new FacebookAuthProvider());
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 360px;
  margin: 4rem auto;
  padding: 2rem;
  border: 1px solid #eee;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}
.btn {
  display: block;
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
.google {
  background: #fff;
  color: #444;
  border: 1px solid #ddd;
}
.facebook {
  background: #1877f2;
  color: #fff;
}
.btn:hover {
  opacity: 0.9;
}
.error {
  margin-top: 1rem;
  color: #d00;
}
</style>
