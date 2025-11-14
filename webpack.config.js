const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
	...defaultConfig,
	entry: {
		// 'grid-controls': './src/grid-controls/index.js',
		'column-control': './src/column-control/index.js',
		'columns-controls': './src/columns-controls/index.js',
		'group-controls': './src/group-controls/index.js',
	},
};
