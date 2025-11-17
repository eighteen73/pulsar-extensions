import {
	BlockControls,
	InspectorControls,
	URLPopover,
	useSettings,
} from '@wordpress/block-editor';
import {
	ToolbarButton,
	MenuGroup,
	MenuItem,
	Button,
	Icon,
	ToggleControl,
	CustomSelectControl,
	__experimentalNumberControl as NumberControl,
	__experimentalVStack as VStack,
	NavigableMenu,
	TextControl,
	ExternalLink,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { link, page, linkOff } from '@wordpress/icons';
import {
	useEffect,
	useState,
	useMemo,
	useRef,
	createInterpolateElement,
} from '@wordpress/element';
import { prependHTTP } from '@wordpress/url';
import { focus } from '@wordpress/dom';

/**
 * Internal dependencies
 */
import BreakpointSelectionControl from '../components/breakpoint-selection-control';

/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components/api/register-block-extension';
import clsx from 'clsx';

/**
 * Link destination constants
 */
const LINK_DESTINATION_NONE = 'none';
const LINK_DESTINATION_CUSTOM = 'custom';
const LINK_DESTINATION_POST = 'post';
const NEW_TAB_REL = ['noreferrer', 'noopener'];

/**
 * additional block attributes object
 */
const additionalAttributes = {
	href: {
		type: 'string',
	},
	linkDestination: {
		type: 'string',
	},
	linkTarget: {
		type: 'string',
	},
	rel: {
		type: 'string',
	},
	linkClass: {
		type: 'string',
	},
	isStackedOnMobile: {
		type: 'boolean',
	},
	stickyScrollOffset: {
		type: 'string',
	},
	stickyZIndex: {
		type: 'number',
	},
	stickyOnScrollUp: {
		type: 'boolean',
	},
	unstickOnMobile: {
		type: 'boolean',
	},
	unstickBreakpoint: {
		type: 'string',
	},
};

/**
 * BlockEdit
 *
 * @param {object} props block props
 * @returns {JSX}
 */
function BlockEdit(props) {
	const supportsStacking = props.name === 'core/group';

	const { attributes, setAttributes } = props;
	const {
		href,
		linkDestination,
		linkTarget,
		rel,
		linkClass,
		isStackedOnMobile,
		stackedBreakpoint,
		layout,
		stickyOffset,
		stickyZIndex,
		stickyOnScrollUp,
		unstickOnMobile,
		unstickBreakpoint,
	} = attributes;

	// Link control states
	const [isOpen, setIsOpen] = useState(false);
	const [popoverAnchor, setPopoverAnchor] = useState(null);
	const [isEditingLink, setIsEditingLink] = useState(false);
	const [urlInput, setUrlInput] = useState(null);

	// Refs
	const autocompleteRef = useRef(null);
	const wrapperRef = useRef();

	const isLinkingToPost = linkDestination === LINK_DESTINATION_POST;

	const isRowLayout =
		layout?.type === 'flex' && layout?.orientation !== 'vertical';
	const isFlexWrapEnabled = layout?.flexWrap === 'wrap';

	const [spacingSizes] = useSettings('spacing.spacingSizes');

	const spacingPresetOptions = useMemo(() => {
		const themeSpacingOptions = (spacingSizes ?? []).map(
			({ name, slug }) => ({
				key: slug,
				name,
			})
		);

		return [
			{
				key: '',
				name: __('Default', 'pulsar-extensions'),
			},
			...themeSpacingOptions,
		];
	}, [spacingSizes]);

	const selectedStickyOffset = useMemo(() => {
		if (!stickyOffset) {
			return spacingPresetOptions[0];
		}

		return (
			spacingPresetOptions.find(
				(option) => option.key === stickyOffset
			) ?? spacingPresetOptions[0]
		);
	}, [spacingPresetOptions, stickyOffset]);

	// Watch for flexWrap changes and disable stack if flexWrap is enabled
	useEffect(() => {
		if (isFlexWrapEnabled && isStackedOnMobile) {
			setAttributes({ isStackedOnMobile: false });
		}
	}, [isFlexWrapEnabled, isStackedOnMobile, setAttributes]);

	// Focus management
	useEffect(() => {
		if (!wrapperRef.current) {
			return;
		}
		const nextFocusTarget =
			focus.focusable.find(wrapperRef.current)[0] || wrapperRef.current;
		nextFocusTarget.focus();
	}, [isEditingLink, href, isLinkingToPost]);

	// Link control functions
	const openLinkUI = () => {
		setIsOpen(true);
	};

	const startEditLink = () => {
		if (linkDestination === LINK_DESTINATION_POST) {
			// Clear the link to post destination when editing
			setAttributes({
				linkDestination: LINK_DESTINATION_NONE,
				href: '',
			});
			setUrlInput('');
		}
		setIsEditingLink(true);
	};

	const stopEditLink = () => {
		setIsEditingLink(false);
	};

	const closeLinkUI = () => {
		setUrlInput(null);
		stopEditLink();
		setIsOpen(false);
	};

	const getLinkDestinations = () => {
		return [
			{
				linkDestination: LINK_DESTINATION_POST,
				title: __('Link to current post'),
				url: undefined,
				icon: page,
			},
		];
	};

	const onSetHref = (value) => {
		const linkDestinations = getLinkDestinations();
		let linkDestinationInput;
		if (!value) {
			linkDestinationInput = LINK_DESTINATION_NONE;
		} else {
			linkDestinationInput = (
				linkDestinations.find((destination) => {
					return destination.url === value;
				}) || { linkDestination: LINK_DESTINATION_CUSTOM }
			).linkDestination;
		}
		setAttributes({
			linkDestination: linkDestinationInput,
			href: value,
		});
	};

	const getUpdatedLinkTargetSettings = (value) => {
		const newLinkTarget = value ? '_blank' : undefined;

		let updatedRel;
		if (newLinkTarget) {
			const rels = (rel ?? '').split(' ');
			NEW_TAB_REL.forEach((relVal) => {
				if (!rels.includes(relVal)) {
					rels.push(relVal);
				}
			});
			updatedRel = rels.join(' ');
		} else {
			const rels = (rel ?? '')
				.split(' ')
				.filter((relVal) => NEW_TAB_REL.includes(relVal) === false);
			updatedRel = rels.length ? rels.join(' ') : undefined;
		}

		return {
			linkTarget: newLinkTarget,
			rel: updatedRel,
		};
	};

	const onSetNewTab = (value) => {
		const updatedLinkTarget = getUpdatedLinkTargetSettings(value);
		setAttributes(updatedLinkTarget);
	};

	const onSetLinkRel = (value) => {
		setAttributes({ rel: value });
	};

	const onSetLinkClass = (value) => {
		setAttributes({ linkClass: value });
	};

	const onChangeUrl = (updatedValue) => {
		setAttributes(updatedValue);
	};

	const onFocusOutside = () => {
		return (event) => {
			// The autocomplete suggestions list renders in a separate popover (in a portal),
			// so onFocusOutside fails to detect that a click on a suggestion occurred in the
			// LinkContainer. Detect clicks on autocomplete suggestions using a ref here, and
			// return to avoid the popover being closed.
			const autocompleteElement = autocompleteRef.current;
			if (
				autocompleteElement &&
				autocompleteElement.contains(event.target)
			) {
				return;
			}
			setIsOpen(false);
			setUrlInput(null);
			stopEditLink();
		};
	};

	const onSubmitLinkChange = () => {
		return (event) => {
			if (urlInput) {
				// It is possible the entered URL actually matches a named link destination.
				// This check will ensure our link destination is correct.
				const selectedDestination =
					getLinkDestinations().find(
						(destination) => destination.url === urlInput
					)?.linkDestination || LINK_DESTINATION_CUSTOM;

				onChangeUrl({
					href: prependHTTP(urlInput),
					linkDestination: selectedDestination,
				});
			}
			stopEditLink();
			setUrlInput(null);
			event.preventDefault();
		};
	};

	const onLinkRemove = () => {
		onChangeUrl({
			linkDestination: LINK_DESTINATION_NONE,
			href: '',
		});
	};

	const advancedOptions = (
		<VStack spacing="3">
			<ToggleControl
				__nextHasNoMarginBottom
				label={__('Open in new tab')}
				onChange={onSetNewTab}
				checked={linkTarget === '_blank'}
			/>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={__('Link relation')}
				value={rel ?? ''}
				onChange={onSetLinkRel}
				help={createInterpolateElement(
					__(
						'The <a>Link Relation</a> attribute defines the relationship between a linked resource and the current document.'
					),
					{
						a: (
							<ExternalLink href="https://developer.mozilla.org/docs/Web/HTML/Attributes/rel" />
						),
					}
				)}
			/>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={__('Link CSS class')}
				value={linkClass || ''}
				onChange={onSetLinkClass}
			/>
		</VStack>
	);

	const linkEditorValue = urlInput !== null ? urlInput : href;
	const showLinkEditor = !linkEditorValue && !isLinkingToPost;

	const urlLabel =
		linkDestination === LINK_DESTINATION_POST
			? __('Link to current post')
			: undefined;

	const PopoverChildren = () => {
		if ((href || isLinkingToPost) && !isEditingLink) {
			return (
				<>
					<URLPopover.LinkViewer
						className="block-editor-format-toolbar__link-container-content"
						url={href || '#'}
						onEditLinkClick={startEditLink}
						urlLabel={urlLabel}
					/>
					<Button
						icon={linkOff}
						label={__('Remove link')}
						onClick={() => {
							onLinkRemove();
						}}
						size="compact"
					/>
				</>
			);
		} else {
			return (
				<URLPopover.LinkEditor
					className="block-editor-format-toolbar__link-container-content"
					value={linkEditorValue}
					onChangeInputValue={setUrlInput}
					onSubmit={onSubmitLinkChange()}
					autocompleteRef={autocompleteRef}
				/>
			);
		}
	};

	return (
		<>
			<BlockControls group="block">
				<ToolbarButton
					icon={link}
					className="components-toolbar__control"
					label={__('Link')}
					aria-expanded={isOpen}
					onClick={openLinkUI}
					ref={setPopoverAnchor}
					isActive={!!href || isLinkingToPost}
				/>
				{isOpen && (
					<URLPopover
						ref={wrapperRef}
						anchor={popoverAnchor}
						onFocusOutside={onFocusOutside()}
						onClose={closeLinkUI}
						renderSettings={() => advancedOptions}
						additionalControls={
							showLinkEditor && (
								<NavigableMenu>
									{getLinkDestinations().map((link) => (
										<MenuItem
											key={link.linkDestination}
											icon={link.icon}
											iconPosition="left"
											onClick={() => {
												setUrlInput(null);
												onChangeUrl({
													href: '',
													linkDestination:
														link.linkDestination,
												});
												stopEditLink();
											}}
										>
											{link.title}
										</MenuItem>
									))}
								</NavigableMenu>
							)
						}
						offset={13}
					>
						{PopoverChildren()}
					</URLPopover>
				)}
			</BlockControls>

			{supportsStacking && isRowLayout && (
				<InspectorControls>
					<div style={{ padding: '0 16px 8px' }}>
						<ToggleControl
							label={__(
								'Stack row on mobile',
								'pulsar-extensions'
							)}
							help={
								isFlexWrapEnabled
									? __(
											'Disabled when "Allow to wrap to multiple lines" is enabled',
											'pulsar-extensions'
										)
									: __(
											'More predictable control over when the row stacks',
											'pulsar-extensions'
										)
							}
							checked={isStackedOnMobile || false}
							disabled={isFlexWrapEnabled}
							onChange={() => {
								setAttributes({
									isStackedOnMobile: !isStackedOnMobile,
								});
							}}
						/>

						{isStackedOnMobile && !isFlexWrapEnabled && (
							<BreakpointSelectionControl
								label={__(
									'Stacked breakpoint',
									'pulsar-extensions'
								)}
								value={stackedBreakpoint || 'md'}
								onChange={(value) =>
									setAttributes({ stackedBreakpoint: value })
								}
							/>
						)}
					</div>
				</InspectorControls>
			)}
			{supportsStacking &&
				attributes?.style?.position?.type === 'sticky' && (
					<InspectorControls group="position">
						<div style={{ paddingTop: '16px' }}>
							<VStack spacing={4}>
								<CustomSelectControl
									label={__(
										'Top offset',
										'pulsar-extensions'
									)}
									help={__(
										'Distance from the top edge when stuck to the viewport',
										'pulsar-extensions'
									)}
									value={selectedStickyOffset}
									onChange={({ selectedItem }) => {
										setAttributes({
											stickyOffset:
												selectedItem?.key || null,
										});
									}}
									options={spacingPresetOptions}
								/>
								<NumberControl
									label={__(
										'Z-Index position',
										'pulsar-extensions'
									)}
									help={__(
										'Control stacking order. Higher values appear on top.',
										'pulsar-extensions'
									)}
									value={stickyZIndex ?? 0}
									onChange={(value) => {
										// Convert to number and set to null if 0
										const numValue =
											value === '' || value === undefined
												? 0
												: Number(value);
										setAttributes({
											stickyZIndex:
												numValue === 0
													? null
													: numValue,
										});
									}}
									step={1}
								/>
								<ToggleControl
									label={__(
										'Hide on scroll down',
										'pulsar-extensions'
									)}
									help={__(
										'Hide sticky element when scrolling down, show when scrolling up.',
										'pulsar-extensions'
									)}
									checked={stickyOnScrollUp || false}
									onChange={(value) =>
										setAttributes({
											stickyOnScrollUp: value,
										})
									}
								/>
								<ToggleControl
									label={__(
										'Unstick on mobile',
										'pulsar-extensions'
									)}
									help={__(
										'Disable sticky positioning on mobile devices',
										'pulsar-extensions'
									)}
									checked={unstickOnMobile || false}
									onChange={(value) =>
										setAttributes({
											unstickOnMobile: value,
										})
									}
								/>

								{unstickOnMobile && (
									<BreakpointSelectionControl
										label={__(
											'Unstick breakpoint',
											'pulsar-extensions'
										)}
										value={unstickBreakpoint || 'lg'}
										onChange={(value) =>
											setAttributes({
												unstickBreakpoint: value,
											})
										}
									/>
								)}
							</VStack>
						</div>
					</InspectorControls>
				)}
		</>
	);
}

/**
 * generateClassNames
 *
 * @param {object} attributes block attributes
 * @returns {string}
 */
function generateClassNames(attributes) {
	const {
		href,
		linkDestination,
		linkClass,
		isStackedOnMobile,
		stackedBreakpoint,
		isFlexWrapEnabled,
		stickyOnScrollUp,
		stickyOffset,
		unstickOnMobile,
		unstickBreakpoint,
	} = attributes;

	return clsx({
		['is-linked']: !!href || linkDestination === LINK_DESTINATION_POST,
		['is-linked-to-post']: linkDestination === LINK_DESTINATION_POST,
		[linkClass]: !!linkClass,
		'is-stacked-on-mobile': isStackedOnMobile && !isFlexWrapEnabled,
		[`is-stacked-on-${stackedBreakpoint}`]:
			isStackedOnMobile && !!stackedBreakpoint && !isFlexWrapEnabled,
		['is-sticky-hidden-on-scroll-down']: stickyOnScrollUp,
		[`is-sticky-offset-${stickyOffset}`]: stickyOffset,
		['is-unstuck-on-mobile']: unstickOnMobile,
		[`is-unstuck-on-${unstickBreakpoint}`]:
			unstickOnMobile && !!unstickBreakpoint,
	});
}

/**
 * generateInlineStyles
 *
 * a function to generate the new inline styles object that should get added to
 * the wrapping element of the block.
 *
 * @param {object} attributes block attributes
 * @returns {string}
 */
function generateInlineStyles(attributes) {
	return '';
}

registerBlockExtension(['core/group', 'core/column'], {
	extensionName: 'pulsar-extensions/group-controls',
	attributes: additionalAttributes,
	classNameGenerator: generateClassNames,
	inlineStyleGenerator: generateInlineStyles,
	Edit: BlockEdit,
	order: 'after',
});
