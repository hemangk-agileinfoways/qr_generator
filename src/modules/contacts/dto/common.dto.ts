import {
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  IsEmail,
  Matches,
  MinLength,
} from "class-validator";

export class PhoneDto {
  @IsString()
  @IsIn(["work", "home", "mobile", "fax", "other"])
  type: "work" | "home" | "mobile" | "fax" | "other";

  @IsString()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, {
    message: "Phone number must be in a valid format",
  })
  @MinLength(8, { message: "Phone number must contain at least 10 digits" })
  value: string;
}

export class EmailDto {
  @IsString()
  @IsIn(["work", "home", "other"])
  type: "work" | "home" | "other";

  @IsString()
  @IsEmail({}, { message: "Email must be in a valid format" })
  value: string;
}

export class AddressDto {
  @IsString()
  @IsIn(["work", "home", "other"])
  type: "work" | "home" | "other";

  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class SocialsDto {
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsUrl()
  instagram?: string;

  @IsOptional()
  @IsUrl()
  facebook?: string;

  @IsOptional()
  @IsUrl()
  twitter?: string;
}
