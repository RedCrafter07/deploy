import { Configuration } from 'webpack';
import type { Swcrc } from '@swc/core';

export default {
	entry: {
		client: './src/client/index.tsx',
	},

	output: {
		filename: '[name].js',
		path: __dirname + '/dist/client',
		publicPath: '/.rd-web/',
	},

	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
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
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader', 'postcss-loader'],
			},
			{
				test: /\.(png|jpg|gif|svg|eot|ttf)$/,
				loader: 'url-loader',
			},
		],
	},
} as Configuration;
