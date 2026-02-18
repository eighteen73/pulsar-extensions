<?php
/**
 * Post Featured Image Focal Point extension class.
 *
 * @package Eighteen73\PulsarExtensions
 */

namespace Eighteen73\PulsarExtensions\Extensions\PostFeaturedImage;

use Eighteen73\PulsarExtensions\Singleton;
use WP_Block;
use WP_HTML_Tag_Processor;

/**
 * Focal Point class.
 */
class FocalPoint {

	use Singleton;

	/**
	 * Setup the class.
	 *
	 * @return void
	 */
	public function setup(): void {
		add_action( 'init', [ $this, 'register_meta' ] );
		add_filter( 'render_block_core/post-featured-image', [ $this, 'render_focal_point' ], 10, 3 );
	}

	/**
	 * Register meta.
	 * Global for all post types.
	 *
	 * @return void
	 */
	public function register_meta(): void {
		register_post_meta(
			'',
			'_thumbnail_focal_point',
			[
				'show_in_rest'      => [
					'schema' => [
						'type'       => 'object',
						'properties' => [
							'x' => [
								'type'    => 'number',
								'minimum' => 0,
								'maximum' => 1,
							],
							'y' => [
								'type'    => 'number',
								'minimum' => 0,
								'maximum' => 1,
							],
						],
						'required'   => [ 'x', 'y' ],
					],
				],
				'single'            => true,
				'type'              => 'object',
				'auth_callback'     => function () {
					return current_user_can( 'edit_posts' );
				},
				'sanitize_callback' => function ( $value ) {
					if ( ! is_array( $value ) ) {
						return null;
					}
					return [
						'x' => isset( $value['x'] ) ? (float) $value['x'] : 0.5,
						'y' => isset( $value['y'] ) ? (float) $value['y'] : 0.5,
					];
				},
			]
		);
	}

	/**
	 * Add the intro class to the group.
	 *
	 * @param string   $block_content The block content.
	 * @param array    $block         The block.
	 * @param WP_Block $instance The block instance.
	 *
	 * @return string
	 */
	public function render_focal_point( string $block_content, array $block, WP_Block $instance ): string {

		// get the post id from context
		$post_id = $instance->context['postId'];

		// get the post featured image focal point
		$focal_point_object = get_post_meta( $post_id, '_thumbnail_focal_point', true );

		// if the focal point is set, add the style attribute to the image
		if ( $focal_point_object ) {
			$focal_point = round( $focal_point_object['x'] * 100 ) . '% ' . round( $focal_point_object['y'] * 100 ) . '%';
			$tags        = new WP_HTML_Tag_Processor( $block_content );

			$tags->next_tag( [ 'tag_name' => 'img' ] );
			$current_style = $tags->get_attribute( 'style' );
			$tags->set_attribute( 'style', $current_style . ' object-position: ' . $focal_point . ';' );
			$block_content = $tags->get_updated_html();
		}

		return $block_content;
	}
}
