"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Spinner, useToast } from "@nimbus-ds/components";
import { Page } from "@nimbus-ds/patterns";
import { getOffer } from "@/lib/admin-api";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ApiOfferGroup } from "@/lib/types";
import { OfferForm } from "../components/offer-form";

export default function EditOfferPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const { dict } = useLocale();
  const [offer, setOffer] = useState<ApiOfferGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOffer(params.id)
      .then(setOffer)
      .catch(() => {
        addToast({
          id: "offer-load-error",
          type: "danger",
          text: dict.home.error,
        });
        router.push("/offers");
      })
      .finally(() => setLoading(false));
  }, [params.id, addToast, dict.home.error, router]);

  if (loading || !offer) {
    return (
      <Page>
        <Page.Body>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="50vh">
            <Spinner size="large" />
          </Box>
        </Page.Body>
      </Page>
    );
  }

  return <OfferForm mode="edit" initial={offer} />;
}
