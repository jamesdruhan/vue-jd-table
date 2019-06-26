# JD-Table / Data

In order to display data in JD-Table you must trigger an **event-from-app** event from your app (the parent) with the name of "**sendData**". The rational for this approach is that typically when your page/component renders, the data may not be available immediately. This is usually due to the fact that you need to request it via some sort of API like REST.

<p align="center">
  <br>
  <img src="./assets/DataEventFlow.png" alt="Example of Data Flow for JD-Table">
  <br>
</p>

--- 

### Data Format

The data sent to JD-Table must be in the format of an JavaScript Array of Objects representing each row of data. Each object should have a key with the same name as the column name (not title). The easiest way to do this for data returned from a REST API call is to parse it with JSON.parse().

> The value assigned to each column key should be either string. Array of strings are not yet supported (but will be eventually). If you want to assign a number as a value ensure to convert it using .toString().

Given the following JD-Table Column Options ..

```javascript
// ...
columns :
[
    {
        name          : 'businessName',
        title         : 'Business Name',
        order         : 1,
        type          : 'String',
        filterable    : true,
        enabled       : true,
        sort          : true,
        sortDirection : 'asc',
        width         : 200,
    },
    {
        name        : 'founderName',
        title       : 'Founder Name',
        order       : 2,
        type        : 'String',
        filterable  : true,
        enabled     : true,
        width       : 100,
    }
]
// ...
```

Payload data sent to JD-Table should be in the following format ..

```javascript
[
    // Row 1
    {
    	businessName : 'Burger King',
    	founderName  : 'James McLamore'    	
    },
    // Row 2
    {
    	businessName : 'Mc Donalds',
    	founderName  : 'Maurice McDonald'   
    }
    // Row 3
    ,
    {
        businessName : 'Wendies',
        founderName  : 'Dave Thomas'   
    }
    // etc.
]
```

---

### sendData Event

Sending a sendData event to JD-Table has two steps:

1. Configure the event:

```javascript
let tableData =
[
    // Row 1
    {
        businessName : 'Burger King',
        founderName  : 'James McLamore'    	
    },
    // Row 2
    {
        businessName : 'Mc Donalds',
        founderName  : 'Maurice McDonald'   
    }
    // Row 3
    ,
    {
        businessName : 'Wendies',
        founderName  : 'Dave Thomas'   
    }
    // etc.
]

this.eventFromApp =
{
    name    : 'sendData',
    payload : tableData
};
```

2. Trigger the event:

```javascript
// Trigger the event.
this.eventFromAppTrigger = true;

// Reset the trigger event.
this.$nextTick( () =>
{
    this.eventFromAppTrigger = false;
});
```

> It is best to setup a Vue method to trigger the event as you will see in the examples below.

---

#### REST API Example

Given the following template ..

```javascript
<template>
    <div id="bisNamedAccount">
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
```

Vue component setup with trigger as a method ..

```javascript
export default
{
    name : 'MyAwesomeAppComponent',
    
    // ...
	
    mounted : function ()
    {
    	// Async call to a Vue method that returns a promise.
        this.myCustomAPICall().then( ( result ) =>
        {
            this.eventFromApp =
            {
                name    : 'sendData',
                payload : JSON.parse( result )
            };
            
            this.triggerEvent();
        });
    },
    
    method :
    {
    	// ...
    	
        // Triggers the currently queued JD-Table event to run.
        triggerEvent : function ()
        {
            // Trigger the event.
            this.eventFromAppTrigger = true;

            // Reset the trigger event.
            this.$nextTick( () =>
            {
                this.eventFromAppTrigger = false;
            });
        },
        
        // Your API Call Method
        myCustomAPICall : function ()
        {
            // .....
        }
        
        // ...
    }
}
```
