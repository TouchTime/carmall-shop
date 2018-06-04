const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
// const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
	entry:"./src/main.js",
	output:{
		path: path.resolve(__dirname, "dist"),
		filename:'js/[hash].bundle.js',
		publicPath:"/shop/"
	},
	module:{
		rules:[{
			test: /\.css$/,
			use: ["style-loader","css-loader"]
		},{
			test: /\.(png|svg|jpg|gif|svg)$/,
			use: [{
				loader : "file-loader",
				options: {
					name: 'images/[hash].[ext]'
				}
			}],
		},{
			test: /\.(woff|woff2|eot|ttf|otf)$/,
			use: [{
				loader : "file-loader",
				options: {
					name: 'fonts/[hash].[ext]'
				}
			}]
		},{
			test: /\.js$/,
			exclude: /node_modules/,
			use: ["babel-loader"]
		},{
			test: /\.vue$/,
      loader: 'vue-loader',
      options: {
				loaders: 'postcss-loader',
        extractCSS: true
      }
    }]
	},
	resolve: {
    alias: {
			'vue$': 'vue/dist/vue.esm.js'
    },
		extensions: ['*', '.js', '.vue', '.json']
  },
	performance:{
		hints: false
	},
	target:"web",
	stats:{
    performance:false,
    modules:false,
    moduleTrace:false
  },
	plugins:[
		// new CleanWebpackPlugin(['dist']),
		new HtmlWebpackPlugin({filename: 'index.html', template: './public/index.html'}),
		new ExtractTextPlugin("css/[hash].css")
	]
};
