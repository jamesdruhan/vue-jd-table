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
