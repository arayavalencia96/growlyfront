import { environment } from "@/common/config/environment";

export const applicationConfig = Object.freeze({
  name: "Growly",
  version: environment.appVersion,
  author: "Axel Araya",
  year: new Date().getFullYear(),
  description: "Objetivos, inversiones y patrimonio en un solo lugar.",
});
