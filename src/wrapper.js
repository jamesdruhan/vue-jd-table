import './assets/jd-table.scss';
import component from './jd-table.vue';

export function install( Vue )
{
	if ( install.installed )
	{
		return;
	}

	install.installed = true;

	Vue.component( 'jdtable', component );
}

const plugin =
{
	install
};

let GlobalVue = null;

if ( typeof window !== 'undefined' )
{
	GlobalVue = window.Vue;
}
else if ( typeof global !== 'undefined' )
{
	GlobalVue = global.Vue;
}

if ( GlobalVue )
{
	GlobalVue.use( plugin );
}

component.install = install;

export default component;