<p align="center">
    <h2 align="center">Vue JD-Table</h2>
</p>

<p align="center">
    A Vue.js component to display data tables. Compatible with Vue 2.x.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/vue-jd-table"><img src="https://img.shields.io/npm/dt/vue-jd-table.svg?style=flat-square"></a>
    <a href="https://www.npmjs.com/package/vue-jd-table"><img src="https://img.shields.io/npm/v/vue-jd-table.svg?style=flat-square"></a>
    <a href="https://github.com/coderdiaz/vue-datasource/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square"></a>
</p>

---

# WORK IN PROGRESS
**NOTE**: This readme is incomplete and does not contain all the instructions to get JDTable going. See the /public/index.html for a full understanding on how to set up the options. See /src/jd-table.vue to see all available options.

## Requirements

- Polyfill (IE 11)
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
        <JDTable></JDTable>
    </div>
</template>

<script>
    import "@fortawesome/fontawesome-free/css/all.min.css";
    import JDTable from 'vue-jd-table';
    
    export default
    {
        name : 'Component',
        
        components:
        {
            JDTable
        }
    }
</script>

<style lang="scss">
    // JD-Table SCSS Variable Overrides Here.
    
    @import "~vue-jd-table/dist/assets/jd-table.scss";
</style
```

##### IE11 Support

If you require IE11 support you need the polyfill the component. See Polyfill section.

```
import JDTable from 'vue-jd-table/src/jd-table.vue';
```

#### Global Registration

```
import Vue from 'vue';
import "@fortawesome/fontawesome-free/css/all.min.css";
import JDTable from 'vue-jd-table';
import 'vue-jd-table/dist/jd-table.min.css';

Vue.component('jdtable',JDTable);

new Vue
({
    ...
}).$mount( '#app' );
```

##### IE11 Support

If you require IE11 support you need the polyfill the component. See Polyfill section.

#### <script> Tag (Direct)

```
<script src="https://unpkg.com/vue"></script>
<script src="vue-jd-table/dist/jd-table.min.js"></script>

<div id="app">
    <JDTable></JDTable>
</div>

<script type="text/javascript">
    new Vue
    ({
        el : '#app',
    });
</script>
```

## Polyfill

Take note that the build module for JDTable does not include Polyfill for IE 11 support. There are multiple ways to resolve this in your project. Typically build processes like Vue-CLI do NOT add polyfill's to your imported dependancies.

### Polyfill Solution #1

Rather then importing the component normally, import the .VUE file directly. If your project already includes polyfill's it will be processed normally.

```
import JDTable from 'vue-jd-table/src/jd-table.vue';
```

### Polyfill Solution #2

Directly add polyfill's to your dependency's.

babel.config.js
```
module.exports = {
	presets:
	[
		['@vue/app',
		{
			polyfills :
			[
				'es6.promise',
				'es6.object.assign',
				'es6.function.name'
			]
		}]
	]
}
```