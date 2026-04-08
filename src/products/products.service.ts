import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Param, ParseUUIDPipe } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { ProductImage } from './entities';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProducsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>
  ) { }

  async create(createProductDto: CreateProductDto) {

    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...createProductDto,
        images: images.map(image => this.productImageRepository.create({ url: image }))
      });
      await this.productRepository.save(product);

      return product;

    } catch (error) {
      this.handleDBExceptions(error);
    }


  }
  findAll(paginationdto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationdto
    return this.productRepository.find({
      take: limit,
      skip: offset
    })
  }

  async findOne(term: string) {
    let product: Product | null;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      //product = await this.productRepository.findOneBy({ slug: term })
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder.where('UPPER(tittle) =:tittle or slug =:slug', {
        tittle: term.toUpperCase(),
        slug: term.toLowerCase()
      }).getOne()
      //`SELECT * FROM Products WHERE slug='xx' OR title='xxxx'`
    }
    //const product = await this.productRepository.findOneBy({ id })
    if (!product)
      throw new NotFoundException(`Product with id ${term}`)
    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
      images: []
    });
    if (!product) throw new NotFoundException(`Product with id: ${id} not found`);
    await this.productRepository.save(product);
    return product;
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleDBExceptions(error: any) {

    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }

}
