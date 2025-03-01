import {
	BinaryFileType,
	IBinaryData,
	IExecuteSingleFunctions,
	IN8nHttpFullResponse,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
	INodeType,
	IPostReceiveBinaryData,
	IPostReceiveFilter,
	IPostReceiveLimit,
	IPostReceiveRootProperty,
	IPostReceiveSet,
	IPostReceiveSetKeyValue,
	IPostReceiveSort,
} from 'n8n-workflow';

export type IMethodModule = INodeType['methods'];

export type PostReceiveAction =
	| ((
			this: IExecuteSingleFunctions,
			items: INodeExecutionData[],
			response: IN8nHttpFullResponse,
	  ) => Promise<INodeExecutionData[]>)
	| IPostReceiveBinaryData
	| IPostReceiveFilter
	| IPostReceiveLimit
	| IPostReceiveRootProperty
	| IPostReceiveSet
	| IPostReceiveSetKeyValue
	| IPostReceiveSort;

export interface IPropertiesWithOptions {
	options: INodePropertyOptions;
	properties: INodeProperties[];
}

export interface IPropertiesWithMethods {
	properties: INodeProperties[];
	methods: IMethodModule;
}

export interface IBinaryResponseData {
	data: IBinaryData;
	fileName?: string;
	mimeType: string;
	fileType: BinaryFileType;
	fileExtension: string;
}
