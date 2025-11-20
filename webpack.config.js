const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
	...defaultConfig,
	entry: {
		'editor/register-icons': './src/editor/register-icons.js',
		'button/icon': './src/button/icon/index.js',
		'column/order': './src/column/order/index.js',
		'columns/stacked': './src/columns/stacked/index.js',
		'group/grid': './src/group/grid/index.js',
		'group/link': './src/group/link/index.js',
		'group/row': './src/group/row/index.js',
		'group/sticky': './src/group/sticky/index.js',
	},
};
