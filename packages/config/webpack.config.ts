import { Configuration } from 'webpack';
import type { Swcrc } from '@swc/core';

export default {
	entry: {
		client: './src/client/index.tsx',
		server: './src/server/index.tsx',
	},

	output: {
		filename: '[name].js',
		path: './dist',
	},

	resolve: {
		extensions: ['', '.ts', '.tsx', '.js', '.jsx'],
	},

	module: {
		loaders: [
			{
				test: /\.tsx?$/,
				loader: 'swc-loader',
				options: {
					jsc: {
						parser: {
							syntax: 'typescript',
							jsx: true,
							decorators: true,
							dynamicImport: true,
						},
						transform: {
							legacyDecorator: true,
							react: {
								pragma: 'React.createElement',
								pragmaFrag: 'React.Fragment',
								throwIfNamespace: true,
								useBuiltins: false,
							},
						},
					},
				} as Swcrc,
			},
		],
	},
} as Configuration;
