<template>
	<div class="JD-Reset JD-Table" :class="frameClasses" :style="frameStyles">

		<div v-if="setting.title !== null" class="layerTitle">{{ setting.title }}</div>

		<!-- Layer: Highlight -->
		<div v-if="setting.highlight" class="layerHighlight JD-NoneSelectable" :style="layerHighlightStyles"></div>

		<!-- Layer: Controls -->
		<div v-if="setting.controls" class="layerControl JD-NoneSelectable" :style="layerControlStyles">

			<!-- Control: Search -->
			<div v-if="setting.search" class="controlSearch" :class="controlSearchClasses">

				<span @click="featureAction('Search')" class="controlItem" :class="searchIconClasses" :title="searchIconTitle">
					<i  class="fas fa-search"></i>

					<!-- Control: Get Started with Search Reminder -->
					<div v-if="gettingStarted && setting.startBySearchArrowSearch && !status.processingData && !loader" class="searchArrow">
					{{ setting.startBySearchArrowSearchText }}
				</div>
				</span>

				<input v-show="feature.searching" @keyup.enter="performSearch" v-model="search.text" type="search" ref="searchField" :placeholder="setting.searchPlaceHolder ? setting.searchPlaceHolder : 'Search Here ..'" :disabled="status.processingData">

				<span v-show="!search.searching" @click="performSearch" class="controlItem search" title="Perform Search">
					<i  class="fas fa-angle-right"></i>
				</span>

				<span v-show="search.searching" @click="clearSearch" class="controlItem clearSearch" title="Clear Search">
					<i  class="fas fa-times-circle"></i>
				</span>

			</div>

			<!-- Control: Feature -->
			<div class="controlFeature" :class="controlFeatureClasses">

				<!-- Feature: Refresh -->
				<span v-if="setting.refresh" @click="featureAction('Refresh')" class="controlItem">
					<i class="fas fa-sync-alt" title="Refresh"></i>
				</span>

				<!-- Feature: Pagination Select -->
				<span v-if="rendering.engine === 2" @click="featureAction('Pagination')" class="controlItem" :class="rendering.pagination.changingRows ? 'selected' : ''">
					<i class="fas fa-scroll" title="Rows Per Page"></i>
				</span>

				<!-- Feature: Column Select -->
				<span v-if="setting.columnSelect" @click="featureAction('Columns')" class="controlItem" :class="columns.selecting ? 'selected' : ''">
					<i class="fas fa-columns" title="Columns"></i>
				</span>

				<!-- Feature: Filter -->
				<span v-if="setting.filter" @click="featureAction('Filter')" class="controlItem" :class="controlFilterClasses">
					<i class="fas fa-filter" title="Filter"></i>

					<!-- Control: Get Started with Filter Reminder -->
					<div v-if="gettingStarted && setting.startBySearchArrowFilter && !filters.show && !status.processingData && !loader" class="filterArrow">
						{{ setting.startBySearchArrowFilterText }}
					</div>
				</span>

				<!-- Feature: Export -->
				<span v-if="setting.export" @click="featureAction('Export')" class="controlItem">
					<i class="fas fa-file-export" title="Export to Excel"></i>
				</span>

				<!-- Feature: Maximize/Minimize -->
				<span v-if="setting.maxMinimize && !setting.forceMaximized" @click="featureAction('MaxMinimize')" class="controlItem">
					<i :class="minMaxIconClasses" :title="minMaxIconTitle"></i>
				</span>

			</div>

		</div>

		<!-- Layer: Options -->
		<div class="layerOption" :style="layerOptionStyles">

			<!-- Option: Pagination -->
			<transition name="jdTableSlideDown">
				<div v-if="rendering.pagination.changingRows" class="optionDropdown" :style="optionDropdownStyles">

					<!-- Header -->
					<div class="dropdownHeader">Page Rows</div>

					<!-- Pagination Row List -->
					<div v-for="rows in rendering.pagination.pageRowOptions" @click="changePageRows( rows )" class="dropdownItem paginationItem JD-Clickable" :class="rendering.pagination.currentSelectedPageRowOption === rows ? 'selected' : ''">
						{{ rows }}
					</div>

				</div>
			</transition>

			<!-- Option: Column -->
			<transition name="jdTableSlideDown">
				<div v-if="columns.selecting" class="optionDropdown" :style="optionDropdownStyles">

					<!-- Header -->
					<div class="dropdownHeader">Columns</div>

					<!-- Error -->
					<div v-if="columns.selectionError" class="errorMessage">You must have at least one column enabled.</div>

					<!-- Column List -->
					<div v-for="column in columns.list" @click="columnSelection( column )" class="dropdownItem JD-Clickable">

						<div class="columnVisibility">
							<i v-if="column.enabled" class="fas fa-eye"></i>
							<i v-else class="fas fa-eye-slash notVisible"></i>
						</div>

						<div class="columnTitle">
							{{ column.title.replace(/(<([^>]+)>)/ig,"") }}
						</div>

					</div>

				</div>
			</transition>

			<!-- Option: Filtering -->
			<transition name="jdTableSlideDown">
				<div v-if="filters.show" class="optionDropdown" :style="optionDropdownStyles">

					<!-- Header -->
					<div class="dropdownHeader">Filtering</div>

					<!-- Error -->
					<div v-if="filters.error" class="errorMessage">{{ filters.errorText }}</div>

					<!-- Select Column Input -->
					<div class="dropdownInput carrot JD-Clickable">
						<div @click="filterDropdown(0)" class="label">
							<span>{{ filterColumnText.replace(/(<([^>]+)>)/ig,"") }}</span>
						</div>

						<transition name="jdTableFade">
							<ul v-if="filters.activeDropdown === 0">
								<li v-for="( column, index ) in filterableColumns" @click="buildFilter( 0, index )">
									{{ column.title.replace(/(<([^>]+)>)/ig,"") }}
								</li>
							</ul>
						</transition>
					</div>

					<!-- Select Filter Input -->
					<div class="dropdownInput carrot JD-Clickable">
						<div @click="filterDropdown(1)" class="label">
							<span>
								{{ filterOptionText }}
							</span>
						</div>

						<transition name="jdTableFade">
							<ul v-if="filters.activeDropdown === 1">
								<li v-for="( option, index ) in filterableOptions" @click="buildFilter( 1, option )">
									{{ option }}
								</li>
							</ul>
						</transition>
					</div>

					<!-- Select Value Input -->
					<div class="dropdownInput addPadding">
						<input ref="filterInput" type="text" @input="filters.error = false" v-model="filters.beingBuilt.value" placeholder="Value"/>
					</div>

					<!-- Filter Apply Buttons -->
					<div class="dropdownRow separate">
						<button v-on:click="clearAllFilters" type="button" class="JD-Button danger" title="Clear All Filters">Clear All</button>
						<button v-on:click="addFilter" type="button" class="JD-Button success" title="Apply Filter">Apply</button>
					</div>

					<!-- Header -->
					<div class="dropdownHeader subHeader">Active Filters</div>

					<!-- Filtered Results -->
					<div class="dropdownHeader smallHeader">Filtered Results: {{ processedDataSize }}</div>

					<!-- Active Filters -->
					<div class="dropdownInput disabled" v-for="( filter, index ) in filters.active">
						<div class="label" :title="filter.column.title.replace(/(<([^>]+)>)/ig,'') + ' .. ' + filter.option + ' .. ' + filter.value">
							<span>
								{{ filter.column.title.replace(/(<([^>]+)>)/ig,"") }}

								<i v-if="filter.option === 'Equals To'" class="fas fa-equals"></i>
								<i v-if="filter.option === 'Not Equals To'" class="fas fa-not-equal"></i>
								<i v-if="filter.option === 'Greater/Equal To'" class="fas fa-greater-than-equal"></i>
								<i v-if="filter.option === 'Less/Equal To'" class="fas fa-less-than-equal"></i>
								<i v-if="filter.option === 'Contains'" class="fas fa-level-down-alt"></i>
								<i v-if="filter.option === 'Begins With'" class="fas fa-long-arrow-alt-right"></i>

								"{{ filter.value }}"
							</span>
						</div>

						<i v-on:click="removeFilter( index )" class="fas fa-minus-circle removeIcon JD-Clickable" title="Remove Filter"></i>
					</div>

				</div>
			</transition>

		</div>

		<!-- Layer: Content -->
		<div class="layerContent" ref="contentFrame" :style="layerContentStyles">

			<!-- Table Content: Table -->
			<div class="table" :style="tableStyles">

				<!-- Table: Head -->
				<div class="head" :style="tableHeadStyles">

					<div v-for="( column, index ) in columns.list" v-if="column.enabled" @click="changeSort( index )" :title="sortTitle( index )" class="cell" :class="columns.activeHover === index ? ( 'hoverAssist' + headCellClasses) : headCellClasses" :style="column.headerStyles">

						<div class="cellText">
							<div class="title" v-html="column.title"></div>
							<i v-if="setting.columnSort && columns.activeSortIndex === index && !columns.activeSortAsc" class="fas fa-sort-alpha-up"></i>
							<i v-if="setting.columnSort && columns.activeSortIndex === index && columns.activeSortAsc" class="fas fa-sort-alpha-down"></i>
							<i v-if="setting.columnSort && columns.activeSortIndex !== index" class="fas fa-sort-alpha-up hoverSort"></i>
						</div>

						<div v-if="resizable" class="resize" @mousedown="resizeStart( index, $event )" @mousemove="resizeDrag( index, $event )" :class="index === columns.activeResize ? 'selected' : ''"></div>

					</div>

				</div>

				<!-- Table Body -->
				<div class="body" ref="bodyData" :style="tableBodyStyles" @scroll="virtualScroll( $event )" @mouseleave="bodyLeave">

					<div v-if="rendering.engine === 0" class="virtualBody" :style="bodyVirtualStyles"></div>

					<div ref="viewData" :style="bodyViewStyles">
						<div v-if="isViewAvailable" v-for="row in view" @dblclick="rowAction( row.index )" class="row" :class="viewRowClasses" :style="viewRowStyles">
							<div v-for="( column, columnIndex ) in columns.list" v-if="column.enabled" class="cell" :class="rowDataClasses" @mouseover="cellHover( columnIndex )" :style="column.dataStyles">
								{{ row.data[column.name] }}
							</div>
						</div>
					</div>

				</div>

			</div>

		</div>

		<!-- Layer: Footer -->
		<div v-if="setting.footer" class="layerFooter JD-NoneSelectable" :style="layerFooterStyles">

			<div v-if="rendering.engine === 2 && processedDataSize" class="pagination">
				<div class="paginationDirection left" :class="rendering.pagination.currentPage === 1 ? 'disabled' : ''">
					<i @click="paginationFirst" class="fas fa-fast-backward start" title="First Page"></i>
					<i @click="paginationPrevious" class="fas fa-backward" title="Previous Page"></i>
				</div>

				<div v-if="!status.mobileSize" class="paginationRows">
					Rows&nbsp;<span v-if="processedDataSize">{{ rendering.pagination.currentStartIndex + 1 }} - {{ rendering.pagination.currentEndIndex }} of&nbsp;</span>{{ processedDataSize }}
				</div>
				<div v-else class="paginationRows">
					<span v-if="processedDataSize">{{ rendering.pagination.currentStartIndex + 1 }} - {{ rendering.pagination.currentEndIndex }}</span>
				</div>

				<div class="paginationArea">

					<div v-if="!status.mobileSize" class="paginationList">
						<div v-if="rendering.pagination.leftPages[0] > 1" class="paginationPage">
							<i class="fas fa-ellipsis-h"></i>
						</div>
						<div v-for="page in rendering.pagination.leftPages" @click="paginationChange( page )" class="paginationPage addHover" :class="page === rendering.pagination.currentPageHightlight ? 'selected' : ''">
							<span>{{ page }}</span>
						</div>
					</div>

					<div v-if="!status.mobileSize" class="paginationList">
						<div v-for="page in rendering.pagination.rightPages" @click="paginationChange( page )" class="paginationPage addHover" :class="page === rendering.pagination.currentPageHightlight ? 'selected' : ''">
							<span>{{ page }}</span>
						</div>
						<div v-if="rendering.pagination.rightPages[rendering.pagination.rightPages.length - 1] < rendering.pagination.availablePages" class="paginationPage">
							<i class="fas fa-ellipsis-h"></i>
						</div>
					</div>

				</div>

				<div class="paginationDirection right" :class="rendering.pagination.currentPage === rendering.pagination.availablePages ? 'disabled' : ''">
					<i @click="paginationNext" class="fas fa-forward" title="Next Page"></i>
					<i @click="paginationLast" class="fas fa-fast-forward end" title="Last Page"></i>
				</div>

			</div>
			<div v-if="( rendering.engine === 0 || rendering.engine === 1 ) && processedDataSize">
				<div class="resultRows" v-show="!filters.show">Rows: {{ processedDataSize }}</div>
			</div>

		</div>

		<!-- Layer: Popup -->
		<transition name="jdTableFade">
			<!-- Table Error -->
			<div v-if="status.tableError" class="layerPopup fullFrame">
				<div class="errorMessage">
					{{ status.tableError }}
				</div>
			</div>

			<!-- No Data Message -->
			<div v-if="status.tableReady && !status.processingData && !loader && !isViewAvailable" class="layerPopup contentFrame">
				<div class="noDataFrame">
					<div class="title">
						No Data Available
					</div>

					<div v-if="filtering" class="filters">
						Try changing your applied filters.
					</div>
				</div>
			</div>

			<!-- Loader -->
			<div v-if="loader" class="layerPopup fullFrame JD-Loader">
				<div class="fulfilling-square-spinner">
					<div class="spinner-inner"></div>
				</div>

				<span class="loadingText">Loading ...</span>
			</div>

			<!-- Processing -->
			<div v-if="status.processingData" class="layerPopup contentFrame JD-Loader">
				<div class="fulfilling-square-spinner">
					<div class="spinner-inner"></div>
				</div>

				<span class="loadingText">Processing Data</span>
			</div>

			<!-- Searching -->
			<div v-if="status.searching" class="layerPopup contentFrame JD-Loader">
				<div class="self-building-square-spinner">
					<div class="square"></div>
					<div class="square"></div>
					<div class="square"></div>
					<div class="square clear"></div>
					<div class="square"></div>
					<div class="square"></div>
					<div class="square clear"></div>
					<div class="square"></div>
					<div class="square"></div>
				</div>

				<span class="loadingText">Searching ..</span>
			</div>

			<!-- Get Started Messaging -->
			<div v-if="!status.processingData && !loader && gettingStarted" class="layerPopup contentFrame">
				<div class="tableMessage" v-html="setting.startBySearchMessage"></div>
			</div>

			<!-- Row Content -->
			<div v-if="row.selectedIndex !== null" class="layerPopup fullFrame fullFrameZone">

				<div class="quickView">

					<div class="quickViewHighlight_1"></div>
					<div class="quickViewHighlight_2"></div>

					<div class="quickViewControl">
						<div @click="print('quickViewContent')" class="controlAction">
							<i class="fas fa-print"></i>
						</div>

						<div class="controlTitle">Quick View</div>

						<div @click="row.selectedIndex = null" class="controlAction">
							<i class="fas fa-times"></i>
						</div>
					</div>

					<div ref="quickViewContent" class="quickViewContent" :style="quickViewContentStyles">
						<div v-for="column in columns.list" class="contentRow">
							<div class="rowTitle">{{ column.title.replace(/(<([^>]+)>)/ig,"") }}</div>
							<div class="rowData">{{ data[row.selectedIndex][column.name] }}</div>
						</div>
					</div>

					<div class="quickViewFooter">
						<div @click="quickViewPrevious" class="footerDirection previous">
							<i class="fas fa-backward"></i>
						</div>
						<div class="footerItem">
							{{ row.selectedIndex + 1 }} of {{ processedDataSize }}
						</div>
						<div @click="quickViewNext" class="footerDirection next">
							<i class="fas fa-forward"></i>
						</div>
					</div>

				</div>

			</div>
		</transition>

	</div>
</template>

<script>
	export default
	{
		name : 'JDTable',

		data ()
		{
			return {
				status :
					{
						tableReady     : false,
						tableError     : null,
						getStarted     : false,
						processingData : false,
						searching      : false,
						mobileSize     : false,
						isIE11         : false,
						tableScroll    : false,
						lastAction     : null,
					},

				view : [],
				data : [],

				feature :
					{
						maximized     : false,
						searching     : false
					},

				rendering :
					{
						engine                  : 0,
						rowMiddleIndex          : 0,
						rowTopIndex             : 0,
						rowBottomIndex          : 0,
						triggerTopPositionPX    : null,
						triggerBottomPositionPX : null,
						virtualHeight           : null,
						isScrolling             : null,
						resettingScroll         : false,
						contentFrameWidth       : null,
						isResizing              : null,
						pagination              :
							{
								currentPage                  : null,
								currentPageHightlight        : null,
								currentStartIndex            : null,
								currentEndIndex              : null,
								availablePages               : null,
								currentPageRows              : null,
								pageRowOptions               : [],
								changingRows                 : false,
								leftPages                    : [],
								rightPages                   : [],
								currentSelectedPageRowOption : null
							}
					},

				processedData : [],

				row :
					{
						selectedIndex : null
					},

				columns :
					{
						list               : [],
						activeHover        : null,
						activeResize       : null,
						activeResizeStart  : null,
						activeSortIndex    : 0,
						activeSortAsc      : false,
						selecting          : false,
						selectionItemWidth : 25,
						selectionError     : false
					},

				search :
					{
						text      : '',
						searching : false
					},

				filters :
					{
						show           : false,
						active         : [],
						activeDropdown : null,
						error          : false,
						errorText      : '',
						beingBuilt     :
							{
								column : null,
								option : null,
								value  : null
							}
					}
			}
		},

		// ---------------
		// Component Props
		// ---------------
		//
		// OPTIONS ----
		//
		// Prop        : option.columns
		// Value       : [ARRAY]
		// Default     : Empty
		// Description : An array of objects which configure the columns of the table.
		// Format      : [
		//				 	{
		//						name          : [STRING] name of the column in the JSON data.
		//						title         : [STRING] title used in the table header.
		//						width         : [NUMBER] used for the width of the column.
		//							          : When option.responsiveTable = FALSE --> Width provided will be PX.
		//                                    : When option.responsiveTable = TRUE --> Width provided will be %.
		//	 					order         : [NUMBER] which defines the order of columns from left to right.
		//                      sort          : [BOOLEAN] sets the column as the initially sorted column.
		// 					    sortDirection : [STRING] sets the direction of the initially sorted column: 'desc' or 'asc'.
		// 						type          : [STRING] which defines the type of data in the column. Options are: 'String' and 'Number'.
		// 						filterable    : [BOOLEAN] which determines if the column can be filtered.
		// 						enabled       : [BOOLEAN] which determines if the column is shown/enabled on initial load.
		//					}
		//               ]
		//
		// Prop        : startBySearch
		// Value       : [BOOLEAN]
		// Default     : False
		// Description : Enables/disables the startBySearchMessage when search text or a filter are not applied.
		//             : This is useful for large dataset's where you don't want to load the entire DB.
		//             : Instead, this prompts the user to search or apply a filter to view any data.
		//
		// Prop        : startBySearchMessage
		// Value       : [STRING]
		// Default     : NULL
		// Description : Message which will be displayed when no search/filter is being applied.
		//
		// Prop        : startBySearchArrowSearch
		// Value       : [BOOLEAN]
		// Default     : NULL
		// Description : When startBySearchMessage is active, displays a pointer to the search box.
		//
		// Prop        : startBySearchArrowFilter
		// Value       : [BOOLEAN]
		// Default     : NULL
		// Description : When startBySearchMessage is active, displays a pointer to the filter box.
		//
		// Prop        : startBySearchArrowSearchText
		// Value       : [BOOLEAN]
		// Default     : NULL
		// Description : Text to be displayed when startBySearchArrorSearch is enabled.
		//
		// Prop        : startBySearchArrowFilterText
		// Value       : [BOOLEAN]
		// Default     : NULL
		// Description : Text to be displayed when startBySearchArrorFilter is enabled.
		//
		// Prop        : option.maxMinimize
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables the min/maximize feature button.
		//
		// Prop        : option.refresh
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables the refresh feature button.
		//
		// Prop        : option.search
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables the search feature button/input.
		//
		// Prop        : option.columnSelect
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables the column select feature.
		//
		// Prop        : option.resize
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables resizing of columns. Only works when responsiveTable is set to FALSE.
		//
		// Prop        : option.filter
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables the filter feature.
		//
		// Prop        : option.export
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables the export to excel feature. Not compatible with IE11 or lower.
		//
		// Prop        : option.columnSort
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables the ability to sort by column.
		//
		// Prop        : option.quickView
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables the ability to double click on a row and show a quick view of all its data.
		//
		// -----
		// | 0 | FULL    : All rows of data will be provided to JD-Table allowing the table to manage the view, search, filtering, pagination itself.
		// | 1 | REQUEST : All data related actions will be emitted to the parent to be processed. The parent in turn will the data details back to the JD-Table.
		// -----
		//
		// Prop        : option.renderEngine
		// Value       : [NUMBER]
		// Default     : NULL
		// Description : Selects the rendering engine JD-Table uses when rendering rows of data.
		//
		// -----
		// | 0 | VIRTUAL    : Render only a small amount of rows based on the table view size. Use this for large tables.
		// | 1 | ALL        : Render all rows regardless of how many there are.
		// | 2 | PAGINATION : Render a specific number of rows and enables 'Next'/'Previous' buttons.
		// -----
		//
		// -------------------------------------
		// | responsiveFrame | responsiveTable |
		// | true            | true            | : Frame fits parent & columns are auto adjusted (%).
		// | true            | false           | : Frame fits parent to a min-width of sum of columns & column are set (PX) size.
		// | false           | true            | : Frame is set (PX) size & column are auto adjusted (%).
		// | false           | false           | : Frame is set (PX) size and columns are set (PX) size.
		// -------------------------------------
		//
		// Prop        : option.responsiveFrame
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Renders the entire JD-Table frame responsively or not.
		//
		// ---------
		// | TRUE  | : Renders the entire JD-Table responsively. It will fit to the parent container.
		// | FALSE | : Renders the entire JD-Table to the width set to the option.frameWidth in pixels.
		// ---------
		//
		// Prop        : option.responsiveTable
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Renders the data table within JD-Table responsively or not.
		//
		// ---------
		// | TRUE  | : Renders the data table responsively to the width of the entire JD-Table frame.
		// | FALSE | : Renders the data table according to the option.columns.width values for each column.
		// ---------
		//
		// Prop        : option.virtualEngineRowStart
		// Value       : [NUMBER]
		// Default     : 250
		// Description : Indicates the amount of rows that if the data exceeds will trigger the virtual rendering engine.
		//             : Only used when renderEngine is set to 0 (auto).
		//
		// Prop        : option.frameWidth
		// Value       : [NUMBER]
		// Default     : Null
		// Description : A number value (PX) which will be assigned to the width of JD-Table when option.responsiveFrame is set to False.
		//
		// Prop        : option.headerHeight
		// Value       : [NUMBER]
		// Default     : 40
		// Description : A number value (PX) which will applied to the table header row height.
		//
		// Prop        : option.dataHeight
		// Value       : [NUMBER]
		// Default     : NULL
		// Description : A number value (PX) which will applied to the data table body height. Null = 100%.
		//
		// Prop        : option.rowHeight
		// Value       : [NUMBER]
		// Default     : 42
		// Description : A number value (PX) which will applied as the height for each data row.
		//
		// Prop        : option.paginationRowLimits
		// Value       : [ARRAY]
		// Default     : [20, 50, 100]
		// Description : Array of numbers that will be provided as options for how many rows appear per page (pagination engine).
		//
		// Prop        : option.paginationRowStart
		// Value       : [NUMBER]
		// Default     : 20
		// Description : A number that will be used as the default selection for how many rows to appear per page (pagination engine).
		//
		// Prop        : option.paginationRowAll
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enable/disable the "ALL" option for how many rows to appear per page (pagination).
		//
		// Prop        : option.pageSideQuantity
		// Value       : [NUMBER]
		// Default     : 5
		// Description : The number of page choices that will be available on either side of the row display on the footer. (pagination engine).
		//
		// Prop        : option.searchEngine
		// Value       : [NUMBER]
		// Default     : 0
		// Description : Sets the search engine that will be used when search is performed.
		//
		// -----
		// | 0 | : JD-Table will search the data that it has available to it.
		// | 1 | : JD-Table will emit a search event to the parent so it can manage how search is performed.
		// -----
		//
		// Prop        : option.forceSearchOpen
		// Value       : [BOOLEAN]
		// Default     : False
		// Description : Force search to be open and cannot be closed.
		//
		// Prop        : option.searchPlaceHolder
		// Value       : [STRING]
		// Default     : NULL
		// Description : The placeholder text for the search input box.
		//
		// Prop        : option.filterEngine
		// Value       : [NUMBER]
		// Default     : 0
		// Description : Sets the filter engine that will be used when filter is performed.
		//
		// -----
		// | 0 | : JD-Table will filter the data that it has available to it.
		// | 1 | : JD-Table will emit a filter event to the parent so it can manage how filter is performed.
		// -----
		//
		// Prop        : option.paginationEngine
		// Value       : [NUMBER]
		// Default     : 0
		// Description : Sets the pagination engine that will be used when a pagination event is performed.
		//
		// -----
		// | 0 | : JD-Table will perform pagination tasks using the data it has current assigned to JD-Table.
		// | 1 | : JD-Table will emit a pagination event to the parent so that external actions like search/filtering can be performed with the pagination changes in mind.
		// -----
		//
		// Prop        : option.startMaximized
		// Value       : [BOOLEAN]
		// Default     : False
		// Description : Renders the table maximized.
		//
		// Prop        : option.forceMaximized
		// Value       : [BOOLEAN]
		// Default     : False
		// Description : Renders the table maximized and removes the min/maximize button.
		//
		// Prop        : option.rowZebra
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Renders all even rows with a light background.
		//
		// Prop        : option.rowFlex
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Allows the row height to be flexible according to the data in the columns.
		//
		// Prop        : option.resizeForceMinWidth
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : When enabled, columns cannot be resized smaller then their initial option.column.width.
		// 			   : Only applies when option.resize is enabled.
		//
		// Prop        : option.highlight
		// Value       : [BOOLEAN]
		// Default     : true
		// Description : Renders the top highlight bar on the frame.
		//
		// Prop        : option.controls
		// Value       : [BOOLEAN]
		// Default     : true
		// Description : Renders the control bar.
		//
		// Prop        : option.footer
		// Value       : [BOOLEAN]
		// Default     : true
		// Description : Renders the footer. Must be true for pagination.
		//
		// Prop        : option.title
		// Value       : [STRING]
		// Default     : Null
		// Description : Display's a title at the top of the table.
		//
		// EVENT ----
		//
		// Prop        : eventFromApp.name
		// Value       : [STRING]
		// Default     : ''
		// Description : Name of event you want to trigger on JD-Table.
		//
		// Prop        : eventFromApp.payload
		// Value       : [ANY]
		// Default     : NULL
		// Description : Optional payload for the event.
		//
		// Prop        : eventFromAppTrigger
		// Value       : [BOOLEAN]
		// Default     : FALSE
		// Description : Triggers the stored event in event.name/payload to execute.

		props :
			{
				option :
					{
						type    : Object,
						default : () => ({})
					},

				eventFromApp :
					{
						type    : Object,
						default : () =>
							({
								name    : null,
								payload : null
							})
					},

				eventFromAppTrigger :
					{
						type    : Boolean,
						default : false
					},

				loader :
					{
						type    : Boolean,
						default : true
					}
			},

		created : function ()
		{
			// Checks if browser is IE11.
			if( navigator.userAgent.indexOf('MSIE')!==-1  || navigator.appVersion.indexOf('Trident/') > -1 )
			{
				this.status.isIE11 = true;
			}
			else
			{
				this.status.isIE11 = !!window.MSInputMethodContext && !!document.documentMode
			}

			this.initializeTable();
		},

		mounted : function ()
		{
			// Add an event listener to watch for a window resize. If detected, re-render the list.
			window.addEventListener( 'resize', ()=>
			{
				// Clear the scrolling timer.
				clearTimeout( this.rendering.isResizing );

				this.rendering.isResizing = setTimeout( () =>
				{
					// If auto rendering is the engine, re-render.
					if ( this.rendering.engine === 0 )
					{
						this.renderView( this.rendering.rowMiddleIndex );
					}

					this.checkMobile();
				}, 750 );
			});
		},

		methods :
			{
				// Configures the table according to the init props.
				initializeTable : function ()
				{
					// Create reactive column settings.
					const INIT_COLUMNS = () =>
					{
						// Ensure columns are defined.
						if ( typeof( this.setting.columns ) === 'object' )
						{
							this.setting.columns.forEach( ( userColumn, index ) =>
							{
								if ( typeof( userColumn.name ) !== 'string' )
								{
									this.status.tableError = 'Error: Invalid settings. One of the defined columns does not have a name assigned.';
								}

								if ( typeof( userColumn.title ) !== 'string' )
								{
									this.status.tableError = 'Error: Invalid settings. One of the defined columns does not have a title assigned.';
								}

								if ( typeof( userColumn.order ) !== 'number' )
								{
									this.status.tableError = 'Error: Invalid settings. One of the defined columns does not have a order assigned.';
								}

								if ( typeof( userColumn.type ) !== 'string' )
								{
									this.status.tableError = 'Error: Invalid settings. One of the defined columns does not have a type assigned.';
								}

								// Sets the column as default sorted.
								if ( userColumn.sort )
								{
									this.columns.activeSortIndex = index;

									if ( typeof( userColumn.sortDirection ) === 'string' )
									{
										if ( userColumn.sortDirection === 'asc' )
										{
											this.columns.activeSortAsc = true;
										}
										else
										{
											this.columns.activeSortAsc = false;
										}
									}
								}

								// Set column width value.
								let columnWidth = null;

								if ( typeof( userColumn.width ) === 'number' )
								{
									columnWidth = userColumn.width;
								}

								// Set initial visibility value.
								let enabled = true;

								if ( typeof( userColumn.enabled ) === 'boolean' && !userColumn.enabled )
								{
									enabled = false;
								}

								// Set filterable value.
								let filterable = false;

								if ( typeof( userColumn.filterable ) === 'boolean' && userColumn.filterable )
								{
									filterable = true;
								}

								this.$set( this.columns.list, index,
									{
										name         : userColumn.name,
										title        : userColumn.title,
										width        : columnWidth,
										order        : userColumn.order,
										type         : userColumn.type,
										filterable   : filterable,
										enabled      : enabled,
										headerStyles : {},
										dataStyles   : {}
									});
							});

							// Sort the array based on the passed order.
							this.columns.list.sort( ( a, b ) =>
							{
								return a.order - b.order;
							});
						}
						else
						{
							this.status.tableError = 'Error: Invalid settings. Columns are not defined.'
						}
					};

					// Determine maximized state.
					const SETUP_MAXIMIZE = () =>
					{
						if ( this.setting.forceMaximized || this.setting.startMaximized )
						{
							this.feature.maximized = true;
						}
					};

					// Check for table & column widths and calculate fixed table full width.
					const SETUP_SIZES = () =>
					{
						let noWidthColumns = 0;

						// Check how many columns have no width assigned.
						this.columns.list.forEach( ( column ) =>
						{
							if ( column.width === null )
							{
								noWidthColumns++;
							}
						});

						// If the table should be responsive, but the sum of the widths is Greater/Equal To 100%. Throw an error.
						if ( this.setting.responsiveTable && this.tableWidth > 100 )
						{
							this.status.tableError =  'Error: Invalid settings. The sum of the individual column widths is greater then 100%. Ensure your columns are balanced.'
						}

						if ( !this.setting.responsiveFrame && this.setting.frameWidth === null )
						{
							this.status.tableError =  'Error: Invalid settings. The setting frameWidth is not configured. In order to use responsiveTable = FALSE you must set a frameWidth. The frame will now operate @ 100% and not function correctly.'
						}

						// Set the column width for each column.
						this.columns.list.forEach( ( column, index ) =>
						{
							// If the column has an assigned width ..
							if ( column.width !== null )
							{
								// If the table is NOT responsive, the width is PX.
								if ( !this.setting.responsiveTable )
								{
									this.$set( this.columns.list[index].headerStyles, 'width', column.width + 'px' );
									this.$set( this.columns.list[index].headerStyles, 'min-width', column.width + 'px' );
									this.$set( this.columns.list[index].headerStyles, 'height', this.setting.headerHeight + 'px' );

									this.$set( this.columns.list[index].dataStyles, 'width', column.width + 'px' );
									this.$set( this.columns.list[index].dataStyles, 'min-width', column.width + 'px' );

									if ( this.setting.rowFlex )
									{
										this.$set( this.columns.list[index].dataStyles, 'min-height', this.setting.rowHeight + 'px' );
									}
								}
								// If the table IS responsive, the width is %.
								else
								{
									this.$set( this.columns.list[index].headerStyles, 'width', column.width + '%' );
									this.$set( this.columns.list[index].dataStyles, 'width', column.width + '%' );
								}
							}
							// If no width is assigned to the column ..
							else
							{
								// If the table is NOT responsive throw an error. This is because column widths are in PX.
								if ( !this.setting.responsiveTable )
								{
									this.status.tableError = 'Error: Invalid settings. One or more of the columns does not have an assigned width. When the setting responsiveTable is set to false, all columns must have a specified width. Rendering table as responsive instead.';
								}

								// Calculate the width out of the remaining percentage.
								let autoColumnWidth = ( 100 - this.tableWidth ) / noWidthColumns;

								this.$set( this.columns.list[index].headerStyles, 'width', autoColumnWidth + '%' );
								this.$set( this.columns.list[index].dataStyles, 'width', autoColumnWidth + '%' );
							}
						});
					};

					// Initialize pagination settings.
					const SETUP_PAGINATION = () =>
					{
						if ( this.setting.renderEngine === 2 )
						{
							// Sets the current page if none is set.
							const INIT_CURRENT_PAGE = () =>
							{
								if ( !this.rendering.pagination.currentPage )
								{
									this.rendering.pagination.currentPage = 1;
								}
							};

							// Sets the current max number of rows per page if none is set.
							const INIT_CURRENT_PAGE_ROWS = () =>
							{
								if ( !this.rendering.pagination.currentPageRows )
								{
									this.rendering.pagination.currentPageRows              = this.setting.paginationRowStart;
									this.rendering.pagination.currentSelectedPageRowOption = this.setting.paginationRowStart;
								}
							};

							// Sets the options available for how many rows will appear on a page.
							const SET_ROW_OPTIONS = () =>
							{
								this.rendering.pagination.pageRowOptions = this.setting.paginationRowLimits;

								if ( this.setting.paginationRowAll )
								{
									this.rendering.pagination.pageRowOptions.push('All');
								}
							};

							INIT_CURRENT_PAGE();
							INIT_CURRENT_PAGE_ROWS();
							SET_ROW_OPTIONS();
						}
					};

					// Force disables features if browser is IE11.
					const BROWSER_CHECK = () =>
					{
						if ( this.status.isIE11 )
						{
							// Export is not compatible with IE11.
							if ( this.setting.export )
							{
								this.setting.export = false;
							}
						}
					}

					// Configure the search option.
					const SETUP_SEARCH = () =>
					{
						if ( this.setting.forceSearchOpen )
						{
							this.feature.searching = true;
						}
					};

					INIT_COLUMNS();
					SETUP_MAXIMIZE();
					SETUP_SIZES();
					SETUP_PAGINATION();
					SETUP_SEARCH();
					BROWSER_CHECK();
				},

				// Manages all feature actions.
				featureAction : function ( name )
				{
					// Switches the maximize flag.
					const MAXIMIZE = () =>
					{
						this.feature.maximized = !this.feature.maximized;

						// Re-render the rows based on the new window size.
						if ( !this.rendering.engine )
						{
							this.renderView( this.rendering.rowMiddleIndex );
						}
					};

					// Shows/hides the search input field.
					const SEARCH = () =>
					{
						if ( !this.setting.forceSearchOpen )
						{
							this.feature.searching = !this.feature.searching;

							if ( this.feature.searching )
							{
								// Waits for the search bar to be visible then focuses it.
								setTimeout( () =>
								{
									this.$refs.searchField.focus();
								}, 150)
							}
						}
					};

					// Emits a refresh event.
					const REFRESH = () =>
					{
						// Update the last action performed.
						this.status.lastAction = 'Refresh';

						this.$emit( 'eventFromJDTable', this.componentState );
					};

					// Show/Hide the filtering view.
					const FILTER = () =>
					{
						this.filters.show = !this.filters.show;
					};

					// Clean up any filter interface/variable settings when a feature button is pressed.
					const FILTER_CLEAN_UP = () =>
					{
						// Reset any filter errors that may exist.
						this.filters.error     = false;
						this.filters.errorText = '';

						// Clear filters if shown.
						if ( this.filters.show )
						{
							this.filters.show = false;
						}
					};

					// Show/Hide the column selection.
					const COLUMNS = () =>
					{
						this.columns.selecting = !this.columns.selecting;
					};

					// Clean up any column selection interface/variable settings when feature button is pressed.
					const COLUMNS_CLEAN_UP = () =>
					{
						this.columns.selecting = false;
					};

					// Show/hide the pagination row changing option.
					const PAGINATION = () =>
					{
						this.rendering.pagination.changingRows = !this.rendering.pagination.changingRows;
					};

					// Clean up any pagination row changing options.
					const PAGINATION_CLEAN_UP = () =>
					{
						this.rendering.pagination.changingRows = false;
					};

					// Exports the current available data to excel.
					const EXPORT = () =>
					{
						// Creates a HTML table to be exported.
						const renderTable = () =>
						{
							var table = '<table><thead>';

							table += '<tr>';

							for ( let i = 0; i < this.columns.list.length; i++ )
							{
								const column = this.columns.list[i];

								table += '<th>';

								if ( typeof( column.title ) === 'undefined' )
								{
									table += column.name;
								}
								else
								{
									table += column.title;
								}

								table += '</th>';
							}

							table += '</tr>';

							table += '</thead><tbody>';

							for ( let i = 0; i < this.processedData.length; i++ )
							{
								const row = this.processedData[i];

								table += '<tr>';

								for ( var j = 0; j < this.columns.list.length; j++ )
								{
									const column = this.columns.list[j];

									table += '<td>';
									table += row[column.name];
									table += '</td>';
								}

								table += '</tr>';
							}

							table += '</tbody></table>';

							return table;
						};

						const mimeType       = 'data:application/vnd.ms-excel;';
						const htmlTable      = renderTable().replace(/ /g, '%20');
						const documentPrefix = 'Export';
						const d              = new Date();
						let dummy            = document.createElement('a');

						dummy.href     = mimeType + ', ' + htmlTable;
						dummy.download = documentPrefix
							+ '-' + d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate()
							+ '-' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds()
							+'.xls';
						dummy.click();
					};

					if ( name === 'MaxMinimize' )
					{
						FILTER_CLEAN_UP();
						COLUMNS_CLEAN_UP();

						MAXIMIZE();
					}
					else if ( name === 'Search' )
					{
						FILTER_CLEAN_UP();
						COLUMNS_CLEAN_UP();

						SEARCH();
					}
					else if ( name === 'Refresh' )
					{
						FILTER_CLEAN_UP();
						COLUMNS_CLEAN_UP();
						PAGINATION_CLEAN_UP();

						REFRESH();
					}
					else if ( name === 'Columns' )
					{
						FILTER_CLEAN_UP();
						PAGINATION_CLEAN_UP();

						COLUMNS();
					}
					else if ( name === 'Filter' )
					{
						COLUMNS_CLEAN_UP();
						PAGINATION_CLEAN_UP();

						FILTER();
					}
					else if ( name === 'Pagination' )
					{
						COLUMNS_CLEAN_UP();
						FILTER_CLEAN_UP();

						PAGINATION();
					}
					else if ( name === 'Export' )
					{
						FILTER_CLEAN_UP();
						COLUMNS_CLEAN_UP();
						PAGINATION_CLEAN_UP();

						EXPORT();
					}
				},

				// Processes the raw data through filters/search. This returns a promise.
				processData : function ()
				{
					// Start processing visual.
					this.status.processingData = true;

					return new Promise( ( resolve, reject ) =>
					{
						// Timeout ensures processing message.
						setTimeout( () => {
							let processedData = this.data;

							// ---------
							// SEARCHING
							// ---------
							//
							// Search terms filter all of the data that JD-Table has. This means search happens before filtering.
							if ( !this.setting.searchEngine )
							{
								// Clean the search term.
								let searchTerm = this.search.text.trim().toLowerCase();

								// If a search term exists, search it.
								if ( searchTerm )
								{
									// Indicate that searching is being done.
									this.search.searching = true;

									processedData = processedData.filter ( ( row ) =>
									{
										// Define the search pattern for various column type date: String/Number/Array.
										const searchAlgorithm = ( column ) =>
										{
											// Search a column which is made up of an array or strings.
											if ( column.type === 'Array' )
											{

											}
											// Search a column which is made up of strings or numbers.
											else
											{
												let searchText = String( row[column.name] ).toLowerCase();

												// Casts number variables to strings to make the searchable with Strings.
												if ( searchText.includes( searchTerm ) )
												{
													return true;
												}
											}

											return false;
										};

										// If the search algorithm function returns true, that row is kept (not filtered).
										return this.columns.list.find( searchAlgorithm );
									});
								}
								else
								{
									// Indicate that searching is NOT being done.
									this.search.searching = false;
								}
							}

							// ---------
							// FILTERING
							// ---------
							//
							// Filters are applied using the following rules:
							// - Filters with the same column are grouped together and use the OR condition (excluding < and > which are AND)
							// 	 - Filter #1: 'Column1' --> 'Equals To' --> 'John'
							//   - Filter #2: 'Column1' --> 'Equals To' --> 'Peter'
							//   - Applied: Show rows where 'Column1' --> 'Equals To' --> 'John' OR 'Peter'
							// - Filters applied to different columns use AND condition.
							//   - Filter #1: 'Column1' --> 'Equals To' --> 'John'
							//   - Filter #2: 'Column2' --> 'Equals To' --> '$100.00'
							//   - Applied: Show rows where 'Column1' --> 'Equals To' --> 'John' AND 'Column2' 'Equals To' --> '$100.00'
							if ( this.filtering )
							{
								let tempData = [];

								// Returns a unique array of column names that are actively filtered.
								const UNIQUE_FILTER_COLUMNS = () =>
								{
									let columnSet     = new Set( this.filters.active.map( ( filter ) => filter.column.name ) );
									let uniqueColumns = [];

									columnSet.forEach( ( column ) =>
									{
										uniqueColumns.push( column );
									});

									return uniqueColumns;
								};

								// Performs filter: Equals To (String Based).
								const FILTER_EQUALS_TO = ( row, columnFilter ) =>
								{
									return ( String( row[columnFilter.column.name]).toLowerCase() === String(columnFilter.value).toLowerCase() );
								};

								// Performs filter: Not Equals To (String Based).
								const FILTER_NOT_EQUALS_TO = ( row, columnFilter ) =>
								{
									return ( String( row[columnFilter.column.name]).toLowerCase() !== String(columnFilter.value).toLowerCase() );
								};

								// Performs filter: Begins With (String Based).
								const FILTER_BEGINS_WITH = ( row, columnFilter ) =>
								{
									return ( String( row[columnFilter.column.name]).toLowerCase().startsWith(String(columnFilter.value).toLowerCase()) );
								};

								// Performs filter: Contains (String Based).
								const FILTER_CONTAINS = ( row, columnFilter ) =>
								{
									return ( String( row[columnFilter.column.name]).toLowerCase().includes(String(columnFilter.value).toLowerCase()) );
								};

								// Performs filter: Greater and Less/Equal To (Number Based).
								const FILTER_GREATER_LESS_THAN = ( row, columnName, greaterThanValue, lessThanValue ) =>
								{
									let columnNumber = Number( row[columnName] );

									if ( greaterThanValue && lessThanValue )
									{
										if ( columnNumber >= greaterThanValue && columnNumber <= lessThanValue )
										{
											return true;
										}
									}

									if ( greaterThanValue && !lessThanValue )
									{
										if ( columnNumber >= greaterThanValue )
										{
											return true;
										}
									}

									if ( !greaterThanValue && lessThanValue )
									{
										if ( columnNumber <= lessThanValue )
										{
											return true;
										}
									}

									return false;
								};

								// Cycle through the unique column filters.
								UNIQUE_FILTER_COLUMNS().forEach( ( columnName, index ) =>
								{
									// Will hold the data that will be filtered.
									let dataToBeFiltered = [];

									// Will hold the new set of filtered data.
									let newFilteredData = [];

									// On first pass (for the first column), use all the data available.
									if ( index === 0 )
									{
										dataToBeFiltered = processedData;
									}
									// On second pass (next column) use existing filtered data.
									else
									{
										dataToBeFiltered = tempData;
									}

									// Get all of the filters for the given column.
									let columnFilters = this.filters.active.filter( ( filter ) =>
									{
										return filter.column.name === columnName;
									});

									// Stores numeric comparison values.
									let greaterThanValue = null;
									let lessThanValue    = null;


									// Check for Greater/Equal To / Less/Equal To filters which should be grouped.
									columnFilters.forEach( ( columnFilter ) =>
									{
										// Store greater then for
										if ( columnFilter.option === 'Greater/Equal To' )
										{
											greaterThanValue = columnFilter.value;
										}

										if ( columnFilter.option === 'Less/Equal To' )
										{
											lessThanValue = columnFilter.value;
										}
									});

									// For each row of data, check the column filter. If any single filter passes, add the row and move to the next.
									dataToBeFiltered.forEach( ( row, index ) =>
									{
										// Indicates if the row has been added to the newly filtered array.
										let hasBeenPushed = false;

										// Process string based filters.
										columnFilters.forEach( ( columnFilter ) =>
										{
											// FILTER: Equals To
											if ( columnFilter.option === 'Equals To' )
											{
												if ( FILTER_EQUALS_TO( row, columnFilter ) )
												{
													newFilteredData.push( row );

													hasBeenPushed = true;
												}
											}

											// FILTER: Contains
											if ( !hasBeenPushed && columnFilter.option === 'Contains' )
											{
												if ( FILTER_CONTAINS( row, columnFilter ) )
												{
													newFilteredData.push( row );

													hasBeenPushed = true;
												}
											}

											// FILTER: Not Equals To
											if ( !hasBeenPushed && columnFilter.option === 'Not Equals To' )
											{
												if ( FILTER_NOT_EQUALS_TO( row, columnFilter ) )
												{
													newFilteredData.push( row );

													hasBeenPushed = true;
												}
											}

											// FILTER: Begins With
											if ( !hasBeenPushed && columnFilter.option === 'Begins With' )
											{
												if ( FILTER_BEGINS_WITH( row, columnFilter ) )
												{
													newFilteredData.push( row );

													hasBeenPushed = true;
												}
											}
										});

										// Check if there are numeric specific operations.
										if ( greaterThanValue || lessThanValue )
										{
											if ( FILTER_GREATER_LESS_THAN( row, columnName, greaterThanValue, lessThanValue ) )
											{
												newFilteredData.push( row );
											}
										}
									});

									// Replace the tempData with the newly filtered data.
									tempData = newFilteredData;
								});

								processedData = tempData;
							}

							this.processedData = processedData;

							// Stop processing visual.
							this.status.processingData = false;

							// End the promise.
							resolve();
						}, 75);
					});
				},

				// Processes the passed event.
				processEvent : function ( name )
				{
					// Process the data sent to JD-Table.
					if ( !this.status.tableError && name === 'sendData' )
					{
						if ( this.eventFromApp.payload !== null && this.eventFromApp.payload.constructor.name === 'Array' )
						{
							if ( this.eventFromApp.payload.length > 0 )
							{
								// Assign the data to the component.
								this.data = this.eventFromApp.payload;

								// Reset scroll position.
								this.resetScroll();

								// Process the data through filters/search.
								this.processData().then( () =>
								{
									// Render the data.
									this.renderView();
								});
							}
							else
							{
								this.view = [];

								this.status.processingData = false;
							}

							// Set the table to ready.
							this.status.tableReady = true;
						}
						else
						{
							this.status.tableError = 'Error: sendData event issue. Payload is null or improperly formatted.';
						}
					}

					// Processes a Table Message event to JD-Table.
					if ( name === 'displayMessage' )
					{
						if ( this.eventFromApp.payload !== null )
						{
							this.status.tableMessage = this.eventFromApp.payload;
						}
					}

					// Process search external search results.
					if ( !this.status.tableError && name === 'searchResults' )
					{
						if ( this.eventFromApp.payload !== null && this.eventFromApp.payload.constructor.name === 'Array' )
						{
							// Clear the searching message.
							this.status.searching = false;

							if ( this.eventFromApp.payload.length > 0 )
							{
								// Assign the data to the component.
								this.data = this.eventFromApp.payload;

								// Reset scroll position.
								this.resetScroll();

								// Process the data through filters/search.
								this.processData().then( () =>
								{
									// Render the data.
									this.renderView();
								});
							}
							else
							{
								this.view = [];
							}

							// Set the table to ready.
							this.status.tableReady = true;
						}
						else
						{
							this.status.tableError = 'Error: searchResults event issue. Payload is null or improperly formatted.';
						}
					}

					// Process request to clear current table data.
					if ( !this.status.tableError && name === 'clearData' )
					{
						// Clear data.
						this.processedData = [];
						this.data          = [];

						// Reset pagination.
						this.rendering.pagination.currentPage           = 1;
						this.rendering.pagination.currentPageHightlight = null;
						this.rendering.pagination.currentStartIndex     = null;
						this.rendering.pagination.currentEndIndex       = null;
						this.rendering.pagination.availablePages        = null;
						this.rendering.pagination.currentPageRows       = this.rendering.pagination.currentSelectedPageRowOption;
						this.rendering.pagination.changingRows          = false;
						this.rendering.pagination.leftPages             = [];
						this.rendering.pagination.rightPages            = [];

						// Stop any processing messaging.
						this.status.processingData = false;

						// Make the table NOT ready.
						this.status.tableReady = false;

						// Reset scroll positions.
						this.resetScroll();

						// Clean the view.
						this.view = [];
					}
				},

				// Renders the correct view based on the data and rendering engine setting.
				renderView : function ( renderPosition = 0 )
				{
					// Start processing visual.
					this.status.processingData = true;

					// Timeout ensures processing message.
					setTimeout( () =>
					{
						// Check mobile size.
						this.checkMobile();

						// Sort the data.
						this.sortData();

						if ( this.processedDataSize > 0 )
						{
							// Rendering Engine: Auto
							if ( !this.setting.renderEngine )
							{
								// Render full.
								if ( this.processedDataSize <= this.setting.virtualEngineRowStart )
								{
									this.rendering.engine = 1;

									this.renderViewAll();
								}
								// Render virtual.
								else
								{
									this.rendering.engine = 0;

									this.renderViewVirtual( renderPosition );
								}
							}
							else
							{
								// Render All.
								if ( this.setting.renderEngine === 1 )
								{
									this.rendering.engine = 1;

									this.renderViewAll();
								}
								// Render Pagination
								if ( this.setting.renderEngine === 2 )
								{
									this.rendering.engine = 2;

									this.renderPagination();
								}
							}
						}
						else
						{
							this.view = [];
						}

						this.checkBodyScroll();

						// Stop processing visual.
						this.status.processingData = false;
					}, 80 );
				},

				// Render all the data passed to JD-Table.
				renderViewAll : function ()
				{
					let fullView = [];

					if ( this.processedDataSize > 0 )
					{
						this.processedData.forEach ( ( row, index ) =>
						{
							fullView.push
							({
								index : index,
								data  : row
							});
						});
					}

					this.view = fullView;
				},

				// Renders the virtual view based on the passed position.
				renderViewVirtual : function ( renderPosition )
				{
					// Calculate how many rows will fit in the current view (client table body).
					const VIRTUAL_ROWS_IN_VIEW = () =>
					{
						// Get the current height of the table body container.
						let viewHeight = this.$refs.bodyData.clientHeight;

						return Math.ceil( viewHeight / this.setting.rowHeight );
					};

					// Calculate the virtual render buffer size. This # of items will be loaded before and after the view.
					const VIRTUAL_BUFFER_SIZE = () =>
					{
						// Set the buffer size to 5 times the amount of rows that fit in the view.
						return VIRTUAL_ROWS_IN_VIEW() * 5;
					};

					// Determines if the renderPosition is near the start of the list.
					const VIRTUAL_START_ZONE = ( position ) =>
					{
						return ( position <= VIRTUAL_BUFFER_SIZE() );
					};

					// Determines if the renderPosition is near the end of the list.
					const VIRTUAL_END_ZONE = ( position ) =>
					{
						return ( position >= ( this.processedDataSize - 1) || position >= (this.processedDataSize - VIRTUAL_BUFFER_SIZE() ) );
					};

					let updatedView = [];

					// Set the virtual height div.
					this.rendering.virtualHeight = 0;

					if ( this.processedDataSize > 0 )
					{
						// Update the virtual height div.
						this.rendering.virtualHeight = this.processedDataSize * this.setting.rowHeight;

						let startPosition = renderPosition - VIRTUAL_BUFFER_SIZE();
						let endPosition   = renderPosition + VIRTUAL_BUFFER_SIZE() + VIRTUAL_ROWS_IN_VIEW();

						// If the render position is in the start zone, set to 0 (beginning) of data.
						if ( VIRTUAL_START_ZONE( startPosition ) )
						{
							startPosition = 0;
						}

						// If the render position is in the end zone, set to the last data item (end).
						if ( VIRTUAL_END_ZONE( endPosition ) )
						{
							endPosition = this.processedDataSize - 1;
						}

						for ( let i = startPosition; i <= endPosition; i++ )
						{
							// Add item to end of view.
							updatedView.push
							({
								index : i,
								data  : this.processedData[i]
							});
						}

						// Update the currently rendered top row (index).
						this.rendering.rowTopIndex = startPosition;

						// Update the currently rendered bottom row (index).
						this.rendering.rowBottomIndex = endPosition;

						// Update the currently rendered position.
						this.rendering.rowMiddleIndex = renderPosition;

						// Set the next render positions (top/bottom).
						this.setRenderPositions();
					}

					this.view = updatedView;
				},

				renderPagination : function ()
				{
					// Sets the available pages based on the data size and rows per page.
					const SET_AVAILABLE_PAGES = () =>
					{
						this.rendering.pagination.availablePages = Math.ceil( this.processedDataSize / this.rendering.pagination.currentPageRows );

						if ( this.rendering.pagination.currentPage > this.rendering.pagination.availablePages )
						{
							this.rendering.pagination.currentPage = 1;
						}
					};

					// Returns the rows that should be in the current view based ont he page.
					const GET_ROWS_IN_PAGE = () =>
					{
						let pageView   = [];
						let startIndex = ( this.rendering.pagination.currentPage * this.rendering.pagination.currentPageRows ) - this.rendering.pagination.currentPageRows;
						let endIndex   = ( this.rendering.pagination.currentPage * this.rendering.pagination.currentPageRows );

						// End index correction.
						if ( endIndex > this.processedDataSize )
						{
							endIndex = this.processedDataSize;
						}

						for ( let i = startIndex; i < endIndex; i++ )
						{
							// Add item to end of view.
							pageView.push
							({
								index : i,
								data  : this.processedData[i]
							});
						}

						if ( pageView.length > 0 )
						{
							this.rendering.pagination.currentStartIndex = startIndex;
							this.rendering.pagination.currentEndIndex   = endIndex;
						}
						else
						{
							this.rendering.pagination.currentStartIndex = 0;
							this.rendering.pagination.currentEndIndex   = 0;
						}

						return pageView;
					};

					// Sets the left and right page options for the footer.
					const SET_PAGE_OPTIONS = () =>
					{
						let leftPages       = [];
						let rightPages      = [];
						let sideQuantity    = this.setting.pageSideQuantity;

						// Correct the side quantity if there aren't enough pages to fulfill it.
						if ( ( sideQuantity * 2 ) > this.rendering.pagination.availablePages )
						{
							sideQuantity = Math.ceil( this.rendering.pagination.availablePages / 2 );
						}

						// If at the beginning of the page last.
						if ( this.rendering.pagination.currentPage <= sideQuantity )
						{
							for ( let i = 1; i <= sideQuantity; i++ )
							{
								leftPages.push( i );
								rightPages.push( i + sideQuantity );
							}

							// If the available pages is a odd number, remove the last rightPage option (extra).
							if ( this.rendering.pagination.availablePages % 2 !== 0 )
							{
								rightPages.pop();
							}
						}
						else
						{
							// If at the end of the page last.
							if ( this.rendering.pagination.currentPage >= ( this.rendering.pagination.availablePages - sideQuantity ) )
							{
								let tempTotalPages = this.rendering.pagination.availablePages;

								// Correction for condition when there are not enough pages to balance on left and right.
								// This will ensure the left side gets filled first.
								let rightSideQuantity = tempTotalPages - sideQuantity;

								if ( rightSideQuantity > sideQuantity )
								{
									rightSideQuantity = sideQuantity;
								}

								for ( let i = 1; i <= rightSideQuantity; i++ )
								{
									rightPages.push( tempTotalPages );

									tempTotalPages--;
								}

								for ( let i = 1; ( i <= sideQuantity && tempTotalPages !== 0 ); i++ )
								{
									leftPages.push( tempTotalPages );

									tempTotalPages--;
								}

								// Reverse the sort order.
								leftPages.reverse();
								rightPages.reverse();
							}
							else
							{
								let tempCurrentPage = this.rendering.pagination.currentPage;

								// Set left side.
								for ( let i = 1; i <= sideQuantity; i++ )
								{
									leftPages.push( tempCurrentPage );

									tempCurrentPage--;
								}

								tempCurrentPage = this.rendering.pagination.currentPage + 1;

								// Set right side.
								for ( let i = 1; i <= sideQuantity; i++ )
								{
									rightPages.push( tempCurrentPage );

									tempCurrentPage++;
								}

								// Reverse the sort order.
								leftPages.reverse();
							}
						}

						this.rendering.pagination.leftPages             = leftPages;
						this.rendering.pagination.rightPages            = rightPages;
						this.rendering.pagination.currentPageHightlight = this.rendering.pagination.currentPage;
					};

					SET_AVAILABLE_PAGES();
					SET_PAGE_OPTIONS();

					// Reset the scroll position.
					this.resetScroll();

					// Update the table view.
					this.view = GET_ROWS_IN_PAGE();
				},

				// Changes the page to the passed value.
				paginationChange : function ( page )
				{
					if ( this.rendering.pagination.currentPage !== page )
					{
						// Update the last action performed.
						this.status.lastAction = 'PaginationGoToSpecificPage';

						// Increase the page.
						this.rendering.pagination.currentPage = page;

						// Emit pagination event.
						if ( this.setting.paginationEngine === 1 )
						{
							this.$emit( 'eventFromJDTable', this.componentState );
						}
						// Update the view.
						else
						{
							// Re-render the view.
							this.renderView();
						}
					}
				},

				// Checks and processes the next page of paginated data.
				paginationNext : function ()
				{
					let nextPage = this.rendering.pagination.currentPage + 1;

					// Ensure not going beyond available pages.
					if ( nextPage <= this.rendering.pagination.availablePages )
					{
						// Update the last action performed.
						this.status.lastAction = 'PaginationGoToNextPage';

						// Increase the page.
						this.rendering.pagination.currentPage++;

						// Emit pagination event.
						if ( this.setting.paginationEngine === 1 )
						{
							this.$emit( 'eventFromJDTable', this.componentState );
						}
						// Update the view.
						else
						{
							// Re-render the view.
							this.renderView();
						}
					}
				},

				// Changes to the last page (end of dataset).
				paginationLast : function ()
				{
					if ( this.rendering.pagination.currentPage !== this.rendering.pagination.availablePages )
					{
						// Update the last action performed.
						this.status.lastAction = 'PaginationGoToLastPage';

						// Set the current page to the last.
						this.rendering.pagination.currentPage = this.rendering.pagination.availablePages;

						// Emit pagination event.
						if ( this.setting.paginationEngine === 1 )
						{
							this.$emit( 'eventFromJDTable', this.componentState );
						}
						// Update the view.
						else
						{
							// Re-render the view.
							this.renderView();
						}
					}
				},

				// Checks and processes the previous page of paginated data.
				paginationPrevious : function ()
				{
					let previousPage = this.rendering.pagination.currentPage - 1;

					// Ensure not going beyond available pages.
					if ( previousPage >= 1 )
					{
						// Update the last action performed.
						this.status.lastAction = 'PaginationGoToPreviousPage';

						// Increase the page.
						this.rendering.pagination.currentPage--;

						// Emit pagination event.
						if ( this.setting.paginationEngine === 1 )
						{
							this.$emit( 'eventFromJDTable', this.componentState );
						}
						// Update the view.
						else
						{
							// Re-render the view.
							this.renderView();
						}
					}
				},

				// Changes to the first page (beginning of dataset).
				paginationFirst : function ()
				{
					if ( this.rendering.pagination.currentPage !== 1 )
					{
						// Update the last action performed.
						this.status.lastAction = 'PaginationGoToFirstPage';

						// Set the current page to the last.
						this.rendering.pagination.currentPage = 1;

						// Emit pagination event.
						if ( this.setting.paginationEngine === 1 )
						{
							this.$emit( 'eventFromJDTable', this.componentState );
						}
						// Update the view.
						else
						{
							// Re-render the view.
							this.renderView();
						}
					}
				},

				// Changes how many rows can appear per page.
				changePageRows : function ( rows )
				{
					if ( this.rendering.pagination.currentSelectedPageRowOption !== rows )
					{
						// Update the last action performed.
						this.status.lastAction = 'PaginationPageLimitChange';

						if ( rows === 'All' )
						{
							this.rendering.pagination.currentPageRows = this.processedDataSize;
						}
						else
						{
							this.rendering.pagination.currentPageRows = rows;
						}

						this.rendering.pagination.currentSelectedPageRowOption = rows;

						this.rendering.pagination.changingRows = false;

						// Emit pagination event.
						if ( this.setting.paginationEngine === 1 )
						{
							this.$emit( 'eventFromJDTable', this.componentState );
						}
						// Update the view.
						else
						{
							this.renderView();
						}
					}
				},

				// Sets the next top and bottom re-rendering position points in pixels.
				setRenderPositions : function ()
				{
					// For a re-render.
					this.$forceUpdate();

					// We use nextTick() so that the height calculations are performed after the render is complete.
					this.$nextTick( () =>
					{
						// Returns the height of the current rendered view (all items).
						const CURRENT_VIEW_HEIGHT = () =>
						{
							return this.$refs.viewData.clientHeight;
						};

						// Returns the current position (top) of the view inside the body.
						const CURRENT_VIEW_POSITION_PX = () =>
						{
							return this.$refs.viewData.offsetTop;
						};

						// Returns the current height of the table body.
						const CURRENT_BODY_HEIGHT = () =>
						{
							return this.$refs.bodyData.clientHeight;
						};

						// Calculate the next render (top) position.
						if ( this.rendering.rowTopIndex === 0 )
						{
							this.rendering.triggerTopPositionPX = -1;
						}
						else
						{
							// Re-render when the scroll bar is at a position where only 5 rows exist above.
							this.rendering.triggerTopPositionPX = Math.floor( CURRENT_VIEW_POSITION_PX() + ( CURRENT_VIEW_HEIGHT() / 8 ) );
						}

						// Calculate the next render (bottom) position.
						if ( this.rendering.rowBottomIndex === ( this.processedDataSize - 1 ) )
						{
							this.rendering.triggerBottomPositionPX = -1;
						}
						else
						{
							// Re-render when scroll bar is at a position where only 2 pages of rows exist.
							this.rendering.triggerBottomPositionPX = Math.floor ( ( CURRENT_VIEW_POSITION_PX() + CURRENT_VIEW_HEIGHT() ) - ( CURRENT_BODY_HEIGHT() * 2.0 ) );
						}
					});
				},

				// Used for virtual rendering, renders the view when scrolling at top/bottom trigger points.
				virtualScroll : function ()
				{
					if ( this.rendering.engine !== 0 )
					{
						return;
					}

					if ( !this.rendering.resettingScroll )
					{
						// Clear the scrolling timer.
						clearTimeout( this.rendering.isScrolling );

						// Get the current scroll position.
						let scrollPositionPX = this.$refs.bodyData.scrollTop;

						// Calculate the % (0 - 100) the scroll position is.
						let scrollPositionPercent = scrollPositionPX / this.rendering.virtualHeight;

						// Calculate the next potential render position in the data.
						let potentialRenderPosition = Math.floor( this.processedDataSize * scrollPositionPercent );

						// Scrolling Up Check
						if ( scrollPositionPX < this.rendering.triggerTopPositionPX )
						{
							if ( this.rendering.triggerTopPositionPX >= 0 )
							{
								// Show the processing message.
								this.status.processingData = true;

								this.rendering.isScrolling = setTimeout( () =>
								{
									this.renderView( Math.floor( this.processedDataSize * scrollPositionPercent ) );
								}, 500 );
							}
						}

						// Scrolling Down Check.
						if ( scrollPositionPX > this.rendering.triggerBottomPositionPX )
						{
							if ( this.rendering.triggerBottomPositionPX >= 0 )
							{
								// Show the processing message.
								this.status.processingData = true;

								this.rendering.isScrolling = setTimeout( () =>
								{
									this.renderView( Math.floor( this.processedDataSize * scrollPositionPercent ) );
								}, 750 );
							}
						}
					}
				},

				// Checks the width of the JD-Table and sets the mobile size flag.
				checkMobile : function ()
				{
					setTimeout( () =>
					{
						if ( this.$refs.bodyData.clientWidth <= 320)
						{
							this.status.mobileSize = true;
						}
						else
						{
							this.status.mobileSize = false;
						}
					}, 220);
				},

				// Sets the column that is currently being hovered over.
				cellHover : function ( columnIndex )
				{
					this.columns.activeHover = columnIndex;
				},

				// Checks if the body of the table has a scroll bar. This is important to align the head + body.
				checkBodyScroll : function ()
				{
					setTimeout( () =>
					{
						// Checks the table widths to see if scroll bar is enabled for body.
						if ( this.$refs.bodyData.scrollHeight > this.$refs.bodyData.clientHeight )
						{
							this.status.tableScroll = true;
						}
						else
						{
							this.status.tableScroll = false;
						}
					}, 100);
				},

				// Resets clears the current hovered column/row data.
				bodyLeave : function ()
				{
					if ( this.rendering.engine !== 0 )
					{
						return;
					}

					this.columns.activeHover = null;
				},

				// Triggers the start of a resize event. Records the column to be resized and the starting X position.
				resizeStart : function ( columnIndex, e )
				{
					// Start a listener to stop the resize process.
					window.addEventListener( 'mouseup', this.resizeStop , false );

					if ( !this.setting.responsiveTable )
					{
						this.columns.activeResize  = columnIndex;
						this.columns.activeResizeStart = e.clientX;
					}

					return false;
				},

				// Ends the column resize process.
				resizeStop : function ()
				{
					// Small delay to help with sort issue.
					setTimeout( () =>
					{
						this.columns.activeResize = null;
					}, 75 );

					this.renderViewVirtual( this.rendering.rowMiddleIndex );

					window.removeEventListener( 'mouseup', this.resizeStop, false );
				},

				// Resets the scroll position to the top left of the table body.
				resetScroll : function ()
				{
					// Reset the render positions.
					this.rendering.triggerTopPositionPX    = null;
					this.rendering.triggerBottomPositionPX = null;

					// This prevents the triggering of the onScroll function for body.
					this.rendering.resettingScroll = true;

					// Reset the scroll position to top/left.
					this.$refs.bodyData.scrollTop      = 0;
					this.$refs.contentFrame.scrollLeft = 0;

					this.$nextTick().then( () =>
					{
						// This prevents the triggering of the onScroll function for body.
						this.rendering.resettingScroll = false;
					});
				},

				// Resizes the flagged column according to the clientX position.
				resizeDrag : function ( columnIndex, e )
				{
					if ( !this.setting.responsiveTable && this.columns.activeResize !== null )
					{
						// Extract the width number from the string.
						let width = this.columns.list[columnIndex].width;

						// Shrink the width.
						if ( e.clientX < this.columns.activeResizeStart )
						{
							// Calculate new width based off the existing width and start drag position and current client X.
							width = width - ( this.columns.activeResizeStart - e.clientX );
						}
						// Expand the width.
						else
						{
							// Calculate new width based off the existing width and start drag position and current client X.
							width = width + ( e.clientX - this.columns.activeResizeStart );
						}

						// If resizeForceMinWidth is enabled and the width is lower then start - reset width.
						if ( this.setting.resizeForceMinWidth && ( width < this.setting.columns[columnIndex].width ) )
						{
							width = this.setting.columns[columnIndex].width;
						}

						// Update the column width.
						this.columns.list[columnIndex].width                   = width;
						this.columns.list[columnIndex].headerStyles['width']   = width + 'px';
						this.columns.list[columnIndex].dataStyles['width']     = width + 'px';
						this.columns.list[columnIndex].dataStyles['min-width'] = width + 'px';

						// Update the initial drag position.
						this.columns.activeResizeStart = e.clientX;
					}
				},

				// Changes the sort column and/or direction.
				changeSort : function ( columnIndex )
				{
					// Prevent sort on resize.
					if ( this.columns.activeResize !== null )
					{
						return;
					}

					if ( !this.setting.columnSort )
					{
						return null;
					}

					// If the clicked column is the currently sorted column, reverse the sort.
					if ( this.columns.activeSortIndex === columnIndex )
					{
						this.columns.activeSortAsc = !this.columns.activeSortAsc;
					}
					// Sort the new column descending.
					else
					{
						this.columns.activeSortIndex     = columnIndex;
						this.columns.activeSortAsc = false;
					}

					// Re-render the view.
					this.renderView( this.rendering.rowMiddleIndex );
				},

				// Sorts the original data.
				sortData : function ()
				{
					let columnName     = this.columns.list[this.columns.activeSortIndex].name;
					let columnSortType = this.columns.list[this.columns.activeSortIndex].type;

					if ( this.processedDataSize > 0 )
					{
						this.processedData.sort( ( a, b ) =>
						{
							// Sort the data with null values.
							const sortByNull = ( x, y ) =>
							{
								if ( !x[columnName] )
								{
									return -1 * ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
								}

								if ( !y[columnName] )
								{
									return 1 * ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
								}
							}

							// Sort the data by string.
							const sortByString = ( x, y ) =>
							{
								let stringX = x[columnName].toUpperCase();
								let stringY = y[columnName].toUpperCase();

								if ( stringX < stringY )
								{
									return -1 * ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
								}

								if ( stringX > stringY )
								{
									return 1 * ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
								}

								// Strings are the same.
								return 0;
							};

							// Sort the data by number.
							const sortByNumber = ( x, y ) =>
							{
								return ( x[columnName] - y[columnName] ) * ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
							};

							// Sort the data by array. Sorts the first string in the array.
							const sortByArray = ( x, y ) =>
							{
								let stringX = x[columnName][0].toUpperCase();
								let stringY = y[columnName][0].toUpperCase();

								if ( stringX < stringY )
								{
									return -1;
								}

								if ( stringX > stringY )
								{
									return 1;
								}

								// Strings are the same.
								return 0;
							};

							// Check for nulls.
							if ( !a[columnName] || !b[columnName] )
							{
								return sortByNull ( a, b );
							}

							// If the column is a string, sort using string function.
							if ( columnSortType === 'String' )
							{
								return sortByString ( a, b );
							}

							// If the column is a Number, sort using Number function.
							if ( columnSortType === 'Number' )
							{
								return sortByNumber ( a, b );
							}

							// If the column is a Array, sort using Array function.
							if ( columnSortType === 'Array' )
							{
								return sortByArray ( a, b );
							}
						});
					}
				},

				// Returns the appropriate sort title.
				sortTitle : function ( columnIndex )
				{
					if ( !this.setting.columnSort )
					{
						return null;
					}

					if ( this.columns.activeSortIndex === columnIndex && !this.columns.activeSortAsc )
					{
						return 'Sort Ascending'
					}

					return 'Sort Descending';
				},

				// Changes the selected filter dropdown focus.
				filterDropdown : function ( columnIndex )
				{
					if ( this.filters.activeDropdown === columnIndex )
					{
						// Clear the selected filter dropdown.
						this.filters.activeDropdown = null;
					}
					else
					{
						// Create a mouse event listener to close the dropdown.
						window.addEventListener( 'mouseup', this.clearFilterDropdown, false );

						// Show the dropdown menu.
						if ( this.filters.beingBuilt.column === null )
						{
							this.filters.activeDropdown = 0;
						}
						else
						{
							this.filters.activeDropdown = columnIndex;
						}
					}
				},

				// Clears the dropdown as well as the window listener.
				clearFilterDropdown : function ()
				{
					// Clear the selected filter dropdown.
					this.filters.activeDropdown = null;

					// Remove the listener.
					window.removeEventListener( 'mouseup', this.clearFilterDropdown, false );
				},

				// Helps build a filter to be applied to the table. Executed when filter dropdown item is clicked.
				buildFilter : function ( itemIndex, item )
				{
					// Reset any error that may exist.
					this.filters.error     = false;
					this.filters.errorText = '';

					// Column selection.
					if ( itemIndex === 0 )
					{
						this.filters.beingBuilt.column = this.filterableColumns[item];

						if ( this.filters.beingBuilt.option === null )
						{
							setTimeout( () =>
							{
								// Activate the next tab.
								this.filters.activeDropdown = 1;

								// Create a mouse event listener to close the dropdown.
								window.addEventListener( 'mouseup', this.clearFilterDropdown, false );
							}, 50);
						}
					}

					// Option selection.
					if ( itemIndex === 1 )
					{
						this.filters.beingBuilt.option = item;

						if ( this.filters.beingBuilt.value === null )
						{
							this.$refs.filterInput.focus();
						}
					}
				},

				// Adds the built filter to be applied to the table.
				addFilter : function ()
				{
					// Manage column error.
					if ( this.filters.beingBuilt.column === null || typeof( this.filters.beingBuilt.column ) !== 'object' )
					{
						this.filters.errorText = 'A column must be selected to add a filter.';
						this.filters.error = true;
					}

					// Manage option error.
					if ( this.filters.beingBuilt.option === null || typeof( this.filters.beingBuilt.option ) !== 'string' )
					{
						this.filters.errorText = 'A filter type must be selected to add a filter.';
						this.filters.error = true;
					}
					else
					{
						if ( this.filters.beingBuilt.option == 'Greater/Equal To' && isNaN( this.filters.beingBuilt.value ) )
						{
							this.filters.errorText = 'Value must be a number.';
							this.filters.error = true;
						}

						if ( this.filters.beingBuilt.option == 'Less/Equal To' && isNaN( this.filters.beingBuilt.value ) )
						{
							this.filters.errorText = 'Value must be a number.';
							this.filters.error = true;
						}
					}

					// Manage value error.
					if ( this.filters.beingBuilt.value === null || typeof( this.filters.beingBuilt.value ) !== 'string' )
					{
						this.filters.errorText = 'A filter value must be entered to add a filter.';
						this.filters.error = true;
					}

					// If there are no errors, continue.
					if ( !this.filters.error )
					{
						// Update the last action performed.
						this.status.lastAction = 'AddFilter';

						// Create a copy of the filter.
						let filter =
							{
								column : this.filters.beingBuilt.column,
								option : this.filters.beingBuilt.option,
								value  : this.filters.beingBuilt.value
							}

						// Add the filter.
						this.filters.active.push( filter );

						// Clear being built.
						this.filters.beingBuilt.column = null;
						this.filters.beingBuilt.option = null;
						this.filters.beingBuilt.value  = null;

						// Reset the scroll position to top/left.
						this.resetScroll();

						// filterEngine = 1 | Filtering is performed externally (emitted).
						if ( this.setting.filterEngine === 1 )
						{
							this.$emit( 'eventFromJDTable', this.componentState );
						}
						// filterEngine = 0 | Filtering is performed on the data that exists in the JD-Table component.
						else
						{
							this.resetScroll();

							// Process the data through filters/search.
							this.processData().then( () =>
							{
								// Render the new view.
								this.renderView();
							});
						}
					}
				},

				// Removes a filter from the active list.
				removeFilter : function ( index )
				{
					// Update the last action performed.
					this.status.lastAction = 'RemoveFilter';

					// Reset any error that may exist.
					this.filters.error     = false;
					this.filters.errorText = '';

					this.filters.active.splice( index, 1 );

					// filterEngine = 1 | Filtering is performed externally (emitted).
					if ( this.setting.filterEngine === 1 )
					{
						this.$emit( 'eventFromJDTable', this.componentState );
					}
					// filterEngine = 0 | Filtering is performed on the data that exists in the JD-Table component.
					else
					{
						this.resetScroll();

						// Process the data through filters/search.
						this.processData().then( () =>
						{
							// Render the new view.
							this.renderView();
						});
					}
				},

				// Clears all active filters and being built.
				clearAllFilters : function ()
				{
					// Update the last action performed.
					this.status.lastAction = 'ClearFilter';

					// Clear being built.
					this.filters.beingBuilt.column = null;
					this.filters.beingBuilt.option = null;
					this.filters.beingBuilt.value = null;

					// Reset any error that may exist.
					this.filters.error     = false;
					this.filters.errorText = '';

					// Clear active.
					this.filters.active = [];

					// filterEngine = 1 | Filtering is performed externally (emitted).
					if ( this.setting.filterEngine === 1 )
					{
						this.$emit( 'eventFromJDTable', this.componentState );
					}
					// filterEngine = 0 | Filtering is performed on the data that exists in the JD-Table component.
					else
					{
						// Process the data through filters/search.
						this.processData().then( () =>
						{
							// Render the new view.
							this.renderView();
						});
					}
				},

				// Changes the column visibility.
				columnSelection : function ( selectedColumn )
				{
					// If disabling, enforce at least 1 enabled.
					if ( selectedColumn.enabled )
					{
						let enabledCount = 0;

						// Check how many are enabled.
						this.columns.list.forEach( ( column ) =>
						{
							if ( column.enabled )
							{
								enabledCount++;
							}
						});

						// Must have at least 1 enabled to disable.
						if ( enabledCount > 1 )
						{
							selectedColumn.enabled      = false;
							this.columns.selectionError = false;

							// Check mobile size.
							this.checkMobile();
						}
						else
						{
							this.columns.selectionError = true;
						}
					}
					else
					{
						this.columns.selectionError = false;
						selectedColumn.enabled      = true;

						// Check mobile size.
						this.checkMobile();
					}
				},

				// Performs the search action.
				performSearch : function ()
				{
					// Update the last action performed.
					this.status.lastAction = 'ApplySearch';

					if ( !this.search.text )
					{
						if ( this.search.searching )
						{
							this.clearSearch();
						}
					}
					else
					{
						this.status.searching = true;

						// Emit search event.
						if ( this.setting.searchEngine === 1 )
						{
							this.search.searching = true;

							this.$emit( 'eventFromJDTable', this.componentState );
						}
						// Perform search using JD-Table.
						else
						{
							this.resetScroll();

							this.processData().then( () =>
							{
								this.status.searching = false;

								this.renderView();
							});
						}
					}
				},

				// Clears the search.
				clearSearch : function ()
				{
					// Update the last action performed.
					this.status.lastAction = 'ClearSearch';

					// Clear search data.
					this.search.text       = '';
					this.search.searching  = false;

					// Emit search event.
					if ( this.setting.searchEngine === 1 )
					{
						this.$emit( 'eventFromJDTable', this.componentState );
					}
					// Perform search using JD-Table.
					else
					{
						this.resetScroll();

						this.processData().then( () =>
						{
							this.renderView();
						});
					}
				},

				// Called when user clicks on a data row. Accepts the index of the data on the this.data.
				rowAction : function ( rowIndex )
				{
					if ( this.setting.quickView )
					{
						// Clean up other potential menus.
						this.columns.selecting = false;
						this.filters.error     = false;
						this.filters.errorText = '';
						this.filters.show      = false;

						// Show the quick view.
						this.row.selectedIndex = rowIndex;
					}
				},

				// Called when the NEXT button is pressed on the quick view.
				quickViewNext : function ()
				{
					if ( this.row.selectedIndex < ( this.processedData.length - 1 ) )
					{
						this.row.selectedIndex++;
					}
				},

				// Called when the PREVIOUS button is pressed on the quick view.
				quickViewPrevious : function ()
				{
					if ( this.row.selectedIndex >= 1 )
					{
						this.row.selectedIndex--;
					}
				},

				// Prints the element.
				print : function ( elementRef )
				{
					let contentToPrinter = this.$refs[elementRef].innerHTML;
					let styles           = "<style>.contentRow { display : flex; flex-direction : column; width : 100%; } .rowTitle { display : flex; align-items : center; font-size : 1rem; font-weight : 600; word-break : break-all; padding : 0.5rem 1rem; } .rowData { display : flex; align-items : center;padding : 0.2rem 1rem; word-break : break-all; }</style>";
					let printWindow      = window.open( '', 'Print', 'height=600, width=800');

					printWindow.document.write('<html><head><title>Print</title>');
					printWindow.document.write(styles);
					printWindow.document.write('</head><body >');
					printWindow.document.write(contentToPrinter);
					printWindow.document.write('</body></html>');

					printWindow.document.close();
					printWindow.focus()
					printWindow.print();
					printWindow.close();
				}
			},

		computed :
			{
				// View flag. Enabled if the view has data. False if not.
				isViewAvailable : function ()
				{
					if ( this.view.length > 0 )
					{
						return true;
					}

					return false;
				},

				// Normalizes the initialize settings in case one or more properties are not configured.
				setting : function ()
				{
					return Object.assign (
						{
							// Column Data
							columns             : [],

							// Features
							startBySearch                : false,
							startBySearchMessage         : null,
							startBySearchArrowSearch     : false,
							startBySearchArrowFilter     : false,
							startBySearchArrowSearchText : 'Search Here',
							startBySearchArrowFilterText : 'Filter by Column',
							maxMinimize                  : true,
							refresh                      : true,
							search                       : true,
							columnSelect                 : true,
							resize                       : true,
							filter                       : true,
							export                       : true,
							columnSort                   : true,
							quickView			         : true,

							// Rendering
							renderEngine          : 2,
							responsiveFrame       : true,
							responsiveTable       : true,
							virtualEngineRowStart : 250,
							frameWidth            : null,
							headerHeight          : 40,
							dataHeight            : null,
							rowHeight             : 42,
							paginationRowLimits   : [50, 750, 100],
							paginationRowStart    : 50,
							paginationRowAll      : true,
							pageSideQuantity      : 5,

							// Search
							searchEngine        : 0,
							forceSearchOpen     : false,
							searchPlaceHolder   : null,
							filterEngine        : 0,
							paginationEngine    : 0,

							// Settings
							startMaximized      : false,
							forceMaximized      : false,
							rowZebra            : true,
							rowFlex             : true,
							resizeForceMinWidth : true,

							//Layers
							highlight           : true,
							controls            : true,
							footer              : true,

							title               : null
						}, this.option
					);
				},

				// Returns the total number of rows in the data.
				processedDataSize : function ()
				{
					return this.processedData.length;
				},

				// Returns true if there are active filters.
				filtering : function ()
				{
					if ( this.filters.active.length > 0 )
					{
						return true;
					}

					return false;
				},

				// Returns TRUE or FALSE based on if resize should be enabled.
				resizable : function ()
				{
					if ( !this.setting.responsiveTable && this.setting.resize )
					{
						return true;
					}

					return false;
				},

				// Apply class to JD-Table frame based on settings.
				frameClasses : function ()
				{
					if ( this.feature.maximized )
					{
						return 'maximized';
					}

					if ( !this.setting.dataHeight )
					{
						return 'fullBody';
					}

					return null;
				},

				// Apply class to JD-Table frame based on settings.
				frameStyles : function ()
				{
					let styles = {};

					if ( !this.feature.maximized )
					{
						if ( !this.setting.responsiveFrame )
						{
							if ( this.setting.frameWidth !== null )
							{
								styles['width']     = this.setting.frameWidth + 'px';
								styles['min-width'] = this.setting.frameWidth + 'px';
							}
							else
							{
								styles['width'] ='100%';
							}
						}

						// Ensures the frame does get larger then the sum of all the column width's in PX.
						if ( this.setting.responsiveFrame && !this.setting.responsiveTable )
						{
							styles['max-width'] = this.tableWidth + 'px';
						}
					}

					return styles;
				},

				// Apply class to controlSearch based on settings.
				controlSearchClasses : function ()
				{
					if ( this.feature.searching )
					{
						return 'searching';
					}

					return null;
				},

				// Apply class to controlFilter based on settings.
				controlFilterClasses : function ()
				{
					let classes = '';

					if ( this.filters.show )
					{
						classes = 'selected';
					}

					if ( this.filtering )
					{
						classes += ' active';
					}

					return classes;
				},

				// Apply class to search icon based on searching status.
				searchIconClasses : function ()
				{
					let classes = 'search';

					if ( this.setting.forceSearchOpen )
					{
						classes += ' noSelect';
					}

					if ( this.feature.searching )
					{
						classes += ' selected';
					}

					if ( this.search.searching )
					{
						classes += ' active';
					}

					return classes;
				},

				// Change search icon title based on searching status.
				searchIconTitle : function ()
				{
					if ( this.feature.searching )
					{
						return 'Hide Search';
					}

					return 'Show Search';
				},

				// Apply class to controlFeature based on settings.
				controlFeatureClasses : function ()
				{
					if ( this.feature.searching )
					{
						return 'searching';
					}

					return null;
				},

				// Apply class to min/maximize icon based on min/maximize status.
				minMaxIconClasses : function ()
				{
					if ( this.feature.maximized )
					{
						return 'fas fa-window-minimize';
					}

					return 'far fa-window-maximize';
				},

				// Change min/maximize icon title based on min/maximize status.
				minMaxIconTitle : function ()
				{
					if ( this.feature.maximized )
					{
						return 'Minimize';
					}

					return 'Maximize';
				},

				// Apply styles to layerContent based on settings.
				layerContentStyles : function ()
				{
					let styles = {};

					if ( !this.feature.maximized )
					{
						// responsiveFrame = TRUE
						if ( this.setting.responsiveFrame )
						{
							// responsiveTable = FALSE
							if ( !this.setting.responsiveTable )
							{
								// Create scroll back in layerContent.
								styles['overflow-y'] = 'auto';
							}
						}
					}
					else
					{
						if ( this.setting.responsiveTable )
						{
							styles['max-width'] ='100%';
						}
						else
						{
							styles['max-width'] = this.tableWidth + 'px';
						}
					}

					return styles;
				},

				// Apply styles to the content table based on settings.
				tableStyles : function ()
				{
					let styles = {};

					// responsiveTable = FALSE
					if ( !this.setting.responsiveTable )
					{
						styles['min-width'] = this.tableWidth + 'px';
					}

					return styles;
				},

				// Apply styles to the table head based on settings.
				tableHeadStyles : function ()
				{
					let styles = {};

					styles['height'] = this.setting.headerHeight + 'px';
					styles['min-height'] = this.setting.headerHeight + 'px';

					return styles;
				},

				// Apply class to table head cells based on settings.
				headCellClasses : function ()
				{
					let classes = '';

					if ( this.setting.columnSort )
					{
						classes += ' sort';
					}

					if ( this.status.tableScroll )
					{
						classes += ' scrollBuffer';
					}

					return classes;
				},

				// Apply styles to the content table body based on settings.
				tableBodyStyles : function ()
				{
					let styles = {};

					if ( !this.feature.maximized )
					{
						styles['height'] = this.setting.dataHeight + 'px';
					}

					return styles;
				},

				// Apply styles to the content table virtual body based on settings.
				bodyVirtualStyles : function ()
				{
					let styles =
						{
							height : this.rendering.virtualHeight + 'px'
						};

					return styles;
				},

				// Apply styles to feature option zone based on settings.
				optionDropdownStyles : function ()
				{
					let styles =
						{
							'max-height' : ( this.setting.dataHeight + this.setting.headerHeight ) + 'px'
						};

					return styles;
				},

				// Apply styles to the content table body data container based on settings.
				bodyViewStyles : function ()
				{
					let styles =
						{
							'width': '100%'
						};

					if ( this.rendering.engine === 0 )
					{
						styles['position'] = 'absolute';
						styles['top']      =( this.rendering.rowTopIndex * this.setting.rowHeight ) + 'px';
					}

					return styles;
				},

				// Apply class to table body row based on settings.
				viewRowClasses : function ()
				{
					let classes = '';

					if ( this.setting.rowZebra )
					{
						classes += ' zebra';
					}

					return classes;
				},

				// Apply styles to the content table body data row based on settings.
				viewRowStyles : function ()
				{
					let styles = {};

					if ( this.setting.rowFlex )
					{
						styles['min-height'] = this.setting.rowHeight + 'px';
					}
					else
					{
						styles['height'] = this.setting.rowHeight + 'px';
					}

					return styles;
				},

				rowDataClasses : function ()
				{
					let classes = '';

					if ( this.setting.rowFlex )
					{
						classes = 'rowFlex';
					}

					return classes;
				},

				// Calculate the total width of the table based on the column size.
				tableWidth : function ()
				{
					let totalWidth   = 0;
					let missingWidth = false;

					this.columns.list.forEach( ( column ) =>
					{
						if ( column.enabled )
						{
							if ( column.width !== null )
							{
								totalWidth += column.width;
							}
							else
							{
								missingWidth = true;
							}
						}
					});

					// If a column width is not set, the total width cannot be determined.
					if ( !this.setting.responsiveTable && missingWidth )
					{
						return null;
					}

					return totalWidth;
				},

				// Returns a list of filterable columns.
				filterableColumns : function ()
				{
					let filterableColumns = [];

					this.columns.list.forEach( ( column ) =>
					{
						if ( column.filterable )
						{
							filterableColumns.push( column );
						}
					});

					return filterableColumns;
				},

				// Returns a list of filter options based on the selected column.
				filterableOptions : function ()
				{
					if ( this.filters.beingBuilt.column === null )
					{
						return [];
					}

					if ( this.filters.beingBuilt.column.type === 'String' )
					{
						return ['Equals To', 'Contains', 'Not Equals To', 'Begins With'];
					}

					if ( this.filters.beingBuilt.column.type === 'Number' )
					{
						return ['Equals To', 'Greater/Equal To', 'Less/Equal To', 'Contains', 'Not Equals To', 'Begins With'];
					}
				},

				// Returns the text shown on the selected filter column.
				filterColumnText : function ()
				{
					if ( this.filters.beingBuilt.column === null )
					{
						return 'Select Column ..'
					}

					return this.filters.beingBuilt.column.title;
				},

				// Returns the text shown on the selected filter option.
				filterOptionText : function ()
				{
					if ( this.filters.beingBuilt.column === null )
					{
						return 'Select Filter ..';
					}

					if ( this.filters.beingBuilt.option === null )
					{
						return 'Filter ..'
					}
					else
					{
						return this.filters.beingBuilt.option;
					}

					return this.filterableOptions[this.filters.beingBuilt.option];
				},

				// Returns the styles for the layerHighlight div.
				layerHighlightStyles : function ()
				{
					let styles = {};

					if ( this.feature.maximized )
					{
						if ( this.setting.responsiveTable )
						{
							styles['max-width'] ='100%';
						}
						else
						{
							styles['max-width'] = this.tableWidth + 'px';
						}
					}

					return styles;
				},

				// Returns the styles for the layerControl div.
				layerControlStyles : function ()
				{
					let styles = {};

					if ( this.feature.maximized )
					{
						if ( this.setting.responsiveTable )
						{
							styles['max-width'] ='100%';
						}
						else
						{
							styles['max-width'] = this.tableWidth + 'px';
						}
					}

					return styles;
				},

				// Returns the styles for the layerOption div.
				layerOptionStyles : function ()
				{
					let styles = {};

					if ( this.feature.maximized )
					{
						if ( this.setting.responsiveTable )
						{
							styles['max-width'] ='100%';
						}
						else
						{
							styles['max-width'] = this.tableWidth + 'px';
						}
					}

					return styles;
				},

				// Returns the styles for the layerFooter div.
				layerFooterStyles : function ()
				{
					let styles = {};

					if ( this.feature.maximized )
					{
						if ( this.setting.responsiveTable )
						{
							styles['max-width'] ='100%';
						}
						else
						{
							styles['max-width'] = this.tableWidth + 'px';
						}
					}

					return styles;
				},

				// Returns the styles for the quickViewContent div.
				quickViewContentStyles : function ()
				{
					let styles = {};

					if ( this.feature.maximized )
					{
						styles['max-height'] = ( this.$refs.bodyData.clientHeight * 0.8 ) + 'px';
					}
					else
					{
						styles['max-height'] = this.setting.dataHeight + 'px';
					}

					return styles;
				},

				// Returns the status of the Getting Started message.
				gettingStarted : function ()
				{
					if ( this.setting.startBySearch )
					{
						if ( !this.search.searching && this.filters.active.length === 0 )
						{
							return true;
						}
					}

					return false;
				},

				// Represents the current state of data of the component. This is emitted to parent events.
				componentState : function ()
				{
					return {
						searchApplied     : this.search.searching,
						searchText        : this.search.text,
						filterApplied     : this.filters.active,
						pageLimit         : this.rendering.pagination.currentSelectedPageRowOption,
						currentPage       : this.rendering.pagination.currentPage,
						currentStartIndex : this.rendering.pagination.currentStartIndex,
						currentEndIndex   : this.rendering.pagination.currentEndIndex,
						lastAction        : this.status.lastAction
					}
				}
			},

		watch :
			{
				// Watches for event triggers. This will run the event when the trigger is true.
				eventFromAppTrigger : function ( to , from )
				{
					if ( from === false && to === true && this.eventFromApp.name )
					{
						this.processEvent( this.eventFromApp.name );
					}
				}
			}
	}
</script>

<style scoped lang="scss"></style>
