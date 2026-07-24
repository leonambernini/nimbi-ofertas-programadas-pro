import { apiJson } from "@/lib/api-http";
import { isAdminSession, requireAdminSession } from "@/lib/auth";
import { deleteOfferImage, uploadOfferImage } from "@/lib/supabase-storage";

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const replaceUrl = form.get("replaceUrl");

    if (!(file instanceof File)) {
      return apiJson(request, { error: "file_required" }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return apiJson(request, { error: "invalid_file_type" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return apiJson(request, { error: "file_too_large" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const url = await uploadOfferImage({
      storeId: session.storeId,
      fileName: file.name,
      contentType: file.type,
      bytes,
    });

    if (typeof replaceUrl === "string" && replaceUrl && replaceUrl !== url) {
      await deleteOfferImage({
        storeId: session.storeId,
        publicUrl: replaceUrl,
      });
    }

    return apiJson(request, { url });
  } catch (error) {
    console.error("[uploads]", error);
    return apiJson(request, { error: "upload_failed" }, { status: 500 });
  }
}
