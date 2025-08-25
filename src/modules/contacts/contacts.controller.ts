import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CreateContactDto } from "./dto/create-contact.dto";
import { Contact } from "./entity/contacts.entity";
import { ContactsService } from "./contacts.service";
import { Public } from "src/security/auth/auth.decorator";
import { ResponseMessage } from "src/common/decorators/response.decorator";
import { DYNAMIC_SUCCESS_RESPONSE } from "src/common/helpers/responses/success.helper";

@Public()
@Controller("contacts")
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post()
  @ResponseMessage(
    DYNAMIC_SUCCESS_RESPONSE.CREATED("Contact and QR Code").MESSAGE
  )
  async create(@Body() dto: CreateContactDto): Promise<Contact> {
    return this.contactsService.create(dto);
  }

  @Get()
  @ResponseMessage(DYNAMIC_SUCCESS_RESPONSE.RETRIEVED("Contacts").MESSAGE)
  async findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("search") search?: string
  ) {
    return this.contactsService.findAll(page, limit, search);
  }

  @Get(":id")
  @ResponseMessage(DYNAMIC_SUCCESS_RESPONSE.RETRIEVED("Contact").MESSAGE)
  async findOne(@Param("id") id: string) {
    return this.contactsService.findOne(id);
  }
}
