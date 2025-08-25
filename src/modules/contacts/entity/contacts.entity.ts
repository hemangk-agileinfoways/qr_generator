import { ObjectId } from "mongodb";
import { TABLE_NAMES } from "src/common/constants/table-name.constant";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectIdColumn,
  UpdateDateColumn,
} from "typeorm";

export class Phone {
  type: "work" | "home" | "mobile" | "fax" | "other";
  value: string;
}

export class Email {
  type: "work" | "home" | "other";
  value: string;
}

export class Address {
  type: "work" | "home" | "other";
  street: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

export class Socials {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

@Entity({ name: TABLE_NAMES.CONTACT })
export class Contact {
  @ObjectIdColumn()
  _id: ObjectId;

  @Index({ unique: true })
  @Column()
  fingerprint: string;

  @Column({ nullable: true })
  qrCodeUrl?: string;

  @Column({ type: "text", nullable: true })
  embeddedVCard?: string;

  @Column({ nullable: true })
  prefix?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  company?: string;

  @Column({ nullable: true })
  jobTitle?: string;

  @Column()
  @Index({ unique: true })
  phones?: Phone[];

  @Column()
  @Index({ unique: true })
  emails?: Email[];

  @Column()
  addresses?: Address[];

  @Column({ nullable: true })
  website?: string;

  @Column()
  socials?: Socials;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  setTimestamps() {
    const currentDate = new Date();
    this.createdAt = currentDate;
    this.updatedAt = currentDate;
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
