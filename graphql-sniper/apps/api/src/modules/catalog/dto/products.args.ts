import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class ProductsArgs {
  @Field(() => Int, { defaultValue: 20 })
  limit = 20;

  @Field(() => Int, { defaultValue: 0 })
  offset = 0;
}
