export async function uploadToCloudinary(file: File): Promise<string> {
  const url = 'https://api.cloudinary.com/v1_1/diko6work/upload'; // Use your Cloud name
  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', 'ibibes_tracker'); // Your unsigned upload preset
  formData.append('folder', 'documents/images'); // Optional folder path

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.secure_url; // This is the final Cloudinary image URL
}
