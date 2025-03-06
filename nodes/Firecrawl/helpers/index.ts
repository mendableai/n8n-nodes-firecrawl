// Export types
export * from './types';

// Export HTTP utilities
import { mergeCustomBodyWithRequest } from './http/requestModifiers';
import {
	getResponseContentType,
	getFileTypeFromContentType,
	getFileExtensionFromContentType,
	isBinaryResponse,
	processBinaryResponseData,
} from './http/responseHandlers';

// Export property builders
import {
	buildPropertiesWithOptions,
	buildPropertiesWithMethods,
	aggregateNodeMethods,
} from './utils/propertyBuilders';

// Re-export all utilities
export {
	mergeCustomBodyWithRequest,
	getResponseContentType,
	getFileTypeFromContentType,
	getFileExtensionFromContentType,
	isBinaryResponse,
	processBinaryResponseData,
	buildPropertiesWithOptions,
	buildPropertiesWithMethods,
	aggregateNodeMethods,
};

// Aliases for request/response handling
export const preSendActionCustomBody = mergeCustomBodyWithRequest;
export const postReceiveActionBinaryData = processBinaryResponseData;
