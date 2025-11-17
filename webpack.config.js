const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
	...defaultConfig,
	entry: {
		'column-control': './src/column-control/index.js',
		'columns-controls': './src/columns-controls/index.js',
		'grid-controls': './src/grid-controls/index.js',
		'group-controls': './src/group-controls/index.js',
	},
};
