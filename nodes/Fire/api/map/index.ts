import { INodeProperties } from 'n8n-workflow';
import { buildApiProperties, createOperationNotice, createUrlProperty } from '../common';

// Define the operation name and display name
export const name = 'map';
export const displayName = 'Map a website and get urls';

/**
 * Create the properties for the map operation
 */
function createMapProperties(): INodeProperties[] {
	return [
		// Operation notice
		createOperationNotice('Default', name),

		// URL input
		createUrlProperty(name),

		// Additional properties can be added here
	];
}

// Build and export the properties and options
const { options, properties } = buildApiProperties(name, displayName, createMapProperties());

export { options, properties };
