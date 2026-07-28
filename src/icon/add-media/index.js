/**
 * WordPress dependencies
 */
import {
	BlockControls,
	InspectorControls,
	MediaReplaceFlow,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel as ToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { store as coreStore } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components/api/register-block-extension';

/**
 * Internal dependencies
 */
import './style.scss';

const ALLOWED_MEDIA_TYPES = ['image/svg+xml'];
const SVG_MIME = 'image/svg+xml';
const MEDIA_ICON_PREFIX = 'pulsar-media/';

/**
 * Additional block attributes.
 */
const additionalAttributes = {
	iconId: {
		type: 'number',
	},
	overrideColor: {
		type: 'boolean',
		default: false,
	},
};

/**
 * Build the editor-only icon name used to drive core's preview.
 *
 * @param {number} iconId Attachment ID.
 * @return {string} Namespaced icon name.
 */
const getMediaIconName = (iconId) => `${MEDIA_ICON_PREFIX}${iconId}`;

/**
 * Whether a media object is an SVG attachment.
 *
 * @param {Object} media Media object from the media library.
 * @return {boolean} True when the media is an SVG.
 */
const isSvgMedia = (media) => {
	if (!media) {
		return false;
	}

	return (
		media.mime === SVG_MIME ||
		media.mime_type === SVG_MIME ||
		media.subtype === 'svg+xml' ||
		(typeof media.url === 'string' && media.url.endsWith('.svg')) ||
		(typeof media.source_url === 'string' &&
			media.source_url.endsWith('.svg'))
	);
};

/**
 * Seed core's icon entity store so the native icon block preview works.
 *
 * @param {Function} receiveEntityRecords core-data action.
 * @param {number}   iconId               Attachment ID.
 * @param {string}   content              SVG markup.
 */
const seedMediaIconEntity = (receiveEntityRecords, iconId, content) => {
	if (!iconId || !content || typeof receiveEntityRecords !== 'function') {
		return;
	}

	const name = getMediaIconName(iconId);

	receiveEntityRecords(
		'root',
		'icon',
		[
			{
				name,
				label: __('Custom SVG', 'pulsar-extensions'),
				content,
			},
		],
		undefined,
		false
	);
};

/**
 * Keep registry icons and custom media mutually exclusive, and keep the
 * editor preview entity in sync when iconId is set.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter.
 * @return {null} Nothing to render.
 */
const CustomIconSync = ({ attributes, setAttributes }) => {
	const { icon, iconId } = attributes;
	const { receiveEntityRecords } = useDispatch(coreStore);

	useEffect(() => {
		if (!iconId) {
			return;
		}

		const iconName = icon ? String(icon) : '';
		const isRegistryIcon =
			iconName !== '' && !iconName.startsWith(MEDIA_ICON_PREFIX);

		// Core inserter won — clear custom media and do not overwrite `icon`.
		if (isRegistryIcon) {
			setAttributes({ iconId: undefined });
			return;
		}

		const mediaIconName = getMediaIconName(iconId);

		if (iconName !== mediaIconName) {
			setAttributes({ icon: mediaIconName });
		}

		let cancelled = false;

		apiFetch({
			path: `/pulsar-extensions/v1/icon-svg/${iconId}`,
		})
			.then((response) => {
				if (cancelled || typeof response?.content !== 'string') {
					return;
				}
				seedMediaIconEntity(
					receiveEntityRecords,
					iconId,
					response.content
				);
			})
			.catch(() => {
				// Preview stays empty if SVG cannot be loaded.
			});

		return () => {
			cancelled = true;
		};
	}, [icon, iconId, receiveEntityRecords, setAttributes]);

	return null;
};

/**
 * Block edit toolbar button for uploading an icon.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter.
 * @return {JSX.Element} Toolbar button for uploading an icon.
 */
const AddMediaEdit = (props) => {
	const { attributes, setAttributes } = props;
	const { iconId, overrideColor } = attributes;

	const { receiveEntityRecords } = useDispatch(coreStore);

	const media = useSelect(
		(select) => {
			if (!iconId) {
				return null;
			}

			return select(coreStore).getEntityRecord(
				'postType',
				'attachment',
				iconId,
				{ context: 'view' }
			);
		},
		[iconId]
	);

	const onSelectMedia = (selected) => {
		if (!isSvgMedia(selected)) {
			return;
		}

		const nextId = selected.id;

		setAttributes({
			iconId: nextId,
			icon: getMediaIconName(nextId),
		});

		apiFetch({
			path: `/pulsar-extensions/v1/icon-svg/${nextId}`,
		})
			.then((response) => {
				if (typeof response?.content === 'string') {
					seedMediaIconEntity(
						receiveEntityRecords,
						nextId,
						response.content
					);
				}
			})
			.catch(() => {});
	};

	const onRemoveMedia = () => {
		setAttributes({
			iconId: undefined,
			icon: undefined,
			overrideColor: false,
		});
	};

	return (
		<>
			<BlockControls group="other">
				<ToolbarGroup>
					<MediaUploadCheck>
						{iconId ? (
							<MediaReplaceFlow
								mediaId={iconId}
								mediaURL={media?.source_url}
								allowedTypes={ALLOWED_MEDIA_TYPES}
								accept={SVG_MIME}
								onSelect={onSelectMedia}
								onReset={onRemoveMedia}
								name={__(
									'Edit custom icon',
									'pulsar-extensions'
								)}
							/>
						) : (
							<MediaUpload
								onSelect={onSelectMedia}
								allowedTypes={ALLOWED_MEDIA_TYPES}
								accept={SVG_MIME}
								value={iconId}
								render={({ open }) => (
									<ToolbarButton
										text={__(
											'Custom icon',
											'pulsar-extensions'
										)}
										onClick={open}
									/>
								)}
							/>
						)}
					</MediaUploadCheck>
				</ToolbarGroup>
			</BlockControls>

			{iconId && (
				<InspectorControls group="styles">
					<ToolsPanel label={__('Custom icon', 'pulsar-extensions')}>
						<ToolsPanelItem
							label={__('Override color', 'pulsar-extensions')}
							hasValue={() => overrideColor}
							onDeselect={() =>
								setAttributes({ overrideColor: false })
							}
							isShownByDefault
						>
							<ToggleControl
								label={__(
									'Override color',
									'pulsar-extensions'
								)}
								checked={overrideColor}
								onChange={(value) =>
									setAttributes({ overrideColor: value })
								}
							/>
						</ToolsPanelItem>
					</ToolsPanel>
				</InspectorControls>
			)}
		</>
	);
};

/**
 * Always-on BlockEdit wrapper for entity sync + mutual exclusivity.
 */
const withCustomIconSync = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		if (props.name !== 'core/icon') {
			return <BlockEdit {...props} />;
		}

		return (
			<>
				<BlockEdit {...props} />
				<CustomIconSync {...props} />
			</>
		);
	};
}, 'withCustomIconSync');

addFilter(
	'editor.BlockEdit',
	'pulsar-extensions/icon-add-media-sync',
	withCustomIconSync
);

/**
 * generateClassNames
 *
 * @param {Object} attributes Block attributes.
 * @return {string} Generated class list representing responsive column states.
 */
function generateClassNames(attributes) {
	const { overrideColor, iconId } = attributes;

	if (!iconId) {
		return null;
	}

	let className = 'has-custom-icon';

	if (overrideColor) {
		className += ' is-override-color';
	}

	return className;
}

registerBlockExtension('core/icon', {
	extensionName: 'pulsar-extensions/add-media',
	attributes: additionalAttributes,
	classNameGenerator: generateClassNames,
	Edit: AddMediaEdit,
});
