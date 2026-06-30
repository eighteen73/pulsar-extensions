/**
 * External dependencies
 */
import { registerBlockExtension } from '@10up/block-components/api/register-block-extension';

/**
 * Internal dependencies
 */
import {
	generateResponsiveGridClasses,
	generateResponsiveGridInlineStyles,
	ResponsiveGridEdit,
	responsiveColumnsAttributes,
} from '../../components/responsive-grid-extension';
import './style.scss';

registerBlockExtension('core/post-template', {
	extensionName: 'pulsar-extensions/post-template/grid',
	attributes: responsiveColumnsAttributes,
	classNameGenerator: generateResponsiveGridClasses,
	inlineStyleGenerator: generateResponsiveGridInlineStyles,
	Edit: ResponsiveGridEdit,
	order: 'after',
});
