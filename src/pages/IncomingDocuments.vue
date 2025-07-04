<template>
  <q-page class="q-pa-md bg-grey-2 flex flex-center">
    <q-card class="incoming-card q-pa-lg q-mt-xl">
      <div class="row justify-center q-mb-md">
        <q-btn-toggle
          v-model="activeTab"
          unelevated
          toggle-color="primary"
          text-color="primary"
          class="btn-toggle"
          :options="[
            { label: 'OUTGOING', value: 'outgoing' },
            { label: 'INCOMING', value: 'incoming' },
          ]"
          @update:model-value="handleTabChange"
        />
      </div>

      <div class="row items-center q-mb-md justify-between">
        <div class="row items-center">
          <div class="accent-bar q-mr-md"></div>
          <div>
            <div class="text-h5 text-weight-bold text-dark">INCOMING</div>
            <div class="text-grey-6 text-body2">Track incoming documents efficiently</div>
          </div>
        </div>
        <q-btn
          color="primary"
          icon="add"
          label="Add"
          class="add-btn"
          @click="showAddDialog = true"
        />
      </div>
      <div class="row q-col-gutter-sm items-center q-mb-md">
        <div class="col-12 col-sm-6">
          <q-input
            dense
            outlined
            debounce="300"
            v-model="search"
            placeholder="Search Particular, Office, or Personnel..."
            clearable
            class="ant-input"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </div>
      <q-table
        flat
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        dense
        class="ant-table q-mb-none"
        :rows-per-page-options="[5, 10, 20]"
        :pagination="{ rowsPerPage: 5 }"
        hide-bottom
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="ant-table-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="ant-table-th">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body-cell-index="props">
          <q-td class="text-grey-8 text-weight-bold">
            {{ props.rowIndex + 1 }}
          </q-td>
        </template>

        <template v-slot:body-cell-date="props">
          <q-td>
            <q-chip color="primary" text-color="white" dense class="ant-chip">
              {{ props.row.date }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-receivingPersonnel="props">
          <q-td>
            <q-chip color="secondary" text-color="white" dense class="ant-chip" icon="person">
              {{ props.row.receivingPersonnel }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-imageUrl="props">
          <q-td>
            <div
              v-if="props.row.imageUrl"
              style="
                width: 50px;
                height: 50px;
                overflow: hidden;
                border-radius: 8px;
                cursor: pointer;
              "
              @click="openImagePreview(props.row.imageUrl)"
            >
              <img
                :src="props.row.imageUrl"
                alt="preview"
                style="width: 100%; height: 100%; object-fit: cover"
                :title="props.row.imageUrl"
              />
            </div>
            <span v-else class="text-grey-5">No image</span>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <q-icon size="2em" name="sentiment_dissatisfied" color="grey-5" />
            <span class="text-grey-6">No documents found</span>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Add Dialog -->
    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 350px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Add Incoming Document</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form @submit.prevent="addDocument">
            <q-input
              v-model="form.particular"
              label="Particular"
              dense
              outlined
              class="q-mb-md"
              required
              autofocus
            />
            <q-input
              v-model="form.date"
              label="Date"
              dense
              outlined
              class="q-mb-md"
              type="date"
              required
            />
            <q-input
              v-model="form.receivingOffice"
              label="Receiving Office"
              dense
              outlined
              class="q-mb-md"
              required
            />
            <q-input
              v-model="form.receivingPersonnel"
              label="Receiving Personnel"
              dense
              outlined
              class="q-mb-md"
              required
            />
            <q-uploader
              label="Supporting Image"
              flat
              accept="image/*"
              max-files="1"
              @added="onFileSelected"
              class="q-mb-md"
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Cancel" color="grey-7" v-close-popup />
              <q-btn
                type="submit"
                color="primary"
                label="Add"
                :disable="
                  !form.particular ||
                  !form.date ||
                  !form.receivingOffice ||
                  !form.receivingPersonnel
                "
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
  <q-dialog v-model="showImagePreview">
    <q-card style="max-width: 90vw; max-height: 90vh; position: relative">
      <q-btn
        icon="close"
        color="yellow"
        flat
        round
        dense
        @click="showImagePreview = false"
        style="position: absolute; top: 10px; right: 10px; z-index: 1"
      />
      <div class="q-pa-md">
        <div v-if="!previewImageUrl" class="text-negative">No image to preview</div>
        <q-img
          v-else
          :src="previewImageUrl"
          style="max-width: 100%; max-height: 100%"
          @error="() => toastr.error('Failed to load image.')"
        />
        <div v-if="previewImageUrl" class="q-mt-sm text-caption text-grey-7">
          URL: {{ previewImageUrl }}
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { db, auth } from 'boot/firebase';
import { collection, getDocs, query, addDoc, Timestamp, where } from 'firebase/firestore';

import { uploadToCloudinary } from 'boot/cloudinaryUpload';
import { useRouter } from 'vue-router';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: 'toast-bottom-right',
};
const router = useRouter();

const activeTab = ref('incoming');
const search = ref('');
const showAddDialog = ref(false);
const showImagePreview = ref(false);
const previewImageUrl = ref('');

const form = ref({
  particular: '',
  date: '',
  receivingOffice: '',
  receivingPersonnel: '',
  imageFile: null as File | null,
});

interface DocumentRow {
  particular: string;
  date: string;
  receivingOffice: string;
  receivingPersonnel: string;
  imageUrl?: string;
}

const rows = ref<DocumentRow[]>([]);
const offlineQueueKey = 'offlineDocumentsQueue';

const handleTabChange = async (value: string) => {
  if (value === 'outgoing') {
    await router.push({ name: 'outgoing' });
  }
};
onMounted(async () => {
  const currentUser = await new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (!user) {
        void router.push({ name: 'LoginPage' });
      }
      resolve(user);
    });
  });

  // Stop further execution if user is null
  if (!currentUser) return;

  if (navigator.onLine) {
    await syncOfflineDocuments();

    const qSnap = await getDocs(
      query(collection(db, 'incomingDocuments'), where('uid', '==', currentUser.uid)),
    );

    rows.value = qSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        particular: data.particular,
        date: data.date.toDate().toISOString().split('T')[0],
        receivingOffice: data.receivingOffice,
        receivingPersonnel: data.receivingPersonnel,
        imageUrl: data.imageUrl || '',
      };
    });

    localStorage.setItem('offlineDocuments', JSON.stringify(rows.value));
  } else {
    const cached = localStorage.getItem('offlineDocuments');
    if (cached) {
      rows.value = JSON.parse(cached);
    }
  }
});

// Sync offline documents
window.addEventListener('online', () => {
  void syncOfflineDocuments();
});

async function syncOfflineDocuments() {
  const queue = JSON.parse(localStorage.getItem(offlineQueueKey) || '[]');
  if (queue.length === 0) return;

  for (const doc of queue) {
    try {
      await addDoc(collection(db, 'incomingDocuments'), {
        ...doc,
        uid: auth.currentUser?.uid || null,
        date: Timestamp.fromDate(new Date(doc.date)),
      });
    } catch (e) {
      console.error('Sync failed for doc:', doc, e);
      return;
    }
  }

  localStorage.removeItem(offlineQueueKey);
}

function openImagePreview(url: string) {
  previewImageUrl.value = url;
  showImagePreview.value = true;
}

const columns = [
  { name: 'index', label: 'No.', align: 'left' as const, field: '' },
  { name: 'particular', label: 'Particular', align: 'left' as const, field: 'particular' },
  { name: 'date', label: 'Date', align: 'left' as const, field: 'date' },
  {
    name: 'receivingOffice',
    label: 'Receiving Office',
    align: 'left' as const,
    field: 'receivingOffice',
  },
  {
    name: 'receivingPersonnel',
    label: 'Receiving Personnel',
    align: 'left' as const,
    field: 'receivingPersonnel',
  },
  { name: 'imageUrl', label: 'Supporting Image', align: 'left' as const, field: 'imageUrl' },
];

const filteredRows = computed(() => {
  const q = search.value.toLowerCase();
  return rows.value.filter(
    (row) =>
      row.particular.toLowerCase().includes(q) ||
      row.date.toLowerCase().includes(q) ||
      row.receivingOffice.toLowerCase().includes(q) ||
      row.receivingPersonnel.toLowerCase().includes(q),
  );
});

function onFileSelected(files: readonly File[]) {
  form.value.imageFile = files[0] || null;
}

async function addDocument() {
  try {
    let imageUrl = '';

    if (form.value.imageFile) {
      imageUrl = await uploadToCloudinary(form.value.imageFile);
    }

    const newDoc: DocumentRow = {
      particular: form.value.particular,
      date: form.value.date,
      receivingOffice: form.value.receivingOffice,
      receivingPersonnel: form.value.receivingPersonnel,
      imageUrl,
    };

    rows.value.unshift(newDoc);
    localStorage.setItem('offlineDocuments', JSON.stringify(rows.value));

    if (navigator.onLine) {
      await addDoc(collection(db, 'incomingDocuments'), {
        ...newDoc,
        uid: auth.currentUser?.uid || null,
        date: Timestamp.fromDate(new Date(form.value.date)),
      });
    } else {
      const queue = JSON.parse(localStorage.getItem(offlineQueueKey) || '[]');
      queue.push(newDoc);
      localStorage.setItem(offlineQueueKey, JSON.stringify(queue));
    }

    toastr.success('Document added!');

    showAddDialog.value = false;
    form.value = {
      particular: '',
      date: '',
      receivingOffice: '',
      receivingPersonnel: '',
      imageFile: null,
    };
  } catch (error) {
    toastr.error('Failed to add document. Check console.');
    console.error('Add error:', error);
  }
}
</script>

<style scoped>
.incoming-card {
  max-width: 900px;
  width: 100%;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.08);
  background: #fff;
}
.accent-bar {
  width: 6px;
  height: 48px;
  border-radius: 4px;
  background: linear-gradient(180deg, #1976d2 0%, #42a5f5 100%);
}
.add-btn {
  min-width: 110px;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(33, 150, 243, 0.08);
  letter-spacing: 0.5px;
}
.ant-input {
  border-radius: 8px;
  background: #f7f8fa;
  font-size: 15px;
}
.ant-table {
  border-radius: 12px;
  overflow: hidden;
  font-size: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}
.ant-table-header {
  background: #f0f2f5;
}
.ant-table-th {
  font-weight: 600;
  color: #222;
  font-size: 15px;
  border-bottom: 2px solid #e6e8eb;
  background: #f0f2f5;
}
.ant-table-row {
  transition: background 0.2s;
}
.ant-table-row:hover {
  background: #e6f7ff !important;
}
.ant-table-row-alt {
  background: #fafbfc;
}
.ant-chip {
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  padding: 0 10px;
}
</style>
