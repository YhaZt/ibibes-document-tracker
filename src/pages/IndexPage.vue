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
            <!-- Edit Button (existing) -->
            <q-btn
              size="sm"
              color="primary"
              flat
              round
              @click="openEditDialog(props.row, props.rowIndex)"
              class="q-ml-xs"
            >
              <!-- Use default slot for custom SVG icon -->
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 100 100">
                <path
                  d="M19.434,93.975c-5.265,0-9.548-4.283-9.548-9.548V27.523c0-5.265,4.283-9.548,9.548-9.548h47.639l5.46-5.461 c1.562-1.561,3.753-2.456,6.012-2.456c2.261,0,4.452,0.896,6.012,2.458l7.068,7.068c1.604,1.604,2.489,3.739,2.489,6.011 c0,2.271-0.885,4.406-2.489,6.011l-5.738,5.738v47.082c0,5.265-4.283,9.548-9.549,9.548H19.434z"
                  opacity=".35"
                ></path>
                <path
                  fill="#f2f2f2"
                  d="M17.434,91.975c-5.265,0-9.548-4.283-9.548-9.548V25.523c0-5.265,4.283-9.548,9.548-9.548h47.639 l5.46-5.461c1.562-1.561,3.753-2.456,6.012-2.456c2.261,0,4.452,0.896,6.012,2.458l7.068,7.068 c1.604,1.604,2.489,3.739,2.489,6.011c0,2.271-0.885,4.406-2.489,6.011l-5.738,5.738v47.082c0,5.265-4.283,9.548-9.549,9.548 H17.434z"
                ></path>
                <path
                  fill="#d9eeff"
                  d="M74.337,85.475H17.434c-1.684,0-3.048-1.365-3.048-3.048V25.524c0-1.684,1.365-3.048,3.048-3.048 h56.903c1.684,0,3.048,1.365,3.048,3.048v56.903C77.386,84.11,76.021,85.475,74.337,85.475z"
                ></path>
                <rect
                  width="11.195"
                  height="9"
                  x="71.653"
                  y="18.389"
                  fill="#f4665c"
                  transform="rotate(45.001 77.251 22.888)"
                ></rect>
                <rect
                  width="10.969"
                  height="39.647"
                  x="52.903"
                  y="21.928"
                  fill="#f9b84f"
                  transform="rotate(45.001 58.388 41.751)"
                ></rect>
                <rect
                  width="11.014"
                  height="4"
                  x="68.312"
                  y="24.32"
                  fill="#9aa2e6"
                  transform="rotate(45.001 73.82 26.32)"
                ></rect>
                <polygon
                  fill="#fedeb3"
                  points="38.006,62.133 40.492,51.891 48.248,59.647"
                ></polygon>
                <path
                  fill="#40396e"
                  d="M74.337,86.975H17.434c-2.508,0-4.548-2.041-4.548-4.548V25.523c0-2.508,2.04-4.548,4.548-4.548 h49.71l6.925-6.925c1.323-1.322,3.63-1.321,4.949,0l7.071,7.071c1.365,1.365,1.365,3.585,0,4.95l-7.203,7.203v49.153 C78.886,84.935,76.845,86.975,74.337,86.975z M17.434,23.975c-0.854,0-1.548,0.695-1.548,1.548v56.903 c0,0.854,0.694,1.548,1.548,1.548h56.903c0.854,0,1.549-0.694,1.549-1.548V32.653c0-0.398,0.158-0.779,0.439-1.061l7.643-7.643 c0.195-0.195,0.195-0.512,0-0.708l-7.071-7.071c-0.127-0.127-0.275-0.146-0.354-0.146c-0.077,0-0.227,0.019-0.354,0.146 l-7.364,7.364c-0.281,0.281-0.663,0.439-1.061,0.439H17.434z"
                ></path>
                <polygon fill="#40396e" points="39.44,56.227 38.006,62.133 43.912,60.7"></polygon>
              </svg>
            </q-btn>
            <!-- Office Update Button (new) -->
            <q-btn
              size="sm"
              color="secondary"
              flat
              round
              @click="openOfficeUpdateDialog(props.row)"
              class="q-ml-xs"
            >
              <!-- Use your SVG icon here -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="22"
                height="22"
                viewBox="0 0 40 40"
              >
                <rect width="3" height="6" x="27.5" y="12.5" fill="#bae0bd"></rect>
                <path fill="#5e9c76" d="M31,19h-4v-7h4V19z M28,18h2v-5h-2V18z"></path>
                <rect width="3" height="10" x="30.5" y="8.5" fill="#8bb7f0"></rect>
                <path fill="#4e7ab5" d="M34,19h-4V8h4V19z M31,18h2V9h-2V18z"></path>
                <rect width="3" height="8" x="33.5" y="10.5" fill="#f78f8f"></rect>
                <path fill="#c74343" d="M37,19h-4v-9h4V19z M34,18h2v-7h-2V18z"></path>
                <rect width="4" height="3.947" x="11.5" y="13.84" fill="#b0c1d4"></rect>
                <path
                  fill="#66798f"
                  d="M16,18.287h-5V13.34h5V18.287z M12,17.287h3V14.34h-3V17.287z"
                ></path>
                <rect width="9" height="1" x="9" y="17" fill="#66798f"></rect>
                <rect width="20" height="12" x="3.5" y="2.5" fill="#c2e8ff"></rect>
                <path fill="#66798f" d="M24,15H3V2h21V15z M4,14h19V3H4V14z"></path>
                <rect width="18" height="5" x="5.5" y="20.5" fill="#dbb065"></rect>
                <path fill="#967a44" d="M24,26H5v-6h19V26z M6,25h17v-4H6V25z"></path>
                <rect width="13" height="18" x="23.5" y="20.5" fill="#f5ce85"></rect>
                <path fill="#967a44" d="M37,39H23V20h14V39z M24,38h12V21H24V38z"></path>
                <rect width="37" height="2" x="1.5" y="18.5" fill="#f5ce85"></rect>
                <path fill="#967a44" d="M39,21H1v-3h38V21z M2,20h36v-1H2V20z"></path>
                <path fill="#66798f" d="M3.5,13v1.5h20V13H3.5z"></path>
                <rect width="2" height="18" x="3.5" y="20.5" fill="#f5ce85"></rect>
                <path fill="#967a44" d="M6,39H3V20h3V39z M4,38h1V21H4V38z"></path>
                <rect width="4" height="1" x="28" y="33.5" fill="#967a44"></rect>
                <rect width="4" height="1" x="28" y="24.5" fill="#967a44"></rect>
                <rect width="13" height="1" x="23.5" y="29" fill="#967a44"></rect>
              </svg>
            </q-btn>
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
  <q-dialog v-model="showOfficeUpdateDialog">
    <q-card style="min-width: 350px; max-width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Office Update</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit.prevent="saveOfficeUpdate">
          <q-input
            v-model="officeUpdateForm.officeName"
            label="Office Name"
            dense
            outlined
            class="q-mb-md"
            required
          />
          <q-input
            v-model="officeUpdateForm.receivingPersonnel"
            label="Receiving Personnel"
            dense
            outlined
            class="q-mb-md"
            required
          />
          <q-input
            v-model="officeUpdateForm.date"
            label="Date"
            dense
            outlined
            class="q-mb-md"
            type="date"
            required
          />
          <div class="q-mb-md">
            <label class="q-mb-xs">Image</label>
            <q-btn
              color="primary"
              outline
              icon="photo_library"
              label="Select Image"
              @click="officeUpdateImageInput?.click()"
              class="q-ml-sm"
            />
            <input
              ref="officeUpdateImageInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onOfficeUpdateImageSelected"
            />
            <div v-if="officeUpdateForm.imageFile" class="q-mt-sm text-grey-6">
              Selected: {{ officeUpdateForm.imageFile.name }}
            </div>
          </div>
          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="Cancel" color="grey-7" v-close-popup />
            <q-btn
              type="submit"
              color="primary"
              label="Save"
              :disable="
                !officeUpdateForm.officeName ||
                !officeUpdateForm.receivingPersonnel ||
                !officeUpdateForm.date
              "
            />
          </div>
        </q-form>
      </q-card-section>
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
  doc,
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
const officeUpdateImageInput = ref<HTMLInputElement>();

// Types
interface DocumentRow {
  id?: string;
  particular: string;
  date: string;
  receivingOffice: string;
  receivingPersonnel: string;
  imageUrl?: string;
}
interface FormRow extends DocumentRow {
  imageFile: File | null;
}
interface OfficeUpdateRow {
  officeName: string;
  receivingPersonnel: string;
  date: string;
  imageFile: File | null;
  imageUrl?: string;
  data_id: string;
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
const showOfficeUpdateDialog = ref(false);
const officeUpdateForm = ref<OfficeUpdateRow>({
  officeName: '',
  receivingPersonnel: '',
  date: '',
  imageFile: null,
  imageUrl: '',
  data_id: '',
});
const editIndex = ref<number | null>(null);
function openOfficeUpdateDialog(row: DocumentRow) {
  officeUpdateForm.value = {
    officeName: '',
    receivingPersonnel: '',
    date: '',
    imageFile: null,
    imageUrl: '',
    data_id: row.id || '',
  };
  showOfficeUpdateDialog.value = true;
}
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
  if (!row || !row.id) return;

  isSaving.value = true;
  if ($q && $q.loading && typeof $q.loading.show === 'function') {
    $q.loading.show({
      message: 'Saving changes...',
      spinner: QSpinnerCube,
      spinnerColor: 'primary',
      backgroundColor: 'white',
      customClass: 'q-pa-xl',
    });
  }

  try {
    if (navigator.onLine) {
      const docRef = doc(db, 'outgoingDocuments', row.id);
      await updateDoc(docRef, {
        particular: editForm.value.particular,
        date: Timestamp.fromDate(new Date(editForm.value.date)),
        receivingOffice: editForm.value.receivingOffice,
        receivingPersonnel: editForm.value.receivingPersonnel,
      });
      await fetchFirestoreData(auth.currentUser?.uid || '');
    } else {
      rows.value[editIndex.value] = {
        ...editForm.value,
        id: row.id,
        imageUrl: editForm.value.imageUrl ?? '',
      };
      await idbSet('offlineDocuments', JSON.parse(JSON.stringify(rows.value)));
    }
    showEditDialog.value = false;
    toastr.success('Document updated!');
  } catch (error) {
    toastr.error('Failed to update document.');
    console.error(error);
  } finally {
    if ($q && $q.loading && typeof $q.loading.hide === 'function') {
      $q.loading.hide();
    }
    isSaving.value = false;
  }
}
window.addEventListener('online', () => {
  void handleOnline();
});
async function handleOnline() {
  isOnline.value = true;
  toastr.info('Back online. Syncing and refreshing data...');
  let user = auth.currentUser;
  if (!user) {
    await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        if (u) {
          user = u;
          unsubscribe();
          resolve(u);
        }
      });
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
        id: doc.id,
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
  { name: 'actions', label: 'Actions', align: 'center' as const, field: '' },
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

function onOfficeUpdateImageSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    officeUpdateForm.value.imageFile = files[0] || null;
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

async function saveOfficeUpdate() {
  isSaving.value = true;
  try {
    let updateNum = 1;
    let collectionName = `${updateNum}_office_update`;

    while (true) {
      const qSnap = await getDocs(
        query(
          collection(db, collectionName),
          where('data_id', '==', officeUpdateForm.value.data_id),
        ),
      );
      if (qSnap.empty) {
        break;
      }
      updateNum++;
      collectionName = `${updateNum}_office_update`;
    }

    let imageUrl = '';
    if (officeUpdateForm.value.imageFile) {
      try {
        if ($q && $q.loading) {
          $q.loading.show({ message: 'Uploading image...', spinner: QSpinnerCube });
        }
        imageUrl = await uploadToCloudinary(officeUpdateForm.value.imageFile);
      } catch {
        if (navigator.onLine) {
          toastr.error('Image upload failed. Please try again.');
          if ($q && $q.loading) $q.loading.hide();
          isSaving.value = false;
          return; // Don't save base64 if online
        } else {
          toastr.warning('Cloud upload failed. Saving image locally.');
          imageUrl = await fileToBase64(officeUpdateForm.value.imageFile);
        }
      } finally {
        if ($q && $q.loading) $q.loading.hide();
      }
    }

    if ($q && $q.loading) {
      $q.loading.show({
        message: 'Saving office update...',
        spinner: QSpinnerCube,
        spinnerColor: 'primary',
        backgroundColor: 'white',
        customClass: 'q-pa-xl',
      });
    }

    await addDoc(collection(db, collectionName), {
      officeName: officeUpdateForm.value.officeName,
      receivingPersonnel: officeUpdateForm.value.receivingPersonnel,
      date: Timestamp.fromDate(new Date(officeUpdateForm.value.date)),
      imageUrl,
      data_id: officeUpdateForm.value.data_id,
      created_at: Timestamp.now(),
    });

    toastr.success('Office update saved!');
    showOfficeUpdateDialog.value = false;
  } catch (error) {
    toastr.error('Failed to save office update.');
    console.error(error);
  } finally {
    if ($q && $q.loading) $q.loading.hide();
    isSaving.value = false;
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
