<?php
/**
 * Stylesheet Registry Interface.
 *
 * Defines the contract for registries that generate stylesheets.
 *
 * @package Eighteen73\PulsarExtensions
 */

namespace Eighteen73\PulsarExtensions\Registries;

/**
 * Interface for stylesheet registries.
 */
interface StylesheetRegistryInterface {

	/**
	 * Get the generated CSS stylesheet.
	 *
	 * @return string The generated CSS.
	 */
	public function get_css(): string;

	/**
	 * Get the stylesheet handle for wp_enqueue_style().
	 *
	 * @return string The stylesheet handle.
	 */
	public function get_handle(): string;

	/**
	 * Clear the cached stylesheet.
	 *
	 * @return bool True if cache was cleared, false otherwise.
	 */
	public function clear_cache(): bool;
}
