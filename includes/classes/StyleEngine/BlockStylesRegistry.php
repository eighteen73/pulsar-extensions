<?php
/**
 * Block Styles Registry.
 *
 * Manages dynamic block container classes and their styles.
 * Similar to how WordPress generates .wp-container-{n} classes.
 *
 * @package Eighteen73\PulsarExtensions
 */

namespace Eighteen73\PulsarExtensions\StyleEngine;

use Eighteen73\PulsarExtensions\Singleton;

/**
 * Registers and manages dynamic block styles.
 */
class BlockStylesRegistry {

	use Singleton;

	/**
	 * Counter for generating unique container class numbers.
	 *
	 * @var int
	 */
	private int $container_counter = 0;

	/**
	 * Stylesheet generator instance.
	 *
	 * @var StylesheetGenerator
	 */
	private StylesheetGenerator $generator;

	/**
	 * Whether styles have been enqueued.
	 *
	 * @var bool
	 */
	private bool $enqueued = false;

	/**
	 * Constructor.
	 */
	protected function __construct() {
		$this->generator = new StylesheetGenerator();
	}

	/**
	 * Register a block style and get its unique container class.
	 *
	 * This mimics WordPress's behavior when blocks need custom styles.
	 *
	 * @param array<string, string> $declarations CSS declarations for this block.
	 * @param string                $prefix       Optional. Class prefix. Default 'wp-container'.
	 *
	 * @return string The container class name (without dot).
	 */
	public function register_block_style( array $declarations, string $prefix = 'wp-container' ): string {
		// Increment counter for unique class
		++$this->container_counter;

		// Generate the class name
		$class_name = "{$prefix}-{$this->container_counter}";

		// Create the CSS rule
		$rule = new CSSRule( ".{$class_name}", $declarations );

		// Add to generator
		$this->generator->add_rule( $rule );

		return $class_name;
	}

	/**
	 * Register multiple styles and get their class names.
	 *
	 * @param array<int, array<string, string>> $styles Array of declaration arrays.
	 * @param string                            $prefix Optional. Class prefix. Default 'wp-container'.
	 *
	 * @return string[] Array of class names.
	 */
	public function register_block_styles( array $styles, string $prefix = 'wp-container' ): array {
		$class_names = [];

		foreach ( $styles as $declarations ) {
			$class_names[] = $this->register_block_style( $declarations, $prefix );
		}

		return $class_names;
	}

	/**
	 * Get the complete stylesheet.
	 *
	 * @return string
	 */
	public function get_stylesheet(): string {
		return $this->generator->get_stylesheet();
	}

	/**
	 * Enqueue the styles.
	 *
	 * @param string $handle Style handle. Default 'pulsar-extensions-block-styles'.
	 *
	 * @return void
	 */
	public function enqueue_styles( string $handle = 'pulsar-extensions-block-styles' ): void {
		if ( $this->enqueued ) {
			return;
		}

		$css = $this->get_stylesheet();

		if ( empty( $css ) ) {
			return;
		}

		if ( ! wp_style_is( $handle, 'registered' ) ) {
			wp_register_style( $handle, false, [], PULSAR_EXTENSIONS_VERSION );
		}

		wp_enqueue_style( $handle );
		wp_add_inline_style( $handle, $css );

		$this->enqueued = true;
	}

	/**
	 * Clear all registered styles.
	 *
	 * Useful for development/testing.
	 *
	 * @return void
	 */
	public function clear(): void {
		$this->container_counter = 0;
		$this->generator->clear();
		$this->enqueued = false;
	}

	/**
	 * Get the current container counter value.
	 *
	 * @return int
	 */
	public function get_container_count(): int {
		return $this->container_counter;
	}
}
