<template>
  <q-page class="q-pa-md bg-grey-2 flex flex-center">
    <q-card class="admin-card q-pa-lg q-mt-xl">
      <div class="row items-center q-mb-md justify-between">
        <div class="row items-center">
          <div class="accent-bar q-mr-md"></div>
          <div>
            <div class="text-h5 text-weight-bold text-dark">ADMIN VIEW</div>
            <div class="text-grey-6 text-body2">All Outgoing & Incoming Documents</div>
          </div>
        </div>
        <q-btn color="negative" icon="logout" label="Logout" class="add-btn" @click="logout" />
      </div>
      <q-tabs v-model="tab" dense class="text-primary q-mb-md">
        <q-tab name="outgoing" label="Outgoing" />
        <q-tab name="incoming" label="Incoming" />
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="outgoing">
          <q-table
            flat
            :rows="outgoingRows"
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
            <template v-slot:body="props">
              <q-tr
                :props="props"
                @click="toggleExpand(props.row, props.rowIndex)"
                style="cursor: pointer"
              >
                <q-td>
                  <q-icon :name="expandedRows[props.rowIndex] ? 'expand_less' : 'expand_more'" />
                </q-td>
                <q-td class="text-grey-8 text-weight-bold">
                  {{ props.rowIndex + 1 }}
                </q-td>
                <q-td>{{ props.row.particular }}</q-td>
                <q-td>
                  <q-chip color="primary" text-color="white" dense class="ant-chip">
                    {{ props.row.date }}
                  </q-chip>
                </q-td>
                <!-- ADD THIS MISSING COLUMN -->
                <q-td>
                  <q-chip color="info" text-color="white" dense class="ant-chip" icon="business">
                    {{ props.row.receivingOffice }}
                  </q-chip>
                </q-td>
                <q-td>
                  <q-chip color="secondary" text-color="white" dense class="ant-chip" icon="person">
                    {{ props.row.receivingPersonnel }}
                  </q-chip>
                </q-td>
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
              </q-tr>
              <q-tr v-if="expandedRows[props.rowIndex]">
                <q-td colspan="100%">
                  <q-table
                    :rows="officeUpdates[props.row.id] || []"
                    :columns="officeUpdateColumns"
                    row-key="id"
                    dense
                    flat
                    class="text-center"
                  >
                    <template v-slot:header="props">
                      <q-tr :props="props">
                        <q-th
                          v-for="col in props.cols"
                          :key="col.name"
                          :props="props"
                          class="text-center"
                        >
                          {{ col.label }}
                        </q-th>
                      </q-tr>
                    </template>

                    <!-- ADD THIS SLOT FOR IMAGE THUMBNAIL -->
                    <template v-slot:body-cell-imageUrl="props">
                      <q-td class="text-center">
                        <div
                          v-if="props.row.imageUrl"
                          style="
                            width: 50px;
                            height: 50px;
                            overflow: hidden;
                            border-radius: 8px;
                            cursor: pointer;
                            margin: 0 auto;
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

                    <template v-slot:body-cell-status="props">
                      <q-td>
                        <q-chip
                          v-if="props.row.isDone"
                          color="positive"
                          text-color="white"
                          dense
                          icon="check"
                        >
                          Done
                        </q-chip>
                      </q-td>
                    </template>
                  </q-table>
                </q-td>
              </q-tr>
            </template>
            <template v-slot:no-data>
              <div class="full-width row flex-center q-gutter-sm q-pa-lg">
                <q-icon size="2em" name="sentiment_dissatisfied" color="grey-5" />
                <span class="text-grey-6">No documents found</span>
              </div>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="incoming">
          <q-table
            flat
            :rows="incomingRows"
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

            <!-- REPLACE THE ENTIRE BODY WITH THIS EXPANDABLE VERSION -->
            <template v-slot:body="props">
              <q-tr
                :props="props"
                @click="toggleExpand(props.row, props.rowIndex)"
                style="cursor: pointer"
              >
                <q-td>
                  <q-icon :name="expandedRows[props.rowIndex] ? 'expand_less' : 'expand_more'" />
                </q-td>
                <q-td class="text-grey-8 text-weight-bold">
                  {{ props.rowIndex + 1 }}
                </q-td>
                <q-td>{{ props.row.particular }}</q-td>
                <q-td>
                  <q-chip color="primary" text-color="white" dense class="ant-chip">
                    {{ props.row.date }}
                  </q-chip>
                </q-td>
                <q-td>
                  <q-chip color="info" text-color="white" dense class="ant-chip" icon="business">
                    {{ props.row.receivingOffice }}
                  </q-chip>
                </q-td>
                <q-td>
                  <q-chip color="secondary" text-color="white" dense class="ant-chip" icon="person">
                    {{ props.row.receivingPersonnel }}
                  </q-chip>
                </q-td>
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
              </q-tr>

              <!-- EXPANDED ROW FOR OFFICE UPDATES -->
              <q-tr v-if="expandedRows[props.rowIndex]">
                <q-td colspan="100%">
                  <q-table
                    :rows="officeUpdates[props.row.id] || []"
                    :columns="officeUpdateColumns"
                    row-key="id"
                    dense
                    flat
                    class="text-center"
                  >
                    <template v-slot:header="props">
                      <q-tr :props="props">
                        <q-th
                          v-for="col in props.cols"
                          :key="col.name"
                          :props="props"
                          class="text-center"
                        >
                          {{ col.label }}
                        </q-th>
                      </q-tr>
                    </template>

                    <!-- IMAGE THUMBNAIL SLOT -->
                    <template v-slot:body-cell-imageUrl="props">
                      <q-td class="text-center">
                        <div
                          v-if="props.row.imageUrl"
                          style="
                            width: 50px;
                            height: 50px;
                            overflow: hidden;
                            border-radius: 8px;
                            cursor: pointer;
                            margin: 0 auto;
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

                    <!-- STATUS SLOT -->
                    <template v-slot:body-cell-status="props">
                      <q-td>
                        <q-chip
                          v-if="props.row.isDone"
                          color="positive"
                          text-color="white"
                          dense
                          icon="check"
                        >
                          Done
                        </q-chip>
                      </q-td>
                    </template>
                  </q-table>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-gutter-sm q-pa-lg">
                <q-icon size="2em" name="sentiment_dissatisfied" color="grey-5" />
                <span class="text-grey-6">No documents found</span>
              </div>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
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
          <q-img v-else :src="previewImageUrl" style="max-width: 100%; max-height: 100%" />
          <div v-if="previewImageUrl" class="q-mt-sm text-caption text-white">
            URL: {{ previewImageUrl }}
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from 'boot/firebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

// 1. Define the DocumentRow interface
interface DocumentRow {
  id: string; // <-- Add this line
  particular: string;
  date: string;
  receivingOffice: string;
  receivingPersonnel: string;
  imageUrl?: string;
}

// 2. Define the OfficeUpdateRow interface
interface OfficeUpdateRow {
  officeName: string;
  receivingPersonnel: string;
  date: string;
  imageUrl?: string;
  isDone?: boolean;
}

const router = useRouter();
const tab = ref('outgoing');
const outgoingRows = ref<DocumentRow[]>([]);
const incomingRows = ref<DocumentRow[]>([]);
const showImagePreview = ref(false);
const previewImageUrl = ref('');
const pagination = ref({ page: 1, rowsPerPage: 10 });
const expandedRows = ref<Record<string, boolean>>({});
const officeUpdates = ref<Record<string, OfficeUpdateRow[]>>({});

const columns = [
  { name: 'expand', label: '', align: 'left' as const, field: '' }, // <-- blank label for arrow
  { name: 'index', label: 'No.', align: 'left' as const, field: '' }, // <-- No. for numbering
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
const officeUpdateColumns = [
  { name: 'officeName', label: 'Office Name', field: 'officeName', align: 'center' as const },
  {
    name: 'receivingPersonnel',
    label: 'Receiving Personnel',
    field: 'receivingPersonnel',
    align: 'center' as const,
  },
  { name: 'date', label: 'Date', field: 'date', align: 'center' as const },
  { name: 'imageUrl', label: 'Image', field: 'imageUrl', align: 'center' as const },
  { name: 'status', label: 'Status', field: 'isDone', align: 'center' as const },
];

function openImagePreview(url: string) {
  previewImageUrl.value = url;
  showImagePreview.value = true;
}

function logout() {
  localStorage.removeItem('isAdmin');
  toastr.info('Logged out');
  void router.push({ name: 'LoginPage' });
}

async function fetchAllData() {
  // Outgoing - fetch ALL documents, no UID filter
  const outgoingSnap = await getDocs(
    query(collection(db, 'outgoingDocuments'), orderBy('date', 'asc')),
  );
  outgoingRows.value = outgoingSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id, // <-- Add this line
      particular: data.particular,
      date:
        data.date && data.date.toDate ? data.date.toDate().toISOString().split('T')[0] : data.date,
      receivingOffice: data.receivingOffice,
      receivingPersonnel: data.receivingPersonnel,
      imageUrl: data.imageUrl || '',
    };
  });
  // Incoming - fetch ALL documents, no UID filter
  const incomingSnap = await getDocs(
    query(collection(db, 'incomingDocuments'), orderBy('date', 'asc')),
  );
  incomingRows.value = incomingSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id, // <-- Add this line
      particular: data.particular,
      date:
        data.date && data.date.toDate ? data.date.toDate().toISOString().split('T')[0] : data.date,
      receivingOffice: data.receivingOffice,
      receivingPersonnel: data.receivingPersonnel,
      imageUrl: data.imageUrl || '',
    };
  });
}

async function fetchOfficeUpdates(dataId: string): Promise<OfficeUpdateRow[]> {
  const updates: OfficeUpdateRow[] = [];
  let updateNum = 1;
  while (true) {
    const collectionName = `${updateNum}_office_update`;
    const qSnap = await getDocs(
      query(collection(db, collectionName), where('data_id', '==', dataId)),
    );
    if (qSnap.empty) break;
    qSnap.forEach((doc) => {
      const data = doc.data();
      updates.push({
        officeName: data.officeName,
        receivingPersonnel: data.receivingPersonnel,
        date:
          data.date && data.date.toDate
            ? data.date.toDate().toISOString().split('T')[0]
            : data.date,
        imageUrl: data.imageUrl || '',
        isDone: true, // will update below
      });
    });
    updateNum++;
  }
  // Mark all except last as done
  updates.forEach((u, i) => (u.isDone = i !== updates.length - 1));
  return updates;
}

async function toggleExpand(row: DocumentRow, rowIndex: number) {
  expandedRows.value[rowIndex] = !expandedRows.value[rowIndex];
  if (expandedRows.value[rowIndex] && !officeUpdates.value[row.id]) {
    officeUpdates.value[row.id] = await fetchOfficeUpdates(row.id);
  }
}

onMounted(() => {
  // Only allow if admin
  if (localStorage.getItem('isAdmin') !== 'true') {
    toastr.error('Unauthorized. Please login as admin.');
    void router.push({ name: 'LoginPage' });
    return;
  }
  void fetchAllData();
});
</script>

<style scoped>
.admin-card {
  max-width: 1100px;
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
.ant-chip {
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  padding: 0 10px;
}
</style>
