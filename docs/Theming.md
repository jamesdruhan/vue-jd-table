# JD-Table / Theming

JD-Table uses SCSS and has a default column theme which can be overridden if you choose to. 

**Note**
> If you use the **/dist/jd-table.min.css** you cannot override the default column scheme very easily. Instead, compile your project with SCSS and override JD-Table variables.

### How To Apply Your Own Theme

First review the variables found in /src/assets/jd-table-vars.scss to see which variables/colours you wish to override.

Recall from the README the following component implementation ..

```vue
<template>
    <div id="app">
        <JDTable
            :option                 = "tableOptions"
            :loader                 = "tableLoader"
            :event-from-app         = "eventFromApp"
            :event-from-app-trigger = "eventFromAppTrigger"
            @event-from-jd-table    = "processEventFromApp( $event )"
        />

        <iframe id="excelExportArea" style="display:none"></iframe>
    </div>
</template>

<script>
    import "@fortawesome/fontawesome-free/css/all.min.css";
    import JDTable from 'vue-jd-table';
    
    export default
    {
        // ....
    }
</script>

<style lang="scss">
    // OPTIONAL: JD-Table SCSS Variable Overrides Here.

    @import "~vue-jd-table/dist/assets/jd-table.scss";
</style>
```

Importing the jd-table.scss file in the style section will allow you to import the default theme values for JD-Table. In order to override any specific variables just add the before the import line.

Example:

```javascript
<style lang="scss">
    // OPTIONAL: JD-Table SCSS Variable Overrides Here.
    $jdTable_BaseTextColour : #000000;
    $jdTable_BaseBGColour   : #FFFFFF;
    $jdTable_BaseFontSize   : 5rem;
    $jdTable_ControlHeight  : 3rem;
    // .. etc.

    @import "~vue-jd-table/dist/assets/jd-table.scss";
</style>
```