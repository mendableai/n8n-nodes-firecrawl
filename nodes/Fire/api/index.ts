import { INodeProperties } from 'n8n-workflow';
import { options as mapOptions, properties as mapProperties } from './map';
import { options as scrapeOptions, properties as scrapeProperties } from './scrape';
import { buildPropertiesWithMethods } from '../helpers';

/**
 * Combined operation options from all API endpoints
 */
const operationOptions = [mapOptions, scrapeOptions];

/**
 * Operation selector property
 */
const operationSelect = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	default: '',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['Default'],
		},
	},
	options: operationOptions,
} as INodeProperties;

// Set default value
operationSelect.default = operationOptions.length > 0 ? operationOptions[0].value : '';

/**
 * Combined properties from all API operations
 */
const rawProperties: INodeProperties[] = [
	operationSelect,
	...mapProperties,
	...scrapeProperties,
];

/**
 * Build final properties and methods
 * This uses the buildPropertiesWithMethods helper to create
 * the final properties and methods objects
 */
const { properties, methods } = buildPropertiesWithMethods(rawProperties);

export { properties, methods };
