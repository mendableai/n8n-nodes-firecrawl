import type { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { allMethods } from './methods';
import { allProperties } from './properties';

/**
 * Fire API Node implementation
 */
export class Fire implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Fire',
    name: 'fire',
    icon: 'file:fire.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Get data from Fire API',
    defaults: {
      name: 'Fire',
    },
    inputs: `={{["main"]}}`,
    outputs: `={{["main"]}}`,
    credentials: [
      {
        name: 'fireApi',
        required: true,
      },
    ],
    requestDefaults: {
      baseURL: 'https://api.firecrawl.dev/v1',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    properties: allProperties,
  };

  methods = allMethods;
}
