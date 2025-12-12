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
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components/api/register-block-extension';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import FlexOrderControl from '../../components/flex-order-control';
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
function BlockEdit({ clientId, attributes, setAttributes }) {
	const { orderWhenStacked } = attributes;

	const { isStackedOnMobile, columnCount } = useSelect(
		(select) => {
			const { getBlockParentsByBlockName, getBlock } =
				select(blockEditorStore);

			if (!clientId) {
				return { isStackedOnMobile: true, columnCount: 1 };
			}

			const parentColumns = getBlockParentsByBlockName(clientId, [
				'core/columns',
			]);

			const parentColumnsClientId = parentColumns?.[0];

			if (!parentColumnsClientId) {
				return { isStackedOnMobile: true, columnCount: 1 };
			}

			const parentColumnsBlock = getBlock(parentColumnsClientId);

			return {
				isStackedOnMobile:
					parentColumnsBlock?.attributes?.isStackedOnMobile ?? true,
				columnCount: parentColumnsBlock?.innerBlocks?.length || 1,
			};
		},
		[clientId]
	);

	if (!isStackedOnMobile) {
		return null;
	}

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
					label={__('Order when stacked', 'pulsar-extensions')}
					helpText={__(
						'Choose the display order for this column when stacked.',
						'pulsar-extensions'
					)}
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
