import { Configuration } from 'webpack';
import HTMLWebpackPlugin from 'html-webpack-plugin';

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

	plugins: [
		new HTMLWebpackPlugin({
			template: './src/client/core/index.html',
		}),
	],

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'esbuild-loader',
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
