<?php
/**
 * Main plugin class.
 *
 * @package Eighteen73\PulsarExtensions
 */

namespace Eighteen73\PulsarExtensions;

defined( 'ABSPATH' ) || exit;

/**
 * Main Plugin class.
 */
class Plugin {

	use Singleton;

	/**
	 * Setup the plugin.
	 *
	 * @return void
	 */
	public function setup(): void {
		add_action( 'init', [ $this, 'load_textdomain' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_scripts' ] );
	}

	/**
	 * Load plugin textdomain.
	 *
	 * @return void
	 */
	public function load_textdomain(): void {
		load_plugin_textdomain(
			'pulsar-extensions',
			false,
			PULSAR_EXTENSIONS_PATH . '/languages'
		);
	}

	/**
	 * Plugin activation.
	 *
	 * @return void
	 */
	public static function activation(): void {}

	/**
	 * Plugin deactivation.
	 *
	 * @return void
	 */
	public static function deactivation(): void {}

	/**
	 * Enqueue frontend scripts and styles.
	 *
	 * @return void
	 */
	public function enqueue_scripts(): void {

		$column_asset  = require_once PULSAR_EXTENSIONS_PATH . 'build/column-control.asset.php';
		$columns_asset = require_once PULSAR_EXTENSIONS_PATH . 'build/columns-controls.asset.php';
		$group_asset   = require_once PULSAR_EXTENSIONS_PATH . 'build/group-controls.asset.php';

		if ( $column_asset ) {
			wp_enqueue_script(
				'pulsar-extensions-column-control',
				PULSAR_EXTENSIONS_URL . 'build/column-control.js',
				$column_asset['dependencies'],
				$column_asset['version'],
				[
					'in_footer' => true,
				],
			);
		}

		if ( $columns_asset ) {
			wp_enqueue_script(
				'pulsar-extensions-columns-controls',
				PULSAR_EXTENSIONS_URL . 'build/columns-controls.js',
				$columns_asset['dependencies'],
				$columns_asset['version'],
				[
					'in_footer' => true,
				],
			);
		}

		if ( $group_asset ) {
			wp_enqueue_script(
				'pulsar-extensions-group-controls',
				PULSAR_EXTENSIONS_URL . 'build/group-controls.js',
				$group_asset['dependencies'],
				$group_asset['version'],
				[
					'in_footer' => true,
				],
			);
		}
	}
}
