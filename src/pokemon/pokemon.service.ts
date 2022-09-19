import { isValidObjectId, Model, Types } from 'mongoose';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
    createPokemonDto.name = createPokemonDto.name.trim().toLowerCase();
    try {
      return await this.pokemonModel.create(createPokemonDto);
    } catch (error) {
      this.#errorHandler(error);
    }
  }

  async findAll(): Promise<Pokemon[]> {
    return this.pokemonModel.find().exec();
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    try {
      if (!isNaN(+term)) pokemon = await this.#findOneByNumber(+term);
      else if (isValidObjectId(term)) pokemon = await this.#findOneById(term);
      else pokemon = await this.#findOneByName(term);

      if (!pokemon) throw new NotFoundException();

      return pokemon;
    } catch (error) {
      this.#errorHandler(error);
    }
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    updatePokemonDto.name = updatePokemonDto.name.trim().toLowerCase();
    try {
      const pokemon = await this.findOne(term);
      if (!pokemon) throw new NotFoundException();
      pokemon.name = updatePokemonDto.name;
      pokemon.noPokemon = updatePokemonDto.noPokemon;
      await pokemon.save();
      return pokemon;
    } catch (error) {
      this.#errorHandler(error);
    }
  }

  async remove(id: string): Promise<boolean> {
    const { deletedCount } = await this.#deleteOne(id);
    if (!deletedCount) throw new NotFoundException();
    return true;
  }

  #findOneByNumber(noPokemon: number) {
    return this.pokemonModel.findOne({ noPokemon }).exec();
  }

  #findOneByName(name: string) {
    return this.pokemonModel.findOne({ name }).exec();
  }

  #findOneById(id: string) {
    return this.pokemonModel.findById(id).exec();
  }

  #deleteOne(id: string) {
    return this.pokemonModel.deleteOne({ _id: id }).exec();
  }

  #pokemonAlreadyExist(reason: string) {
    throw new BadRequestException(
      `Pokemon ${JSON.stringify(reason)} already exists`,
    );
  }

  #errorHandler(error?: any) {
    console.log(error.message);
    if (error instanceof NotFoundException) throw new NotFoundException();
    if (error.code === 11000) this.#pokemonAlreadyExist(error.keyValue);
    throw new InternalServerErrorException();
  }
}
