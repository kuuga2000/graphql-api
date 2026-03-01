import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { ProductsArgs } from './dto/products.args';
import { Product } from './entities/product.type';
import { CatalogService } from './catalog.service';

@Resolver(() => Product)
export class CatalogResolver {
  constructor(private readonly catalogService: CatalogService) {}

  @Query(() => [Product], { name: 'products' })
  products(@Args() args: ProductsArgs): Promise<Product[]> {
    return this.catalogService.findAll(args.limit, args.offset);
  }

  @Query(() => Product, { name: 'product' })
  product(@Args('id', { type: () => ID }) id: string): Promise<Product> {
    return this.catalogService.findById(id);
  }
}
