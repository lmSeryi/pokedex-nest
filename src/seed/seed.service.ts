import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces';

@Injectable()
export class SeedService {
  readonly #axios: AxiosInstance = axios;
  readonly #url: string = 'https://pokeapi.co/api/v2/pokemon';

  async executeSeed() {
    const { data } = await this.#axios.get<PokeResponse>(
      `${this.#url}?limit=10`,
    );

    data.results.forEach(({ url }) => {
      const segments = url.split('/');
      const id = +segments[segments.length - 2];
    });

    return data.results;
  }
}
