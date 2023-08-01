import { Configuration } from 'webpack';
import type { Swcrc } from '@swc/core';

export default {
	entry: {
		server: './src/server/index.ts',
	},

	output: {
		filename: '[name].js',
		path: __dirname + '/dist/server',
	},

	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
	},

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'swc-loader',
				options: {
					jsc: {
						parser: {
							syntax: 'typescript',
							decorators: true,
							dynamicImport: true,
						},
						transform: {
							legacyDecorator: true,
						},
					},
				} as Swcrc,
			},
		],
	},

	target: 'node',
} as Configuration;