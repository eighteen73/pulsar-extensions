import { registerBlockExtension } from '@10up/block-components';

/**
 * additional block attributes object
 */
const additionalAttributes = {
    hasBackgroundPattern: {
        type: 'boolean',
        default: false,
    },
    backgroundPatternShape: {
        type: 'string',
        default: 'dots',
    },
    backgroundPatternColor: {
        type: 'string',
        default: 'green'
    }
}

/**
 * BlockEdit
 *
 * a react component that will get mounted in the Editor when the block is
 * selected. It is recommended to use Slots like `BlockControls` or `InspectorControls`
 * in here to put settings into the blocks toolbar or sidebar.
 *
 * @param {object} props block props
 * @returns {JSX}
 */
function BlockEdit(props) {...}

/**
 * generateClassNames
 *
 * a function to generate the new className string that should get added to
 * the wrapping element of the block.
 *
 * @param {object} attributes block attributes
 * @returns {string}
 */
function generateClassNames(attributes) {...}

registerBlockExtension(
 [ 'core/group' ],
 {
  extensionName: 'pulsar-extensions/grid-controls',
  attributes: additionalAttributes,
  classNameGenerator: generateClassNames,
  Edit: BlockEdit,
  order: 'before',
 }
);
