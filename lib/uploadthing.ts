import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core"; // Import the router type

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// You might need UploadUploader depending on your UI choices
// export const UploadUploader = generateUploader<OurFileRouter>();
