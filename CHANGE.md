# JD-Table

### Change Log

#### v1.1.3
- Fixed scrolling issue when selecting columns in the filter feature.
- Fixed issue with quick view pagination.

#### v1.1.2
- Fixed bug where if only 1 search result was returned, the selected item was wrong.

#### v1.1.1
- Fixed issue with quick view showing wrong item when filter applied.
- Fixed test data in public/index.html file for dev.
- Fixed spelling mistake in scss file.

#### v1.1.0
- Added prefix "jd-" to all table classes.
- Added "Add New" button feature to control bar.
- Added support for Array type data.
- Added custom data sorting
    - First custom sort: IP (works for string and array types)
- Quick View
    - Added "View Item" feature.
    - Added "Edit Item" feature.
    - Added "Delete Item" feature.
    - You can now configure quick view for single or double (left) click.
    - Made quick view title smaller.
    - Title now disappears on 350px breakpoint.
    - Changed Quick View to use browser window rather than table frame.
    - Quick View now closes when clicking outside of the window.
    - Added table row highlight for quick viewed items.
- Duplicated README in docs for parent git path for NPM.
- Added context menu for rows (left/right click).
    - Added "Quick View" context item.
    - Added "View" context item.
    - Added "Edit" context item.
    - Added "Delete" context item.
    - Added "Add" context item.
    - Added a polyfill for the Element.closest function for IE11 support.
- Fixed bug that caused "No Data" message to display when refreshing.
- Fixed bug that caused event listeners to multiple when component is destroyed then created.
- Changed emitted events to occur for most all table actions regardless of dataProvider state.
- Changed sendData event to accept componentState.
- Added new event (Parent to JD-Table) called 'setState'

#### v1.0.3
- Initial Release