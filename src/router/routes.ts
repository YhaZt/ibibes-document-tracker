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
      },
      {
        path: 'outgoing',
        name: 'outgoing',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'incoming',
        name: 'Incoming',
        component: () => import('pages/IncomingDocuments.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    name: 'NotFound',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
// import { signOut } from 'firebase/auth';
// import { auth } from 'boot/firebase';

// signOut(auth);
