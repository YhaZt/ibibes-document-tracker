<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="q-pa-xl" style="min-width: 300px">
      <div class="text-h6 text-center q-mb-lg">Login with Google</div>
      <q-btn
        color="primary"
        icon="login"
        label="Sign in with Google"
        @click="loginWithGoogle"
        class="full-width"
        :disable="!isOnline"
      />
      <div v-if="!isOnline" class="text-negative text-center q-mt-md">
        You are offline. Please connect to the internet to login.
      </div>
    </q-card>
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
</script>
