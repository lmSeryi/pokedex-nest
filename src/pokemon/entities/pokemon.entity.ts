import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Pokemon extends Document {
  @Prop({
    unique: true,
    required: true,
    index: true,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  noPokemon: number;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
