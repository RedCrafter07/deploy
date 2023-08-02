import { Configuration } from 'webpack';
import HTMLWebpackPlugin from 'html-webpack-plugin';

export default {
	entry: './src/client/index.tsx',

	output: {
		filename: 'index.js',
		path: __dirname + '/dist/client',
		publicPath: '/.rd-scm',
	},

	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json'],
	},

	module: {
		rules: [
			{ test: /\.tsx?$/, use: 'esbuild-loader' },
			{ test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
		],
	},

	plugins: [
		new HTMLWebpackPlugin({
			template: './src/client/index.html',
		}),
	],
} as Configuration;
