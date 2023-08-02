import { Configuration } from 'webpack';
import HTMLWebpackPlugin from 'html-webpack-plugin';

export default {
	entry: './src/client/index.tsx',

	output: {
		filename: '[name].js',
		path: __dirname + '/dist/client',
		publicPath: '/.rd-scm',
	},

	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
	},

	module: {
		rules: [
			{ test: /\.tsx?$/, loader: 'esbuild-loader' },
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader', 'postcss-loader'],
			},
		],
	},

	plugins: [
		new HTMLWebpackPlugin({
			template: './src/client/index.html',
		}),
	],
} as Configuration;
