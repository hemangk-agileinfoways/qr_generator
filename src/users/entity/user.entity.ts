import { TABLE_NAMES } from "../../common/constants/table-name.constant";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: TABLE_NAMES.USER })
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ nullable: false })
  gender: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, default: false })
  is_active: boolean;
}
