import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Product } from './entities/product.type';

type ProductApiResponse = {
  id?: number;
  name?: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
};

type ProductListApiEnvelope = {
  data: ProductApiResponse[];
  meta: {
    limit: number;
    offset: number;
    count: number;
  };
};

type ProductApiEnvelope = {
  data: ProductApiResponse;
};

@Injectable()
export class CatalogService {
  private readonly baseUrl =
    process.env.SECRET_SHOP_API_BASE_URL ?? 'http://localhost:8080/api/v1';
  private readonly allowedFields = new Set([
    'id',
    'name',
    'description',
    'slug',
    'isActive',
  ]);

  async findAll(limit = 20, offset = 0, fields: string[] = []): Promise<Product[]> {
    if (limit <= 0 || offset < 0) {
      throw new BadRequestException('limit must be > 0 and offset must be >= 0');
    }

    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    const projectedFields = this.sanitizeFields(fields);
    if (projectedFields.length > 0) {
      params.set('fields', projectedFields.join(','));
    }

    const envelope = await this.fetchJson<ProductListApiEnvelope>(
      `${this.baseUrl}/products?${params.toString()}`,
    );

    return envelope.data.map(this.toGraphqlProduct);
  }

  async findById(id: string, fields: string[] = []): Promise<Product> {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new BadRequestException('id must be a positive integer');
    }

    const params = new URLSearchParams();
    const projectedFields = this.sanitizeFields(fields);
    if (projectedFields.length > 0) {
      params.set('fields', projectedFields.join(','));
    }

    const suffix = params.toString() ? `?${params.toString()}` : '';
    const envelope = await this.fetchJson<ProductApiEnvelope>(
      `${this.baseUrl}/products/${numericId}${suffix}`,
    );

    return this.toGraphqlProduct(envelope.data);
  }

  private toGraphqlProduct(apiProduct: ProductApiResponse): Product {
    const product: Partial<Product> = {};
    if (apiProduct.id !== undefined) {
      product.id = String(apiProduct.id);
    }
    if (apiProduct.name !== undefined) {
      product.name = apiProduct.name;
    }
    if (apiProduct.description !== undefined) {
      product.description = apiProduct.description;
    }
    if (apiProduct.slug !== undefined) {
      product.slug = apiProduct.slug;
    }
    if (apiProduct.isActive !== undefined) {
      product.isActive = apiProduct.isActive;
    }

    return product as Product;
  }

  private sanitizeFields(fields: string[]): string[] {
    return [...new Set(fields)].filter((field) => this.allowedFields.has(field));
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (response.status === 404) {
        throw new NotFoundException('resource not found');
      }

      if (response.status === 400) {
        throw new BadRequestException('invalid request for upstream API');
      }

      if (!response.ok) {
        throw new InternalServerErrorException(
          `upstream API error with status ${response.status}`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('unable to reach secret-shop REST API');
    } finally {
      clearTimeout(timeout);
    }
  }
}
