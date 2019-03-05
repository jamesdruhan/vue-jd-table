<p align="center">
    <h2 align="center">Vue JD-Table</h2>
</p>

<p align="center">
    A Vue.js component to display data tables. Compatible with Vue 2.x.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/vue-jd-table"><img src="https://img.shields.io/npm/dt/vue-jd-table.svg?style=flat-square"></a>
    <a href="https://www.npmjs.com/package/vue-jd-table"><img src="https://img.shields.io/npm/v/vue-jd-table.svg?style=flat-square"></a>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square">
</p>

---

# WORK IN PROGRESS
**NOTE**: This readme is incomplete and does not contain all the instructions to get JDTable going. See the /public/index.html for a full understanding on how to set up the options. See /src/jd-table.vue to see all available options.

## Requirements

- Font Awesome (Free)

## Install

```
npm install --save-dev vue-jd-table
npm install --save-dev @fortawesome/fontawesome-free
```

## Usage

The following steps indicate how to initialize JDTable but not configure its required options.

### NPM

#### Single File Component
```
<template>
    <div>
        <JDTable ... ></JDTable>
    </div>
</template>

<script>
    import "@fortawesome/fontawesome-free/css/all.min.css";
    import JDTable from 'vue-jd-table';
    
    export default
    {
        name : 'MyApp',
        
        components:
        {
            JDTable
        }
    }
</script>

<style lang="scss">
    // OPTIONAL: JD-Table SCSS Variable Overrides Here.

    @import "~vue-jd-table/dist/assets/jd-table.scss";
</style
```

##### IE11 Support

If you require IE11 support you need the polyfill the dependancy. See Polyfill section.

#### Global Registration

```
import Vue     from 'vue';
import JDTable from 'vue-jd-table';

import "@fortawesome/fontawesome-free/css/all.min.css";
import 'vue-jd-table/dist/jd-table.min.css';

Vue.component('jdtable',JDTable);

new Vue
({
    ...
}).$mount( '#app' );
```

##### IE11 Support

If you require IE11 support you need the polyfill the dependancy. See Polyfill section.

#### Script Tag (Direct)

```
<!-- Polyfill -->
<script src="https://polyfill.io/v3/polyfill.js?features=es5,es6,es7&flags=gated"></script>

<!-- VueJS -->
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>

<!-- JD-Table Vue Component -->
<script src="vue-jd-table/dist/jd-table.min.js"></script>

<!-- JD-Table Styles -->
<link rel="stylesheet" href="vue-jd-table/dist/jd-table.min.css">

<!-- Font Awesome (Free) -->
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">

<div id="app">
    <JDTable ...></JDTable>
</div>

<script type="text/javascript">
    new Vue
    ({
        el : '#app',
    });
</script>
```

## Polyfill

Take note that the build module for JDTable does not include Polyfill. If you need support for legacy browsers like IE 11 you will need to inject a polyfill service.

There are multiple ways to resolve this in your project. Typically build processes like Vue-CLI do NOT add polyfill's to your imported **dependancies** (it will polyfill your app but not the JDTable dependancy).

### Polyfill Solution #1

For build processes like Vue-CLI, rather then importing the component normally, import the .VUE file directly. If your project already includes polyfill's it will be processed normally.

```
import JDTable from 'vue-jd-table/src/jd-table.vue';
```

### Polyfill Solution #2

#### Vue-CLI

Add the following to vue.config.js

```
module.exports =
{
	transpileDependencies : ['vue-jd-table']
};
```

#### Babel/Polyfill

Using babel and babel-polyfill, directly add polyfill's to your dependency's.

babel.config.js
```
module.exports = {
	presets:
	[
		['env',
		{
			polyfills :
			[
				'es6.promise',
				'es6.object.assign',
				'es6.function.name',
				'es6.array.find',
				'es6.array.find-index',
				'es7.array.includes',
				'es6.string.includes'
			]
		}]
	]
}
```