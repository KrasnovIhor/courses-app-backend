import { ApiProperty } from "@nestjs/swagger";

export class SwaggerCourse {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  authors: string[];
}

export class SwaggerUser {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

export class SwaggerAuthor {
  @ApiProperty()
  name: string;
}
