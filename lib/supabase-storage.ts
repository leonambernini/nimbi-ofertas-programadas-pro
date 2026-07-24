import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

function getAdminClient() {
  return createClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: { persistSession: false },
  });
}

export function pathFromPublicUrl(publicUrl: string): string | null {
  try {
    const bucket = env.supabaseStorageBucket();
    const marker = `/storage/v1/object/public/${bucket}/`;
    const url = new URL(publicUrl);
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    const path = decodeURIComponent(url.pathname.slice(idx + marker.length));
    return path || null;
  } catch {
    return null;
  }
}

export async function uploadOfferImage(params: {
  storeId: string;
  fileName: string;
  contentType: string;
  bytes: ArrayBuffer;
}): Promise<string> {
  const bucket = env.supabaseStorageBucket();
  const ext = params.fileName.split(".").pop()?.toLowerCase() || "png";
  const path = `${params.storeId}/${crypto.randomUUID()}.${ext}`;
  const client = getAdminClient();

  const { error } = await client.storage.from(bucket).upload(path, params.bytes, {
    contentType: params.contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteOfferImage(params: {
  storeId: string;
  publicUrl: string | null | undefined;
}): Promise<void> {
  if (!params.publicUrl) return;

  const path = pathFromPublicUrl(params.publicUrl);
  if (!path || !path.startsWith(`${params.storeId}/`)) return;

  const bucket = env.supabaseStorageBucket();
  const client = getAdminClient();
  const { error } = await client.storage.from(bucket).remove([path]);

  if (error) {
    console.warn("[storage] deleteOfferImage failed", {
      path,
      message: error.message,
    });
  }
}

export async function deleteStoreOfferImages(storeId: string): Promise<void> {
  const bucket = env.supabaseStorageBucket();
  const client = getAdminClient();

  const { data, error } = await client.storage.from(bucket).list(storeId, {
    limit: 1000,
  });

  if (error) {
    console.warn("[storage] list store images failed", {
      storeId,
      message: error.message,
    });
    return;
  }

  if (!data?.length) return;

  const paths = data
    .filter((file) => Boolean(file.name))
    .map((file) => `${storeId}/${file.name}`);

  if (!paths.length) return;

  const { error: removeError } = await client.storage.from(bucket).remove(paths);
  if (removeError) {
    console.warn("[storage] deleteStoreOfferImages failed", {
      storeId,
      message: removeError.message,
    });
  }
}
