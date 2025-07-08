import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/',
        name: 'LoginPage',
        component: () => import('pages/loginPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'outgoing',
        name: 'outgoing',
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'incoming',
        name: 'Incoming',
        component: () => import('pages/IncomingDocuments.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    name: 'NotFound',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { requiresAuth: false },
  },
];

export default routes;
// import { signOut } from 'firebase/auth';
// import { auth } from 'boot/firebase';

// signOut(auth);
