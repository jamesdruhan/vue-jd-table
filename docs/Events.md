# JD-Table / Events

This section explains how communication works between your app and the JD-Table component. There are two types of events:

- [Your App to JD-Table Events](#Your-App-to-JD-Table-Events)
- [JD-Table Events to Your App](#JD-Table-Events-to-Your-App)
- [Component State](#Component State)

### Why not use an event bus?

An event bus is another Vue instance that is used between parent and child components to emit events. They are my personal favorite way method of communication and the community recommended goto choice.

So why didn't I use one? The simple answer is that I didn't want to create a component that required the user to create an event bus to use and install JD-Table. It adds setup complexity and overhead users may not want in their apps.

### Your App to JD-Table Events

These are events triggered from your application (parent) to JD-Table (child). JD-Table accepts the following events:

- **sendData**
    - Used to display data in JD-Table. The payload on this event changes depending on the dataProvider option (see below). You can optionally pass the component state which is useful if you are re-rendering the table to a users previous state. Learn about component state [here](#Component State).
    
    ##### dataProvider = 0 (Internal)
    ```javascript
    this.eventFromApp =
    {
        name           : 'sendData',
        payload        : JSON.parse( data ),
        componentState :
        {
      	   // ...
        }
    };
    ```
    
    ##### dataProvider = 1 (External)
    ```javascript
    this.eventFromApp =
    {
        name    : 'sendData',
        payload :
        {
            data          : JSON.parse( result ),
            // The total count of how many rows exist in the dataset.
            count         : 0,
            // The current index of the first row in the data being sent (used for pagination).
            firstRowIndex : 0
        },
        componentState :
        {
             // ...
        }
    }
    ```
- **clearAll**
    - Used to perform a complete table reset (clears data, search, filters, etc.). A payload is not required for this event.
    
    ##### Example:
    ```javascript
    this.eventFromApp =
    {
        name    : 'clearAll'
    }
    ```
    
- **tableError**
    - Used to display an error in red. The payload for this event is the error message to display (String).
    
    ##### Example:
    ```javascript
    this.eventFromApp =
    {
        name    : 'tableError',
        payload : 'You do not have access to this table.'
    }
    ```
    
- **exportExcel**
    - Used to trigger a excel export. The payload is a array of data that will be exported using JD-Table's export engine.
    
    ##### Example:
    ```javascript
    this.eventFromApp =
    {
        name    : 'exportExcel',
        payload : JSON.parse( dataResult )
    }
    ```
    
    > This is typically used only when dataProvider = 1 (external).

- **setState**
    - Used to update JD-Table's state including search, filtering, pagination, and more. Check out [Component State](#Component State) to learn more.
    
    ##### Example:
    ```javascript
    this.eventFromApp =
    {
        name           : 'setState',
        componentState :
        {
            searchApplied : true,
            searchText    : 'My Search Text',
            filterApplied : null,
            pageLimit     : null,
            currentPage   : null,
            lastAction    : null,
            sortColumn    : null,
            sortDirection : null,
            sortSpecial   : null,
            selectedItem  : null,
            selectedIndex : null,
            currentView   : null
        }
    }
    ```
    
##### How to trigger App to JD-Table event

Recall from the README the following template setup ...

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

In the above setup, you would configure the details of the event using a property called **eventFromApp** and trigger the event using another property called **eventFromAppTrigger**.

The **eventFromApp** is a object that contains the event name and payload:

```javascript
this.eventFromApp =
{
    name    : 'tableError',
    payload : 'Error: Request for data from the server failed (500). Details: Access Denied'
}
```

Now that you've configured an event you need to trigger it in the JD-Table:

```javascript
// Trigger the event.
this.eventFromAppTrigger = true;

// Reset the trigger event.
this.$nextTick( () =>
{
    this.eventFromAppTrigger = false;
});
```

Setting the variable **eventFromAppTrigger** to true triggers the event. However, you must ensure to reset the trigger variable to false. This **must** be done on the nextTick (VueJS function). If you do not reset the variable on nextTick the vent will not run.

Typically it is better to configure the trigger as a method in Vue. In this way you only need to call your method.

```javascript
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
```

---

### JD-Table Events to Your App

These are events triggered from the JD-Table component using the VueJS [$emit](#https://vuejs.org/v2/guide/components-custom-events.html) function. These can be captured and sent to a method in your app by registering the event in your template.

The primary purpose for these events is to indicate an action that happens within JD-Table that requires external (parent) intervention. For example, if a 'Refresh' event is triggered, the user has clicked the "Refresh" data button. As such, this should trigger a update in the dataset - which nearly everytime will be a REST API call from the parent (followed by a sendData event).

Another purpose is to take note of the JD-Table's component state. You can create a snapshot of this data to be used when a user migrates away from the table then uses "Back" in there browser. If this happens you can inject the old state to show them the table as they left it. You can also create user specific saved states.

##### Capture the Event
```javascript
@event-from-jd-table = "processEventFromApp( $event )"
```

Full Example:

```javascript
<div id="bisNamedAccount">
    <JDTable
    :option                 = "tableOptions"
    :loader                 = "tableLoader"
    :event-from-app         = "eventFromApp"
    :event-from-app-trigger = "eventFromAppTrigger"
    @event-from-jd-table    = "processEventFromApp( $event )"
/>
```

> With the exception of the "Refresh" and "AddNew" event, all other events are intended for external data processing (dataProvider = 1 option).

In the example above, whenever JD-Table emit's an event it will trigger the processEventFromApp() method with the event details in $event.

#### Component State (From JD-Table)

When a event is triggered from JD-Table it is emitted with the current JD-Table component state. This provides you with a bunch of details as to what the current state is of the table and its features.

The component state is a object and contains the following details:

```javascript
componentState =
{
    // Boolean indicating if a search text has been applied to the table.
    searchApplied,
    // String hold the current applied search text.
    searchText,
    // Array of currently applied filters to the table.
    filterApplied,
    // Number indicating the currently selected max rows that can be displayed on a page when pagination is enabled.
    pageLimit,
    // Number indicating the current page the user is on when pagination is enabled.
    currentPage,
    // String indicating the last action performed (this is the name of the event).
    lastAction,
    // String indicating the column that is currently selected as the sort column.
    sortColumn,
    // String indicating the direction of the sorted column: 'asc' or 'desc'.
    sortDirection
    // String indicating the special sort instructions for the column.
    sortSpecial
    // Object of the row data currently selected.
    selectedItem
    // Number indicating the selected row index value of the data.
    selectedIndex
    // Name of the current selected view.
    currentView
}
```

#### Managing Events

As all events are sent to a single callback function you must manage the 

#### JD-Table Events

- [AddNew](#AddNew)
- [AddItemNewWindow](#AddItemNewWindow)
- [ViewItem](#ViewItem)
- [ViewItemNewWindow](#ViewItemNewWindow)
- [EditItem](#EditItem)
- [EditItemNewWindow](#EditItemNewWindow)
- [DeleteItem](#DeleteItem)
- [Refresh](#Refresh)
- [ExcelExport](#ExcelExport)
- [PaginationGoToSpecificPage](#PaginationGoToSpecificPage)
- [PaginationGoToNextPage](#PaginationGoToNextPage)
- [PaginationGoToLastPage](#PaginationGoToLastPage)
- [PaginationGoToPreviousPage](#PaginationGoToPreviousPage)
- [PaginationGoToFirstPage](#PaginationGoToFirstPage)
- [PaginationPageLimitChange](#PaginationPageLimitChange)
- [ChangeView](#ChangeView)
- [ChangeSort](#ChangeSort)
- [AddFilter](#AddFilter)
- [RemoveFilter](#RemoveFilter)
- [ClearFilter](#ClearFilter)
- [ApplySearch](#ApplySearch)
- [ClearSearch](#ClearSearch)

> **REMINDER**: When performing any event, be sure to remember to modify your API calls for data based on the componentState values like search, filter and pagination.

#### AddItem

- **Trigger**: This event is emitted when the user clicks the 'Add New' button in JD-Table. The intention of this button is to redirect a user to a form/page in order to add a new record to the table.

- **What You Should Do**: You should implement a function that redirects the user to a new page or displays a form that allows them to insert a new record.
    
##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'AddItem' )
            {
            	// Using Vue Router
                router.push('addTableItem');
            }
        }
    }
    
    // ...
}
```

#### AddItemNewWindow

- **Trigger**: This event is emitted when the user clicks the 'Add New' button in JD-Table. The intention of this button is to redirect a user to a form/page in order to add a new record to the table in a new tab/window.

- **What You Should Do**: You should implement a function that redirects (in a new tab/window) the user to a new page or displays a form that allows them to insert a new record.
    
##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'AddItemNewWindow' )
            {
            	// Using Vue Router
                router.push('addTableItem');
            }
        }
    }
    
    // ...
}
```

#### ViewItem

- **Trigger**: This event is emitted when the user clicks the 'View' button in the left/right context menu. The intention of this button is to redirect a user to a form/page in order to view the record in the table.

- **What You Should Do**: You should implement a function that redirects the user to a new page or displays a form that allows them to view the record. You can get the row details of the item to be viewed in the componentState using the selectedItem and selectedIndex keys.
    
##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'ViewItem' )
            {
            	// Using Vue Router
                router.push('addTableItem');
            }
        }
    }
    
    // ...
}
```

#### ViewItemNewWindow

- **Trigger**: This event is emitted when the user clicks the 'View (New Window)' button in the left/right context menu. The intention of this button is to redirect a user to a form/page in order to view the record in the table in a new tab/window.

- **What You Should Do**: You should implement a function that redirects the user to a new page or displays a form (in a new tab/window) that allows them to view the record. You can get the row details of the item to be viewed in the componentState using the selectedItem and selectedIndex keys.
    
##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'ViewItemNewWindow' )
            {
            	// Using Vue Router
                router.push('addTableItem');
            }
        }
    }
    
    // ...
}
```

#### EditItem

- **Trigger**: This event is emitted when the user clicks the 'Edit' button in Quick View. The intention of this button is to redirect a user to a form/page in order to edit the record in the table.

- **What You Should Do**: You should implement a function that redirects the user to a new page or displays a form that allows them to edits the record. You can get the row details of the item to be edited in the componentState using the selectedItem and selectedIndex keys.
    
##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'AddNew' )
            {
            	// Using Vue Router
                router.push('addTableItem');
            }
        }
    }
    
    // ...
}
```

#### EditItemNewWindow

- **Trigger**: This event is emitted when the user clicks the 'Edit (New Window)' button in Quick View. The intention of this button is to redirect a user to a form/page in order to edit the record in the table in a new window/tab.

- **What You Should Do**: You should implement a function that redirects (in a new tab or window) the user to a new page or displays a form that allows them to edits the record. You can get the row details of the item to be edited in the componentState using the selectedItem and selectedIndex keys.
    
##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'EditItemNewWindow' )
            {
            	// Using Vue Router
                router.push('addTableItem');
            }
        }
    }
    
    // ...
}
```

#### DeleteItem

- **Trigger**: This event is emitted when the user clicks the 'Delete' button in Quick View. The intention of this button is process the deletion of a row record.

- **What You Should Do**: You should implement a function deletes the row data (you should most likely confirm the action first). You can get the row details of the item to be deleted in the componentState using the selectedItem and selectedIndex keys.
    
##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'DeleteItem' )
            {
            	// Using Vue Router
                router.push('addTableItem');
            }
        }
    }
    
    // ...
}
```

#### Refresh

- **Trigger**: This event is emitted when the user clicks the 'Refresh' button in JD-Table. The intention of refresh is to update the current data being displayed in the table.

- **What You Should Do**: You should implement a function that updates the data from your source (most likely a REST API) then send the data back to JD-Table with a 'sendData' event.

    > **TIP**: If you are using dataProvider = 1 option (external), you are best off saving your last API request as a variable in your app (parent) so you can perform events like Refresh and Excel export events, ensuring you are preforming the last request.
    
##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                this.getDataFromAPI( ( result ) =>
                {
                    this.eventFromApp =
                    {
                        name    : 'sendData',
                        payload : JSON.parse( result )
                    };

                    this.triggerEvent();
                });
            }
        }
    }
    
    // ...
}
```

> See [How to trigger App to JD-Table event](#How to trigger App to JD-Table event) to understand the method for trigging events (this.triggerEvent).

#### ExcelExport

- **Trigger**: This event is triggered when the user clicks the Excel Export button and the **dataProvider** option is set to 1 (external).

- **What You Should Do**: You should implement a function that requests the currently displayed data via your source (most likely a REST API) then trigger a 'exportExcel' event to send the data to JD-Table.

    > **TIP**: If you are using dataProvider = 1 option (external), you are best off saving your last API request as a variable in your app (parent) so you can perform events like Refresh and Excel export events, ensuring you are preforming the last request.

##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'ExcelExport' )
            {
                this.getExportDataFromAPI( ( result ) =>
                {
                    this.eventFromApp =
                    {
                        name    : 'exportExcel',
                        payload : JSON.parse( result )
                    };

                    this.triggerEvent();
                });
            }
        }
    }
    
    // ...
}
```

#### PaginationGoToSpecificPage

> **NOTE**: All pagination event examples are the same. While one even would suffice for all pagination actions, individual events were kept for the sake of a giving developers more granular control over parent/app actions.

- **Trigger**: This event is triggered when a user clicks a specific page number in the pagination page list (ie. pages 1,2,3,4,5,6 - user clicks 4). This is only triggered if option dataProvider = 1. 

- **What You Should Do**: You should implement a function requests the data while using the componentState along with your pagination settings to determine which how to craft your REST API query. 

    > **TIP**: If your REST API has a skip filter you can easily calculate the skip value using the componentState data:
    
    ```javascript
    let currentSkipIndex = ( componentState.currentPage - 1 ) * componentState.pageLimit;
    ``` 

##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'ExcelExport' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'PaginationGoToSpecificPage' )
            {
            	// Use this in your API call.
            	this.currentSkipIndex = ( componentState.currentPage - 1 ) * componentState.pageLimit;

                this.getDataFromAPI( ( result ) =>
                {
                    this.eventFromApp =
                    {
                        name    : 'sendData',
                        payload :
                        {
                            data          : JSON.parse( result ),
                            count         : this.currentQueryClauseCount,
                            firstRowIndex : this.currentSkipIndex
                        }
                    }
    
                    this.triggerEvent();
                });
            }
        }
    }
    
    // ...
}
```

> **TIP**: When using dataProvider = 1 (external), you need to provide a total count of how many rows of data exist in the current query (this is for pagination). Try storing the total count (length) in your app as a data variable so you can refer to it like above (**this.currentQueryClauseCount**).

#### PaginationGoToNextPage

> **NOTE**: All pagination event examples are the same. While one even would suffice for all pagination actions, individual events were kept for the sake of a giving developers more granular control over parent/app actions.

- **Trigger**: This event is triggered when a user clicks the "Next" button to progress to the next paginated page. This is only triggered if option dataProvider = 1. 

- **What You Should Do**: You should implement a function requests the data while using the componentState along with your pagination settings to determine which how to craft your REST API query. 

    > **TIP**: If your REST API has a skip filter you can easily calculate the skip value using the componentState data:
    
    ```javascript
    let currentSkipIndex = ( componentState.currentPage - 1 ) * componentState.pageLimit;
    ``` 

##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'ExcelExport' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'PaginationGoToSpecificPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToNextPage' )
            {
            	// Use this in your API call.
            	this.currentSkipIndex = ( componentState.currentPage - 1 ) * componentState.pageLimit;

                this.getDataFromAPI( ( result ) =>
                {
                    this.eventFromApp =
                    {
                        name    : 'sendData',
                        payload :
                        {
                            data          : JSON.parse( result ),
                            count         : this.currentQueryClauseCount,
                            firstRowIndex : this.currentSkipIndex
                        }
                    }
    
                    this.triggerEvent();
                });
            }
        }
    }
    
    // ...
}
```

> **TIP**: When using dataProvider = 1 (external), you need to provide a total count of how many rows of data exist in the current query (this is for pagination). Try storing the total count (length) in your app as a data variable so you can refer to it like above (**this.currentQueryClauseCount**).

#### PaginationGoToLastPage

> **NOTE**: All pagination event examples are the same. While one even would suffice for all pagination actions, individual events were kept for the sake of a giving developers more granular control over parent/app actions.

- **Trigger**: This event is triggered when a user clicks the "Last" button to progress to the last paginated page. This is only triggered if option dataProvider = 1. 

- **What You Should Do**: You should implement a function requests the data while using the componentState along with your pagination settings to determine which how to craft your REST API query. 

    > **TIP**: If your REST API has a skip filter you can easily calculate the skip value using the componentState data:
    
    ```javascript
    let currentSkipIndex = ( componentState.currentPage - 1 ) * componentState.pageLimit;
    ``` 

##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'ExcelExport' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'PaginationGoToSpecificPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToNextPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToLastPage' )
            {
            	// Use this in your API call.
            	this.currentSkipIndex = ( componentState.currentPage - 1 ) * componentState.pageLimit;

                this.getDataFromAPI( ( result ) =>
                {
                    this.eventFromApp =
                    {
                        name    : 'sendData',
                        payload :
                        {
                            data          : JSON.parse( result ),
                            count         : this.currentQueryClauseCount,
                            firstRowIndex : this.currentSkipIndex
                        }
                    }
    
                    this.triggerEvent();
                });
            }
        }
    }
    
    // ...
}
```

> **TIP**: When using dataProvider = 1 (external), you need to provide a total count of how many rows of data exist in the current query (this is for pagination). Try storing the total count (length) in your app as a data variable so you can refer to it like above (**this.currentQueryClauseCount**).

#### PaginationGoToPreviousPage

> **NOTE**: All pagination event examples are the same. While one even would suffice for all pagination actions, individual events were kept for the sake of a giving developers more granular control over parent/app actions.

- **Trigger**: This event is triggered when a user clicks the "Previous" button to progress to the previous paginated page. This is only triggered if option dataProvider = 1. 

- **What You Should Do**: You should implement a function requests the data while using the componentState along with your pagination settings to determine which how to craft your REST API query. 

    > **TIP**: If your REST API has a skip filter you can easily calculate the skip value using the componentState data:
    
    ```javascript
    let currentSkipIndex = ( componentState.currentPage - 1 ) * componentState.pageLimit;
    ``` 

##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'ExcelExport' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'PaginationGoToSpecificPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToNextPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToLastPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToPreviousPage' )
            {
            	// Use this in your API call.
            	this.currentSkipIndex = ( componentState.currentPage - 1 ) * componentState.pageLimit;

                this.getDataFromAPI( ( result ) =>
                {
                    this.eventFromApp =
                    {
                        name    : 'sendData',
                        payload :
                        {
                            data          : JSON.parse( result ),
                            count         : this.currentQueryClauseCount,
                            firstRowIndex : this.currentSkipIndex
                        }
                    }
    
                    this.triggerEvent();
                });
            }
        }
    }
    
    // ...
}
```

> **TIP**: When using dataProvider = 1 (external), you need to provide a total count of how many rows of data exist in the current query (this is for pagination). Try storing the total count (length) in your app as a data variable so you can refer to it like above (**this.currentQueryClauseCount**).

#### PaginationGoToFirstPage

> **NOTE**: All pagination event examples are the same. While one even would suffice for all pagination actions, individual events were kept for the sake of a giving developers more granular control over parent/app actions.

- **Trigger**: This event is triggered when a user clicks the "First" button to progress to the first paginated page. This is only triggered if option dataProvider = 1. 

- **What You Should Do**: You should implement a function requests the data while using the componentState along with your pagination settings to determine which how to craft your REST API query. 

    > **TIP**: If your REST API has a skip filter you can easily calculate the skip value using the componentState data:
    
    ```javascript
    let currentSkipIndex = ( componentState.currentPage - 1 ) * componentState.pageLimit;
    ``` 

##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'ExcelExport' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'PaginationGoToSpecificPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToNextPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToLastPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToPreviousPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToFirstPage' )
            {
            	// Use this in your API call.
            	this.currentSkipIndex = ( componentState.currentPage - 1 ) * componentState.pageLimit;

                this.getDataFromAPI( ( result ) =>
                {
                    this.eventFromApp =
                    {
                        name    : 'sendData',
                        payload :
                        {
                            data          : JSON.parse( result ),
                            count         : this.currentQueryClauseCount,
                            firstRowIndex : this.currentSkipIndex
                        }
                    }
    
                    this.triggerEvent();
                });
            }
        }
    }
    
    // ...
}
```

> **TIP**: When using dataProvider = 1 (external), you need to provide a total count of how many rows of data exist in the current query (this is for pagination). Try storing the total count (length) in your app as a data variable so you can refer to it like above (**this.currentQueryClauseCount**).

#### PaginationPageLimitChange

> **NOTE**: All pagination event examples are the same. While one even would suffice for all pagination actions, individual events were kept for the sake of a giving developers more granular control over parent/app actions.

- **Trigger**: This event is triggered when a user changes the amount of rows that are displayed on a single page. This is only triggered if option dataProvider = 1. 

- **What You Should Do**: You should implement a function requests the data while using the componentState along with your pagination settings to determine which how to craft your REST API query. 

    > **TIP**: If your REST API has a skip filter you can easily calculate the skip value using the componentState data:
    
    ```javascript
    let currentSkipIndex = ( componentState.currentPage - 1 ) * componentState.pageLimit;
    ``` 

##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'ExcelExport' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'PaginationGoToSpecificPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToNextPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToLastPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToPreviousPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToFirstPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationPageLimitChange' )
            {
            	// Use this in your API call.
            	this.currentSkipIndex = ( componentState.currentPage - 1 ) * componentState.pageLimit;

                this.getDataFromAPI( ( result ) =>
                {
                    this.eventFromApp =
                    {
                        name    : 'sendData',
                        payload :
                        {
                            data          : JSON.parse( result ),
                            count         : this.currentQueryClauseCount,
                            firstRowIndex : this.currentSkipIndex
                        }
                    }
    
                    this.triggerEvent();
                });
            }
        }
    }
    
    // ...
}
```

> **TIP**: When using dataProvider = 1 (external), you need to provide a total count of how many rows of data exist in the current query (this is for pagination). Try storing the total count (length) in your app as a data variable so you can refer to it like above (**this.currentQueryClauseCount**).

#### ChangeView

- **Trigger**: This event is triggered when a user changes the view (if multiple version are configured). This is only triggered if option dataProvider = 1. 

- **What You Should Do**: You should implement a function that performs the previously performed query.

##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'ExcelExport' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'PaginationGoToSpecificPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToNextPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToLastPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToPreviousPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToFirstPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationPageLimitChange' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ChangeView' )
            {           	
               this.getDataFromAPI( ( result ) =>
               {
                   this.eventFromApp =
                   {
                       name    : 'sendData',
                       payload : JSON.parse( result )
                   };

                   this.triggerEvent();
               });
            }
        }
    }
    
    // ...
}
```

#### ChangeSort

- **Trigger**: This event is triggered when a user clicks on a column heading in order to change the sort order. This is only triggered if option dataProvider = 1. 

- **What You Should Do**: You should implement a function that performs the previously performed query with a different sort order. The sorting details will be available on the componentState (column and direction).

##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'ExcelExport' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'PaginationGoToSpecificPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToNextPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToLastPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToPreviousPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToFirstPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationPageLimitChange' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ChangeView' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ChangeSort' )
            {
            	// Check for sorting and adjust API query accordingly ..
            	
               this.getDataFromAPI( ( result ) =>
               {
                   this.eventFromApp =
                   {
                       name    : 'sendData',
                       payload : JSON.parse( result )
                   };

                   this.triggerEvent();
               });
            }
        }
    }
    
    // ...
}
```

#### AddFilter

- **Trigger**: This event is triggered when a user clicks the 'Apply' button in the filters option. The filters (if any) are provided in the componentState. This is only triggered if option dataProvider = 1. 

- **What You Should Do**: You should implement a function that performs the previously performed query while taking into account the filters.

##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'ExcelExport' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'PaginationGoToSpecificPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToNextPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToLastPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToPreviousPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToFirstPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationPageLimitChange' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ChangeView' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ChangeSort' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'AddFilter' )
            {
            	// Check for filters and adjust API query accordingly.
            	
               this.getDataFromAPI( ( result ) =>
               {
                   this.eventFromApp =
                   {
                       name    : 'sendData',
                       payload : JSON.parse( result )
                   };

                   this.triggerEvent();
               });
            }
        }
    }
    
    // ...
}
```

#### RemoveFilter

- **Trigger**: This event is triggered when a user clicks minus (-) sign beside an active filter to remove it. The remaining filters (if any) are provided in the componentState. This is only triggered if option dataProvider = 1. 

- **What You Should Do**: You should implement a function that performs the previously performed query while taking into account the filters.

##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'ExcelExport' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'PaginationGoToSpecificPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToNextPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToLastPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToPreviousPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToFirstPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationPageLimitChange' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ChangeView' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ChangeSort' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'AddFilter' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'RemoveFilter' )
            {
            	// Check for filters and adjust API query accordingly.
            	
               this.getDataFromAPI( ( result ) =>
               {
                   this.eventFromApp =
                   {
                       name    : 'sendData',
                       payload : JSON.parse( result )
                   };

                   this.triggerEvent();
               });
            }
        }
    }
    
    // ...
}
```

#### ClearFilter

- **Trigger**: This event is triggered when a user clicks the 'Clear All' button in the filters section to remove all filters. This is only triggered if option dataProvider = 1. 

- **What You Should Do**: You should implement a function that performs the previously performed query while taking into account the removal of filters.

##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'ExcelExport' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'PaginationGoToSpecificPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToNextPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToLastPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToPreviousPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToFirstPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationPageLimitChange' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ChangeView' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ChangeSort' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'AddFilter' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'RemoveFilter' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ClearFilter' )
            {
            	// Check for component state details and adjust API query accordingly.
            	
               this.getDataFromAPI( ( result ) =>
               {
                   this.eventFromApp =
                   {
                       name    : 'sendData'
                   };

                   this.triggerEvent();
               });
            }
        }
    }
    
    // ...
}
```

#### ApplySearch

- **Trigger**: This event is triggered when a user searches for something using the search box. This is only triggered if option dataProvider = 1.  

- **What You Should Do**: You should implement a function that performs a REST API query including a LIKE search only the columns that you want to be searchable. Typically a user will assume all columns are searchable (full text search). However you can limit this to specific columns and modify the search placeholder text to indicate what is being searched.

##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'ExcelExport' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'PaginationGoToSpecificPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToNextPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToLastPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToPreviousPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToFirstPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationPageLimitChange' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ChangeView' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ChangeSort' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'AddFilter' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'RemoveFilter' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ClearFilter' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ApplySearch' )
            {
            	// Modify REST API query for search details.
            	
               this.getDataFromAPI( ( result ) =>
               {
                   this.eventFromApp =
                   {
                       name    : 'sendData',
                       payload : JSON.parse( result )
                   };

                   this.triggerEvent();
               });
            }
        }
    }
    
    // ...
}
```

#### ClearSearch

- **Trigger**: This event is triggered when a user clears the currently active search. This is only triggered if option dataProvider = 1.  

- **What You Should Do**: You should implement a function that performs a REST API query to exclude and search details. Be sure to check the componentState for filter details.

##### Example

```javascript
export default
{
    // ...
	
    methods :
    {
        // Triggered when the JD-Table emits a "eventFromJDTable" event.
        processEventFromApp : function ( componentState )
        {
            if ( componentState.lastAction === 'Refresh' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'ExcelExport' )
            {
                // ...
            }
            else if ( componentState.lastAction === 'PaginationGoToSpecificPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToNextPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToLastPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToPreviousPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationGoToFirstPage' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'PaginationPageLimitChange' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ChangeView' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ChangeSort' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'AddFilter' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'RemoveFilter' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ClearFilter' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ApplySearch' )
            {
                // ..
            }
            else if ( componentState.lastAction === 'ClearSearch' )
            {
            	// Modify REST API query to remove search details.
            	
               this.getDataFromAPI( ( result ) =>
               {
                   this.eventFromApp =
                   {
                       name    : 'sendData',
                       payload : JSON.parse( result )
                   };

                   this.triggerEvent();
               });
            }
        }
    }
    
    // ...
}
```

### Component State

Whenever a user performs an event in JD-Table that changes something (ie. search, filter, sort, pagination, etc.) the component will emit an event containing the current state of JD-Table (componentState).

The primary use for this object is to provide information to the parent when dataProvider option is set to 1. This allows the parent to obtain the correct data according to the tables state (search, filter, etc.).

However, another use for componentState is to save it and re-use it to put JD-Table into the saved state. This is perfect for single page applications when the user moves away from the table then clicks "Back". If you don't record the component state, then JD-Table will just revert to its defaults when the user goes back to the page. However, if you store the componentState (ie. in Vuex) you an send it along with the sendData event to provide a better user experience.

When setting a new component state the following will be processed:

- **searchText** [String]: The text in the search box.
- **searchApplied** [Boolean]: Indicates if a search was being performed or not. 
- **filterApplied** [Array]: An array of objects containing filter details.
- **pageLimit** [Number]: The page limit value for the table.
- **currentPage** [Number]: The current active page.
- **sortColumnIndex** [Number]: The current column index being sorted.
- **sortDirection** [String]: The sort direction of the column ('ASC' or 'DESC').
- **currentView** [Object]: The current view details of the table.

> **WARNING**: It is not recommended to modify any of the the component state values directly. When JD-Table emits the componentState object, store it as is and do not modify it. When updating the component state, send the same (stored) component state back to JD-Table. Any changes in the structure of this object can cause unknown behaviour. 