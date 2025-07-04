<template>
  <q-layout view="lHh Lpr fff" class="bg-grey-1">
    <q-header elevated class="bg-white text-grey-8" height-hint="64">
      <q-toolbar class="GPL__toolbar" style="height: 64px">
        <q-toolbar-title shrink class="row items-center no-wrap">
          <img src="~assets/ibibes.png" height="30" width="80" />
          <span class="q-ml-sm">MinSU i-BIBES Documents Tracker</span>
        </q-toolbar-title>

        <q-space />

        <!-- 👇 Logout Button -->
        <q-btn flat round dense icon="logout" @click="logout" color="red" class="q-ml-sm">
          <q-tooltip>Logout</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container class="GPL__page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import { auth } from 'boot/firebase';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const router = useRouter();

toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: 'toast-bottom-right',
};

async function logout() {
  try {
    await signOut(auth);
    toastr.info('You have been logged out.');
    await router.push({ name: 'LoginPage' });
  } catch (err: unknown) {
    toastr.error('Failed to logout.');
    console.error(err);
  }
}
</script>

<style lang="sass">
.GPL

  &__toolbar
    height: 64px

  &__toolbar-input
    width: 35%

  &__drawer-item
    line-height: 24px
    border-radius: 0 24px 24px 0
    margin-right: 12px

    .q-item__section--avatar
      padding-left: 12px
      .q-icon
        color: #5f6368

    .q-item__label:not(.q-item__label--caption)
      color: #3c4043
      letter-spacing: .01785714em
      font-size: .875rem
      font-weight: 500
      line-height: 1.25rem

    &--storage
      border-radius: 0
      margin-right: 0
      padding-top: 24px
      padding-bottom: 24px

  &__side-btn
    &__label
      font-size: 12px
      line-height: 24px
      letter-spacing: .01785714em
      font-weight: 500

  @media (min-width: 1024px)
    &__page-container
      padding-left: 94px
</style>
