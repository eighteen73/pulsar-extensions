/**
 * WordPress dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { FocalPointPicker, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components';

/**
 * Internal dependencies
 */
import './style.scss';

/**
 * additional block attributes object
 */
const additionalAttributes = {
	focalPoint: {
		type: 'object',
	},
};

/**
 * BlockEdit
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter provided by Gutenberg.
 * @return {JSX.Element|null} Inspector controls for managing responsive grids or null.
 */
const ImageFocalPointEdit = (props) => {
	const { attributes, setAttributes } = props;
	const { url, aspectRatio, focalPoint } = attributes;

	const onChangeFocalPoint = (value) => {
		setAttributes({ focalPoint: value });
	};

	return (
		<>
			{aspectRatio && (
				<InspectorControls>
					<PanelBody>
						<FocalPointPicker
							label={__('Focal Point', 'pulsar')}
							url={url}
							value={focalPoint}
							onChange={onChangeFocalPoint}
						/>
					</PanelBody>
				</InspectorControls>
			)}
		</>
	);
};

const generateInlineStyles = (attributes) => {
	const { focalPoint } = attributes;

	if (!focalPoint) {
		return null;
	}

	const { x, y } = focalPoint;

	return {
		objectPosition: `${x * 100}% ${y * 100}%`,
	};
};

/**
 * add the block extension
 */
registerBlockExtension('core/image', {
	extensionName: 'pulsar-extensions/image-focal-point',
	attributes: additionalAttributes,
	classNameGenerator: () => null,
	inlineStyleGenerator: generateInlineStyles,
	Edit: ImageFocalPointEdit,
});
