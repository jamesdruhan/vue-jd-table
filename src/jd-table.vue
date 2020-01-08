<template>
	<div class="jd-reset jd-table" :class="frameClasses" :style="frameStyles">

		<div v-if="setting.title !== null" class="jd-layerTitle">{{ setting.title }}</div>

		<!-- Layer: Highlight -->
		<div v-if="setting.highlight" class="jd-layerHighlight jd-noneSelectable" :style="layerHighlightStyles"></div>

		<!-- Layer: Controls -->
		<div v-if="setting.controls" class="jd-layerControl jd-noneSelectable" :style="layerControlStyles">

			<!-- Control: Search -->
			<div v-if="setting.search" class="jd-controlSearch" :class="controlSearchClasses">

				<span @click="featureAction('Search')" class="jd-controlItem" :class="searchIconClasses" :title="searchIconTitle">
					<i  class="fas fa-search"></i>

					<!-- Control: Get Started with Search Reminder -->
					<div v-if="gettingStarted && setting.startBySearchArrowSearch && !status.processingData && !loader" class="jd-searchArrow">
					{{ setting.startBySearchArrowSearchText }}
				</div>
				</span>

				<input v-show="feature.searching" @keyup.enter="performSearch" v-model="search.text" type="search" ref="searchField" :placeholder="setting.searchPlaceHolder ? setting.searchPlaceHolder : 'Search Here ..'" :disabled="status.processingData">

				<span v-show="feature.searching && !search.searching" @click="performSearch" class="jd-controlItem jd-search" title="Perform Search">
					<i  class="fas fa-angle-right"></i>
				</span>

				<span v-show="feature.searching && search.searching" @click="clearSearch" class="jd-controlItem jd-clearSearch" title="Clear Search">
					<i  class="fas fa-times-circle"></i>
				</span>

			</div>

			<!-- Control: Feature -->
			<div class="jd-controlFeature" :class="controlFeatureClasses">

				<!-- Feature: Add New -->
				<span v-if="setting.addNew" @click="featureAction('AddNew')" class="jd-controlItem">
					<i class="fas fa-plus-square" title="Add New"></i>
				</span>

				<!-- Feature: Refresh -->
				<span v-if="setting.refresh" @click="featureAction('Refresh')" class="jd-controlItem">
					<i class="fas fa-sync-alt" title="Refresh"></i>
				</span>

				<!-- Feature: Pagination Select -->
				<span v-if="rendering.engine === 2" @click="featureAction('Pagination')" class="jd-controlItem" :class="rendering.pagination.changingRows ? 'jd-selected' : ''">
					<i class="fas fa-scroll" title="Rows Per Page"></i>
				</span>

				<!-- Feature: Column Select -->
				<span v-if="setting.columnSelect" @click="featureAction('Columns')" class="jd-controlItem" :class="columns.selecting ? 'jd-selected' : ''">
					<i class="fas fa-columns" title="Columns"></i>
				</span>

				<!-- Feature: Filter -->
				<span v-if="setting.filter" @click="featureAction('Filter')" class="jd-controlItem" :class="controlFilterClasses">
					<i class="fas fa-filter" title="Filter"></i>

					<!-- Control: Get Started with Filter Reminder -->
					<div v-if="gettingStarted && setting.startBySearchArrowFilter && !menuVisible && !status.processingData && !loader" class="jd-filterArrow">
						{{ setting.startBySearchArrowFilterText }}
					</div>
				</span>

				<!-- Feature: View -->
				<span v-if="setting.views.length > 0" @click="featureAction('View')" class="jd-controlItem">
					<i class="far fa-eye" title="View"></i>
				</span>

				<!-- Feature: Export -->
				<span v-if="setting.export" @click="featureAction('Export')" class="jd-controlItem">
					<i class="fas fa-file-export" title="Export to Excel"></i>
				</span>

				<!-- Feature: Maximize/Minimize -->
				<span v-if="setting.maxMinimize && !setting.forceMaximized" @click="featureAction('MaxMinimize')" class="jd-controlItem">
					<i :class="minMaxIconClasses" :title="minMaxIconTitle"></i>
				</span>

			</div>

		</div>

		<!-- Layer: Options -->
		<div class="jd-layerOption" :style="layerOptionStyles">

			<!-- Option: Pagination -->
			<transition name="jdTableSlideDown">
				<div v-if="rendering.pagination.changingRows" class="jd-optionDropdown" :style="optionDropdownStyles">

					<!-- Header -->
					<div class="jd-dropdownHeader">Page Rows</div>

					<!-- Pagination Row List -->
					<div v-for="rows in rendering.pagination.pageRowOptions" @click="changePageRows( rows )" class="jd-dropdownItem jd-paginationItem jd-clickable" :class="rendering.pagination.currentSelectedPageRowOption === rows ? 'jd-selected' : ''">
						{{ rows }}
					</div>

				</div>
			</transition>

			<!-- Option: Column -->
			<transition name="jdTableSlideDown">
				<div v-if="columns.selecting" class="jd-optionDropdown" :style="optionDropdownStyles">

					<!-- Header -->
					<div class="jd-dropdownHeader">Columns</div>

					<!-- Error -->
					<div v-if="columns.selectionError" class="jd-errorMessage">You must have at least one column enabled.</div>

					<!-- Column List -->
					<div v-for="column in columns.list" @click="columnSelection( column )" class="jd-dropdownItem jd-clickable">

						<div class="jd-columnVisibility">
							<i v-if="column.enabled" class="fas fa-eye"></i>
							<i v-else class="fas fa-eye-slash jd-notVisible"></i>
						</div>

						<div class="jd-columnTitle">
							{{ column.title.replace(/(<([^>]+)>)/ig,"") }}
						</div>

					</div>

				</div>
			</transition>

			<!-- Option: Filtering -->
			<transition name="jdTableSlideDown">
				<div v-if="filters.show" class="jd-optionDropdown" :style="optionDropdownStyles">

					<!-- Header -->
					<div class="jd-dropdownHeader">Filtering</div>

					<!-- Error -->
					<div v-if="filters.error" class="jd-errorMessage">{{ filters.errorText }}</div>

					<!-- Select Column Input -->
					<div class="jd-dropdownInput jd-carrot jd-clickable">
						<div @click="filterDropdown(0)" class="jd-label">
							<span>{{ filterColumnText.replace(/(<([^>]+)>)/ig,"") }}</span>
						</div>

						<transition name="jdTableFade">
							<ul v-if="filters.activeDropdown === 0" id="filterDropDownMenu">
								<li v-for="( column, index ) in filterableColumns" @click="buildFilter( 0, index )">
									{{ column.title.replace(/(<([^>]+)>)/ig,"") }}
								</li>
							</ul>
						</transition>
					</div>

					<!-- Select Filter Input -->
					<div class="jd-dropdownInput jd-carrot jd-clickable">
						<div @click="filterDropdown(1)" class="jd-label">
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
					<div class="jd-dropdownInput jd-addPadding">
						<input @keyup.enter="addFilter" ref="filterInput" type="text" @input="filters.error = false" v-model="filters.beingBuilt.value" placeholder="Value"/>
					</div>

					<!-- Filter Apply Buttons -->
					<div class="jd-dropdownRow jd-separate">
						<button v-on:click="clearAllFilters" type="button" class="jd-button jd-danger" title="Clear All Filters">Clear All</button>
						<button v-on:click="addFilter" type="button" class="jd-button jd-success" title="Apply Filter">Apply</button>
					</div>

					<!-- Header -->
					<div class="jd-dropdownHeader jd-subHeader">Active Filters</div>

					<!-- Filtered Results -->
					<div class="jd-dropdownHeader jd-smallHeader">Filtered Results: {{ formatNumberWithCommas ( processedDataSize ) }}</div>

					<!-- Active Filters -->
					<div class="jd-dropdownInput jd-disabled" v-for="( filter, index ) in filters.active">
						<div class="jd-label" :title="filter.column.title.replace(/(<([^>]+)>)/ig,'') + ' .. ' + filter.option + ' .. ' + filter.value">
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

						<i v-on:click="removeFilter( index )" class="fas fa-minus-circle jd-removeIcon jd-clickable" title="Remove Filter"></i>
					</div>

				</div>
			</transition>

			<!-- Option: View -->
			<transition name="jdTableSlideDown">
				<div v-if="rendering.views.changingViews" class="jd-optionDropdown" :style="optionDropdownStyles">

					<!-- Header -->
					<div class="jd-dropdownHeader">Views</div>

					<!-- View List -->
					<div v-for="row in rendering.views.list" @click="changeViews( row )" class="jd-dropdownItem jd-paginationItem jd-clickable" :class="rendering.views.currentSelectedView === row.viewName ? 'jd-selected' : ''">
						{{ row.viewName }}
					</div>

				</div>
			</transition>

		</div>

		<!-- Layer: Content -->
		<div class="jd-layerContent" ref="contentFrame" :style="layerContentStyles">

			<!-- Table Content: Table -->
			<div class="jd-contentTable" :style="tableStyles">

				<!-- Table: Head -->
				<div class="jd-head" :style="tableHeadStyles">

					<div v-for="( column, index ) in rendering.views.currentView.schema" v-if="column.enabled" @click="changeSort( index, column.name, column.sortSpecial )" :title="sortTitle( index )" class="jd-cell" :class="columns.activeHoverIndex === index ? ( 'jd-hoverAssist' + headCellClasses) : headCellClasses" :style="column.headerStyles">

						<div class="jd-cellText">
							<div class="jd-title" v-html="column.title"></div>
							<i v-if="setting.columnSort && columns.activeSortIndex === index && !columns.activeSortAsc" class="fas fa-sort-alpha-up"></i>
							<i v-if="setting.columnSort && columns.activeSortIndex === index && columns.activeSortAsc" class="fas fa-sort-alpha-down"></i>
							<i v-if="setting.columnSort && columns.activeSortIndex !== index" class="fas fa-sort-alpha-down jd-hoverSort"></i>
						</div>

						<div v-if="resizable" class="jd-resize" @mousedown="resizeStart( index, $event )" @mousemove="resizeDrag( index, $event )" :class="index === columns.activeResize ? 'jd-selected' : ''"></div>

					</div>

				</div>

				<!-- Table Body -->
				<div class="jd-body" ref="bodyData" :style="tableBodyStyles" @scroll="virtualScroll( $event )" @mouseleave="bodyLeave">

					<div v-if="rendering.engine === 0" class="jd-virtualBody" :style="bodyVirtualStyles"></div>

					<div ref="viewData" :style="bodyViewStyles">
						<div v-if="isViewAvailable" v-for="row in currentTableData" @click="rowActionSingle( row.index )" @dblclick="rowActionDouble( row.index )" @mouseover="rowHover( row.index, $event )" class="jd-row" :class="viewRowClasses" :style="viewRowStyles">
							<div v-for="( column, columnIndex ) in rendering.views.currentView.schema" v-if="column.enabled" class="jd-cell" :class="rowDataClasses" @mouseover="cellHover( columnIndex )" :style="column.dataStyles">
								<!-- List Items -->
								<span v-if="column.type === 'Array'">
									<ul class="jd-list">
										<li v-for="item in row.data[column.name]">
											{{ item }}
										</li>
									</ul>
								</span>
								<!-- String Items -->
								<span v-else>{{ row.data[column.name] }}</span>
							</div>
						</div>
					</div>

				</div>

			</div>

		</div>

		<!-- Layer: Footer -->
		<div v-if="setting.footer" class="jd-layerFooter jd-noneSelectable" :style="layerFooterStyles">

			<div v-if="rendering.engine === 2 && processedDataSize" class="jd-pagination">
				<div class="jd-paginationDirection jd-left" :class="rendering.pagination.currentPage === 1 ? 'jd-disabled' : ''">
					<i @click="paginationFirst" class="fas fa-fast-backward jd-start" title="First Page"></i>
					<i @click="paginationPrevious" class="fas fa-backward" title="Previous Page"></i>
				</div>

				<div v-if="!status.mobileSize" class="jd-paginationRows">
					Rows&nbsp;<span v-if="processedDataSize">{{ rendering.pagination.currentStartIndex + 1 }} - {{ rendering.pagination.currentEndIndex }} of&nbsp;</span>{{ formatNumberWithCommas( processedDataSize ) }}
				</div>
				<div v-else class="jd-paginationRows">
					<span v-if="processedDataSize">{{ rendering.pagination.currentStartIndex + 1 }} - {{ rendering.pagination.currentEndIndex }}</span>
				</div>

				<div class="jd-paginationArea">

					<div v-if="!status.mobileSize" class="jd-paginationList">
						<div v-if="rendering.pagination.leftPages[0] > 1" class="jd-paginationPage">
							<i class="fas fa-ellipsis-h"></i>
						</div>
						<div v-for="page in rendering.pagination.leftPages" @click="paginationChange( page )" class="jd-paginationPage jd-addHover" :class="page === rendering.pagination.currentPageHightlight ? 'jd-selected' : ''">
							<span>{{ page }}</span>
						</div>
					</div>

					<div v-if="!status.mobileSize" class="jd-paginationList">
						<div v-for="page in rendering.pagination.rightPages" @click="paginationChange( page )" class="jd-paginationPage jd-addHover" :class="page === rendering.pagination.currentPageHightlight ? 'jd-selected' : ''">
							<span>{{ page }}</span>
						</div>
						<div v-if="rendering.pagination.rightPages[rendering.pagination.rightPages.length - 1] < rendering.pagination.availablePages" class="jd-paginationPage">
							<i class="fas fa-ellipsis-h"></i>
						</div>
					</div>

				</div>

				<div class="jd-paginationDirection jd-right" :class="rendering.pagination.currentPage === rendering.pagination.availablePages ? 'jd-disabled' : ''">
					<i @click="paginationNext" class="fas fa-forward" title="Next Page"></i>
					<i @click="paginationLast" class="fas fa-fast-forward jd-end" title="Last Page"></i>
				</div>

			</div>
			<div v-if="( rendering.engine === 0 || rendering.engine === 1 ) && processedDataSize">
				<div class="jd-resultRows" v-show="!filters.show">Rows: {{ formatNumberWithCommas( processedDataSize ) }}</div>
			</div>

		</div>

		<!-- Layer: Popup -->
		<transition name="jdTableFade">
			<!-- Table Error -->
			<div v-if="status.tableError" class="jd-layerPopup jd-fullFrame">
				<div class="jd-errorMessage">
					{{ status.tableError }}
				</div>
			</div>

			<!-- No Data Message -->
			<div v-if="noDataMessage" class="jd-layerPopup jd-contentFrame">
				<div class="jd-noDataFrame">
					<div class="jd-title">
						No Data Available
					</div>

					<div v-if="filtering" class="jd-filters">
						Try changing your applied filters.
					</div>
				</div>
			</div>

			<!-- Loader -->
			<div v-if="loader" class="jd-layerPopup jd-fullFrame jd-loader">
				<div class="fulfilling-square-spinner">
					<div class="spinner-inner"></div>
				</div>

				<span class="jd-loadingText">Loading ...</span>
			</div>

			<!-- Processing -->
			<div v-if="status.processingData" class="jd-layerPopup jd-contentFrame jd-loader">
				<div class="fulfilling-square-spinner">
					<div class="spinner-inner"></div>
				</div>

				<span class="jd-loadingText">Processing</span>
			</div>

			<!-- Searching -->
			<div v-if="status.searching" class="jd-layerPopup jd-contentFrame jd-loader">
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

				<span class="jd-loadingText">Searching</span>
			</div>

			<!-- Updating -->
			<div v-if="status.updatingPage" class="jd-layerPopup jd-contentFrame jd-loader">
				<div class="looping-rhombuses-spinner">
					<div class="rhombus"></div>
					<div class="rhombus"></div>
					<div class="rhombus"></div>
				</div>

				<span class="jd-loadingText">Updating</span>
			</div>

			<!-- Get Started Messaging -->
			<div v-if="gettingStarted" class="jd-layerPopup jd-contentFrame">
				<div class="jd-tableMessage" v-html="setting.startBySearchMessage"></div>
			</div>
		</transition>

		<!-- Layer: Quick View -->
		<transition name="jdTableFade">
			<div v-if="row.selectedIndex !== null && !status.processingData && !status.searching && !status.updatingPage" class="jd-layerPopup jd-fullBrowser jd-fullFrame jd-fullFrameZone">

				<div class="jd-quickView">

					<div class="jd-quickViewHighlight_1"></div>
					<div class="jd-quickViewHighlight_2"></div>

					<div class="jd-quickViewControl">
						<div class="jd-controlAction">
							<span @click="print('quickViewContent')" >
								<i class="fas fa-print"></i>
							</span>
							<span v-if="setting.viewItem" @click="featureAction('ViewItem')">
								<i class="far fa-arrow-alt-circle-up"></i>
							</span>
						</div>

						<div class="jd-controlTitle">Quick View</div>

						<div class="jd-controlAction">
							<span v-if="setting.deleteItem" @click="featureAction('DeleteItem')">
								<i class="fas fa-trash-alt"></i>
							</span>
							<span v-if="setting.editItem" @click="featureAction('EditItem')">
								<i class="fas fa-pencil-alt"></i>
							</span>
							<span @click="quickViewClose">
								<i class="fas fa-times"></i>
							</span>
						</div>
					</div>

					<div ref="quickViewContent" class="jd-quickViewContent">
						<div v-for="column in columns.list" class="jd-contentRow">
							<div class="jd-rowTitle">{{ column.title.replace(/(<([^>]+)>)/ig,"") }}</div>

							<!-- List Items -->
							<div v-if="column.type === 'Array'" class="jd-rowData">
								<ul>
									<li v-for="item in data[row.selectedIndex][column.name]">
										{{ item }}
									</li>
								</ul>
							</div>
							<!-- String Items -->
							<div v-else class="jd-rowData">{{ data[row.selectedIndex][column.name] }}</div>

						</div>
					</div>

					<div class="jd-quickViewFooter">
						<div @click="quickViewPrevious" class="jd-footerDirection jd-previous">
							<i class="fas fa-backward"></i>
						</div>
						<div v-if="setting.dataProvider === 1" class="jd-footerItem">
							{{ row.selectedIndex + rendering.pagination.currentStartIndex + 1 }} of {{ processedDataSize }}
						</div>
						<div v-else class="jd-footerItem">
							{{ row.selectedIndex + 1 }} of {{ processedDataSize }}
						</div>
						<div @click="quickViewNext" class="jd-footerDirection jd-next">
							<i class="fas fa-forward"></i>
						</div>
					</div>

				</div>

			</div>
		</transition>

		<!-- Layer: Right Click / Context Menu -->
		<transition name="jdTableFade">
			<div v-show="( setting.contextMenuLeft || setting.contextMenuRight ) && status.contextMenu" class="jd-contextMenu" ref="jd_contextMenu">
				<ul class="jd-contextMenuOptions">
					<li v-if="setting.contextMenuQuickView || setting.contextMenuView || setting.contextMenuEdit || setting.contextMenuDelete" class="jd-contextMenuHeader jd-noneSelectable">
						<span>Row Options</span>
					</li>
					<li v-if="setting.contextMenuQuickView" @click="contextQuickView" class="jd-contextMenuOption jd-noneSelectable" title="Open Quick View">
						<span>Quick View</span>
					</li>
					<li v-if="setting.contextMenuView"  class="jd-contextMenuOption jd-noneSelectable">
						<span @click="contextView(false)" title="View Record">View</span>
						<span @click="contextView(true)" title="View (In New Window)"><i class="fas fa-external-link-alt"></i></span>
					</li>
					<li v-if="setting.contextMenuEdit" class="jd-contextMenuOption jd-noneSelectable">
						<span @click="contextEdit(false)" title="Edit Record">Edit</span>
						<span @click="contextEdit(true)" title="Edit (In New Window)"><i class="fas fa-external-link-alt"></i></span>
					</li>
					<li v-if="setting.contextMenuDelete" class="jd-contextMenuOption jd-noneSelectable">
						<span @click="contextDelete" title="Delete Record">Delete</span>
					</li>
					<li v-if="setting.contextMenuAdd" class="jd-contextMenuHeader jd-noneSelectable">
						<span>Table Options</span>
					</li>
					<li v-if="setting.contextMenuAdd" class="jd-contextMenuOption jd-noneSelectable">
						<span @click="contextAdd(false)" title="Add Record">Add</span>
						<span @click="contextAdd(true)" title="Add (In New Window)"><i class="fas fa-external-link-alt"></i></span>
					</li>
				</ul>
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
					tableError     : null,
					getStarted     : false,
					processingData : false,
					updatingPage   : false,
					searching      : false,
					mobileSize     : false,
					isIE11         : false,
					tableScroll    : false,
					lastAction     : null,
					contextMenu    : false,
					tableReady     : false
				},

				currentTableData : [],
				data             : [],

				feature :
				{
					maximized : false,
					searching : false
				},

				rendering :
				{
					engine            : 0,
					isScrolling       : null,
					resettingScroll   : false,
					contentFrameWidth : null,
					isResizing        : null,
					pagination        :
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
						currentSelectedPageRowOption : null,
					},
					virtual :
					{
						rowMiddleIndex          : 0,
						rowTopIndex             : 0,
						rowBottomIndex          : 0,
						triggerTopPositionPX    : null,
						triggerBottomPositionPX : null,
						height                  : null,
						virtualBufferSize       : 5
					},
					external :
					{
						dataSize : null
					},
					views :
					{
						changingViews       : false,
						currentSelectedView : null,
						list                : [],
						currentView         : []
					}
				},

				processedData : [],

				row :
				{
					selectedIndex        : null,
					activeHoverIndex     : null,
					activeHoverElement   : null,
					activeContextIndex   : null,
					activeContextElement : null
				},

				columns :
				{
					list               : [],
					activeHoverIndex   : null,
					activeResize       : null,
					activeResizeStart  : null,
					activeSortIndex    : 0,
					activeSortName     : null,
					activeSortAsc      : false,
					activeSortSpecial  : null,
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
		// Prop        : option.dataProvider
		// Value       : [NUMBER]
		// Default     : 0
		// Description : Sets the manner of which data will be provided to JD-Table.
		//
		// -----
		// | 0 | FULL    : All data will be provided as one single injection to the table. Search/filtering will be performed on that data by JD-Table.
		// | 1 | REQUEST : All data will be provided via external requests for all data based actions (search, filtering, pagination, sorting, etc.).
		// -----         : These data based actions will instead emit events to the parent app for processing.
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
		// Prop        : option.addNew
		// Value       : [BOOLEAN]
		// Default     : False
		// Description : Enables/disables the Add New feature button.
		//
		// Prop        : option.editItem
		// Value       : [BOOLEAN]
		// Default     : False
		// Description : Enables/disables the Edit Item feature button (quick view).
		//
		// Prop        : option.viewItem
		// Value       : [BOOLEAN]
		// Default     : False
		// Description : Enables/disables the View Item feature button (quick view).
		//
		// Prop        : option.deleteItem
		// Value       : [BOOLEAN]
		// Default     : False
		// Description : Enables/disables the Delete Item feature button (quick view).
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
		// Prop        : option.exportLimit
		// Value       : [NUMBER]
		// Default     : null (ALL)
		// Description : Sets a restriction on how many records can be exported via Excel.
		//
		// Prop        : option.columnSort
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables the ability to sort by column.
		//
		// Prop        : option.quickView
		// Value       : [NUMBER]
		// Default     : 1
		// Description : Enables/disables the ability to click or double click a row to see the quick view.
		//
		// -----
		// | 0 | NONE         : Disables quick view.
		// | 1 | CLICK        : Quick view appears on single (left) click.
		// | 2 | DOUBLE CLICK : Quick view appears on double (left) click.
		// -----
		//
		// Prop        : option.contextMenu
		// Value       : [BOOLEAN]
		// Default     : False
		// Description : Enables/disables a row context menu for when a user right clicks on a row.
		//
		// Prop        : option.contextMenuQuickView
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables the row context menu option for Quick Viewing the row data.
		//
		// Prop        : option.contextMenuView
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables the row context menu option for Viewing the row data.
		//
		// Prop        : option.contextMenuEdit
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables the row context menu option for Editing the row data.
		//
		// Prop        : option.contextMenuDelete
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables the row context menu option for Delete the row data.
		//
		// Prop        : option.contextMenuAdd
		// Value       : [BOOLEAN]
		// Default     : True
		// Description : Enables/disables the row context menu option for Adding a row of data.
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
		// Prop        : option.responsiveFrameForceFullWidth
		// Value       : [BOOLEAN]
		// Default     : False
		// Description : When responsiveFrame is set to true and the number of columns in the table shrink the entire table will as well
		//             : (according it its parent). However sometimes you want the table to be 100% no matter what. Set this option to
		//             : True and it will force the table to ignore column widths when the table shrinks.
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
		// Prop        : option.views
		// Value       : [ARRAY]
		// Default     : Null
		// Description : List of available views that are in addition to the default. Each array item should be an object with column view details.
		//             : [
		//             :    {   // View #1
		//             :        viewName : 'My Awesome View',
		//             :        schema   :
		//             :        [
		//             :            {   // Column #1
		//			   :	        	name          : [STRING] name of the column in the JSON data.
		//			   :	        	title         : [STRING] title used in the table header.
		//			   :	        	width         : [NUMBER] used for the width of the column.
		//			   :	        		          : When option.responsiveTable = FALSE --> Width provided will be PX.
		//             :                              : When option.responsiveTable = TRUE --> Width provided will be %.
		//	 		   :	        	order         : [NUMBER] which defines the order of columns from left to right.
		//             :                sort          : [BOOLEAN] sets the column as the initially sorted column.
		// 			   :	            sortDirection : [STRING] sets the direction of the initially sorted column: 'desc' or 'asc'.
		// 			   :	        	type          : [STRING] which defines the type of data in the column. Options are: 'String' and 'Number'.
		// 			   :	        	filterable    : [BOOLEAN] which determines if the column can be filtered.
		// 			   :	        	enabled       : [BOOLEAN] which determines if the column is shown/enabled on initial load.
		//             :            }, ...
		//             :        ]
		//             :    }, ...
		//             : ]
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
			this.polyfillClosest();

			this.checkBrowser();

			this.initializeTable();
		},

		mounted : function ()
		{
			// Add an event listener to watch for a window resize. If detected, re-render the list.
			window.addEventListener( 'resize', this.resizeListener );

			if ( this.setting.contextMenuLeft || this.setting.contextMenuRight )
			{
				this.initializeContextMenu();
			}

			if ( this.setting.quickView )
			{
				this.initializeQuickMenu();
			}
		},

		// Clean up custom listeners.
		beforeDestroy : function ()
		{
			// Context Listener - LEFT CLICK
			if ( this.setting.contextMenuLeft || this.setting.contextMenuRight )
			{
				window.removeEventListener( "click", this.contextListenerLeftClick );
			}

			// Context Listener - RIGHT CLICK
			if ( this.setting.contextMenuRight )
			{
				// Register context menu (right click) event.
				window.removeEventListener( "contextmenu", this.contextListenerRightClick );
			}

			// Quick Menu Listener
			window.removeEventListener( "click", this.quickMenuListenerLeftClick );

			// Filter Dropdown
			window.removeEventListener( 'mouseup', this.clearFilterDropdown, false );

			// Resize Listeners
			window.removeEventListener( 'resize', this.resizeListener );
			window.removeEventListener( 'mouseup', this.resizeStop , false );
		},

		methods :
		{
			// Polyfills the element function "closest" (IE11).
			polyfillClosest : function ()
			{
				if ( window.Element && !Element.prototype.closest )
				{
					Element.prototype.closest = function ( s )
					{
						let matches = ( this.document || this.ownerDocument ).querySelectorAll( s ), i, el = this;

						do
						{
							i = matches.length;
							while ( --i >= 0 && matches.item( i ) !== el ) {};
						} while ( (i < 0) && ( el = el.parentElement ) );

						return el;
					};
				}
			},

			// Configures the table according to the init props.
			initializeTable : function ()
			{
				// Sets the rendering engine.
				const INIT_ENGINE = () =>
				{
					this.rendering.engine = this.setting.renderEngine ? this.setting.renderEngine : 0;
				};

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
								name          : userColumn.name,
								title         : userColumn.title,
								width         : columnWidth,
								originalWidth : columnWidth,
								order         : userColumn.order,
								type          : userColumn.type,
								filterable    : filterable,
								enabled       : enabled,
								headerStyles  : {},
								dataStyles    : {},
								sort          : userColumn.sort ? userColumn.sort : false,
								sortDirection : userColumn.sortDirection ? userColumn.sortDirection : null,
								sortSpecial   : userColumn.sortSpecial ? userColumn.sortSpecial : null
							});
						});

						// Sort the array based on the passed order.
						this.columns.list.sort( ( a, b ) =>
						{
							return a.order - b.order;
						});

						let viewLength = this.rendering.views.list.push
						({
							viewName : 'Default',
							schema   : []
						});

						// Create default view.
						this.columns.list.forEach ( ( column ) =>
						{
							if ( column.enabled )
							{
								this.rendering.views.list[viewLength - 1].schema.push( column );
							}
						});

						// Sort the default view.
						this.rendering.views.list[viewLength - 1].schema.sort( ( a, b ) =>
						{
							return a.order - b.order;
						});

						// Set the default view and active.
						this.rendering.views.currentView = this.rendering.views.list[viewLength - 1];

						let hasBeenSorted = false;

						this.rendering.views.currentView.schema.forEach( ( viewColumn, viewIndex ) =>
						{
							// Sets the column as default sorted.
							if ( viewColumn.sort )
							{
								this.columns.activeSortIndex    = viewIndex;
								this.columns.activeSortName     = viewColumn.name;
								this.columns.activeSortSpecial  = viewColumn.sortSpecial;

								if ( typeof( viewColumn.sortDirection ) === 'string' )
								{
									this.columns.activeSortAsc = false;

									if ( viewColumn.sortDirection === 'asc' )
									{
										this.columns.activeSortAsc = true;
									}
								}
							}
						});

						this.rendering.views.currentSelectedView = 'Default';

						// No sorting set, use first column.
						if ( !hasBeenSorted )
						{
							this.columns.activeSortIndex    = 0;
							this.columns.activeSortAsc      = true;
							this.columns.activeSortName     = this.rendering.views.currentView.schema[0].name;
							this.columns.activeSortSpecial  = this.rendering.views.currentView.schema[0].sortSpecial;
						}
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
					if ( this.setting.responsiveTable && this.tableWidth !== null && this.tableWidth > 100 )
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

				// Force pagination for external data provider.
				const DATA_PROVIDER_CHECK = () =>
				{
					if ( this.setting.dataProvider === 1 )
					{
						if ( this.setting.renderEngine === 0 )
						{
							this.status.tableError = 'Error: External data provider is only supported by the Pagination render engine. Please change your settings.';
						}
					}
				};

				// Configure the search option.
				const SETUP_SEARCH = () =>
				{
					if ( this.setting.forceSearchOpen )
					{
						this.feature.searching = true;
					}
				};

				// Build views.
				const BUILD_VIEWS = () =>
				{
					if ( this.setting.views.length > 0 )
					{
						// Validate view(s) format.
						this.setting.views.forEach ( ( view, viewIndex ) =>
						{
							// +1 is added to index because "Default" is the first (0).
							let currentViewIndex = viewIndex + 1;

							if ( view.viewName.constructor.name === 'String' && view.schema.constructor.name === 'Array' && view.schema.length > 0 )
							{
								// Create the view in the list.
								this.$set( this.rendering.views.list, currentViewIndex,
								{
									viewName : view.viewName,
									schema   : []
								});

								// Set the column width for each column.
								view.schema.forEach( ( column, columnIndex ) =>
								{
									this.$set( this.rendering.views.list[currentViewIndex].schema, columnIndex,
									{
										name          : column.name ? column.name : '',
										title         : column.title ? column.title : '',
										width         : column.width ? column.width : null,
										originalWidth : column.width ? column.width : null,
										order         : column.order ? column.order : null,
										type          : column.type ? column.type : 'String',
										filterable    : column.filterable ? column.filterable : false,
										enabled       : column.enabled ? column.enabled : false,
										headerStyles  : {},
										dataStyles    : {},
										sort          : column.sort ? column.sort : false,
										sortDirection : column.sortDirection ? column.sortDirection : null,
									});

									// If the column has an assigned width ..
									if ( column.width !== null )
									{
										this.rendering.views.list[currentViewIndex].schema[columnIndex].originalWidth = column.width;

										// If the table is NOT responsive, the width is PX.
										if ( !this.setting.responsiveTable )
										{
											this.$set( this.rendering.views.list[currentViewIndex].schema[columnIndex].headerStyles, 'width', column.width + 'px' );
											this.$set( this.rendering.views.list[currentViewIndex].schema[columnIndex].headerStyles, 'min-width', column.width + 'px' );
											this.$set( this.rendering.views.list[currentViewIndex].schema[columnIndex].headerStyles, 'height', this.setting.headerHeight + 'px' );

											this.$set( this.rendering.views.list[currentViewIndex].schema[columnIndex].dataStyles, 'width', column.width + 'px' );
											this.$set( this.rendering.views.list[currentViewIndex].schema[columnIndex].dataStyles, 'min-width', column.width + 'px' );

											if ( this.setting.rowFlex )
											{
												this.$set( this.rendering.views.list[currentViewIndex].schema[columnIndex].dataStyles, 'min-height', this.setting.rowHeight + 'px' );
											}
										}
										// If the table IS responsive, the width is %.
										else
										{
											this.$set( this.rendering.views.list[currentViewIndex].schema[columnIndex].headerStyles, 'width', column.width + '%' );
											this.$set( this.rendering.views.list[currentViewIndex].schema[columnIndex].dataStyles, 'width', column.width + '%' );
										}
									}
									// If no width is assigned to the column ..
									else
									{
										// If the table is NOT responsive throw an error. This is because column widths are in PX.
										if ( !this.setting.responsiveTable )
										{
											this.status.tableError = `Error: Invalid settings in view name: ${ view.viewName }. One or more of the columns does not have an assigned width. When the setting responsiveTable is set to false, all columns must have a specified width. Rendering table as responsive instead.`;
										}

										// Calculate the width out of the remaining percentage.
										let autoColumnWidth = ( 100 - this.tableWidth ) / noWidthColumns;

										this.$set( this.rendering.views.list[currentViewIndex].schema[columnIndex].headerStyles, 'width', autoColumnWidth + '%' );
										this.$set( this.rendering.views.list[currentViewIndex].schema[columnIndex].dataStyles, 'width', autoColumnWidth + '%' );
									}
								});

								// Sort the new view.
								this.rendering.views.list[currentViewIndex].schema.sort( ( a, b ) =>
								{
									return a.order - b.order;
								});
							}
							else
							{
								this.status.tableError = 'Error: There was a problem validating a view configuration. Validate the JD-Table settings.';
							}
						});
					}
				};

				INIT_ENGINE();
				INIT_COLUMNS();
				SETUP_MAXIMIZE();
				SETUP_SIZES();
				SETUP_PAGINATION();
				SETUP_SEARCH();
				DATA_PROVIDER_CHECK();
				BUILD_VIEWS();
			},

			// Configures the table context menu (right/left click).
			initializeContextMenu : function ()
			{
				// LEFT CLICK
				if ( this.setting.contextMenuLeft || this.setting.contextMenuRight )
				{
					window.addEventListener( "click", this.contextListenerLeftClick );
				}

				// RIGHT CLICK
				if ( this.setting.contextMenuRight )
				{
					// Register context menu (right click) event.
					window.addEventListener( "contextmenu", this.contextListenerRightClick );
				}
			},

			// Emits the current state of the component.
			emitState : function ()
			{
				this.$emit( 'event-from-jd-table', this.componentState );
			},

			// JavaScript listener for resizing the window.
			resizeListener : function ( e )
			{
				// Clear the scrolling timer.
				clearTimeout( this.rendering.isResizing );

				this.rendering.isResizing = setTimeout( () =>
				{
					// If auto rendering is the engine, re-render.
					if ( this.rendering.engine === 0 )
					{
						this.renderView( this.rendering.virtual.rowMiddleIndex );
					}

					this.checkMobile();
				}, 750 );
			},

			// JavaScript listener for left clicking (context menu).
			contextListenerLeftClick : function ( e )
			{
				// If the menu is visible already ..
				if ( this.status.contextMenu )
				{
					this.hideContextMenu();
				}

				if ( this.setting.contextMenuLeft && e.target.closest( '.jd-body' ) )
				{
					// Get the location of the right click.
					const clickLocation =
					{
						left : e.clientX,
						top  : e.clientY
					};

					// Show the menu at the click location.
					this.showContextMenu( clickLocation );
				}
			},

			// JavaScript listener for right clicking (context menu).
			contextListenerRightClick : function ( e )
			{
				// If the click takes places in the table body ..
				if ( e.target.closest( '.jd-body' ) )
				{
					// Prevent the regular menu.
					e.preventDefault();

					// Clear previous context (if any).
					if ( this.status.contextMenu )
					{
						this.hideContextMenu();
					}

					// Close any feature menu.
					this.featureAction( null );

					// Get the location of the right click.
					const clickLocation =
					{
						left : e.clientX,
						top  : e.clientY
					};

					// Show the menu at the click location.
					this.showContextMenu( clickLocation );

					return false;
				}
			},

			// JavaScript listener for left clicking (quick menu).
			quickMenuListenerLeftClick : function ( e )
			{
				// Don't run this when clicking in the table body.
				if ( !e.target.closest( '.jd-body' ) )
				{
					// Ensure user clicks outside the popup window.
					if ( this.row.selectedIndex !== null && e.target.classList.contains('jd-layerPopup') )
					{
						this.quickViewClose();
					}
				}
			},

			// Configures a click listener to close quick menu when clicked out of it.
			initializeQuickMenu : function ()
			{
				window.addEventListener( "click", this.quickMenuListenerLeftClick );
			},

			// Enables the context menu at the coordinates passed.
			showContextMenu : function ( { top, left } )
			{
				// Close any feature menu.
				this.featureAction( null );

				this.$refs.jd_contextMenu.style.left = `${ left }px`;
				this.$refs.jd_contextMenu.style.top  = `${ top }px`;

				// Update the index of the row right clicked on.
				this.row.activeContextIndex   = this.row.activeHoverIndex;
				this.row.activeContextElement = this.row.activeHoverElement;

				// Make the row red.
				this.row.activeContextElement.classList.add('jd-rowSelect');

				// Show the context menu,
				this.status.contextMenu = true;

				// Context menu position correction.
				setTimeout( () =>
				{
					let contextWidth  = this.$refs.jd_contextMenu.offsetWidth;
					let contextHeight = this.$refs.jd_contextMenu.offsetHeight;
					let windowWidth   = window.innerWidth;
					let windowHeight  = window.innerHeight;

					if ( ( windowWidth - left ) < contextWidth )
					{
						// 21 is subtracted to compensate for a scrollbar.
						this.$refs.jd_contextMenu.style.left = ( windowWidth - contextWidth ) - 21 + "px";
					}

					if ( (windowHeight - top ) < contextHeight )
					{
						// 21 is subtracted to compensate for a scrollbar.
						this.$refs.jd_contextMenu.style.top = ( windowHeight - contextHeight ) - 21 + "px";
					}

				}, 50, { top, left } );
			},

			// Disabled (hides) the context menu.
			hideContextMenu : function ()
			{
				if ( this.row.selectedIndex === null )
				{
					// Remove the row red.
					this.row.activeContextElement.classList.remove('jd-rowSelect');

					// Update the index of the row right clicked on.
					this.row.activeContextIndex   = null;
					this.row.activeContextElement = null;
				}

				this.status.contextMenu = false;
			},

			// Manages all feature actions.
			featureAction : function ( name )
			{
				// Switches the maximize flag.
				const MAXIMIZE = () =>
				{
					this.feature.maximized = !this.feature.maximized;

					// Virtual Scroll: Re-render the rows based on the new window size.
					if ( this.rendering.engine === 0 )
					{
						this.renderView( this.rendering.virtual.rowMiddleIndex );
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

				// Emits a add new event to the parent.
				const ADDNEW = () =>
				{
					// Update the last action performed.
					this.status.lastAction = 'AddItem';

					this.emitState();
				};

				// Emits a add new event to the parent.
				const VIEWITEM = () =>
				{
					this.contextView();
				};

				// Emits a add new event to the parent.
				const EDITITEM = () =>
				{
					this.contextEdit();
				};

				// Emits a add new event to the parent.
				const DELETEITEM = () =>
				{
					this.contextDelete();
				};

				// Emits a refresh event to the parent.
				const REFRESH = () =>
				{
					// Update the last action performed.
					this.status.lastAction = 'Refresh';

					// Update table status.
					this.updateStatus( 'updatingPage', true );

					this.emitState();
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

				// Clean up any view row changing options.
				const VIEW_CLEAN_UP = () =>
				{
					this.rendering.views.changingViews = false;
				};

				// Show/hide the view changing option.
				const VIEW = () =>
				{
					this.rendering.views.changingViews = !this.rendering.views.changingViews;
				};

				// Exports the current available data to excel.
				const EXPORT = () =>
				{
					// Update the last action performed.
					this.status.lastAction = 'ExcelExport';

					// Check if a limit is set.
					if ( this.setting.exportLimit )
					{
						let dataSize = null;

						const checkExportLimit = () =>
						{
							if ( this.setting.dataProvider !== 1 && this.processedData.length > this.setting.exportLimit )
							{
								dataSize = this.formatNumberWithCommas( this.processedData.length );

								return true;
							}

							return false;
						}

						const checkExportLimitExternal = () =>
						{
							if ( this.setting.dataProvider === 1 && this.processedDataSize > this.setting.exportLimit )
							{
								dataSize = this.formatNumberWithCommas( this.processedDataSize );

								return true;
							}

							return false;
						}

						if ( checkExportLimit() || checkExportLimitExternal() )
						{
							alert(`Sorry, you can only export a maximum of ${ this.formatNumberWithCommas( this.setting.exportLimit ) } records at a time. There are currently ${ dataSize } records in your table. Try filtering the records down further to use this feature.`)

							return;
						}
					}

					if ( this.setting.dataProvider === 1 )
					{
						this.updateStatus( 'processingData', true );
					}
					else
					{
						this.exportExcel( this.processedData );
					}

					this.emitState();
				};

				if ( name === 'MaxMinimize' )
				{
					FILTER_CLEAN_UP();
					COLUMNS_CLEAN_UP();
					PAGINATION_CLEAN_UP();
					VIEW_CLEAN_UP();

					MAXIMIZE();
				}
				else if ( name === 'Search' )
				{
					FILTER_CLEAN_UP();
					COLUMNS_CLEAN_UP();
					PAGINATION_CLEAN_UP();
					VIEW_CLEAN_UP();

					SEARCH();
				}
				else if ( name === 'AddNew' )
				{
					FILTER_CLEAN_UP();
					COLUMNS_CLEAN_UP();
					PAGINATION_CLEAN_UP();
					VIEW_CLEAN_UP();

					ADDNEW();
				}
				else if ( name === 'ViewItem' )
				{
					FILTER_CLEAN_UP();
					COLUMNS_CLEAN_UP();
					PAGINATION_CLEAN_UP();
					VIEW_CLEAN_UP();

					VIEWITEM();
				}
				else if ( name === 'EditItem' )
				{
					FILTER_CLEAN_UP();
					COLUMNS_CLEAN_UP();
					PAGINATION_CLEAN_UP();
					VIEW_CLEAN_UP();

					EDITITEM();
				}
				else if ( name === 'DeleteItem' )
				{
					FILTER_CLEAN_UP();
					COLUMNS_CLEAN_UP();
					PAGINATION_CLEAN_UP();
					VIEW_CLEAN_UP();

					DELETEITEM();
				}
				else if ( name === 'Refresh' )
				{
					FILTER_CLEAN_UP();
					COLUMNS_CLEAN_UP();
					PAGINATION_CLEAN_UP();
					VIEW_CLEAN_UP();

					REFRESH();
				}
				else if ( name === 'Columns' )
				{
					FILTER_CLEAN_UP();
					PAGINATION_CLEAN_UP();
					VIEW_CLEAN_UP();

					COLUMNS();
				}
				else if ( name === 'Filter' )
				{
					COLUMNS_CLEAN_UP();
					PAGINATION_CLEAN_UP();
					VIEW_CLEAN_UP();

					FILTER();
				}
				else if ( name === 'Pagination' )
				{
					COLUMNS_CLEAN_UP();
					FILTER_CLEAN_UP();
					VIEW_CLEAN_UP();

					PAGINATION();
				}
				else if ( name === 'Export' )
				{
					FILTER_CLEAN_UP();
					COLUMNS_CLEAN_UP();
					PAGINATION_CLEAN_UP();
					VIEW_CLEAN_UP();

					EXPORT();
				}
				else if ( name === 'View' )
				{
					COLUMNS_CLEAN_UP();
					FILTER_CLEAN_UP();
					PAGINATION_CLEAN_UP();

					VIEW();
				}
				else
				{
					FILTER_CLEAN_UP();
					COLUMNS_CLEAN_UP();
					PAGINATION_CLEAN_UP();
					VIEW_CLEAN_UP();
				}
			},

			// Exports data to excel. Supports IE.
			exportExcel : function ( data )
			{
				// Creates a HTML table to be exported.
				const renderTable = () =>
				{
					let table = '<table><thead>';

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

					for ( let i = 0; i < data.length; i++ )
					{
						const row = data[i];

						table += '<tr>';

						for ( let j = 0; j < this.columns.list.length; j++ )
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

				let userAgent      = window.navigator.userAgent;
				let browserDetails = userAgent.indexOf("MSIE ");

				if ( browserDetails > 0 || !!navigator.userAgent.match( /Trident.*rv\:11\./ ) )
				{
					excelExportArea.document.open( "txt/html","replace" );
					excelExportArea.document.write( renderTable() );
					excelExportArea.document.close();
					excelExportArea.focus();

					excelExportArea.document.execCommand( "SaveAs",true,"Data_Export.xls" );
				}
				else
				{
					window.open( 'data:application/vnd.ms-excel,' + encodeURIComponent( renderTable() ) );
				}
			},

			// Processes the raw data through filters/search. This returns a promise.
			processData : function ()
			{
				return new Promise( ( resolve, reject ) =>
				{
					// External Data - Just copy to processedData.
					if ( this.setting.dataProvider === 1 )
					{
						this.processedData = this.data;

						resolve();
					}
					// Internal Data - Process through search/filter.
					else
					{
						// Timeout ensures processing message.
						setTimeout( () =>
						{
							let processedData = this.data;

							// ---------
							// SEARCHING
							// ---------
							//
							// Search terms filter all of the data that JD-Table has. This means search happens before filtering.

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
											let searchMatch = false;

											if ( row[column.name] && row[column.name].length > 0 )
											{
												// For each item in the row/column.
												row[column.name].forEach( ( item ) =>
												{
													let searchText = String( item ).toLowerCase();

													// Casts number variables to strings to make the searchable with Strings.
													if ( !searchMatch && searchText.includes( searchTerm ) )
													{
														searchMatch = true;
													}
												});
											}

											return searchMatch;
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

									// If the search algorithm function returns true, that row is kept (not excluded from results).
									return this.columns.list.find( searchAlgorithm );
								});
							}
							else
							{
								// Indicate that searching is NOT being done.
								this.search.searching = false;
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
									return ( String( row[columnFilter.column.name]).toLowerCase().includes( String( columnFilter.value ).toLowerCase() ) );
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
							this.updateStatus( 'processingData', false );

							// End the promise.
							resolve();
						}, 75);
					}
				});
			},

			// Processes the passed event.
			processEvent : function ( name )
			{
				// Process the data sent to JD-Table.
				if ( !this.status.tableError && name === 'sendData' )
				{
					let eventError = false;

					// Clear the current view.
					this.currentTableData = [];

					// Internal Data
					if ( this.setting.dataProvider === 0 )
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

									if ( typeof this.eventFromApp.componentState !== 'undefined' )
									{
										this.changeState( this.eventFromApp.componentState );
									}

									this.tableReady = true;
								});
							}
							else
							{
								this.currentTableData = [];

								this.tableReady = true;
							}
						}
						else
						{
							eventError = true;
						}
					}

					// External Data
					if ( this.setting.dataProvider === 1 )
					{
						if ( this.eventFromApp.payload !== null && this.eventFromApp.payload.constructor.name === 'Object' )
						{
							if ( this.eventFromApp.payload.data.length > 0 )
							{
								// Assign the results true length.
								this.rendering.external.dataSize = this.eventFromApp.payload.count;

								// Assign the data to the component.
								this.data = this.eventFromApp.payload.data;

								// Process the data through filters/search.
								this.processData().then( () =>
								{
									// Render the data.
									this.renderView();

									if ( typeof this.eventFromApp.componentState !== 'undefined' )
									{
										this.changeState( this.eventFromApp.componentState );
									}

									this.tableReady = true;
								});
							}
							else
							{
								this.currentTableData = [];

								this.tableReady = true;
							}
						}
						else
						{
							eventError = true;
						}
					}

					// Clear any messaging/statuses.
					this.updateStatus( null, null );

					if ( eventError )
					{
						this.status.tableError = 'Error: sendData event issue. Payload is null or improperly formatted.';
					}
				}

				// Reset table (Clear All)
				if ( !this.status.tableError && name === 'clearAll' )
				{
					this.clearTable();
				}

				// Displays a table error.
				if ( !this.status.tableError && name === 'tableError' )
				{
					this.status.tableError = this.eventFromApp.payload;

					// Clear any messaging/statuses.
					this.updateStatus( null, null );
				}

				// Exports passed data to excel.
				if ( !this.status.tableError && name === 'exportExcel' )
				{
					this.exportExcel( this.eventFromApp.payload );

					// Clear any messaging/statuses.
					this.updateStatus( null, null );
				}

				// Sets the component state.
				if ( !this.status.tableError && name === 'setState' )
				{
					if ( this.eventFromApp.componentState !== null && this.eventFromApp.componentState.constructor.name === 'Object' )
					{
						this.changeState( this.eventFromApp.componentState );
					}
				}
			},

			// Updates the state of JD-Table
			changeState : function ( newState )
			{
				// Search Text
				if ( typeof newState.searchText !== 'undefined' && newState.searchText )
				{
					this.search.text = String ( newState.searchText );
				}

				// Searching
				if ( typeof newState.searchApplied !== 'undefined' && newState.searchApplied !== null && newState.searchApplied.constructor.name === 'Boolean' )
				{
					this.performSearch();
				}

				// Active Filters
				if ( typeof newState.filterApplied !== 'undefined' && newState.filterApplied !== null && newState.filterApplied.constructor.name === 'Array' )
				{
					this.filters.active = newState.filterApplied;

					// Process the data through filters/search.
					this.processData().then( () =>
					{
						// Render the new view.
						this.renderView();
					});
				}

				// Page Limit
				if ( typeof newState.pageLimit !== 'undefined' && newState.pageLimit !== null && newState.pageLimit.constructor.name === 'Number' )
				{
					this.changePageRows( newState.pageLimit )
				}

				// Current Page
				if ( typeof newState.currentPage !== 'undefined' && newState.currentPage !== null && newState.currentPage.constructor.name === 'Number' )
				{
					this.rendering.pagination.currentPage = newState.currentPage;

					// Re-render the view.
					this.renderView();
				}

				// Column Sort
				if ( typeof newState.sortColumnIndex !== 'undefined' && newState.sortColumnIndex !== null && newState.sortColumnIndex.constructor.name === 'Number' )
				{
					this.columns.activeSortIndex = newState.sortColumnIndex;

					// Sorted Direction
					if ( typeof newState.sortDirection !== 'undefined' && newState.sortDirection !== null && newState.sortDirection.constructor.name === 'String' )
					{
						if ( newState.sortDirection === 'ASC' )
						{
							this.columns.activeSortAsc = true;
						}
						else
						{
							this.columns.activeSortAsc = false;
						}

						// Re-render the view.
						this.renderView();
					}
				}

				// Current Selected View
				if ( typeof newState.currentView !== 'undefined' && newState.currentView !== null )
				{
					this.changeView( newState.currentView );
				}
			},

			// Renders the correct view based on the data and rendering engine setting.
			renderView : function ( renderPosition = 0 )
			{
				// Start processing visual.
				this.updateStatus( 'processingData', true );

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
						if ( this.setting.renderEngine === 0 )
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
						this.currentTableData = [];
					}

					this.checkBodyScroll();

					// Stop processing visual.
					this.updateStatus( 'processingData', false );
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

				this.currentTableData = fullView;
			},

			// Renders the virtual view based on the passed position.
			renderViewVirtual : function ( renderPosition )
			{
				// Calculate the virtual render buffer size. This # of items will be loaded before and after the view.
				const VIRTUAL_BUFFER_SIZE = () =>
				{
					// Set the buffer size to 5 times the amount of rows that fit in the view.
					return this.getRowsInView() * this.rendering.virtual.virtualBufferSize;
				};

				// Determines if the renderPosition is near the start of the list.
				const VIRTUAL_START_ZONE = ( position ) =>
				{
					return ( position <= VIRTUAL_BUFFER_SIZE() );
				};

				// Determines if the renderPosition is near the end of the list.
				const VIRTUAL_END_ZONE = ( position ) =>
				{
					return ( position >= ( this.processedDataSize - 1 ) || position >= (this.processedDataSize - VIRTUAL_BUFFER_SIZE() ) );
				};

				let updatedView = [];

				// Set the virtual height div.
				this.rendering.virtual.height = 0;

				if ( this.processedDataSize > 0 )
				{
					// Update the virtual height div.
					this.rendering.virtual.height = this.processedDataSize * this.setting.rowHeight;

					let startPosition = renderPosition - VIRTUAL_BUFFER_SIZE();
					let endPosition   = renderPosition + VIRTUAL_BUFFER_SIZE() + this.getRowsInView();

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

					// Update the currently rendered top row (index).
					this.rendering.virtual.rowTopIndex = startPosition;

					// Update the currently rendered bottom row (index).
					this.rendering.virtual.rowBottomIndex = endPosition;

					// Update the currently rendered position.
					this.rendering.virtual.rowMiddleIndex = renderPosition;

					for ( let i = startPosition; i <= endPosition; i++ )
					{
						// Add item to end of view.
						updatedView.push
						({
							index : i,
							data  : this.processedData[i]
						});
					}

					// Set the next render positions (top/bottom).
					this.setRenderPositions();
				}

				this.currentTableData = updatedView;
			},

			// Renders a set amount of records per page.
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

					// Correction for external data.
					if ( this.setting.dataProvider === 1 && this.processedDataSize )
					{
						startIndex = 0;
						endIndex   = this.processedData.length;
					}

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
						if ( this.setting.dataProvider === 1 )
						{
							this.rendering.pagination.currentStartIndex = ( this.rendering.pagination.currentPage * this.rendering.pagination.currentPageRows ) - this.rendering.pagination.currentPageRows;
							this.rendering.pagination.currentEndIndex   = ( this.rendering.pagination.currentPage * this.rendering.pagination.currentPageRows );

							// End index correction for last page
							if ( this.rendering.pagination.currentEndIndex > this.processedDataSize )
							{
								this.rendering.pagination.currentEndIndex = this.processedDataSize;
							}
						}
						else
						{
							this.rendering.pagination.currentStartIndex = startIndex;
							this.rendering.pagination.currentEndIndex   = endIndex;
						}
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
				this.currentTableData = GET_ROWS_IN_PAGE();
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
					if ( this.setting.dataProvider === 1 )
					{
						this.updateStatus( 'updatingPage', true );
					}
					// Update the view.
					else
					{
						// Re-render the view.
						this.renderView();
					}

					this.emitState();
				}
			},

			// Checks and processes the next page of paginated data.
			paginationNext : function ()
			{
				// Update the last action performed.
				this.status.lastAction = 'PaginationGoToNextPage';

				let nextPage = this.rendering.pagination.currentPage + 1;

				// Ensure not going beyond available pages.
				if ( nextPage <= this.rendering.pagination.availablePages )
				{
					// Increase the page.
					this.rendering.pagination.currentPage++;

					// Emit pagination event.
					if ( this.setting.dataProvider === 1 )
					{
						this.updateStatus( 'updatingPage', true );
					}
					// Update the view.
					else
					{
						// Re-render the view.
						this.renderView();
					}

					this.emitState();
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
					if ( this.setting.dataProvider === 1 )
					{
						this.updateStatus( 'updatingPage', true );
					}
					// Update the view.
					else
					{
						// Re-render the view.
						this.renderView();
					}

					this.emitState();
				}
			},

			// Checks and processes the previous page of paginated data.
			paginationPrevious : function ()
			{
				// Update the last action performed.
				this.status.lastAction = 'PaginationGoToPreviousPage';

				let previousPage = this.rendering.pagination.currentPage - 1;

				// Ensure not going beyond available pages.
				if ( previousPage >= 1 )
				{
					// Increase the page.
					this.rendering.pagination.currentPage--;

					// Emit pagination event.
					if ( this.setting.dataProvider === 1 )
					{
						this.updateStatus( 'updatingPage', true );
					}
					// Update the view.
					else
					{
						// Re-render the view.
						this.renderView();
					}

					this.emitState();
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
					if ( this.setting.dataProvider === 1 )
					{
						this.updateStatus( 'updatingPage', true );
					}
					// Update the view.
					else
					{
						// Re-render the view.
						this.renderView();
					}

					this.emitState();
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

					this.rendering.pagination.currentPage           = 1;
					this.rendering.pagination.currentPageHightlight = null;
					this.rendering.pagination.currentStartIndex     = null;
					this.rendering.pagination.currentEndIndex       = null;
					this.rendering.pagination.availablePages        = null;
					this.rendering.pagination.changingRows          = false;
					this.rendering.pagination.leftPages             = [];
					this.rendering.pagination.rightPages            = [];
					this.rendering.external.dataSize                = null;

					// Emit pagination event.
					if ( this.setting.dataProvider === 1 )
					{
						this.updateStatus( 'updatingPage', true );
					}
					// Update the view.
					else
					{
						this.renderView();
					}

					this.emitState();
				}
			},

			// Changes the current view (Shows/hides a grouping of columns).
			changeViews : function ( view )
			{
				// Update the last action performed.
				this.status.lastAction = 'ChangeView';

				if ( view )
				{
					if ( this.rendering.views.currentSelectedView !== view.viewName )
					{
						// Update the status.
						this.updateStatus( 'updatingPage', true );

						// Update the current view.
						this.rendering.views.currentSelectedView = view.viewName;
						this.rendering.views.currentView         = view;

						// Update the visibility on all columns based on the view.
						this.columns.list.forEach ( ( column ) =>
						{
							let matchedColumn = this.rendering.views.currentView.schema.find( ( viewColumn ) =>
							{
								return column.name === viewColumn.name;
							});

							if ( matchedColumn )
							{
								column.enabled = true;
							}
							else
							{
								column.enabled = false
							}
						});

						let hasBeenSorted = false;

						// Update the sort.
						this.rendering.views.currentView.schema.forEach( ( viewColumn, viewIndex ) =>
						{
							if ( viewColumn.sort )
							{
								this.columns.activeSortIndex    = viewIndex;
								this.columns.activeSortName     = viewColumn.name;
								this.columns.activeSortSpecial  = viewColumn.sortSpecial;
								hasBeenSorted                   = true;

								if ( typeof( viewColumn.sortDirection ) === 'string' )
								{
									this.columns.activeSortAsc = false;

									if ( viewColumn.sortDirection === 'asc' )
									{
										this.columns.activeSortAsc = true;
									}
								}
							}
						});

						if ( !hasBeenSorted )
						{
							this.columns.activeSortIndex   = 0;
							this.columns.activeSortAsc     = true
							this.columns.activeSortName    = this.rendering.views.currentView.schema[0].name;
							this.columns.activeSortSpecial = this.rendering.views.currentView.schema[0].sortSpecial;
						}

						if ( this.setting.dataProvider === 1 )
						{
							this.updateStatus( 'updatingPage', true );
						}
						else
						{
							// Re-render the view.
							this.renderView();
						}
					}
				}

				this.rendering.views.changingViews = false;

				this.emitState();
			},

			// Virtual Engine: Sets the next top and bottom re-rendering position points in pixels.
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
					if ( this.rendering.virtual.rowTopIndex === 0 )
					{
						this.rendering.virtual.triggerTopPositionPX = -1;
					}
					else
					{
						// Re-render when the scroll bar is at a position where only 5 rows exist above.
						this.rendering.virtual.triggerTopPositionPX = Math.floor( CURRENT_VIEW_POSITION_PX() + ( CURRENT_VIEW_HEIGHT() / 8 ) );
					}

					// Calculate the next render (bottom) position.
					if ( this.rendering.virtual.rowBottomIndex === ( this.processedDataSize - 1 ) )
					{
						this.rendering.virtual.triggerBottomPositionPX = -1;
					}
					else
					{
						// Re-render when scroll bar is at a position where only 2 pages of rows exist.
						this.rendering.virtual.triggerBottomPositionPX = Math.floor ( ( CURRENT_VIEW_POSITION_PX() + CURRENT_VIEW_HEIGHT() ) - ( CURRENT_BODY_HEIGHT() * 2.0 ) );
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
					let scrollPositionPercent = scrollPositionPX / this.rendering.virtual.height;

					// Calculate the next potential render position in the data.
					let potentialRenderPosition = Math.floor( this.processedDataSize * scrollPositionPercent );

					// Scrolling Up Check
					if ( scrollPositionPX < this.rendering.virtual.triggerTopPositionPX )
					{
						if ( this.rendering.virtual.triggerTopPositionPX >= 0 )
						{
							// Show the processing message.
							this.updateStatus( 'processingData', true );

							this.rendering.isScrolling = setTimeout( () =>
							{
								this.renderView( Math.floor( this.processedDataSize * scrollPositionPercent ) );
							}, 500 );
						}
					}

					// Scrolling Down Check.
					if ( scrollPositionPX > this.rendering.virtual.triggerBottomPositionPX )
					{
						if ( this.rendering.virtual.triggerBottomPositionPX >= 0 )
						{
							// Show the processing message.
							this.updateStatus( 'processingData', true );

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
					this.status.mobileSize = false;

					if ( this.$refs.bodyData.clientWidth <= 320)
					{
						this.status.mobileSize = true;
					}
				}, 220);
			},

			// Sets the row index that is currently being hovered over.
			rowHover : function ( rowIndex, e )
			{
				this.row.activeHoverIndex   = rowIndex;
				this.row.activeHoverElement = e.srcElement.closest('.jd-row');
			},

			// Sets the column that is currently being hovered over.
			cellHover : function ( columnIndex )
			{
				this.columns.activeHoverIndex = columnIndex;
			},

			// Checks if the body of the table has a scroll bar. This is important to align the head + body.
			checkBodyScroll : function ()
			{
				setTimeout( () =>
				{
					this.status.tableScroll = false;

					// Checks the table widths to see if scroll bar is enabled for body.
					if ( this.$refs.bodyData.scrollHeight > this.$refs.bodyData.clientHeight )
					{
						this.status.tableScroll = true;
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

				this.columns.activeHoverIndex = null;
			},

			// Triggers the start of a resize event. Records the column to be resized and the starting X position.
			resizeStart : function ( columnIndex, e )
			{
				// Start a listener to stop the resize process.
				window.addEventListener( 'mouseup', this.resizeStop , false );

				if ( !this.setting.responsiveTable )
				{
					this.columns.activeResize      = columnIndex;
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

				// Virtual Engine
				if ( this.setting.rendering === 0 )
				{
					this.renderViewVirtual( this.rendering.virtual.rowMiddleIndex );
				}

				window.removeEventListener( 'mouseup', this.resizeStop, false );
			},

			// Resets the scroll position to the top left of the table body.
			resetScroll : function ()
			{
				// Reset the render positions.
				this.rendering.virtual.triggerTopPositionPX    = null;
				this.rendering.virtual.triggerBottomPositionPX = null;

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
					let width = this.rendering.views.currentView.schema[columnIndex].width;

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
					if ( this.setting.resizeForceMinWidth && ( width < this.rendering.views.currentView.schema[columnIndex].originalWidth ) )
					{
						width = this.setting.columns[columnIndex].width;
					}

					// Update the column width.
					this.rendering.views.currentView.schema[columnIndex].width                   = width;
					this.rendering.views.currentView.schema[columnIndex].headerStyles['width']   = width + 'px';
					this.rendering.views.currentView.schema[columnIndex].dataStyles['width']     = width + 'px';
					this.rendering.views.currentView.schema[columnIndex].dataStyles['min-width'] = width + 'px';

					// Update the initial drag position.
					this.columns.activeResizeStart = e.clientX;
				}
			},

			// Changes the sort column and/or direction.
			changeSort : function ( columnIndex, columnName, sortSpecial )
			{
				// Update the last action performed.
				this.status.lastAction = 'ChangeSort';

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
				// Sort the new column ascending.
				else
				{
					this.columns.activeSortIndex   = columnIndex;
					this.columns.activeSortName    = columnName;
					this.columns.activeSortAsc     = true;
					this.columns.activeSortSpecial = sortSpecial;
				}

				if ( this.setting.dataProvider === 1 )
				{
					this.updateStatus( 'updatingPage', true );
				}
				else
				{
					// Re-render the view.
					this.renderView();
				}

				this.emitState();
			},

			// Sorts the original data.
			sortData : function ()
			{
				if ( this.setting.dataProvider === 0 )
				{
					let columnName        = this.rendering.views.currentView.schema[this.columns.activeSortIndex].name;
					let columnSortType    = this.rendering.views.currentView.schema[this.columns.activeSortIndex].type;
					let columnSortSpecial = this.rendering.views.currentView.schema[this.columns.activeSortIndex].sortSpecial;

					if ( this.processedDataSize > 0 )
					{
						this.processedData.sort( ( a, b ) =>
						{
							// Sort the data with null values.
							const sortByNull = ( x, y ) =>
							{
								if ( columnSortType === 'Array' )
								{
									if ( !x[columnName] || !x[columnName][0] )
									{
										return -1 * ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
									}

									if ( !y[columnName] || !y[columnName][0] )
									{
										return ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
									}
								}
								else
								{
									if ( !x[columnName] )
									{
										return -1 * ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
									}

									if ( !y[columnName] )
									{
										return ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
									}
								}
							};

							// Sort the data by string.
							const sortByString = ( x, y ) =>
							{
								// Special Sorting
								if ( columnSortSpecial )
								{
									// IP
									if ( columnSortSpecial.toLowerCase() === 'ip' )
									{
										x = x[columnName].split( '.' );
										y = y[columnName].split( '.' );

										for ( let i = 0; i < x.length; i++ )
										{
											if ( ( x[i] = parseInt( x[i] ) ) < ( y[i] = parseInt( y[i] ) ) )
											{
												return -1 * ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
											}
											else if ( x[i] > y[i] )
											{
												return ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
											}
										}
									}
								}
								// Normal String Sort
								else
								{
									x = x[columnName].toUpperCase();
									y = y[columnName].toUpperCase();

									if ( x < y )
									{
										return -1 * ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
									}

									if ( x > y )
									{
										return ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
									}
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
								// Special IP Sort
								if ( columnSortSpecial )
								{
									// IP
									if ( columnSortSpecial.toLowerCase() === 'ip' )
									{
										x = x[columnName][0].split( '.' );
										y = y[columnName][0].split( '.' );

										for ( let i = 0; i < x.length; i++ )
										{
											if ( ( x[i] = parseInt( x[i] ) ) < ( y[i] = parseInt( y[i] ) ) )
											{
												return -1 * ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
											}
											else if ( x[i] > y[i] )
											{
												return ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
											}
										}
									}
								}
								// Normal String Sort
								else
								{
									x = x[columnName][0].toUpperCase();
									y = y[columnName][0].toUpperCase();

									if ( x < y )
									{
										return ( ( !this.columns.activeSortAsc ) ? 1 : -1 );
									}

									if ( x > y )
									{
										return ( ( !this.columns.activeSortAsc ) ? -1 : 1 );
									}
								}

								// Strings are the same.
								return 0;
							};

							// Check for nulls.
							if ( columnSortType === 'Array' )
							{
								if ( !a[columnName] || !a[columnName][0] || !b[columnName] || !b[columnName][0] )
								{
									return sortByNull ( a, b );
								}
							}
							else
							{
								if ( !a[columnName] || !b[columnName] )
								{
									return sortByNull ( a, b );
								}
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
			clearFilterDropdown : function ( e )
			{
				if ( e.target.id !== 'filterDropDownMenu' )
				{
					// Clear the selected filter dropdown.
					this.filters.activeDropdown = null;

					// Remove the listener.
					window.removeEventListener( 'mouseup', this.clearFilterDropdown, false );
				}
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
				// Manage Data Availability.
				if ( this.setting.dataProvider === 0 && this.data.length === 0 )
				{
					this.filters.errorText = 'There is no data available to filter.';
					this.filters.error = true;
				}

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
					if ( this.filters.beingBuilt.option === 'Greater/Equal To' && isNaN( this.filters.beingBuilt.value ) )
					{
						this.filters.errorText = 'Value must be a number.';
						this.filters.error = true;
					}

					if ( this.filters.beingBuilt.option === 'Less/Equal To' && isNaN( this.filters.beingBuilt.value ) )
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

					// dataProvider = 1 | Filtering is performed externally (emitted).
					if ( this.setting.dataProvider === 1 )
					{
						this.updateStatus( 'updatingPage', true );
					}
					// dataProvider = 0 | Filtering is performed on the data that exists in the JD-Table component.
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

					this.emitState();
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

				// dataProvider = 1 | Filtering is performed externally (emitted).
				if ( this.setting.dataProvider === 1 )
				{
					this.updateStatus( 'updatingPage', true );
				}
				// dataProvider = 0 | Filtering is performed on the data that exists in the JD-Table component.
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

				this.emitState();
			},

			// Clears all active filters and being built.
			clearAllFilters : function ()
			{
				// Update the last action performed.
				this.status.lastAction = 'ClearFilter';

				// Clear being built.
				this.filters.beingBuilt.column = null;
				this.filters.beingBuilt.option = null;
				this.filters.beingBuilt.value  = null;

				// Reset any error that may exist.
				this.filters.error     = false;
				this.filters.errorText = '';

				// Clear active.
				this.filters.active = [];

				// dataProvider = 1 | Filtering is performed externally (emitted).
				if ( this.setting.dataProvider === 1 )
				{
					this.updateStatus( 'updatingPage', true );
				}
				// dataProvider = 0 | Filtering is performed on the data that exists in the JD-Table component.
				else
				{
					// Process the data through filters/search.
					this.processData().then( () =>
					{
						// Render the new view.
						this.renderView();
					});
				}

				this.emitState();
			},

			// Changes the column visibility. Adds/removes column from view.
			columnSelection : function ( selectedColumn )
			{
				// If disabling, enforce at least 1 enabled.
				if ( selectedColumn.enabled )
				{
					let enabledCount = 0;

					// Check how many are enabled.
					this.rendering.views.currentView.schema.forEach( ( column ) =>
					{
						if ( column.enabled )
						{
							enabledCount++;
						}
					});

					// Must have at least 1 enabled to disable.
					if ( enabledCount > 1 )
					{
						// Spice column out of currentView.
						let columnToSplice = this.rendering.views.currentView.schema.findIndex( ( viewColumn ) =>
						{
							return selectedColumn.name === viewColumn.name;
						});

						// Update column.
						selectedColumn.enabled      = false;
						this.columns.selectionError = false;

						// Remove from array.
						this.rendering.views.currentView.schema.splice( columnToSplice, 1 );

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

					// Add to array. The view isn't sorted, its just added to the end.
					this.rendering.views.currentView.schema.push( selectedColumn );

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
					// Emit search event.
					if ( this.setting.dataProvider === 1 )
					{
						this.updateStatus( 'searching', true );

						this.search.searching = true;
					}
					// Perform search using JD-Table.
					else
					{
						if ( this.data.length > 0 )
						{
							this.updateStatus( 'searching', true );

							this.resetScroll();

							this.processData().then( () =>
							{
								this.updateStatus( 'searching', false );

								this.renderView();
							});
						}
					}
				}

				this.emitState();
			},

			// Clears the search.
			clearSearch : function ()
			{
				// Update the last action performed.
				this.status.lastAction = 'ClearSearch';

				// Clear search data.
				this.search.text       = '';
				this.search.searching  = false;

				this.resetScroll();

				this.processData().then( () =>
				{
					// Emit search event.
					if ( this.setting.dataProvider === 1 )
					{
						this.updateStatus( 'updatingPage', true );
					}
					else
					{
						this.renderView();
					}

					this.emitState();
				});
			},

			// Called when user selects the "Quick View" option from the left/right click context menu of a row.
			contextQuickView : function ()
			{
				// Reset any visible feature options.
				this.featureAction( null );

				// Show the quick view.
				this.row.selectedIndex = this.row.activeContextIndex;
			},

			// Called when user selects the "View" option from the left/right click context menu of a row.
			contextView : function ( newWindow )
			{
				// Reset any visible feature options.
				this.featureAction( null );

				// Update the last action performed.
				this.status.lastAction = 'ViewItem';

				if ( newWindow )
				{
					// Update the last action performed.
					this.status.lastAction = 'ViewItemNewWindow';
				}

				this.emitState();
			},

			// Called when user selects the "Edit" option from the left/right click context menu of a row.
			contextEdit : function ( newWindow )
			{
				// Reset any visible feature options.
				this.featureAction( null );

				// Update the last action performed.
				this.status.lastAction = 'EditItem';

				if ( newWindow )
				{
					// Update the last action performed.
					this.status.lastAction = 'EditItemNewWindow';
				}

				this.emitState();
			},

			// Called when user selects the "Delete" option from the left/right click context menu of a row.
			contextDelete : function ()
			{
				// Reset any visible feature options.
				this.featureAction( null );

				// Update the last action performed.
				this.status.lastAction = 'DeleteItem';

				this.emitState();
			},

			// Called when user selects the "Add" option from the left/right click context menu of a row.
			contextAdd : function ( newWindow )
			{
				// Reset any visible feature options.
				this.featureAction( null );

				// Update the last action performed.
				this.status.lastAction = 'AddItem';

				if ( newWindow )
				{
					// Update the last action performed.
					this.status.lastAction = 'AddItemNewWindow';
				}

				this.emitState();
			},

			// Called when user single (left) clicks on a data row. Accepts the index of the data on the this.data.
			rowActionSingle : function ( rowIndex )
			{
				if ( this.setting.quickView === 1 && !this.setting.contextMenuLeft )
				{
					// If the menu is visible already ..
					if ( this.status.contextMenu )
					{
						this.hideContextMenu();
					}

					this.featureAction( null );

					// Add a highlight to the quick view row.
					this.row.activeContextIndex   = this.row.activeHoverIndex;
					this.row.activeContextElement = this.row.activeHoverElement;

					// Make the row red.
					this.row.activeContextElement.classList.add('jd-rowSelect');

					// Show the quick view.
					this.row.selectedIndex = rowIndex;
				}
			},

			// Called when user double clicks on a data row. Accepts the index of the data on the this.data.
			rowActionDouble : function ( rowIndex )
			{
				if ( this.setting.quickView === 2 && !this.setting.contextMenuLeft )
				{
					// If the menu is visible already ..
					if ( this.status.contextMenu )
					{
						this.hideContextMenu();
					}

					this.featureAction( null );

					// Add a highlight to the quick view row.
					this.row.activeContextIndex   = this.row.activeHoverIndex;
					this.row.activeContextElement = this.row.activeHoverElement;

					// Make the row red.
					this.row.activeContextElement.classList.add('jd-rowSelect');

					// Show the quick view.
					this.row.selectedIndex = rowIndex;
				}
			},

			// Called when the quick view window is closed.
			quickViewClose : function ()
			{
				// Remove the row red.
				this.row.activeContextElement.classList.remove('jd-rowSelect');

				// Update the index of the row right clicked on.
				this.row.activeContextIndex   = null;
				this.row.activeContextElement = null;

				// Hide the quick view.
				this.row.selectedIndex = null;
			},

			// Called when the NEXT button is pressed on the quick view.
			quickViewNext : function ()
			{
				// External
				if ( this.setting.dataProvider === 1 )
				{
					if ( this.row.selectedIndex < ( this.processedDataSize ) )
					{
						if ( this.data[ this.row.selectedIndex + 1 ] != null )
						{
							this.row.selectedIndex++;
						}
						else
						{
							// Check for last page
							if ( this.rendering.pagination.currentEndIndex !== this.processedDataSize )
							{
								// Need more data (move to next page).
								this.paginationNext();

								this.row.selectedIndex = 0;
							}
						}
					}
				}
				// Internal
				else
				{
					if ( this.row.selectedIndex < ( this.processedData.length - 1 ) )
					{
						this.row.selectedIndex++;
					}
				}
			},

			// Called when the PREVIOUS button is pressed on the quick view.
			quickViewPrevious : function ()
			{
				// External
				if ( this.setting.dataProvider === 1 )
				{
					if ( this.row.selectedIndex === 0 && this.rendering.pagination.currentPage !== 1 )
					{
						// Need more data (move to previous page).
						this.paginationPrevious();

						this.row.selectedIndex = this.data.length - 1;
					}
					else
					{
						if ( this.row.selectedIndex >= 1 )
						{
							this.row.selectedIndex--;
						}
					}
				}
				// Internal
				else
				{
					if ( this.row.selectedIndex >= 1 )
					{
						this.row.selectedIndex--;
					}
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
				printWindow.focus();
				printWindow.print();
				printWindow.close();
			},

			// Clears all data from table.
			clearTable : function ()
			{
				// Clear data.
				this.processedData = [];
				this.data          = [];

				// Clear Search
				this.search.searching = false;
				this.search.text      = "";

				// Clear Filters
				this.filters.active            = [];
				this.filters.activeDropdown    = null;
				this.filters.beingBuilt.column = null;
				this.filters.beingBuilt.option = null;
				this.filters.beingBuilt.value  = null;
				this.filters.error             = false;
				this.filters.errorText         = "";
				this.filters.show              = false;

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

				// Reset virtual.
				this.rendering.virtual.rowBottomIndex           = 0;
				this.rendering.virtual.rowTopIndex              = 0;
				this.rendering.virtual.rowMiddleIndex           = 0;
				this.rendering.virtual.triggerBottomPositionPX  = 0;
				this.rendering.virtual.triggerTopPositionPX     = 0;
				this.rendering.virtual.height                   = 0;

				// Reset external.
				this.rendering.external.dataSize = null;

				// Selection
				this.row.selectedIndex = null;

				// Stop any processing messaging.
				this.updateStatus( 'processingData', false );

				// Reset scroll positions.
				this.resetScroll();

				// Clean the view.
				this.currentTableData = [];
			},

			// Displays the appropriate table message based on component status.
			updateStatus : function ( statusName, state )
			{
				this.status.searching      = false;
				this.status.updatingPage   = false;
				this.status.processingData = false;

				if ( statusName === 'processingData' )
				{
					this.status.processingData = state;
				}

				if ( statusName === 'searching' )
				{
					this.status.searching = state;
				}

				if ( statusName === 'updatingPage' )
				{
					this.status.updatingPage = state;
				}
			},

			// Convert raw number to formatted.
			formatNumberWithCommas : function ( x )
			{
				if ( x )
				{
					return x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, "," );
				}

				return 0;
			},

			// Returns the number of rows that can fit in the current view.
			getRowsInView : function ()
			{
				// Get the current height of the table body container.
				let viewHeight = this.$refs.bodyData.clientHeight;

				return Math.ceil( viewHeight / this.setting.rowHeight );
			},

			// Checks if the browser is a version of Internet Explorer.
			checkBrowser : function ()
			{
				// Checks if browser is IE11.
				if ( navigator.userAgent.indexOf('MSIE')!==-1  || navigator.appVersion.indexOf('Trident/') > -1 )
				{
					this.status.isIE11 = true;
				}
				else
				{
					this.status.isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
				}
			}
		},

		computed :
		{
			// View flag. Enabled if the view has data. False if not.
			isViewAvailable : function ()
			{
				return this.currentTableData.length > 0;
			},

			// Normalizes the initialize settings in case one or more properties are not configured.
			setting : function ()
			{
				return Object.assign (
					{
						// Data Provider
						dataProvider : 0,

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
						addNew                       : false,
						editItem                     : false,
						viewItem                     : false,
						deleteItem                   : false,
						resize                       : true,
						filter                       : true,
						export                       : true,
						exportLimit                  : null,
						columnSort                   : true,
						quickView			         : 1,
						contextMenuRight             : false,
						contextMenuLeft              : false,
						contextMenuQuickView         : true,
						contextMenuView              : true,
						contextMenuEdit              : true,
						contextMenuDelete            : true,
						contextMenuAdd               : true,

						// Rendering
						renderEngine                   : 2,
						responsiveFrame                : true,
						responsiveFrameForceFullWidth  : false,
						responsiveTable                : true,
						virtualEngineRowStart          : 250,
						frameWidth                     : null,
						headerHeight                   : 40,
						dataHeight                     : 400,
						rowHeight                      : 42,
						paginationRowLimits            : [50, 100, 200],
						paginationRowStart             : 50,
						paginationRowAll               : true,
						pageSideQuantity               : 5,

						// Search
						forceSearchOpen     : false,
						searchPlaceHolder   : null,

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

						title               : null,
						views               : []
					}, this.option
				);
			},

			// Returns the total number of rows in the data.
			processedDataSize : function ()
			{
				// Check if data is being fed from externally.
				if ( this.setting.dataProvider === 1 )
				{
					return this.rendering.external.dataSize;
				}

				return this.processedData.length;
			},

			// Returns true if there are active filters.
			filtering : function ()
			{
				return this.filters.active.length > 0;
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
					return 'jd-maximized';
				}

				if ( !this.setting.dataHeight )
				{
					return 'jd-fullBody';
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
						if ( !this.setting.responsiveFrameForceFullWidth )
						{
							styles['max-width'] = this.tableWidth + 'px';
						}
					}
				}

				return styles;
			},

			// Apply class to controlSearch based on settings.
			controlSearchClasses : function ()
			{
				if ( this.feature.searching )
				{
					return 'jd-searching';
				}

				return null;
			},

			// Apply class to controlFilter based on settings.
			controlFilterClasses : function ()
			{
				let classes = '';

				if ( this.filters.show )
				{
					classes = 'jd-selected';
				}

				if ( this.filtering )
				{
					classes += ' jd-active';
				}

				return classes;
			},

			// Apply class to search icon based on searching status.
			searchIconClasses : function ()
			{
				let classes = '';

				if ( this.setting.forceSearchOpen )
				{
					classes += ' jd-noSelect';
				}

				if ( this.feature.searching )
				{
					classes += ' jd-search jd-selected';
				}

				if ( this.search.searching )
				{
					classes += ' jd-active';
				}

				if ( !this.feature.searching && !this.setting.forceSearchOpen )
				{
					classes += ' jd-notActive'
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
					return 'jd-searching';
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
					classes += ' jd-sort';
				}

				if ( this.status.tableScroll )
				{
					classes += ' jd-scrollBuffer';
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
				return {
					height : this.rendering.virtual.height + 'px'
				};
			},

			// Apply styles to feature option zone based on settings.
			optionDropdownStyles : function ()
			{
				return {
					'max-height' : ( this.setting.dataHeight + this.setting.headerHeight ) + 'px'
				};
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
					styles['top']      =( this.rendering.virtual.rowTopIndex * this.setting.rowHeight ) + 'px';
				}

				return styles;
			},

			// Apply class to table body row based on settings.
			viewRowClasses : function ()
			{
				let classes = '';

				if ( this.setting.rowZebra )
				{
					classes += ' jd-zebra';
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
					classes = 'jd-rowFlex';
				}

				return classes;
			},

			// Calculate the total width of the table based on the column size.
			tableWidth : function ()
			{
				let totalWidth   = 0;
				let missingWidth = false;

				this.rendering.views.currentView.schema.forEach( ( column ) =>
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
					if ( this.setting.dataProvider === 1 )
					{
						return ['Equals To', 'Contains', 'Not Equals To'];
					}

					return ['Equals To', 'Contains', 'Not Equals To', 'Begins With'];
				}

				if ( this.filters.beingBuilt.column.type === 'Array' )
				{
					if ( this.setting.dataProvider === 1 )
					{
						return ['Contains'];
					}

					return ['Contains'];
				}

				if ( this.filters.beingBuilt.column.type === 'Number' )
				{
					if ( this.setting.dataProvider === 1 )
					{
						return ['Equals To', 'Greater/Equal To', 'Less/Equal To', 'Contains', 'Not Equals To'];
					}

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

			// Returns the status of the Getting Started message.
			gettingStarted : function ()
			{
				if ( !this.status.processingData && !this.loader && this.setting.startBySearch )
				{
					if ( !this.search.searching && !this.filtering )
					{
						return true;
					}
				}

				return false;
			},

			// Returns the status for displaying the no data message.
			noDataMessage : function ()
			{
				if ( !this.status.processingData && !this.processedDataSize && !this.loader && !this.isViewAvailable && !this.status.updatingPage && !this.status.searching && this.tableReady )
				{
					if ( !this.gettingStarted )
					{
						return true;
					}
				}

				return false;
			},

			// Returns true if any of the option menus are shown and false if none.
			menuVisible : function ()
			{
				if ( this.filters.show || this.rendering.pagination.changingRows || this.columns.selecting || this.rendering.views.changingViews )
				{
					return true;
				}

				return false;
			},

			// Represents the current state of data of the component. This is emitted to parent events.
			componentState : function ()
			{
				return {
					searchApplied   : this.search.searching,
					searchText      : this.search.text,
					filterApplied   : this.filters.active,
					pageLimit       : this.rendering.pagination.currentSelectedPageRowOption,
					currentPage     : this.rendering.pagination.currentPage,
					lastAction      : this.status.lastAction,
					sortColumn      : this.columns.activeSortName ? this.columns.activeSortName : this.rendering.views.currentView.schema[0].name,
					sortColumnIndex : this.columns.activeSortIndex ? this.columns.activeSortIndex : 0,
					sortDirection   : this.columns.activeSortAsc ? 'ASC' : 'DESC',
					sortSpecial     : this.columns.activeSortSpecial ? this.columns.activeSortSpecial : null,
					selectedItem    : this.row.selectedIndex !== null ? this.currentTableData[ this.row.selectedIndex ] : this.row.activeContextIndex !== null ? this.currentTableData[ this.row.activeContextIndex ] : null,
					selectedIndex   : this.row.selectedIndex !== null ? this.row.selectedIndex : this.row.activeContextIndex !== null  ? this.row.activeContextIndex : null,
					currentView     : this.rendering.views.currentView
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
