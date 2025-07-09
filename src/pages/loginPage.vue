<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="q-pa-xl" style="min-width: 300px">
      <div class="text-h6 text-center q-mb-lg">Login with Google</div>
      <q-btn
        color="primary"
        icon="login"
        label="Sign in with Google"
        @click="loginWithGoogle"
        class="full-width q-mb-md"
        :disable="!isOnline"
      />
      <q-btn
        color="secondary"
        icon="admin_panel_settings"
        label="Admin Login"
        @click="showAdminDialog = true"
        class="full-width"
      />
      <div v-if="!isOnline" class="text-negative text-center q-mt-md">
        You are offline. Please connect to the internet to login.
      </div>
    </q-card>
    <q-dialog v-model="showAdminDialog" persistent>
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Admin Login</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="adminCode"
            label="Enter Admin Code"
            type="password"
            autofocus
            @keyup.enter="loginAsAdmin"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn color="primary" label="Login" @click="loginAsAdmin" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from 'boot/firebase';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: 'toast-bottom-right',
};
const router = useRouter();
const isOnline = ref(navigator.onLine);

window.addEventListener('online', () => {
  isOnline.value = true;
});
window.addEventListener('offline', () => {
  isOnline.value = false;
});

// Admin login state
const showAdminDialog = ref(false);
const adminCode = ref('');

async function loginWithGoogle() {
  if (!isOnline.value) {
    toastr.error('You are offline. Please connect to the internet to login.', 'Offline');
    return;
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    toastr.success(`Welcome, ${user.displayName}`, 'Login Successful');
    await router.push({ name: 'outgoing' });
  } catch (err: unknown) {
    if (err instanceof Error) {
      toastr.error(err.message, 'Login Failed');
    } else {
      toastr.error('An unexpected error occurred.', 'Login Failed');
    }
  }
}

async function loginAsAdmin() {
  if (adminCode.value === '08152024') {
    localStorage.setItem('isAdmin', 'true');
    toastr.success('Admin login successful!');
    showAdminDialog.value = false;
    await router.push({ name: 'admin' }); // <-- change to your admin route name
  } else {
    toastr.error('Incorrect admin code.');
  }
}
</script>
