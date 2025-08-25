// src/modules/contacts/utils/normalize-contact.util.ts
import * as crypto from "crypto";
import { CreateContactDto } from "../dto/create-contact.dto";

export function normalizeContact(input: CreateContactDto) {
  // Deep clone to avoid mutating the DTO
  const clone: any = JSON.parse(JSON.stringify(input));
  console.log("🚀 ~ normalizeContact ~ clone:", clone);

  // Helpers
  const normalizeString = (str?: string) =>
    str ? str.trim().replace(/\s+/g, " ") : undefined;

  const normalizePhone = (val: string) =>
    val ? val.replace(/[^\d+]/g, "") : val;

  const sortArray = (arr: any[]) =>
    arr.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

  // Normalize top-level strings
  clone.prefix = normalizeString(clone.prefix);
  clone.firstName = normalizeString(clone.firstName);
  clone.lastName = normalizeString(clone.lastName);
  clone.company = normalizeString(clone.company);
  clone.jobTitle = normalizeString(clone.jobTitle); // Fixed: was 'title'
  clone.website = normalizeString(clone.website);

  // Normalize emails
  if (clone.emails) {
    clone.emails = clone.emails.map((e: any) => ({
      type: e.type,
      value: normalizeString(e.value)?.toLowerCase(),
    }));
    clone.emails = sortArray(clone.emails);
  }

  // Normalize phones
  if (clone.phones) {
    clone.phones = clone.phones.map((p: any) => ({
      type: p.type,
      value: normalizePhone(p.value),
    }));
    clone.phones = sortArray(clone.phones);
  }

  // Normalize addresses
  if (clone.addresses) {
    clone.addresses = clone.addresses.map((a: any) => ({
      type: a.type,
      street: normalizeString(a.street),
      city: normalizeString(a.city),
      region: normalizeString(a.region),
      postalCode: normalizeString(a.postalCode),
      country: normalizeString(a.country),
    }));
    clone.addresses = sortArray(clone.addresses);
  }

  // Normalize socials
  if (clone.socials) {
    Object.keys(clone.socials).forEach((k) => {
      if (clone.socials[k]) {
        clone.socials[k] = normalizeString(clone.socials[k])?.toLowerCase();
      }
    });
  }

  // Generate fingerprint
  const fingerprint = crypto
    .createHash("sha256")
    .update(JSON.stringify(clone))
    .digest("hex");

  console.log("🚀 ~ normalizeContact ~ clone 1:", clone);
  return { normalized: clone, fingerprint };
}
