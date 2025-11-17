import {
	BlockControls,
	InspectorControls,
	useSettings,
	__experimentalLinkControl as LinkControl,
} from '@wordpress/block-editor';
import {
	ToolbarButton,
	Popover,
	MenuGroup,
	MenuItem,
	Button,
	Icon,
	ToggleControl,
	CustomSelectControl,
	__experimentalNumberControl as NumberControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { link, page, linkOff } from '@wordpress/icons';
import { useEffect, useState, useMemo } from '@wordpress/element';

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

	const [isEditingURL, setIsEditingURL] = useState(false);
	const [popoverAnchor, setPopoverAnchor] = useState(null);
	const { attributes, setAttributes } = props;
	const {
		href,
		linkDestination,
		linkTarget,
		isStackedOnMobile,
		stackedBreakpoint,
		layout,
		stickyOffset,
		stickyZIndex,
		stickyOnScrollUp,
		unstickOnMobile,
		unstickBreakpoint,
	} = attributes;

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

	return (
		<>
			<BlockControls group="block">
				<ToolbarButton
					ref={setPopoverAnchor}
					name="link"
					icon={link}
					title={__('Link', 'pulsar-extensions')}
					onClick={() => setIsEditingURL(true)}
					isActive={
						!!href || linkDestination === 'post' || isEditingURL
					}
				/>
				{isEditingURL && (
					<Popover
						anchor={popoverAnchor}
						onClose={() => setIsEditingURL(false)}
						placement="bottom"
						focusOnMount={true}
						offset={12}
						className="pulsar-extensions-advanced-group__link-popover"
						variant="alternate"
					>
						{linkDestination !== 'post' && (
							<LinkControl
								value={{
									url: href,
									opensInNewTab: linkTarget === '_blank',
								}}
								onChange={({
									url: newURL = '',
									opensInNewTab,
								}) => {
									setAttributes({
										href: newURL,
										linkDestination: newURL
											? 'custom'
											: undefined,
										linkTarget: opensInNewTab
											? '_blank'
											: undefined,
									});
								}}
								onRemove={() =>
									setAttributes({
										href: undefined,
										linkDestination: undefined,
										linkTarget: undefined,
									})
								}
							/>
						)}
						{!href && !linkDestination && (
							<div className="enable-linked-groups__link-popover-menu">
								<MenuGroup>
									<MenuItem
										icon={page}
										iconPosition="left"
										info={__(
											'Use when the Group is located in a Query block.',
											'pulsar-extensions'
										)}
										onClick={() =>
											setAttributes({
												linkDestination: 'post',
											})
										}
									>
										{__(
											'Link to current post',
											'pulsar-extensions'
										)}
									</MenuItem>
								</MenuGroup>
							</div>
						)}
						{linkDestination === 'post' && (
							<div className="enable-linked-groups__link-popover-post-selected">
								<div className="enable-linked-groups__link-popover-post-selected-label">
									<span className="enable-linked-groups__link-popover-post-selected-icon">
										<Icon icon={page} />
									</span>
									{__(
										'Linked to current post',
										'pulsar-extensions'
									)}
								</div>
								<Button
									icon={linkOff}
									label={__(
										'Remove link',
										'pulsar-extensions'
									)}
									onClick={() =>
										setAttributes({
											linkDestination: undefined,
										})
									}
								/>
							</div>
						)}
					</Popover>
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
		isStackedOnMobile,
		stackedBreakpoint,
		isFlexWrapEnabled,
		stickyOnScrollUp,
		stickyOffset,
		unstickOnMobile,
		unstickBreakpoint,
	} = attributes;

	return clsx({
		['is-linked']: !!href,
		['is-linked-to-post']: linkDestination === 'post',
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
