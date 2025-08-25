import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Contact } from "./entity/contacts.entity";
import { Repository } from "typeorm";
import { LoggerService } from "src/common/logger/logger.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { normalizeContact } from "./utils/normalize-contact.utils";
import * as crypto from "crypto";
import * as path from "path";
import * as fs from "fs/promises";
import * as QRCode from "qrcode";
import { TypeExceptions } from "src/common/helpers/exceptions";
import { ObjectId } from "mongodb";

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private myLogger: LoggerService
  ) {}

  async create(createContactPayload: CreateContactDto): Promise<Contact> {
    try {
      // 1. Normalize payload
      const normalizeResult = normalizeContact(createContactPayload);
      const normalized = normalizeResult.normalized;
      const fingerprint = normalizeResult.fingerprint;

      // 2. Build vCard string (3.0)
      const vcard = this.buildVCard(normalized);
      console.log("🚀 ~ ContactsService ~ create ~ vcard:", vcard);

      const randomId = crypto.randomBytes(12).toString("hex");

      // 3. Generate QR code PNG
      const qrDir = path.join(process.cwd(), "public", "qr");
      await fs.mkdir(qrDir, { recursive: true });

      const qrPath = path.join(qrDir, `${randomId}.png`);
      await QRCode.toFile(qrPath, vcard, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 512,
      });

      const qrCodeUrl = `/public/qr/${randomId}.png`;

      // 4. Persist to DB
      const contact = this.contactRepository.create({
        ...normalized,
        fingerprint,
        embeddedVCard: vcard,
        qrCodeUrl,
      });

      await this.contactRepository.save(contact);
      return contact[0];
    } catch (error) {
      this.myLogger.error("Failed to create contact", error);
      throw TypeExceptions.UnknownError(error.message);
    }
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    let where: any = {};

    if (search) {
      // MongoDB regex search (case-insensitive)
      const regex = new RegExp(search, "i");
      where = {
        $or: [
          { firstName: regex },
          { lastName: regex },
          { "emails.value": regex },
          { "phones.value": regex },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.contactRepository.find({
        where,
        skip,
        take: limit,
      }),
      this.contactRepository.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!contact) {
      throw TypeExceptions.NotFoundError("Contact not found");
    }
    return contact;
  }

  private buildVCard(contact: any): string {
    const lines: string[] = [];
    lines.push("BEGIN:VCARD");
    lines.push("VERSION:3.0");

    // Full Name (FN is required)
    const fullName = [contact.prefix, contact.firstName, contact.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (fullName) {
      lines.push(`FN:${this.escapeVCardValue(fullName)}`);
    } else {
      lines.push("FN:Unknown Contact");
    }

    // Structured Name (N)
    if (contact.firstName || contact.lastName) {
      const lastName = this.escapeVCardValue(contact.lastName || "");
      const firstName = this.escapeVCardValue(contact.firstName || "");
      const prefix = this.escapeVCardValue(contact.prefix || "");
      lines.push(`N:${lastName};${firstName};;${prefix};`);
    }

    // Organization
    if (contact.company) {
      lines.push(`ORG:${this.escapeVCardValue(contact.company)}`);
    }

    // Job Title
    if (contact.jobTitle) {
      lines.push(`TITLE:${this.escapeVCardValue(contact.jobTitle)}`);
    }

    // Phone Numbers
    if (contact.phones && Array.isArray(contact.phones)) {
      contact.phones.forEach((phone) => {
        if (phone && phone.value) {
          const phoneType = this.mapPhoneType(phone.type);
          lines.push(`TEL;TYPE=${phoneType}:${phone.value}`);
        }
      });
    }

    // Email Addresses
    if (contact.emails && Array.isArray(contact.emails)) {
      contact.emails.forEach((email) => {
        if (email && email.value) {
          const emailType = this.mapEmailType(email.type);
          lines.push(
            `EMAIL;TYPE=${emailType}:${this.escapeVCardValue(email.value)}`
          );
        }
      });
    }

    // Addresses
    if (contact.addresses && Array.isArray(contact.addresses)) {
      contact.addresses.forEach((address) => {
        if (address) {
          const addrType = this.mapAddressType(address.type);
          const addrComponents = [
            "",
            "",
            this.escapeVCardValue(address.street || ""),
            this.escapeVCardValue(address.city || ""),
            this.escapeVCardValue(address.region || ""),
            this.escapeVCardValue(address.postalCode || ""),
            this.escapeVCardValue(address.country || ""),
          ];
          lines.push(`ADR;TYPE=${addrType}:${addrComponents.join(";")}`);
        }
      });
    }

    // Website
    if (contact.website) {
      lines.push(`URL:${this.escapeVCardValue(contact.website)}`);
    }

    // Social Media
    if (contact.socials) {
      if (contact.socials.linkedin) {
        lines.push(
          `X-SOCIALPROFILE;TYPE=linkedin:${this.escapeVCardValue(contact.socials.linkedin)}`
        );
      }
      if (contact.socials.twitter) {
        lines.push(
          `X-SOCIALPROFILE;TYPE=twitter:${this.escapeVCardValue(contact.socials.twitter)}`
        );
      }
      if (contact.socials.facebook) {
        lines.push(
          `X-SOCIALPROFILE;TYPE=facebook:${this.escapeVCardValue(contact.socials.facebook)}`
        );
      }
      if (contact.socials.instagram) {
        lines.push(
          `X-SOCIALPROFILE;TYPE=instagram:${this.escapeVCardValue(contact.socials.instagram)}`
        );
      }
    }

    console.log("🚀 ~ buildVCard ~ lines:", lines);

    lines.push("END:VCARD");
    return lines.join("\r\n");
  }

  private escapeVCardValue(value: string): string {
    if (!value) return "";
    return value
      .replace(/\\/g, "\\\\")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "");
  }

  private async generateQR(vcard: string, fileName: string): Promise<void> {
    const qrDir = path.join(process.cwd(), "public", "qr");
    const qrPath = path.join(qrDir, fileName);

    await QRCode.toFile(qrPath, vcard, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 1024,
    });
  }

  private checkForNewFields(existing: Contact, incoming: any): boolean {
    for (const [key, value] of Object.entries(incoming)) {
      // Skip empty incoming values
      if (!value) continue;

      // Check if existing value is empty and incoming has value
      if (!existing[key]) return true;

      // For arrays (phones, emails, addresses)
      if (Array.isArray(value)) {
        const existingArray = existing[key] || [];
        // Check if incoming array has more items
        if (value.length > existingArray.length) return true;

        // Check if any new values in arrays
        for (const item of value) {
          const hasNew = !existingArray.some(
            (existing: any) => existing.value === item.value
          );
          if (hasNew) return true;
        }
      }
    }
    return false;
  }

  private mergeNewFields(existing: Contact, incoming: any): any {
    const merged = { ...existing };

    for (const [key, value] of Object.entries(incoming)) {
      if (!value) continue;

      if (Array.isArray(value)) {
        const existingArray = merged[key] || [];
        const newItems = value.filter(
          (item: any) =>
            !existingArray.some(
              (existing: any) => existing.value === item.value
            )
        );
        merged[key] = [...existingArray, ...newItems];
      } else if (!merged[key]) {
        merged[key] = value;
      }
    }

    return merged;
  }

  private mapPhoneType(type: string): string {
    const typeMap: { [key: string]: string } = {
      mobile: "CELL",
      cell: "CELL",
      home: "HOME",
      work: "WORK",
      office: "WORK",
      business: "WORK",
      fax: "FAX",
      other: "VOICE",
    };
    return typeMap[type?.toLowerCase()] || "VOICE";
  }

  private mapEmailType(type: string): string {
    const typeMap: { [key: string]: string } = {
      personal: "HOME",
      home: "HOME",
      work: "WORK",
      business: "WORK",
      office: "WORK",
      other: "INTERNET",
    };
    return typeMap[type?.toLowerCase()] || "INTERNET";
  }

  private mapAddressType(type: string): string {
    const typeMap: { [key: string]: string } = {
      home: "HOME",
      personal: "HOME",
      work: "WORK",
      business: "WORK",
      office: "WORK",
      other: "POSTAL",
    };
    return typeMap[type?.toLowerCase()] || "POSTAL";
  }
}
