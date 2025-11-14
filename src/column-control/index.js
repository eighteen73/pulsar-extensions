/**
 * WordPress dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import FlexOrderControl from '../components/flex-order-control';
import './style.scss';

/**
 * additional block attributes object
 */
const additionalAttributes = {
	orderWhenStacked: {
		type: 'number',
	},
};

/**
 * BlockEdit
 *
 * @param {object} props block props
 * @returns {JSX}
 */
function BlockEdit({ attributes, setAttributes }) {
	const { orderWhenStacked } = attributes;

	return (
		<InspectorControls group="settings">
			<PanelBody>
				<FlexOrderControl
					value={orderWhenStacked}
					onChange={(value) =>
						setAttributes({ orderWhenStacked: value })
					}
				/>
			</PanelBody>
		</InspectorControls>
	);
}

/**
 * generateClassNames
 *
 * @param {object} attributes block attributes
 * @returns {string}
 */
function generateClassNames(attributes) {
	const { orderWhenStacked } = attributes;

	return clsx({
		[`is-order-when-stacked-${orderWhenStacked}`]: orderWhenStacked,
	});
}

registerBlockExtension(['core/column'], {
	extensionName: 'pulsar-extensions/column-controls',
	attributes: additionalAttributes,
	classNameGenerator: generateClassNames,
	Edit: BlockEdit,
	order: 'after',
});
