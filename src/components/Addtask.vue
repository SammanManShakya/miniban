<template>
  <div class="popup-backdrop" @click.self="close">
    <div class="popup">
      <h3>New Task</h3>
      <label>
        Title
        <input v-model="title" placeholder="Task title" />
      </label>

      <div v-for="(d, i) in details" :key="i" class="detail-input">
        <input
          v-model="details[i]"
          placeholder="Detail"
        />
      </div>
      <button class="btn add-detail" @click="addDetail">
        + Details
      </button>

      <div class="actions">
        <button class="btn cancel" @click="close">Cancel</button>
        <button class="btn submit" @click="submit" :disabled="!title">
          Add task
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['add-task','close'])

const title   = ref('')
const details = ref([''])

function addDetail() {
  details.value.push('')
}

function submit() {
  // filter out empty details
  const filteredDetails = details.value.filter(d => d.trim() !== '')

  // create timestamp
  const now = new Date().toISOString()

  // pack task data
  const task = {
    title: title.value.trim(),
    details: filteredDetails,
    created: now,
    finished: null
  }

  emit('add-task', task)
  emit('close')
}

function close() {
  emit('close')
}
</script>

<style scoped>
.popup-backdrop {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 10;
}
.popup {
  background: white;
  color: #000;               /* ensure text is black */
  padding: 1.5rem;
  border-radius: 8px;
  width: 300px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.popup h3 {
  margin-top: 0;
}
.popup label {
  display: block;
  margin-bottom: 1rem;
  color: #000;               /* ensure label text is black */
}
.popup input {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #000;               /* input text black */
}
.detail-input {
  margin-bottom: 0.5rem;
}
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.add-detail {
  background: #3182ce;
  color: #fff;
  margin-bottom: 1rem;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.cancel {
  background: #a0aec0; color: white;
}
.submit {
  background: #38a169; color: white;
}
.submit:disabled {
  opacity: 0.6; cursor: not-allowed;
}
</style>
