import { Args, ID, Info, Query, Resolver } from '@nestjs/graphql';
import {
  FieldNode,
  FragmentDefinitionNode,
  InlineFragmentNode,
  Kind,
  OperationDefinitionNode,
  SelectionNode,
} from 'graphql';
import type { GraphQLResolveInfo } from 'graphql';
import { ProductsArgs } from './dto/products.args';
import { Product } from './entities/product.type';
import { CatalogService } from './catalog.service';

@Resolver(() => Product)
export class CatalogResolver {
  constructor(private readonly catalogService: CatalogService) {}

  @Query(() => [Product], { name: 'products' })
  products(
    @Args() args: ProductsArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Product[]> {
    return this.catalogService.findAll(
      args.limit,
      args.offset,
      this.getRequestedProductFields(info),
    );
  }

  @Query(() => Product, { name: 'product' })
  product(
    @Args('id', { type: () => ID }) id: string,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Product> {
    return this.catalogService.findById(id, this.getRequestedProductFields(info));
  }

  private getRequestedProductFields(info: GraphQLResolveInfo): string[] {
    const fields = new Set<string>();
    for (const node of info.fieldNodes) {
      if (node.selectionSet) {
        this.collectSelections(node, info, fields);
      }
    }

    if (fields.size === 0) {
      this.collectFromOperation(info.operation, info, info.fieldName, fields);
    }

    return [...fields].filter((field) => field !== '__typename');
  }

  private collectSelections(
    node: FieldNode | InlineFragmentNode,
    info: GraphQLResolveInfo,
    fields: Set<string>,
  ): void {
    if (!node.selectionSet) {
      return;
    }

    for (const selection of node.selectionSet.selections) {
      this.collectSelection(selection, info, fields);
    }
  }

  private collectSelection(
    selection: SelectionNode,
    info: GraphQLResolveInfo,
    fields: Set<string>,
  ): void {
    if (selection.kind === Kind.FIELD) {
      fields.add(selection.name.value);
      return;
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      this.collectSelections(selection, info, fields);
      return;
    }

    if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const fragment = info.fragments[selection.name.value];
      if (fragment) {
        for (const fragmentSelection of fragment.selectionSet.selections) {
          this.collectSelection(fragmentSelection, info, fields);
        }
      }
    }
  }

  private collectFromOperation(
    operation: OperationDefinitionNode,
    info: GraphQLResolveInfo,
    fieldName: string,
    fields: Set<string>,
  ): void {
    for (const selection of operation.selectionSet.selections) {
      this.collectRootSelection(selection, info, fieldName, fields);
    }
  }

  private collectRootSelection(
    selection: SelectionNode,
    info: GraphQLResolveInfo,
    fieldName: string,
    fields: Set<string>,
  ): void {
    if (selection.kind === Kind.FIELD) {
      if (selection.name.value === fieldName && selection.selectionSet) {
        for (const child of selection.selectionSet.selections) {
          this.collectSelection(child, info, fields);
        }
      }
      return;
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      for (const child of selection.selectionSet.selections) {
        this.collectRootSelection(child, info, fieldName, fields);
      }
      return;
    }

    const fragment = info.fragments[selection.name.value];
    if (fragment) {
      this.collectFromFragment(fragment, info, fieldName, fields);
    }
  }

  private collectFromFragment(
    fragment: FragmentDefinitionNode,
    info: GraphQLResolveInfo,
    fieldName: string,
    fields: Set<string>,
  ): void {
    for (const selection of fragment.selectionSet.selections) {
      this.collectRootSelection(selection, info, fieldName, fields);
    }
  }
}
