/** Modelos de countdown — alinhados a Modelos HTML/Itens da Vitrine e Pagina de Produto. */

export type CountdownItemsModel =
  | "badge"
  | "bar"
  | "flash"
  | "inline"
  | "hero";

export type CountdownPdpModel =
  | "urgency_box"
  | "inline"
  | "progress"
  | "floating"
  | "banner";

export const COUNTDOWN_ITEMS_MODELS: CountdownItemsModel[] = [
  "badge",
  "bar",
  "flash",
  "inline",
  "hero",
];

export const COUNTDOWN_PDP_MODELS: CountdownPdpModel[] = [
  "urgency_box",
  "inline",
  "progress",
  "floating",
  "banner",
];

export const DEFAULT_COUNTDOWN_ITEMS_MODEL: CountdownItemsModel = "badge";
export const DEFAULT_COUNTDOWN_PDP_MODEL: CountdownPdpModel = "urgency_box";

export function parseCountdownItemsModel(
  value: unknown,
): CountdownItemsModel {
  if (
    typeof value === "string" &&
    COUNTDOWN_ITEMS_MODELS.includes(value as CountdownItemsModel)
  ) {
    return value as CountdownItemsModel;
  }
  return DEFAULT_COUNTDOWN_ITEMS_MODEL;
}

export function parseCountdownPdpModel(value: unknown): CountdownPdpModel {
  if (
    typeof value === "string" &&
    COUNTDOWN_PDP_MODELS.includes(value as CountdownPdpModel)
  ) {
    return value as CountdownPdpModel;
  }
  return DEFAULT_COUNTDOWN_PDP_MODEL;
}
