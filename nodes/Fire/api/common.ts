import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { buildPropertiesWithOptions } from '../helpers';

/**
 * Formats an operation name for display
 * @param name - The raw operation name
 * @returns The formatted operation name with proper capitalization
 */
export function formatOperationName(name: string): string {
	// Convert operation name to title case with spaces
	return name
		.split(/(?=[A-Z])/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Creates a standard API operation notice property
 * @param resourceName - The name of the resource
 * @param operationName - The name of the operation
 * @returns A node property for the operation notice
 */
export function createOperationNotice(
	resourceName: string,
	operationName: string,
): INodeProperties {
	return {
		displayName: `POST /${operationName}`,
		name: 'operation',
		type: 'notice',
		typeOptions: {
			theme: 'info',
		},
		default: '',
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Creates a standard URL input property
 * @param operationName - The name of the operation
 * @param defaultUrl - The default URL value
 * @param resourceName - The name of the resource
 * @returns A node property for the URL input
 */
export function createUrlProperty(
	operationName: string,
	defaultUrl: string = 'https://firecrawl.dev',
	resourceName: string = 'Default',
): INodeProperties {
	return {
		displayName: 'Url',
		name: 'url',
		type: 'string',
		default: defaultUrl,
		routing: {
			request: {
				body: {
					url: '={{ $value }}',
				},
			},
		},
		displayOptions: {
			hide: {
				useCustomBody: [true],
			},
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Creates a standard API operation option
 * @param name - The name of the operation
 * @param action - The display name for the action
 * @returns A node property option for the operation
 */
export function createOperationOption(
	name: string,
	action: string,
): INodePropertyOptions {
	return {
		name: action,
		value: name,
		action,
		routing: {
			request: {
				method: 'POST',
				url: `=/${name}`,
			},
		},
	};
}

/**
 * Builds API properties with options
 * @param name - The name of the operation
 * @param action - The display name for the action
 * @param properties - The properties for the operation
 * @returns An object containing options and properties
 */
export function buildApiProperties(
	name: string,
	action: string,
	properties: INodeProperties[],
) {
	const option = createOperationOption(name, action);
	return buildPropertiesWithOptions(option, properties);
}
