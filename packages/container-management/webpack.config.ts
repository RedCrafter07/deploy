import { Configuration } from 'webpack';

export default {
	entry: {
		server: './src/server/index.ts',
	},

	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
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
				},
				exclude: /node_modules/,
			},
		],
	},

	target: 'node',
} as Configuration;
