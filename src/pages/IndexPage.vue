<template>
  <q-page class="q-pa-md bg-grey-2 flex flex-center">
    <q-banner v-if="!isOnline" class="bg-red-2 text-red-8 q-mb-md" rounded>
      <q-icon name="wifi_off" class="q-mr-sm" /> You are offline. Changes will be saved locally and
      synced when online.
    </q-banner>
    <q-dialog v-model="isSaving" persistent>
      <q-card class="q-pa-lg flex flex-center bg-white" style="min-width: 200px">
        <q-spinner-ball color="red" size="50px" />
        <div class="q-mt-sm text-body2">Saving...</div>
      </q-card>
    </q-dialog>
    <q-card class="outgoing-card q-pa-lg q-mt-xl">
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
            <div class="text-h5 text-weight-bold text-dark">OUTGOING</div>
            <div class="text-grey-6 text-body2">Track outgoing documents efficiently</div>
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
        :rows-per-page-options="[5, 10, 20, 50]"
        :pagination="pagination"
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

        <template v-slot:body-cell-actions="props">
          <q-td align="center">
            <q-btn
              size="sm"
              color="primary"
              icon="edit"
              flat
              round
              @click="openEditDialog(props.row, props.rowIndex)"
            />
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
          <div class="text-h6">Add Outgoing Document</div>
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
            <div class="q-mb-md">
              <label class="q-mb-sm">Supporting Image</label>
              <div class="row q-gutter-sm">
                <q-btn
                  color="primary"
                  outline
                  icon="photo_camera"
                  label="Camera"
                  @click="openCamera"
                  class="col"
                />
                <q-btn
                  color="primary"
                  outline
                  icon="photo_library"
                  label="Gallery"
                  @click="openGallery"
                  class="col"
                />
              </div>
              <div v-if="form.imageFile" class="q-mt-sm text-grey-6">
                Selected: {{ form.imageFile.name }}
              </div>
              <!-- Hidden file inputs -->
              <input
                ref="cameraInput"
                type="file"
                accept="image/*"
                capture="environment"
                style="display: none"
                @change="onCameraFileSelected"
              />
              <input
                ref="galleryInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="onGalleryFileSelected"
              />
            </div>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Cancel" color="grey-7" v-close-popup />
              <q-btn
                type="submit"
                color="primary"
                label="Add"
                :disable="
                  isSubmitting ||
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
  <q-dialog v-model="showEditDialog">
    <q-card style="min-width: 350px; max-width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Edit Outgoing Document</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit.prevent="saveEdit">
          <q-input
            v-model="editForm.particular"
            label="Particular"
            dense
            outlined
            class="q-mb-md"
            required
            autofocus
          />
          <q-input
            v-model="editForm.date"
            label="Date"
            dense
            outlined
            class="q-mb-md"
            type="date"
            required
          />
          <q-input
            v-model="editForm.receivingOffice"
            label="Receiving Office"
            dense
            outlined
            class="q-mb-md"
            required
          />
          <q-input
            v-model="editForm.receivingPersonnel"
            label="Receiving Personnel"
            dense
            outlined
            class="q-mb-md"
            required
          />
          <!-- Optionally add image editing here -->
          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="Cancel" color="grey-7" v-close-popup />
            <q-btn type="submit" color="primary" label="Save" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
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
        <div v-if="previewImageUrl" class="q-mt-sm text-caption text-white">
          URL: {{ previewImageUrl }}
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { db, auth } from 'boot/firebase';
import {
  collection,
  getDocs,
  query,
  addDoc,
  Timestamp,
  where,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { uploadToCloudinary } from 'boot/cloudinaryUpload';
import { useRouter } from 'vue-router';
import { onAuthStateChanged } from 'firebase/auth';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import { idbGet, idbSet, idbRemove } from 'boot/idb';
import { useQuasar, QSpinnerCube } from 'quasar';

const $q = useQuasar();
const isSaving = ref(false);
const isSubmitting = ref(false);
toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: 'toast-bottom-right',
};

const router = useRouter();

const activeTab = ref('outgoing');
const search = ref('');
const showAddDialog = ref(false);
const showEditDialog = ref(false);
const showImagePreview = ref(false);
const previewImageUrl = ref('');
const cameraInput = ref<HTMLInputElement>();
const galleryInput = ref<HTMLInputElement>();

// Types
interface DocumentRow {
  particular: string;
  date: string;
  receivingOffice: string;
  receivingPersonnel: string;
  imageUrl?: string;
}
interface FormRow extends DocumentRow {
  imageFile: File | null;
}

// State
const form = ref<FormRow>({
  particular: '',
  date: '',
  receivingOffice: '',
  receivingPersonnel: '',
  imageUrl: '',
  imageFile: null,
});
const editForm = ref<FormRow>({
  particular: '',
  date: '',
  receivingOffice: '',
  receivingPersonnel: '',
  imageUrl: '',
  imageFile: null,
});
const editIndex = ref<number | null>(null);

const pagination = ref({
  page: 1,
  rowsPerPage: 5,
});
const rows = ref<DocumentRow[]>([]);
const offlineQueueKey = 'offlineOutgoingQueue';
const isOnline = ref(navigator.onLine);

// Edit dialog logic
function openEditDialog(row: DocumentRow, index: number) {
  editForm.value = { ...row, imageFile: null }; // imageFile is not edited here
  editIndex.value = index;
  showEditDialog.value = true;
}

async function saveEdit() {
  if (editIndex.value === null) return;
  const row = rows.value[editIndex.value];
  if (!row) return;

  // Update Firestore if online
  if (navigator.onLine) {
    const snapshot = await getDocs(
      query(
        collection(db, 'outgoingDocuments'),
        where('uid', '==', auth.currentUser?.uid || ''),

        where('particular', '==', row.particular),
        where('date', '==', row.date),
        where('receivingOffice', '==', row.receivingOffice),
      ),
    );
    for (const docSnap of snapshot.docs) {
      await updateDoc(docSnap.ref, {
        particular: editForm.value.particular,
        date: editForm.value.date,
        receivingOffice: editForm.value.receivingOffice,
        receivingPersonnel: editForm.value.receivingPersonnel,
        // imageUrl: editForm.value.imageUrl, // add if you want to edit image
      });
    }
  }
  // Update local rows
  rows.value[editIndex.value] = {
    particular: editForm.value.particular,
    date: editForm.value.date,
    receivingOffice: editForm.value.receivingOffice,
    receivingPersonnel: editForm.value.receivingPersonnel,
    imageUrl: editForm.value.imageUrl ?? '', // ensure string, not undefined
  };
  showEditDialog.value = false;
  toastr.success('Document updated!');
}

// ✅ Fix ESLint - Async wrapper for 'online' event
window.addEventListener('online', () => {
  void handleOnline();
});
async function handleOnline() {
  isOnline.value = true;
  toastr.info('Back online. Syncing and refreshing data...');
  // Wait for Firebase Auth to be ready
  let user = auth.currentUser;
  if (!user) {
    // Wait for onAuthStateChanged to fire
    await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        if (u) {
          user = u;
          unsubscribe();
          resolve(u);
        }
      });
      // Fallback: resolve after 3 seconds even if no user
      setTimeout(() => {
        unsubscribe();
        resolve(null);
      }, 3000);
    });
  }
  if (user) {
    await syncOfflineDocuments();
    await fetchFirestoreData(user.uid);
  } else {
    toastr.error('Not authenticated. Cannot sync offline documents.');
    console.warn('No authenticated user when coming online, skipping sync.');
  }
}

// Offline event (sync)
window.addEventListener('offline', () => {
  isOnline.value = false;
  toastr.warning('You are now offline. Changes will be saved locally.');
});

const handleTabChange = async (value: string) => {
  if (value === 'incoming') {
    await router.push({ name: 'Incoming' });
  }
};

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    void (async () => {
      if (!user) {
        rows.value = [];
        return;
      }
      isOnline.value = navigator.onLine;
      if (navigator.onLine) {
        await syncOfflineDocuments();
        await fetchFirestoreData(user.uid);
      } else {
        const cached = await idbGet<DocumentRow[]>('offlineDocuments');
        if (cached) {
          rows.value = cached;
        }
      }
    })();
  });
});

async function fetchFirestoreData(uid: string) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'outgoingDocuments'),
        where('uid', '==', uid),
        orderBy('created_at', 'asc'),
      ),
    );

    if (snapshot.empty) {
      console.warn('⚠️ No documents found for UID:', uid);
    }

    const results: DocumentRow[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        particular: data.particular || '',
        date:
          data.date && typeof data.date.toDate === 'function'
            ? data.date.toDate().toISOString().split('T')[0]
            : '',
        receivingOffice: data.receivingOffice || '',
        receivingPersonnel: data.receivingPersonnel || '',
        imageUrl: data.imageUrl || '',
      });
    });

    rows.value = results;
    await idbSet('offlineDocuments', results);
  } catch (error) {
    console.error('❌ Error fetching Firestore data:', error);
    toastr.error('Failed to fetch documents from Firestore.');
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

async function syncOfflineDocuments() {
  if (!($q && $q.loading && typeof $q.loading.show === 'function')) {
    console.error('Quasar $q.loading is not available!');
    return;
  }

  $q.loading.show({ spinner: QSpinnerCube, message: 'Syncing offline documents...' });

  const queue = (await idbGet<DocumentRow[]>(offlineQueueKey)) || [];
  if (queue.length === 0) {
    $q.loading.hide();
    return;
  }

  const syncedDocs = [];
  let syncError = false;

  for (const doc of queue) {
    try {
      let finalImageUrl = doc.imageUrl;

      if (doc.imageUrl && doc.imageUrl.startsWith('data:image')) {
        const response = await fetch(doc.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });
        finalImageUrl = await uploadToCloudinary(file);
      }

      await addDoc(collection(db, 'outgoingDocuments'), {
        ...doc,
        imageUrl: finalImageUrl,
        uid: auth.currentUser?.uid || null,
        date: Timestamp.fromDate(new Date(doc.date)),
        created_at: Timestamp.now(), // ✅ Added created_at field
      });

      syncedDocs.push({ ...doc, imageUrl: finalImageUrl });
    } catch (e) {
      syncError = true;
      console.error('Sync failed:', e);
      toastr.error('Sync failed for a document.');
    }
  }

  const user = auth.currentUser;
  if (user) await fetchFirestoreData(user.uid);

  await idbRemove(offlineQueueKey);
  $q.loading.hide();

  if (!syncError) {
    toastr.success('Offline documents synced to the cloud!');
  }
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
  { name: 'actions', label: 'Actions', align: 'center' as const, field: '' }, // <-- Add this
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

function openCamera() {
  cameraInput.value?.click();
}

function openGallery() {
  galleryInput.value?.click();
}

function onCameraFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    form.value.imageFile = files[0] || null;
  }
}

function onGalleryFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    form.value.imageFile = files[0] || null;
  }
}

async function addDocument() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  isSaving.value = true;
  try {
    if ($q && $q.loading) {
      $q.loading.show({
        message: 'Adding Outgoing Document...',
        spinner: QSpinnerCube,
        spinnerColor: 'primary',
        backgroundColor: 'white',
        customClass: 'q-pa-xl',
      });
    }

    let imageUrl = '';

    const duplicate = rows.value.some(
      (row) =>
        row.particular === form.value.particular &&
        row.date === form.value.date &&
        row.receivingOffice === form.value.receivingOffice,
    );
    if (duplicate) {
      toastr.warning('Duplicate document. Not saved.');
      $q.loading.hide();
      return;
    }

    if (form.value.imageFile) {
      if (navigator.onLine) {
        try {
          imageUrl = await uploadToCloudinary(form.value.imageFile);
        } catch (uploadError) {
          console.warn('Cloud upload failed. Falling back to base64.', uploadError);
          imageUrl = await fileToBase64(form.value.imageFile);
        }
      } else {
        if (form.value.imageFile.size > 10 * 1024 * 1024) {
          toastr.warning('Image too large to store offline.');
          $q.loading.hide();
          return;
        }
        imageUrl = await fileToBase64(form.value.imageFile);
      }
    }

    const newDoc: DocumentRow = {
      particular: form.value.particular,
      date: form.value.date,
      receivingOffice: form.value.receivingOffice,
      receivingPersonnel: form.value.receivingPersonnel,
      imageUrl,
    };

    if (!navigator.onLine) {
      const offlineQueue = (await idbGet<DocumentRow[]>(offlineQueueKey)) || [];
      const queueDuplicate = offlineQueue.some(
        (row) =>
          row.particular === newDoc.particular &&
          row.date === newDoc.date &&
          row.receivingOffice === newDoc.receivingOffice,
      );
      if (queueDuplicate) {
        toastr.warning('Duplicate document in offline queue. Not saved.');
        $q.loading.hide();
        return;
      }
      offlineQueue.push(newDoc);
      await idbSet(offlineQueueKey, JSON.parse(JSON.stringify(offlineQueue)));
    }

    rows.value.unshift(newDoc);
    await idbSet('offlineDocuments', JSON.parse(JSON.stringify(rows.value)));

    if (navigator.onLine) {
      try {
        await addDoc(collection(db, 'outgoingDocuments'), {
          ...newDoc,
          uid: auth.currentUser?.uid || null,
          date: Timestamp.fromDate(new Date(form.value.date)),
          created_at: Timestamp.now(), // ✅ Added created_at field
        });
        await fetchFirestoreData(auth.currentUser?.uid || '');
      } catch {
        toastr.error('Failed to save online. Saved locally.');
      }
    } else {
      const queue = (await idbGet<DocumentRow[]>(offlineQueueKey)) || [];
      queue.push(newDoc);
      await idbSet(offlineQueueKey, JSON.parse(JSON.stringify(queue)));
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
    $q.loading.hide();
  } catch (error) {
    console.error('Add error:', error);
    toastr.error('Failed to add document.');
  } finally {
    isSaving.value = false;
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.btn-toggle {
  border-radius: 8px;
  background-color: #e3f2fd;
  padding: 4px;
  max-width: 300px;
}

.outgoing-card {
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
