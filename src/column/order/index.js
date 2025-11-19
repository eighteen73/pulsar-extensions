/**
 * WordPress dependencies
 */
import {
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components/api/register-block-extension';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import FlexOrderControl from '../../components/flex-order-control';

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
function BlockEdit({ clientId, attributes, setAttributes }) {
	const { orderWhenStacked } = attributes;
	const columnCount = useSelect(
		(select) => {
			if (!clientId) {
				return 1;
			}

			const { getBlockParentsByBlockName, getBlock } =
				select(blockEditorStore);
			const parentColumns = getBlockParentsByBlockName(clientId, [
				'core/columns',
			]);
			const parentColumnsClientId = parentColumns?.[0];

			if (!parentColumnsClientId) {
				return 1;
			}

			const parentColumnsBlock = getBlock(parentColumnsClientId);

			return parentColumnsBlock?.innerBlocks?.length || 1;
		},
		[clientId]
	);

	useEffect(() => {
		if (
			typeof orderWhenStacked === 'number' &&
			orderWhenStacked > columnCount &&
			columnCount > 0
		) {
			setAttributes({ orderWhenStacked: columnCount });
		}
	}, [columnCount, orderWhenStacked, setAttributes]);

	return (
		<InspectorControls group="settings">
			<PanelBody>
				<FlexOrderControl
					value={orderWhenStacked || undefined}
					itemCount={columnCount}
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
		[`is-order-${orderWhenStacked}`]:
			orderWhenStacked && orderWhenStacked > 0,
	});
}

registerBlockExtension('core/column', {
	extensionName: 'pulsar-extensions/column/order',
	attributes: additionalAttributes,
	classNameGenerator: generateClassNames,
	Edit: BlockEdit,
	order: 'after',
});
