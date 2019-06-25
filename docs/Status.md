# JD-Table / Status

JD-Table has a number of statuses or states. These are activated/deactivated based on the **loader** property as well as events.

- [Loader](#loader)
- [Processing Data](#processing)
- [Updating Page](#updating)
- [Searching](#searching)

---

### Loader

The loader status is controlled via the **loader** property. When enabled, displays "Loading" with a animated CSS graphic in the center of the JD-Table. Link this property to a reactive variable in your application to control the loading state of the JD-Table at any time. This is especially handy when loading data from a API call.

When the loader is enabled (true), a full lockout of JD-Table and his features is applied. Your application must change the loader property to false in order to allow the user to use your JD-Table.

For example, below uses the loader property while making a REST API call to get data ..

```html
// HTML Template ..
<JDTable
    :option                 = "tableOptions"
    :loader                 = "tableLoader"
    :event-from-app         = "eventFromApp"
    :event-from-app-trigger = "eventFromAppTrigger"
    @event-from-jd-table    = "processEventFromApp( $event )"
/>
```

```javascript
// Vue Data Declaration
data :
{
    tableLoader : false,
    // ...	
}
```

```javascript
// Vue Mounted Hook
mounted : function ()
{
    // Enable the table loader.
    this.tableLoader = true;
    
    // Get Data Call
    this.apiRESTCall().then( ( result ) =>
    {
        this.eventFromApp =
        {
            name    : 'sendData',
            payload : JSON.parse( data )
        };
        
        this.triggerEvent();
        
        // Disable the table loader.
        this.tableLoader = false;
    });
},
```

---

### Processing

The processing status is JD-Table controlled and enabled when data is being rendered in the view. When enabled displays "Processing" with a animated CSS graphic.

This status plays a larger role when using the virtual scroll rendering feature. In addition, it can have a lot of screen time if your table is loading/rendering many, many rows of data.

---

### Updating

 The updating status is JD-Table controlled and enabled when performing functions that change/update the view: pagination, refresh, views, sorting, filters, etc. When enabled, displays "Updating" with a animated CSS graphic.
 
 > When using dataProvider = 1 (external) the updating status will be enabled when a $emit from JD-Table occurs. It will be turned off (false) when your app triggers a event like sendData back to JD-Table.
 
 ---
 
 ### Searching
 
 The searching status is JD-Table controlled and enabled when performing a search. When enabled, displays "Searching" with a animated CSS graphic.
 
  > When using dataProvider = 1 (external) the searching status will be enabled when the search $emit from JD-Table occurs. It will be turned off (false) when your app triggers a event like sendData back to JD-Table.
  