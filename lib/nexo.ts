"use client";

import { create, type NexoClient } from "@tiendanube/nexo";

let instance: NexoClient | null = null;

export function getNexoClient(): NexoClient {
  if (!instance) {
    instance = create({
      clientId: process.env.NEXT_PUBLIC_NUVEMSHOP_CLIENT_ID ?? "",
      log: process.env.NODE_ENV === "development",
    });
  }
  return instance;
}
