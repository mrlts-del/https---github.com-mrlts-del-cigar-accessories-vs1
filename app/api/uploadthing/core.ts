import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import getServerSession from 'next-auth'; // Use default import
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Session } from 'next-auth'; // Import augmented Session type
import { Role } from '@prisma/client';

const f = createUploadthing();

// Fake auth function - Replace with your actual session check
// const auth = (req: Request) => ({ id: "fakeId" });
async function getUserAuth() {
  const session = (await getServerSession(authOptions)) as unknown as Session | null;
  return session?.user; // Returns user object or null
}


// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique route slug
  productImageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 5 } }) // Allow up to 5 images of 4MB each
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await getUserAuth();

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError('Unauthorized: Must be logged in');
      // Ensure user is admin
      if (user.role !== Role.ADMIN) throw new UploadThingError('Unauthorized: Admin role required');

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      console.log(`User ${user.id} starting image upload.`);
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.url);
      console.log('file key', file.key); // Use this key if needed

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      // We need key and url on the client
      return { uploadedBy: metadata.userId, url: file.url, key: file.key };
    }),
  // Add other file routes if needed (e.g., profile pictures)
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
