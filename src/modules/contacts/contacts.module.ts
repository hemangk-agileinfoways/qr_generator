import { Module } from "@nestjs/common";
import { ContactsController } from "./contacts.controller";
import { ContactsService } from "./contacts.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Contact } from "./entity/contacts.entity";
import { LoggerModule } from "src/common/logger/logger.module";

@Module({
  imports: [TypeOrmModule.forFeature([Contact]), LoggerModule],
  controllers: [ContactsController],
  providers: [ContactsService],
})
export class ContactsModule {}
