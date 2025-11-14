<?php
/**
 * Plugin Name:       Pulsar Extensions
 * Plugin URI:        https://github.com/brettsmason/pulsar-extensions/
 * Update URI:        https://eighteen73.co.uk
 * Description:       Extensions for the Pulsar theme.
 * Version:           0.1.0
 * Requires at least: 6.8
 * Requires PHP:      7.4
 * Requires Plugins:
 * Author:            eighteen73
 * Author URI:        https://eighteen73.co.uk
 * Text Domain:       pulsar-extensions
 * Domain Path:       /languages
 *
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package           Eighteen73\PulsarExtensions
 */

namespace Eighteen73\PulsarExtensions;

defined( 'ABSPATH' ) || exit;

// Useful global constants.
define( 'PULSAR_EXTENSIONS_URL', plugin_dir_url( __FILE__ ) );
define( 'PULSAR_EXTENSIONS_PATH', plugin_dir_path( __FILE__ ) );
define( 'PULSAR_EXTENSIONS_INC', PULSAR_EXTENSIONS_PATH . 'includes/' );

// Require the autoloader.
$autoloader = PULSAR_EXTENSIONS_PATH . '/vendor/autoload.php';

if ( file_exists( $autoloader ) ) {
	require_once $autoloader;
} else {
	add_action(
		'admin_notices',
		function () {
			printf(
				'<div class="notice notice-error"><p><strong>%s</strong>: %s</p></div>',
				esc_html__( 'Pulsar Extensions', 'pulsar-extensions' ),
				sprintf(
					/* translators: %s: composer install command */
					esc_html__( 'Composer dependencies not found. Please run %s to install required dependencies.', 'pulsar-extensions' ),
					'composer install'
				)
			);
		}
	);
	return;
}

// Initialise the plugin.
Plugin::instance()->setup();

// Register activation and deactivation hooks.
register_activation_hook( __FILE__, [ Plugin::class, 'activation' ] );
register_deactivation_hook( __FILE__, [ Plugin::class, 'deactivation' ] );
