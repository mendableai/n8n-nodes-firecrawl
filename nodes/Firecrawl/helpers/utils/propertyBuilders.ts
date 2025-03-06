import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { IMethodModule, IPropertiesWithMethods, IPropertiesWithOptions } from '../types';

/**
 * Builds properties with options for node configuration
 * @param options - The node property options
 * @param properties - The node properties
 * @returns An object containing options and properties
 */
export function buildPropertiesWithOptions(
	options: INodePropertyOptions,
	properties: INodeProperties[],
): IPropertiesWithOptions {
	return {
		options,
		properties,
	};
}

/**
 * Builds properties with methods for node configuration
 * @param properties - The node properties
 * @param methods - Optional methods to include
 * @returns An object containing properties and methods
 */
export function buildPropertiesWithMethods(
	properties: INodeProperties[],
	methods?: IMethodModule,
): IPropertiesWithMethods {
	return {
		properties,
		methods: methods || {},
	};
}

/**
 * Aggregates methods from multiple modules into a single object
 * @param modules - Array of method modules to aggregate
 * @returns A single object containing all methods
 */
export function aggregateNodeMethods(modules: IMethodModule[]): IMethodModule {
	return modules.reduce((methods, module) => {
		return {
			...methods,
			...module,
		};
	}, {});
}
