import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Product } from './entities/product.type';

type ProductApiResponse = {
  id: number;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
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

  async findAll(limit = 20, offset = 0): Promise<Product[]> {
    if (limit <= 0 || offset < 0) {
      throw new BadRequestException('limit must be > 0 and offset must be >= 0');
    }

    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });

    const envelope = await this.fetchJson<ProductListApiEnvelope>(
      `${this.baseUrl}/products?${params.toString()}`,
    );

    return envelope.data.map(this.toGraphqlProduct);
  }

  async findById(id: string): Promise<Product> {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new BadRequestException('id must be a positive integer');
    }

    const envelope = await this.fetchJson<ProductApiEnvelope>(
      `${this.baseUrl}/products/${numericId}`,
    );

    return this.toGraphqlProduct(envelope.data);
  }

  private toGraphqlProduct(apiProduct: ProductApiResponse): Product {
    return {
      id: String(apiProduct.id),
      name: apiProduct.name,
      description: apiProduct.description,
      slug: apiProduct.slug,
      isActive: apiProduct.isActive,
    };
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
