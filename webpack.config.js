const path = require('path');
const fg = require('fast-glob');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

const getEntryName = (file) => {
	const cleaned = file.replace(/^src\//, '').replace(/\.js$/, '');

	if (cleaned.endsWith('/view')) {
		return cleaned.replace(/\/view$/, '-view');
	}

	return cleaned.replace(/\/index$/, '');
};

const buildEntries = () => {
	const files = fg.sync(['src/**/index.js', 'src/**/view.js'], {
		onlyFiles: true,
	});

	return files.reduce(
		(entries, file) => ({
			...entries,
			[getEntryName(file)]: path.resolve(__dirname, file),
		}),
		{}
	);
};

module.exports = {
	...defaultConfig,
	entry: {
		'editor/register-icons': './src/editor/register-icons.js',
		...buildEntries(),
	},
};
