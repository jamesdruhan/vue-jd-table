import vue         from 'rollup-plugin-vue';
import scss        from 'rollup-plugin-scss';
import buble       from 'rollup-plugin-buble';
import commonjs    from 'rollup-plugin-commonjs';
import replace     from 'rollup-plugin-replace';
import copy        from 'rollup-plugin-copy-assets';
import { terser }  from "rollup-plugin-terser";
import nodeResolve from 'rollup-plugin-node-resolve';
import livereload  from 'rollup-plugin-livereload';
import serve       from 'rollup-plugin-serve';
import minimist    from 'minimist';

const argv = minimist( process.argv.slice(2) );

// Declare Rollup Plugins
const plugins =
[
	// Replace strings in files while bundling them.
	replace
	({
		'process.env.NODE_ENV' : JSON.stringify('production'),
	}),

	// Convert CommonJS modules to ES6, so they can be included in a Rollup bundle.
	commonjs(),

	// Processes SCSS files in Rollup.
	scss(),

	// Processes VUE templates in Rollup.
	vue
	({
		css             : true,
		compileTemplate : true,
		template        :
		{
			isProduction : true,
		}
	}),

	// Convert ES2015 for Rollup.
	buble(),

	// Rollup plugin to minify generated es bundle. Uses terser under the hood.
	terser(),

	// Copies RAW assets to the distributed folder.
	copy
	({
		assets :
		[
			'./src/assets/jd-table.scss',
			'./src/assets/jd-table-vars.scss'
		]
	}),

	// Locate modules using the Node resolution algorithm.
	nodeResolve
	({
		browser : true,
		jsnext  : true
	})
];

// Development : Enable live reload and serve @ localhost.
if ( process.env.NODE_ENV === 'development' )
{
	plugins.push( livereload() );

	plugins.push
	(
		serve
		({
			open        : true,
			openPage    : '/',
			verbose     : true,
			contentBase : 'public',
			port        : 8080
		})
	);
}

const config =
{
	input  : 'src/wrapper.js',

	output :
	{
		name      : 'JDTable',
		exports   : 'named',
		file      : 'public/component.js',
		sourcemap : true,
	},

	plugins
};

export default config;