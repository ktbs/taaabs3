import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Trace} from "../../ktbs-api/Trace.js";

import "../ktbs4la2-document-header/ktbs4la2-document-header.js";

/**
 * Encodes a string containing a Javascript special character to it's HTML hexadecimal entity
 */
function JSSpecialCharToHTMLHex(str) {
    return "&#x" + str.codePointAt(0).toString(16) + ";";
}

/**
 * 
 */
class KTBS4LA2TraceTable extends KtbsResourceElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url);
		this._obselsLoadingAbortController = new AbortController();
		this._resolveTypeSet();
		this._allowFullScreen = true;
		this._maxVisibleRows = 150;
		this._updateOverflowRowsTaskID = null;
		this._bindedOnDragScrollbarFunction = this._onDragScrollbar.bind(this);
		this._bindedOnScrollBarMouseLeaveFunction = this._onScrollBarMouseLeave.bind(this);
		this._bindedOnScrollBarMouseMoveFunction = this._onScrollBarMouseMove.bind(this);
		this._resquestedScroll = 0;
		this._latestTableViewData = null;
		this._firstUnhiddenRowIndex = null;
		this._lastUnhiddenRowIndex = null;
		this._obselsData = new Array();

		this._sortedObselsIds = {
			"id": {"asc": null, "desc": null},
			"type": {"asc": null, "desc": null},
			"subject": {"asc": null, "desc": null},
			"begin": {"asc": null, "desc": null},
			"end": {"asc": null, "desc": null}
		};
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._widgetContainer = this.shadowRoot.querySelector("#widget-container");
		this._tableContainer = this.shadowRoot.querySelector("#table-container");
		this._table = this.shadowRoot.querySelector("#table");
		this._tableHeader = this.shadowRoot.querySelector("#table-header");
		this._tableBody = this.shadowRoot.querySelector("#table-body");
		this._tableFooter = this.shadowRoot.querySelector("#table-footer");

		this._tableHeaderIdLabel = this.shadowRoot.querySelector("#table-header-id-label");
		this._tableHeaderTypeLabel = this.shadowRoot.querySelector("#table-header-type-label");
		this._tableHeaderSubjectLabel = this.shadowRoot.querySelector("#table-header-subject-label");
		this._tableHeaderBeginLabel = this.shadowRoot.querySelector("#table-header-begin-label");
		this._tableHeaderEndLabel = this.shadowRoot.querySelector("#table-header-end-label");
		this._tableHeaderAttributesTypeLabel = this.shadowRoot.querySelector("#table-header-attributes-type-label");
		this._tableHeaderAttributesValueLabel = this.shadowRoot.querySelector("#table-header-attributes-value-label");

		this._sortIdAscButton = this.shadowRoot.querySelector("#sort-id-asc");
		this._sortIdAscButton.addEventListener("click", this._onClickSortIdAscButton.bind(this));

		this._sortIdDescButton = this.shadowRoot.querySelector("#sort-id-desc");
		this._sortIdDescButton.addEventListener("click", this._onClickSortIdDescButton.bind(this));

		this._sortTypeAscButton = this.shadowRoot.querySelector("#sort-type-asc");
		this._sortTypeAscButton.addEventListener("click", this._onClickSortTypeAscButton.bind(this));

		this._sortTypeDescButton = this.shadowRoot.querySelector("#sort-type-desc");
		this._sortTypeDescButton.addEventListener("click", this._onClickSortTypeDescButton.bind(this));

		this._sortSubjectAscButton = this.shadowRoot.querySelector("#sort-subject-asc");
		this._sortSubjectAscButton.addEventListener("click", this._onClickSortSubjectAscButton.bind(this));

		this._sortSubjectDescButton = this.shadowRoot.querySelector("#sort-subject-desc");
		this._sortSubjectDescButton.addEventListener("click", this._onClickSortSubjectDescButton.bind(this));

		this._sortBeginAscButton = this.shadowRoot.querySelector("#sort-begin-asc");
		this._sortBeginAscButton.addEventListener("click", this._onClickSortBeginAscButton.bind(this));

		this._sortBeginDescButton = this.shadowRoot.querySelector("#sort-begin-desc");
		this._sortBeginDescButton.addEventListener("click", this._onClickSortBeginDescButton.bind(this));

		this._sortEndAscButton = this.shadowRoot.querySelector("#sort-end-asc");
		this._sortEndAscButton.addEventListener("click", this._onClickSortEndAscButton.bind(this));

		this._sortEndDescButton = this.shadowRoot.querySelector("#sort-end-desc");
		this._sortEndDescButton.addEventListener("click", this._onClickSortEndDescButton.bind(this));


		this._toggleFullscreenButton = this.shadowRoot.querySelector("#toggle-fullscreen-button");
		this._toggleFullscreenButton.addEventListener("click", this._onClickToggleFullscreenButton.bind(this));
		


		this._scrollTools = this.shadowRoot.querySelector("#scroll-tools");
		this._scrollTopButton = this.shadowRoot.querySelector("#scroll-top-button");
		this._scrollTopButton.addEventListener("mousedown", this._onScrollTopButtonMouseDown.bind(this));
		this._scrollTopButton.addEventListener("mouseout", this._onScrollTopButtonMouseOut.bind(this));
		
		this._scrollBar = this.shadowRoot.querySelector("#scroll-bar");
		this._scrollBar.addEventListener("wheel", this._onScrollBarMouseWheel.bind(this), { passive: false });
		this._scrollBar.addEventListener("mousedown", this._onScrollBarMouseDown.bind(this));

		this._scrollBarHandle = this.shadowRoot.querySelector("#scroll-bar-handle");
		this._scrollBarHandle.addEventListener("mousedown", this._onScrollBarHandleMouseDown.bind(this));
		
		this._scrollBottomButton = this.shadowRoot.querySelector("#scroll-bottom-button");
		this._scrollBottomButton.addEventListener("mousedown", this._onScrollBottomButtonMouseDown.bind(this));
		this._scrollBottomButton.addEventListener("mouseout", this._onScrollBottomButtonMouseOut.bind(this));
		
		// observe resize of tableHeader & tableFooter
		this._tableSectionsResizeObserver = new ResizeObserver(this._onTableViewChanged.bind(this));
		this._tableSectionsResizeObserver.observe(this._tableContainer);
		
		this._tableContainer.addEventListener("scroll", this._onTableContainerScrolled.bind(this));

		this._errorMessageDiv = this.shadowRoot.querySelector("#error-message");
		this._waitMessageContent = this.shadowRoot.querySelector("#wait-message-content");

		window.document.addEventListener("mouseup", this._onDocumentMouseUp.bind(this), true);
	}

	/**
	 * 
	 */
	_onClickSortIdAscButton(event) {
		if(!this._sortIdAscButton.classList.contains("applied")) {
			this._sortTable("id", "asc");
			this._sortIdAscButton.classList.add("applied");
		}
		else
			event.preventDefault();
	}

	/**
	 * 
	 */
	_onClickSortIdDescButton(event) {
		if(!this._sortIdDescButton.classList.contains("applied")) {
			this._sortTable("id", "desc");
			this._sortIdDescButton.classList.add("applied");
		}
		else
			event.preventDefault();
	}

	/**
	 * 
	 */
	_onClickSortTypeAscButton(event) {
		if(!this._sortTypeAscButton.classList.contains("applied")) {
			this._sortTable("type", "asc");
			this._sortTypeAscButton.classList.add("applied");
		}
		else
			event.preventDefault();
	}

	/**
	 * 
	 */
	_onClickSortTypeDescButton(event) {
		if(!this._sortTypeDescButton.classList.contains("applied")) {
			this._sortTable("type", "desc");
			this._sortTypeDescButton.classList.add("applied");
		}
		else
			event.preventDefault();
	}

	/**
	 * 
	 */
	_onClickSortSubjectAscButton(event) {
		if(!this._sortSubjectAscButton.classList.contains("applied")) {
			this._sortTable("subject", "asc");
			this._sortSubjectAscButton.classList.add("applied");
		}
		else
			event.preventDefault();
	}

	/**
	 * 
	 */
	_onClickSortSubjectDescButton(event) {
		if(!this._sortSubjectDescButton.classList.contains("applied")) {
			this._sortTable("subject", "desc");
			this._sortSubjectDescButton.classList.add("applied");
		}
		else
			event.preventDefault();
	}

	/**
	 * 
	 */
	_onClickSortBeginAscButton(event) {
		if(!this._sortBeginAscButton.classList.contains("applied")) {
			this._sortTable("begin", "asc");
			this._sortBeginAscButton.classList.add("applied");
		}
		else
			event.preventDefault();
	}

	/**
	 * 
	 */
	_onClickSortBeginDescButton(event) {
		if(!this._sortBeginDescButton.classList.contains("applied")) {
			this._sortTable("begin", "desc");
			this._sortBeginDescButton.classList.add("applied");
		}
		else
			event.preventDefault();
	}

	/**
	 * 
	 */
	_onClickSortEndAscButton(event) {
		if(!this._sortEndAscButton.classList.contains("applied")) {
			this._sortTable("end", "asc");
			this._sortEndAscButton.classList.add("applied");
		}
		else
			event.preventDefault();
	}

	/**
	 * 
	 */
	_onClickSortEndDescButton(event) {
		if(!this._sortEndDescButton.classList.contains("applied")) {
			this._sortTable("end", "desc");
			this._sortEndDescButton.classList.add("applied");
		}
		else
			event.preventDefault();
	}

	/**
	 * When obsels of a trace need to be ordered, kTBS uses a total ordering considering :
				- their end timestamp, then
				- their begin timestamp, then
				- their identifier.
	 *
	 * @param {*} obselA 
	 * @param {*} obselB 
	 */
	_compareDefault(obselA, obselB) {
		if(obselA.end < obselB.end)
			return -1;
		else if(obselA.end > obselB.end)
			return 1;
		else {
			if(obselA.begin < obselB.begin)
				return -1;
			else if(obselA.begin > obselB.begin)
				return 1;
			else {
				if(obselA.id < obselB.id)
					return -1;
				else if(obselA.id > obselB.id)
					return 1;
				else
					return 0; // should never happen, as Obsels IDs are supposed to be unique within a Trace
			}
		}
	}

	/**
	 * 
	 */
	_compareObselIdAsc(obselA, obselB) {
		if(obselA.id < obselB.id)
			return -1;
		else if(obselA.id > obselB.id)
			return 1;
		else
			return this._compareDefault(obselA, obselB);
	}

	/**
	 * 
	 */
	_compareObselIdDesc(obselA, obselB) {
		if(obselA.id < obselB.id)
			return 1;
		else if(obselA.id > obselB.id)
			return -1;
		else
			return this._compareDefault(obselA, obselB);
	}

	/**
	 * 
	 */
	_compareObselTypeAsc(obselA, obselB) {
		let obselATypeSortingValue;
		
		if(obselA.type)
			obselATypeSortingValue = obselA.type.get_translated_label(this._lang);

		if(!obselATypeSortingValue)
			obselATypeSortingValue =  obselA.type_id;

		let obselBTypeSortingValue;
		
		if(obselB.type)
			obselBTypeSortingValue = obselB.type.get_translated_label(this._lang);

		if(!obselBTypeSortingValue)
			obselBTypeSortingValue =  obselB.type_id;
		
		if(obselATypeSortingValue < obselBTypeSortingValue)
			return -1;
		else if(obselATypeSortingValue > obselBTypeSortingValue)
			return 1;
		else
			return this._compareDefault(obselA, obselB);
	}

	/**
	 * 
	 */
	_compareObselTypeDesc(obselA, obselB) {
		let obselATypeSortingValue;

		if(obselA.type)
			obselATypeSortingValue = obselA.type.get_translated_label(this._lang);

		if(!obselATypeSortingValue)
			obselATypeSortingValue =  obselA.type_id;

		let obselBTypeSortingValue;
		
		if(obselB.type)
			obselBTypeSortingValue = obselB.type.get_translated_label(this._lang);

		if(!obselBTypeSortingValue)
			obselBTypeSortingValue =  obselB.type_id;

		if(obselATypeSortingValue < obselBTypeSortingValue)
			return 1;
		else if(obselATypeSortingValue > obselBTypeSortingValue)
			return -1;
		else
			return this._compareDefault(obselA, obselB);
	}

	/**
	 * 
	 */
	_compareObselSubjectAsc(obselA, obselB) {
		if(obselA.subject < obselB.subject)
			return -1;
		else if(obselA.subject > obselB.subject)
			return 1;
		else
			return this._compareDefault(obselA, obselB);
	}

	/**
	 * 
	 */
	_compareObselSubjectDesc(obselA, obselB) {
		if(obselA.subject < obselB.subject)
			return 1;
		else if(obselA.subject > obselB.subject)
			return -1;
		else
			return this._compareDefault(obselA, obselB);
	}

	/**
	 * 
	 */
	_compareObselBeginAsc(obselA, obselB) {
		if(obselA.begin < obselB.begin)
			return -1;
		else if(obselA.begin > obselB.begin)
			return 1;
		else
			return this._compareDefault(obselA, obselB);
	}

	/**
	 * 
	 */
	_compareObselBeginDesc(obselA, obselB) {
		if(obselA.begin < obselB.begin)
			return 1;
		else if(obselA.begin > obselB.begin)
			return -1;
		else
			return this._compareDefault(obselA, obselB);
	}

	/**
	 * 
	 */
	_compareObselEndDesc(obselA, obselB) {
		if(obselA.end < obselB.end)
			return 1;
		else if(obselA.end > obselB.end)
			return -1;
		else
			return this._compareDefault(obselA, obselB);
	}

	/**
	 * 
	 */
	_getComparisonFunction(column, direction) {
		switch(column) {
			case "id" :
				if(direction == "asc")
					return this._compareObselIdAsc.bind(this);
				else
					return this._compareObselIdDesc.bind(this);
			case "type" :
				if(direction == "asc")
					return this._compareObselTypeAsc.bind(this);
				else
					return this._compareObselTypeDesc.bind(this);
			case "subject" :
				if(direction == "asc")
					return this._compareObselSubjectAsc.bind(this);
				else
					return this._compareObselSubjectDesc.bind(this);
			case "begin" :
				if(direction == "asc")
					return this._compareObselBeginAsc.bind(this);
				else
					return this._compareObselBeginDesc.bind(this);
			case "end" :
				if(direction == "asc")
					return this._compareDefault.bind(this);
				else
					return this._compareObselEndDesc.bind(this);
			default: 
				return undefined;
		}
	}

	/**
	 * 
	 * @param {*} column 
	 * @param {*} direction 
	 */
	_getSortedObselIds(column, direction) {
		let comparisonFunction = this._getComparisonFunction(column, direction);

		if(comparisonFunction != undefined)
			return this._obselsData.slice(0).sort(comparisonFunction).map(obsel => obsel.id);
		else
			throw new Error("No comparison function found to sort Obsels by \"" + column + "\" in direction \"" + direction + "\"");
	}

	/**
	 * 
	 * @param {*} column 
	 * @param {*} direction 
	 */
	_sortTable(column, direction) {
		// hide table and show wait message
		if(!this._tableContainer.classList.contains("pending"))
			this._tableContainer.classList.add("pending");

		// un-hilight previously applied sort button(s)
		let appliedButtons = this._tableHeader.querySelectorAll("button.sort-button.applied");

		for(let i = 0; i < appliedButtons.length; i++)
			appliedButtons[i].classList.remove("applied");

		if(this._sortTableTaskID)
			clearTimeout(this._sortTableTaskID);

		this._sortTableTaskID = setTimeout(() => {
			// get sorted obsels IDs
			if(!(this._sortedObselsIds[column][direction] instanceof Array))
				this._sortedObselsIds[column][direction] = this._getSortedObselIds(column, direction);

			let lastRow = null;

			// apply order
			for(let i = (this._sortedObselsIds[column][direction].length - 1); i >= 0 ; i--) {
				let obselId = this._sortedObselsIds[column][direction][i];
				let obselEntryRow = this._table.querySelector("tr.obsel-entry-row#" + CSS.escape(obselId));

				if(obselEntryRow) {
					let obselRows = [obselEntryRow];
					let obselNextRow = obselEntryRow.nextSibling;

					while(obselNextRow && (obselNextRow.tagName == "TR") && !obselNextRow.classList.contains("obsel-entry-row")) {
						obselRows.push(obselNextRow);
						obselNextRow = obselNextRow.nextSibling;
					}

					let nextObselEntryRow = null;

					if(i < (this._sortedObselsIds[column][direction].length - 1)) {
						let nextObselId = this._sortedObselsIds[column][direction][i + 1];
						nextObselEntryRow = this._table.querySelector("tr.obsel-entry-row#" + CSS.escape(nextObselId));

						if(!nextObselEntryRow)
							throw new Error("Cannot find expected entry row for obsel #" + nextObselId);
					}
					
					let rowToInsertBefore = nextObselEntryRow;
					
					for(let j = (obselRows.length - 1); j >= 0; j--) {
						let movedRow = obselRows[j];

						if(movedRow.classList.contains("overflow"))
							movedRow.classList.remove("overflow");

						this._tableBody.insertBefore(movedRow, rowToInsertBefore);

						let attributeRowIsEven = ((i % 2) == 0)?((j % 2) == 0):((j % 2) == 1);
						
						if(attributeRowIsEven) {
							if(movedRow.classList.contains("odd"))
								movedRow.classList.remove("odd");

							if(!movedRow.classList.contains("even"))
								movedRow.classList.add("even");
						}
						else {
							if(movedRow.classList.contains("even"))
								movedRow.classList.remove("even");

							if(!movedRow.classList.contains("odd"))
								movedRow.classList.add("odd");
						}

						if(!lastRow)
							lastRow = movedRow;

						rowToInsertBefore = movedRow;
					}
				}
			}

			this._tableContainer.scrollTop = 0;
			
			if(lastRow) {
				this._firstUnhiddenRowIndex = 1;
				this._lastUnhiddenRowIndex = lastRow.rowIndex;
			}
			
			this._onTableViewChanged();

			// hide wait message and show table
			if(this._tableContainer.classList.contains("pending"))
				this._tableContainer.classList.remove("pending");

			this._sortTableTaskID = null;
		});
	}

	/**
	 *  @TODO : benchmarker, compter les appels => optimiser si nécessaire (système de mise en cache/invalidation du cache)
	 */
	_getTableViewData() {
		if(this._latestTableViewData == null) {
			this._latestTableViewData = {};

			// find number of obsel data rows (= without header and footer) in the table
			let headerRowsCount = 1;
			let footerRowsCount = 1;
			this._latestTableViewData.totalObselRowsCount = this._table.rows.length - (headerRowsCount + footerRowsCount);

			if(this._latestTableViewData.totalObselRowsCount > 0) {
				this._latestTableViewData.firstObselDataRow = this._table.rows[headerRowsCount];
				this._latestTableViewData.lastObselDataRow = this._table.rows[headerRowsCount + this._latestTableViewData.totalObselRowsCount - 1];
				this._latestTableViewData.firstUnhiddenObselDataRow = this._table.rows[this._firstUnhiddenRowIndex];
				this._latestTableViewData.lastUnhiddenObselDataRow = this._table.rows[this._lastUnhiddenRowIndex];
			}
			else {
				this._latestTableViewData.firstObselDataRow = null;
				this._latestTableViewData.lastObselDataRow = null;
				this._latestTableViewData.firstUnhiddenObselDataRow = null;
				this._latestTableViewData.lastUnhiddenObselDataRow = null;
			}

			let tableContainerBoundingClientRect = this._tableContainer.getBoundingClientRect();

			this._latestTableViewData.tableBodyHeight = this._tableBody.clientHeight;

			let tableContainerAbsoluteTop = tableContainerBoundingClientRect.top;
			let tableContainerAbsoluteBottom = tableContainerBoundingClientRect.bottom;

			let tableHeaderBoundingClientRect = this._tableHeader.getBoundingClientRect();
			this._latestTableViewData.tableHeaderAbsoluteBottom = tableContainerAbsoluteTop + tableHeaderBoundingClientRect.height;
			
			let tableFooterBoundingClientRect = this._tableFooter.getBoundingClientRect();
			let tableFooterAbsoluteTop = tableContainerAbsoluteBottom - tableFooterBoundingClientRect.height;

			this._latestTableViewData.visibleBodyHeight = Math.max(tableFooterAbsoluteTop - this._latestTableViewData.tableHeaderAbsoluteBottom, 0);
			this._latestTableViewData.scrollableHeight = Math.max((this._latestTableViewData.tableBodyHeight - this._latestTableViewData.visibleBodyHeight), 0);
			this._latestTableViewData.topScrollableHeight = this._tableContainer.scrollTop;
			this._latestTableViewData.bottomScrollableHeight =  Math.max((this._latestTableViewData.scrollableHeight - this._latestTableViewData.topScrollableHeight), 0);

			if((this._latestTableViewData.visibleBodyHeight > 0) && (this._firstUnhiddenRowIndex != null) && (this._lastUnhiddenRowIndex != null)) {
				let firstVisibleRow;

				for(let i = this._firstUnhiddenRowIndex; i <= this._lastUnhiddenRowIndex; i++) {
					let aRow = this._table.rows[i];
					let aRowBoundingClientRect = aRow.getBoundingClientRect();

					if(aRowBoundingClientRect.bottom  >= this._latestTableViewData.tableHeaderAbsoluteBottom) {
						firstVisibleRow = aRow;
						break;
					}
				}

				this._latestTableViewData.firstVisibleRow = firstVisibleRow;

				if(firstVisibleRow) {
					// find visible ratio of firstVisibleRow
					let firstVisibleRowBoundingRect = firstVisibleRow.getBoundingClientRect();
					let firstVisibleRowVisibleHeight = Math.min(firstVisibleRowBoundingRect.height, firstVisibleRowBoundingRect.bottom - this._latestTableViewData.tableHeaderAbsoluteBottom);
					this._latestTableViewData.firstVisibleRowRatio = firstVisibleRowVisibleHeight.toFixed(1) / firstVisibleRowBoundingRect.height.toFixed(1);
				}
				else
					this._latestTableViewData.firstVisibleRowRatio = 0;

				let lastVisibleRow;

				//console.log("-----------------------------------");

				for(let i = this._lastUnhiddenRowIndex; i >= this._firstUnhiddenRowIndex; i--) {
					let aRow = this._table.rows[i];
					//console.log("i=" + i + " => row.id=" + aRow.id);
					let aRowBoundingClientRect = aRow.getBoundingClientRect();

					if(aRowBoundingClientRect.top  <= tableFooterAbsoluteTop) {
						lastVisibleRow = aRow;
						break;
					}
				}

				//console.log("-----------------------------------");

				this._latestTableViewData.lastVisibleRow = lastVisibleRow;

				if(lastVisibleRow) {
					// find visible ratio of lastVisibleRow
					let lastVisibleRowBoundingRect = lastVisibleRow.getBoundingClientRect();
					let lastVisibleRowVisibleHeight = Math.min(lastVisibleRowBoundingRect.height, (tableFooterAbsoluteTop + 1) - lastVisibleRowBoundingRect.top);
					this._latestTableViewData.lastVisibleRowRatio = lastVisibleRowVisibleHeight / lastVisibleRowBoundingRect.height;
				}
				else
					this._latestTableViewData.lastVisibleRowRatio = 0;
			}
			else {
				this._latestTableViewData.firstVisibleRow = null;
				this._latestTableViewData.firstVisibleRowRatio = 0;
				this._latestTableViewData.lastVisibleRow = null;
				this._latestTableViewData.lastVisibleRowRatio = 0;
			}
		}

		return this._latestTableViewData;
	}

	/**
	 * 
	 */
	_onTableViewChanged() {
		this._invalidateLatestTableViewData();

		if(this._updateOverflowRowsTaskID) {
			clearTimeout(this._updateOverflowRowsTaskID);
			this._updateOverflowRowsTaskID = null;
		}

		let tableViewData = this._getTableViewData();

		/*console.log("tableViewData = ");
		console.log(tableViewData);*/

		if(tableViewData.firstVisibleRow && tableViewData.lastVisibleRow) {
			this._updateScrollBar(tableViewData);

			this._updateOverflowRowsTaskID = setTimeout(() => {
				let tableViewData = this._getTableViewData();
				let firstVisibleRowTopBefore = tableViewData.firstVisibleRow.getBoundingClientRect().top;
				this._updateOverflowRows(tableViewData.firstVisibleRow, firstVisibleRowTopBefore, tableViewData.lastVisibleRow);
				this._updateOverflowRowsTaskID = null;
			}, 100);
		}
	}

	_invalidateLatestTableViewData() {
		this._latestTableViewData = null;
	}

	/**
	 * 
	 */
	_onTableContainerScrolled() {
		if(
				!this._scrollBarHandleIsDragged() 
			&& 	!this._scrollTopButtonPressedIntervalID 
			&& 	!this._scrollBottomButtonPressedIntervalID
			&&	!this._scrollBarMouseDownIntervalID
			&&	(this._resquestedScroll == 0)
		) {
			this._resetScrollControl();
			this._onTableViewChanged();
		}
	}

	/**
	 * 
	 */
	_dateToTimeStamp(dateString) {
		return (new Date(dateString).getTime());
	}

	/**
	 * 
	 */
	_reloadObsels() {
		if(!this._tableContainer.classList.contains("pending"))
			this._tableContainer.classList.add("pending");

		this._ktbsResource.force_state_refresh();

		this._ktbsResource.get()
			.then(function() {
				this.onktbsResourceLoaded();
			}.bind(this))
			.catch(function(error) {
				this.onktbsResourceLoadFailed(error);
			}.bind(this));
	}

	/**
	 * 
	 */
	formatTimeStampToDate(timestamp) {
		let date = new Date(timestamp);
		return date.getFullYear() 
				+ "/" + (date.getMonth() + 1).toString().padStart(2, "0") 
				+ "/" + date.getDate().toString().padStart(2, "0")
				+ " - " + date.getHours().toString().padStart(2, "0") 
				+ ":" + date.getMinutes().toString().padStart(2, "0")
				+ ":" + date.getSeconds().toString().padStart(2, "0")
				+ ":" + date.getMilliseconds().toString().padStart(3, "0");
	}

	/**
	 * 
	 */
	_getObselFragment(obsel, isEven, isOverflow) {
		let obselFragment = document.createDocumentFragment();
		let tableRow = document.createElement("tr");
		tableRow.classList.add("obsel-entry-row");

		if(isEven)
			tableRow.classList.add("even");
		else
			tableRow.classList.add("odd");

		if(isOverflow)
			tableRow.classList.add("overflow");

		tableRow.setAttribute("id", obsel.id);

		let tableCellSelect = document.createElement("td");
		tableCellSelect.classList.add("checkbox_cell");
		let checkBox = document.createElement("input");
		checkBox.setAttribute("type", "checkbox");
		checkBox.setAttribute("name", "selected_obsels");
		checkBox.setAttribute("value", obsel.id);
		checkBox.setAttribute("title", this._translateString("Select/Unselect this obsel"));
		tableCellSelect.appendChild(checkBox);
		tableRow.appendChild(tableCellSelect);

		let tableCellId = document.createElement("td");
		let obselLink = document.createElement("a");
		obselLink.setAttribute("target", "_blank");
		obselLink.setAttribute("title", this._translateString("See this obsel in the REST console (opens in a new tab)"));
		obselLink.setAttribute("href", obsel.uri);
		obselLink.classList.add("obsel-link");
		obselLink.innerText = obsel.id;
		tableCellId.appendChild(obselLink);
		tableRow.appendChild(tableCellId);
		
		let tableCellType = document.createElement("td");
		tableCellType.classList.add("obsel-type-cell");
		let obselType = obsel.type;

        if(obselType) {
			let obselTypeLabel;
            let obselTypeTranslatedLabel = obselType.get_translated_label(this._lang);

            if(obselTypeTranslatedLabel)
                obselTypeLabel = obselTypeTranslatedLabel;
            else
				obselTypeLabel = obselType.label?obselType.label:obselType.id;
				
			let obselTypeColor = obselType.suggestedColor;

			if(obselTypeColor)
				tableCellType.style.color = obselTypeColor;

			let obselTypeSymbol = obselType.suggestedSymbol;

			if(obselTypeSymbol) {
				let obselTypeSymbolSpan = document.createElement("span");
				obselTypeSymbolSpan.classList.add("obseltype-symbol");
				obselTypeSymbolSpan.innerHTML = JSSpecialCharToHTMLHex(obselTypeSymbol);
				tableCellType.appendChild(obselTypeSymbolSpan);
			}

			let obselTypeLabelSpan = document.createElement("span");
			obselTypeLabelSpan.innerText += " " + obselTypeLabel;
			tableCellType.appendChild(obselTypeLabelSpan);
        }
        else
			tableCellType.innerText = obsel.type_id;
		
		tableRow.appendChild(tableCellType);

		let tableCellSubject = document.createElement("td");

		if((obsel.subject != null) && (obsel.subject != undefined))
			tableCellSubject.innerText = obsel.subject;

		tableRow.appendChild(tableCellSubject);

		let tableCellBegin = document.createElement("td");
		tableCellBegin.innerText = this.formatTimeStampToDate(obsel.begin);
		tableRow.appendChild(tableCellBegin);

		let tableCellEnd = document.createElement("td");
		tableCellEnd.innerText = this.formatTimeStampToDate(obsel.end);
		tableRow.appendChild(tableCellEnd);

		let obsel_attributes = obsel.attributes;

		if(obsel_attributes.length > 0) {
			let obsel_attribute = obsel_attributes[0];
			let attributeTypeCell = document.createElement("td");
			let attributeType = obsel_attribute.type;
			let attributeTypeLabel;

            if(attributeType) {
                let attributeTypeTranslatedLabel = attributeType.get_translated_label(this._lang);

                if(attributeTypeTranslatedLabel)
                    attributeTypeLabel = attributeTypeTranslatedLabel;
                else {
                    let attributeTypeDefaultLabel = attributeType.label;

                    if(attributeTypeDefaultLabel)
                        attributeTypeLabel = attributeTypeDefaultLabel;
                    else
                        attributeTypeLabel = obsel_attribute.type_id;
                }
            }
            else
                attributeTypeLabel = obsel_attribute.type_id;

			attributeTypeCell.classList.add("attribute-type-cell");
			attributeTypeCell.innerText = attributeTypeLabel;
			tableRow.appendChild(attributeTypeCell);
			
			let attributeValueCell = document.createElement("td");
			attributeValueCell.classList.add("attribute-value-cell");
			attributeValueCell.innerText = obsel_attribute.value;
			tableRow.appendChild(attributeValueCell);

			tableCellSelect.setAttribute("rowspan", obsel_attributes.length);
			tableCellId.setAttribute("rowspan", obsel_attributes.length);
			tableCellType.setAttribute("rowspan", obsel_attributes.length);
			tableCellSubject.setAttribute("rowspan", obsel_attributes.length);
			tableCellBegin.setAttribute("rowspan", obsel_attributes.length);
			tableCellEnd.setAttribute("rowspan", obsel_attributes.length);

			obselFragment.appendChild(tableRow);

			for(let i = 1; i < obsel_attributes.length; i++) {
				let obsel_attribute = obsel_attributes[i];
				let attributeRow = document.createElement("tr");

				if(isOverflow)
					attributeRow.classList.add("overflow");

				if(isEven) {
					if((i % 2) == 0)
						attributeRow.classList.add("even");
					else
						attributeRow.classList.add("odd");
				}
				else {
					if((i % 2) == 0)
						attributeRow.classList.add("odd");
					else
						attributeRow.classList.add("even");
				}

				let attributeTypeCell = document.createElement("td");
				let attributeType = obsel_attribute.type;
				let attributeTypeLabel;
	
				if(attributeType) {
					let attributeTypeTranslatedLabel = attributeType.get_translated_label(this._lang);
	
					if(attributeTypeTranslatedLabel)
						attributeTypeLabel = attributeTypeTranslatedLabel;
					else {
						let attributeTypeDefaultLabel = attributeType.label;
	
						if(attributeTypeDefaultLabel)
							attributeTypeLabel = attributeTypeDefaultLabel;
						else
							attributeTypeLabel = obsel_attribute.type_id;
					}
				}
				else
					attributeTypeLabel = obsel_attribute.type_id;
	
				attributeTypeCell.innerText = attributeTypeLabel;
				attributeTypeCell.classList.add("attribute-type-cell");
				attributeRow.appendChild(attributeTypeCell);
				
				let attributeValueCell = document.createElement("td");
				attributeValueCell.innerText = obsel_attribute.value;
				attributeValueCell.classList.add("attribute-value-cell");
				attributeRow.appendChild(attributeValueCell);
	
				obselFragment.appendChild(attributeRow);
			}
		}
		else {
			let emptyAttributeTypeCell = document.createElement("td");
			tableRow.appendChild(emptyAttributeTypeCell);
			let emptyAttributeValueCell = document.createElement("td");
			tableRow.appendChild(emptyAttributeValueCell);
			obselFragment.appendChild(tableRow);
		}

		return obselFragment;
	}

	/**
	 * 
	 */
	onktbsResourceLoaded() {
		this._trace_model = this._ktbsResource.model;

		this._componentReady.then(() => {
			while(this._tableBody.firstChild)
				this._tableBody.removeChild(this._tableBody.firstChild);
		});

		this._obselList = this._ktbsResource.obsel_list;

		this._allObselsLoaded = new Promise((resolve, reject) => {
			this._resolveAllObselsLoaded = resolve;
			this._rejectAllObselsLoaded = reject;
		});
		
		let firstObselPage = this._obselList.get_first_page(100);

		firstObselPage.get(this._obselsLoadingAbortController.signal)
			.then((response) => {
				this._onObselListPageRead(firstObselPage);
			})
			.catch((error) => {
				if((error.name != "AbortError") || !this._obselsLoadingAbortController.signal.aborted)
					this._onObselListPageReadFailed(error);
			});

		this._allObselsLoaded
			.then(() => {
				this._componentReady.then(() => {
					if(this._tableContainer.classList.contains("error"))
						this._tableContainer.classList.remove("error");

					if(this._errorMessageDiv.innerText && (this._errorMessageDiv.innerText != ""))
						this._errorMessageDiv.innerText = "";

					if(this._tableContainer.classList.contains("pending"))
						this._tableContainer.classList.remove("pending");
				});
			});
	}

	/**
	 * 
	 */
	_onObselListPageRead(obselsListPage) {
		if(!this._obselsLoadingAbortController.signal.aborted) {
			this._componentReady.then(() => {
				this._trace_model.get().finally(() => {
					setTimeout(() => {
						let obselRowsFragment = document.createDocumentFragment();
						let obsels = obselsListPage.obsels;
						this._obselsData = this._obselsData.concat(obsels);
						let currentVisibleLinesCount = this._tableBody.querySelectorAll("tr:not(.overflow").length;
						
						for(let i = 0; i < obsels.length; i++) {
							let anObsel = obsels[i];
							let obselEntryIsOverflow = (currentVisibleLinesCount > this._maxVisibleRows);
							let anObselFragment = this._getObselFragment(anObsel, ((i%2) == 0), obselEntryIsOverflow);

							if(!obselEntryIsOverflow) {
								if(this._firstUnhiddenRowIndex == null)
									this._firstUnhiddenRowIndex
							}

							currentVisibleLinesCount += anObselFragment.querySelectorAll("tr:not(.overflow").length;
							obselRowsFragment.appendChild(anObselFragment);
						}

						this._tableBody.appendChild(obselRowsFragment);

						if(this._firstUnhiddenRowIndex == null)
							this._firstUnhiddenRowIndex = 1;

						if(this._lastUnhiddenRowIndex == null)
							this._lastUnhiddenRowIndex = currentVisibleLinesCount;

						this._onTableViewChanged();
					});
				});
			});
			
			let nextPage = obselsListPage.next_page;

			if(!nextPage) {
				setTimeout(() => {
					this._resolveAllObselsLoaded();
				});
			}
			else {
				setTimeout(() => {
					if(!this._obselsLoadingAbortController.signal.aborted)
						nextPage.get(this._obselsLoadingAbortController.signal)
							.then(() => {
								if(!this._obselsLoadingAbortController.signal.aborted)
									this._onObselListPageRead(nextPage);
							})
							.catch((error) => {
								if(!(error instanceof DOMException) && (error.name !== "AbortError") && !this._obselsLoadingAbortController.signal.aborted)
									this._onObselListPageReadFailed(error);
							});
				});
			}
		}
	}

	/**
	 * 
	 */
	_onObselListPageReadFailed(error) {
		this._obselsLoadingAbortController.abort();

		this._componentReady.then(() => {
			/*this._obselsLoadControlButton.setAttribute("title", this._translateString("Reload"));
			this._loadingStatusIcon.setAttribute("title", this._translateString("Error : ") + error);
			this._obselsLoadingIndications.className = "error";*/
			this._rejectAllObselsLoaded(error);
		});
	}

	/**
	 * 
	 */
	onktbsResourceLoadFailed(error) {
		super.onktbsResourceLoadFailed(error);

		this._componentReady.then(() => {
			this._errorMessageDiv.innerText = this._translateString("Error") + " (" + error.message + ")";;

			if(!this._tableContainer.classList.contains("error"))
				this._tableContainer.classList.add("error");

			if(this._tableContainer.classList.contains("pending"))
				this._tableContainer.classList.remove("pending");
		});
	}

	/**
	 * 
	 */
	_getKtbsResourceClass() {
		return Trace;
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this._tableHeaderIdLabel.innerText = this._translateString("@id");
		this._tableHeaderTypeLabel.innerText = this._translateString("Obsel type");
		this._tableHeaderSubjectLabel.innerText = this._translateString("Subject");
		this._tableHeaderBeginLabel.innerText = this._translateString("Begin");
		this._tableHeaderEndLabel.innerText = this._translateString("End");
		this._tableHeaderAttributesTypeLabel.innerText = this._translateString("Attribute");
		this._tableHeaderAttributesValueLabel.innerText = this._translateString("Value");
		this._waitMessageContent.innerText = this._translateString("Please wait...");
		let obselLinks = this._tableBody.querySelectorAll(".obsel-link");
		this._toggleFullscreenButton.setAttribute("title", this._translateString("Toggle fullscreen"));

		for(let i = 0; i < obselLinks.length; i++)
			obselLinks[i].setAttribute("title", this._translateString("See this obsel in the REST console (opens in a new tab)"));

		if(this._ktbsResource.syncStatus == "in_sync")
			this.onktbsResourceLoaded();
	}

	/**
	 * 
	 */
	_onClickToggleFullscreenButton(event) {
		event.stopPropagation();

		if(this._allowFullScreen) {
			if(document.fullscreenElement === null) {
				if(this.dispatchEvent(new Event("request-fullscreen", {cancelable: true})))
					this._widgetContainer.requestFullscreen();
			}
			else
				document.exitFullscreen();
		}
	}

	/**
	 * 
	 */
	_setObselRowOverflow(aRow) {
		if(!aRow.classList.contains("overflow"))
			aRow.classList.add("overflow");

		let nextRow = aRow.nextSibling;

		while((nextRow != null) && (!nextRow.classList.contains("obsel-entry-row"))) {
			if(!nextRow.classList.contains("overflow"))
				nextRow.classList.add("overflow");

			nextRow = nextRow.nextSibling;
		}
	}

	/**
	 * 
	 */
	_unsetObselRowOverflow(aRow) {
		if(aRow.classList.contains("overflow"))
			aRow.classList.remove("overflow");
		
		let nextRow = aRow.nextSibling;

		while((nextRow != null) && (!nextRow.classList.contains("obsel-entry-row"))) {
			if(nextRow.classList.contains("overflow"))
				nextRow.classList.remove("overflow");

			nextRow = nextRow.nextSibling;
		}
	}

	/**
	 * @TODO : benchmarker, puis optimiser si nécessaire
	 */
	_updateOverflowRows(firstVisibleRow, firstVisibleRowTop, lastVisibleRow) {
		// unhide rows in the visible range, if any is hidden
		for(let i = firstVisibleRow.rowIndex; i <= lastVisibleRow.rowIndex; i++) {
			let aRow = this._table.rows[i];

			if(aRow.classList.contains("overflow") && aRow.classList.contains("obsel-entry-row"))
				this._unsetObselRowOverflow(aRow);
		}

		// unhide rows immediatly above minVisibleRank and below maxVisibleRank
		let topRow = firstVisibleRow;
		let bottomRow = lastVisibleRow;
		this._firstUnhiddenRowIndex = topRow.rowIndex;
		this._lastUnhiddenRowIndex = bottomRow.rowIndex;
		let visibleRowsCount = this._lastUnhiddenRowIndex - this._firstUnhiddenRowIndex + 1;
		
		while((topRow || bottomRow) && (visibleRowsCount <= this._maxVisibleRows)) {
			if(topRow) {
				topRow = topRow.previousSibling;

				while(topRow && !(topRow.classList && topRow.classList.contains("obsel-entry-row")))
					topRow = topRow.previousSibling;

				if(topRow && topRow.classList) {
					if(topRow.classList.contains("overflow"))
						this._unsetObselRowOverflow(topRow);

					this._firstUnhiddenRowIndex = topRow.rowIndex;
					visibleRowsCount = this._lastUnhiddenRowIndex - this._firstUnhiddenRowIndex + 1;
				}
			}

			if(bottomRow && (visibleRowsCount <= this._maxVisibleRows)) {
				bottomRow = bottomRow.nextSibling;

				while(bottomRow && !(bottomRow.classList && bottomRow.classList.contains("obsel-entry-row")))
					bottomRow = bottomRow.nextSibling;

				if(bottomRow && bottomRow.classList) {
					if(bottomRow.classList.contains("overflow")) {
						this._unsetObselRowOverflow(bottomRow);
						this._lastUnhiddenRowIndex = bottomRow.rowIndex;
					}

					while(bottomRow.nextSibling && !bottomRow.nextSibling.classList.contains("obsel-entry-row")) {
						bottomRow = bottomRow.nextSibling;
						this._lastUnhiddenRowIndex = bottomRow.rowIndex;
					}
					
					visibleRowsCount = this._lastUnhiddenRowIndex - this._firstUnhiddenRowIndex + 1;
				}
			}
		}

		// hide non-overflow rows that are above new minVisibleRank and below new maxVisibleRank
		let visibleObselEntryRowsQueryString = ":not(.overflow).obsel-entry-row";
		let visibleObselEntryRows = this._tableBody.querySelectorAll(visibleObselEntryRowsQueryString);
		
		for(let i = 0; i < visibleObselEntryRows.length; i++) {
			let aRow = visibleObselEntryRows[i];

			if((aRow.rowIndex < this._firstUnhiddenRowIndex) || (aRow.rowIndex > this._lastUnhiddenRowIndex))
				this._setObselRowOverflow(aRow);
		}

		// re-position scrollTop if necessary, so the manipulations are invisible to the user and Firefox doesn't trigger an infinite callbacks loop
		let firstVisibleRowTopAfter = firstVisibleRow.getBoundingClientRect().top;

		if(firstVisibleRowTopAfter != firstVisibleRowTop)
			this._tableContainer.scrollTop += (firstVisibleRowTopAfter - firstVisibleRowTop);

		this._invalidateLatestTableViewData();

		let topFin = performance.now();
	}

	/**
	 * 
	 */
	_updateScrollBar(tableViewData) {
		// 
		let topLimit = tableViewData.firstVisibleRow.rowIndex + (1 - tableViewData.firstVisibleRowRatio);
		let bottomLimit = tableViewData.lastVisibleRow.rowIndex + tableViewData.lastVisibleRowRatio;

		// 
		let topLimitPercentage = ((topLimit - tableViewData.firstObselDataRow.rowIndex) / tableViewData.totalObselRowsCount) * 100;
		let bottomLimitPercentage = ((bottomLimit - tableViewData.firstObselDataRow.rowIndex) / tableViewData.totalObselRowsCount) * 100;
		let visiblePercentage = ((bottomLimit - topLimit) / tableViewData.totalObselRowsCount) * 100;

		// update whole scroll tools enabled state
		if(((visiblePercentage >= 100) || (visiblePercentage <= 0))) {
			if(this._widgetContainer.classList.contains("scrollable"))
				this._widgetContainer.classList.remove("scrollable");
		}
		else {
			// set scrollbar handl's height
			this._scrollBarHandle.style.height = visiblePercentage + "%";
			let scrollBarHeight = this._scrollBar.clientHeight;
			let theoreticalScrollBarHandleHeight = Math.round((visiblePercentage * scrollBarHeight) / 100);
			let realScrollBarHandleHeight = this._scrollBarHandle.clientHeight;
			let scrollBarHandleHeightDelta = realScrollBarHandleHeight - theoreticalScrollBarHandleHeight;

			// set scollbar handle's top position
			let scrollBarHandleTop = ((scrollBarHeight - scrollBarHandleHeightDelta) * topLimitPercentage) / 100;
			this._scrollBarHandle.style.top = scrollBarHandleTop + "px";

			// update scroll buttons enabled state
			this._scrollTopButton.disabled = (topLimitPercentage <= 0);
			this._scrollBottomButton.disabled = (bottomLimitPercentage >= 100);

			if(!this._widgetContainer.classList.contains("scrollable"))
				this._widgetContainer.classList.add("scrollable");
		}
	}

	/**
	 * 
	 */
	_onScrollBarMouseWheel(event) {
		if(this._widgetContainer.classList.contains("scrollable")) {
			let verticalMovement = event.deltaY;
			let tableViewData = this._getTableViewData();
			
			if(
				(
						(verticalMovement < 0)
					&&	(
							(this._tableContainer.scrollTop > 0)
						||	(tableViewData.firstVisibleRow != tableViewData.firstObselDataRow)
					)
				)
				||	(
						(verticalMovement > 0)
					&&	(
							(this._tableContainer.scrollTop < Math.floor(this._tableBody.getBoundingClientRect().height - tableViewData.visibleBodyHeight))
						||	(tableViewData.lastVisibleRow != tableViewData.lastObselDataRow)
					)
				)
			) {
				event.preventDefault();	
				let tableViewData = this._getTableViewData();
				let visibleTopLimit = tableViewData.firstVisibleRow.rowIndex + (1 - tableViewData.firstVisibleRowRatio);
				let visibleBottomLimit = tableViewData.lastVisibleRow.rowIndex + tableViewData.lastVisibleRowRatio;
				let visibleRowsCount = visibleBottomLimit - visibleTopLimit;
				let averageRowHeight = tableViewData.visibleBodyHeight / visibleRowsCount;
				let extrapolatedTotalTableHeight = tableViewData.totalObselRowsCount * averageRowHeight;
				let extrapolatedScrollableHeight = extrapolatedTotalTableHeight - tableViewData.visibleBodyHeight;
				let tableHeightScrollStepsCount = Math.ceil(extrapolatedScrollableHeight / 17.5);
				let stepsPerInterval =  Math.max(Math.ceil(tableHeightScrollStepsCount / 20), 1);

				let movementUnit = event.deltaMode;

				if(movementUnit == 0)
					verticalMovement = Math.round(verticalMovement / 69);
				else
					verticalMovement = verticalMovement / 3;

				this._requestIncrementScroll(verticalMovement * stepsPerInterval);
			}
		}
	}

	/**
	 * 
	 */
	_onScrollBarMouseMove(event) {
		if(this._scrollBarMouseDownIntervalID) {
			this._latestScrollBarMouseOffsetY = event.offsetY;
			this._latestScrollBarMouseClientY = event.clientY;
		}
	}

	/**
	 * 
	 */
	_onScrollBarMouseLeave(event) {
		if(this._scrollBarMouseDownIntervalID)
			this._resetScrollControl();
	}

	/**
	 * 
	 */
	_onScrollBarMouseDown(event) {
		if((event.target == this._scrollBar) && this._widgetContainer.classList.contains("scrollable")) {
			event.preventDefault();
			this._resetScrollControl();
			this._latestScrollBarMouseOffsetY = event.offsetY;
			this._latestScrollBarMouseClientY = event.clientY;
			let scrollBarHandleRelativeTop = this._scrollBarHandle.getBoundingClientRect().top - this._scrollBar.getBoundingClientRect().top;
			let scrollBarHandleRelativeBottom = this._scrollBarHandle.getBoundingClientRect().bottom - this._scrollBar.getBoundingClientRect().top;

			let tableViewData = this._getTableViewData();
			let visibleTopLimit = tableViewData.firstVisibleRow.rowIndex + (1 - tableViewData.firstVisibleRowRatio);
			let visibleBottomLimit = tableViewData.lastVisibleRow.rowIndex + tableViewData.lastVisibleRowRatio;
			let visibleRowsCount = visibleBottomLimit - visibleTopLimit;
			let averageRowHeight = tableViewData.visibleBodyHeight / visibleRowsCount;
			let extrapolatedTotalTableHeight = tableViewData.totalObselRowsCount * averageRowHeight;
			let extrapolatedScrollableHeight = extrapolatedTotalTableHeight - tableViewData.visibleBodyHeight;
			let tableHeightScrollStepsCount = Math.ceil(extrapolatedScrollableHeight / 17.5);
			let stepsPerInterval =  Math.max(Math.ceil(tableHeightScrollStepsCount / 20), 1);
			
			if(this._latestScrollBarMouseOffsetY < scrollBarHandleRelativeTop)
				this._requestIncrementScroll(-stepsPerInterval);
			else if(this._latestScrollBarMouseOffsetY > scrollBarHandleRelativeBottom)
				this._requestIncrementScroll(stepsPerInterval);

			this._scrollBar.addEventListener("mouseleave", this._bindedOnScrollBarMouseLeaveFunction);
			this._scrollBar.addEventListener("mousemove", this._bindedOnScrollBarMouseMoveFunction);

			if(this._scrollBarMouseDownIntervalID)
				clearInterval(this._scrollBarMouseDownIntervalID);
		
			this._scrollBarMouseDownIntervalID = setInterval(() => {
				let scrollBarHandleRelativeTop = this._scrollBarHandle.getBoundingClientRect().top - this._scrollBar.getBoundingClientRect().top;
				let scrollBarHandleRelativeBottom = this._scrollBarHandle.getBoundingClientRect().bottom - this._scrollBar.getBoundingClientRect().top;
			
				if(this._latestScrollBarMouseOffsetY < scrollBarHandleRelativeTop)
					this._requestIncrementScroll(-stepsPerInterval);
				else if(this._latestScrollBarMouseOffsetY > scrollBarHandleRelativeBottom)
					this._requestIncrementScroll(stepsPerInterval);
				else {
					this._resetScrollControl();
					this._scrollBarHandle.classList.add("dragged");
					this._scrollBarHandleDragOrigin = this._latestScrollBarMouseClientY;
					let scrollBarHandleTopValue = this._scrollBarHandle.style.top;
					this._scrollBarHandleOrigin = parseFloat(scrollBarHandleTopValue.substring(0, scrollBarHandleTopValue.length - 2));
					this._tableViewDataAtDragScrollbarBegin = this._getTableViewData();
					window.document.addEventListener("mousemove", this._bindedOnDragScrollbarFunction, true);
				}
			}, 30);
		}
	}

	/**
	 * 
	 */
	_requestIncrementScroll(requestedSteps) {
		if(
				((requestedSteps > 0) && (this._resquestedScroll < 0))
			||	((requestedSteps < 0) && (this._resquestedScroll > 0))
		)
			this._resquestedScroll = (17.5 * requestedSteps);
		else
			this._resquestedScroll += (17.5 * requestedSteps);

		if(this._requestIncrementScrollTaskId)
			clearTimeout(this._requestIncrementScrollTaskId);

		this._requestIncrementScrollTaskId = setTimeout(() => {
			if(this._resquestedScroll != 0) {
				let tableViewData = this._getTableViewData();

				if(
						(
								(this._resquestedScroll < 0) 
							&&	(
										(tableViewData.topScrollableHeight >= Math.abs(this._resquestedScroll))
									||	(tableViewData.firstUnhiddenObselDataRow == tableViewData.firstObselDataRow)
								)
						)
					||	(
								(this._resquestedScroll > 0)
							&&	(
										(tableViewData.bottomScrollableHeight >= this._resquestedScroll)
									||	(tableViewData.lastUnhiddenObselDataRow == tableViewData.lastObselDataRow)
								)
						)
				) {
					this._tableContainer.scrollTop += this._resquestedScroll;
					this._onTableViewChanged();
				}
				else {
					let currentTopRowIndex = tableViewData.firstVisibleRow.rowIndex;
					let currentTopRowRatio = tableViewData.firstVisibleRowRatio;
					let currentBottomRowIndex = tableViewData.lastVisibleRow.rowIndex;
					let currentBottomRowRatio = tableViewData.lastVisibleRowRatio;
					let currentTopLimit = currentTopRowIndex + (1 - currentTopRowRatio);
					let currentTopRowPosition = currentTopRowIndex + (1 - currentTopRowRatio);
					let currentBottomRowPosition = currentBottomRowIndex + currentBottomRowRatio;
					let currentlyVisibleDelta = currentBottomRowPosition - currentTopRowPosition;

					let unhiddenRowsCount = tableViewData.lastUnhiddenObselDataRow.rowIndex - tableViewData.firstUnhiddenObselDataRow.rowIndex + 1;
					let averageRowHeight = tableViewData.tableBodyHeight / unhiddenRowsCount;
					let extrapolatedRowOffset = this._resquestedScroll / averageRowHeight;
					let newTopLimit = currentTopLimit + extrapolatedRowOffset;

					if(newTopLimit < tableViewData.firstObselDataRow.rowIndex)
						newTopLimit = tableViewData.firstObselDataRow.rowIndex;

					if(newTopLimit > (tableViewData.lastObselDataRow.rowIndex + 1 - currentlyVisibleDelta))
						newTopLimit = (tableViewData.lastObselDataRow.rowIndex + 1 - currentlyVisibleDelta);

					let newTopRowIndex = Math.floor(newTopLimit);
					let newTopRowHiddenRatio = newTopLimit % 1;
					let newTopRow = this._table.rows[newTopRowIndex];
					let newTopRowTop = tableViewData.tableHeaderAbsoluteBottom - (newTopRowHiddenRatio * newTopRow.getBoundingClientRect().height);
					let newBottomLimit = newTopLimit + currentlyVisibleDelta;
					let newBottomRowIndex = Math.floor(newBottomLimit);
					let newBottomRow = this._table.rows[newBottomRowIndex];
					this._updateOverflowRows(newTopRow, newTopRowTop, newBottomRow);
					let newTableViewData = this._getTableViewData();
					this._updateScrollBar(newTableViewData);
				}

				this._resquestedScroll = 0;
			}

			this._requestIncrementScrollTaskId = null;
		});
	}

	/**
	 * 
	 */
	_onScrollTopButtonMouseDown(event) {
		event.preventDefault();
		this._resetScrollControl();
		this._requestIncrementScroll(-1);

		if(this._scrollTopButtonPressedIntervalID)
			clearInterval(this._scrollTopButtonPressedIntervalID);
		
		this._scrollTopButtonPressedIntervalID = setInterval(() => {
			if(this._tableContainer.scrollTop > 0)
				this._requestIncrementScroll(-1);
			else {
				let tableViewData = this._getTableViewData();

				if(tableViewData.firstVisibleRow == tableViewData.firstObselDataRow)
					this._resetScrollControl();
			}
		}, 30);
	}

	/**
	 * 
	 */
	_onScrollTopButtonMouseOut(event) {
		event.preventDefault();
		this._resetScrollControl();
	}

	/**
	 * 
	 */
	_onScrollBottomButtonMouseDown(event) {
		event.preventDefault();
		this._resetScrollControl();
		this._requestIncrementScroll(1);

		if(this._scrollBottomButtonPressedIntervalID)
			clearInterval(this._scrollBottomButtonPressedIntervalID);

		this._scrollBottomButtonPressedIntervalID = setInterval(() => {
			let tableViewData = this._getTableViewData();

			if(this._tableContainer.scrollTop < (this._table.getBoundingClientRect().height - tableViewData.visibleBodyHeight))
				this._requestIncrementScroll(1);
			else {
				if(tableViewData.lastVisibleRow == tableViewData.lastObselDataRow)
					this._resetScrollControl();
			}
		}, 30);
	}

	/**
	 * 
	 */
	_onScrollBottomButtonMouseOut(event) {
		event.preventDefault();
		this._resetScrollControl();
	}

	/**
	 * 
	 */
	_onScrollBarHandleMouseDown(event) {
		event.preventDefault();
		this._resetScrollControl();
		
		if(this._widgetContainer.classList.contains("scrollable") && !this._scrollBarHandleIsDragged()) {
			this._scrollBarHandle.classList.add("dragged");
			this._scrollBarHandleDragOrigin = event.clientY;
			let scrollBarHandleTopValue = this._scrollBarHandle.style.top;
			this._scrollBarHandleOrigin = parseFloat(scrollBarHandleTopValue.substring(0, scrollBarHandleTopValue.length - 2));
			this._tableViewDataAtDragScrollbarBegin = this._getTableViewData();
			window.document.addEventListener("mousemove", this._bindedOnDragScrollbarFunction, true);
		}
	}

	/**
	 * 
	 */
	_onDragScrollbar(event) {
		event.preventDefault();

		if(this._tableViewDataAtDragScrollbarBegin.firstVisibleRow && this._tableViewDataAtDragScrollbarBegin.lastVisibleRow) {
			// calculate new scrollbar handle position
			let mouseYDelta = event.clientY - this._scrollBarHandleDragOrigin;
			let newScrollBarHandleTop = this._scrollBarHandleOrigin + mouseYDelta;
			let scrollBarHandleRealHeight = this._scrollBarHandle.getBoundingClientRect().height;
			let scrollBarHeight = this._scrollBar.clientHeight;

			// limit new scrollbar handle position so it doesn't go out of the the scrollbar
			if(newScrollBarHandleTop < 0) // limit at top
				newScrollBarHandleTop = 0;
			else if((newScrollBarHandleTop + scrollBarHandleRealHeight) > scrollBarHeight) // limit at bottom
				newScrollBarHandleTop = scrollBarHeight - scrollBarHandleRealHeight;

			// move scrollbar handle to it's new position
			this._scrollBarHandle.style.top = newScrollBarHandleTop + "px";

			// update scroll buttons enabled/disabled state according to the new scrollbar handle's position
			this._scrollTopButton.disabled = (newScrollBarHandleTop <= 0);
			this._scrollBottomButton.disabled = ((newScrollBarHandleTop + scrollBarHandleRealHeight) >= scrollBarHeight);

			if(this._updateOverflowRowsTaskID != null)
				clearTimeout(this._updateOverflowRowsTaskID);

			this._updateOverflowRowsTaskID = setTimeout(() => {
				let currentTopRowIndex = this._tableViewDataAtDragScrollbarBegin.firstVisibleRow.rowIndex;
				let currentTopRowRatio = this._tableViewDataAtDragScrollbarBegin.firstVisibleRowRatio;
				let currentBottomRowIndex = this._tableViewDataAtDragScrollbarBegin.lastVisibleRow.rowIndex;
				let currentBottomRowRatio = this._tableViewDataAtDragScrollbarBegin.lastVisibleRowRatio;

				// calculate the visible number of lines
				let currentTopRowPosition = currentTopRowIndex + (1 - currentTopRowRatio);
				let currentBottomRowPosition = currentBottomRowIndex + currentBottomRowRatio;
				let currentlyVisibleDelta = currentBottomRowPosition - currentTopRowPosition;

				let newScrollBarHandleBottom = newScrollBarHandleTop + scrollBarHandleRealHeight;

				let newTopLimit;

				// handle is at the top of the scrollbar
				if(newScrollBarHandleTop <= 0)
					newTopLimit = this._tableViewDataAtDragScrollbarBegin.firstObselDataRow.rowIndex;
				// handle is at the bottom of the scrollbar
				else if(newScrollBarHandleBottom >= scrollBarHeight)
					newTopLimit = this._tableViewDataAtDragScrollbarBegin.lastObselDataRow.rowIndex + 1 - currentlyVisibleDelta;
				// handle is somewhere between the top and the bottom of the scrollbar
				else {
					let scrollbarHeightStyle = this._scrollBarHandle.style.height;
					let scrollbarTheoreticalHeightPercentage = scrollbarHeightStyle.substring(0, scrollbarHeightStyle.length - 1);
					let scrollbarTheoreticalHeight = Math.round((scrollbarTheoreticalHeightPercentage / 100) * scrollBarHeight);
				
					let scrollBarHandleTopRatio;

					// if the scrollbar handle is smaller than it should, it means that it's height is overriden by the CSS property "min-height" in order to stay usable
					if(scrollbarTheoreticalHeight  < scrollBarHandleRealHeight) {
						let scrollBarHandleHeightDelta = scrollBarHandleRealHeight - scrollbarTheoreticalHeight;
						scrollBarHandleTopRatio = newScrollBarHandleTop / (scrollBarHeight - scrollBarHandleHeightDelta);
					}
					// the scrollbar handle's height is normal
					else
						scrollBarHandleTopRatio = newScrollBarHandleTop / scrollBarHeight;

					newTopLimit = this._tableViewDataAtDragScrollbarBegin.firstObselDataRow.rowIndex + this._tableViewDataAtDragScrollbarBegin.firstVisibleRowRatio + (this._tableViewDataAtDragScrollbarBegin.totalObselRowsCount * scrollBarHandleTopRatio);
				}
				
				let newTopRowIndex = Math.floor(newTopLimit);
				let newTopRowHiddenRatio = newTopLimit % 1;
				let newTopRow = this._table.rows[newTopRowIndex];
				let newTopRowTop = this._tableViewDataAtDragScrollbarBegin.tableHeaderAbsoluteBottom - (newTopRowHiddenRatio * newTopRow.getBoundingClientRect().height);
				let newBottomLimit = newTopLimit + currentlyVisibleDelta;
				let newBottomRowIndex = Math.floor(newBottomLimit);
				let newBottomRow = this._table.rows[newBottomRowIndex];

				this._updateOverflowRows(newTopRow, newTopRowTop, newBottomRow);
				this._updateOverflowRowsTaskID = null;
			});
		}
	}

	/**
	 * 
	 */
	_scrollBarHandleIsDragged() {
		return this._scrollBarHandle.classList.contains("dragged");
	}

	/**
	 * 
	 */
	_resetScrollControl() {
		this._resquestedScroll = 0;

		if(this._requestIncrementScrollTaskId) {
			clearInterval(this._requestIncrementScrollTaskId);
			this._requestIncrementScrollTaskId = null;
		}

		if(this._scrollBarHandleIsDragged()) {
			window.document.removeEventListener("mousemove", this._bindedOnDragScrollbarFunction, true);
			this._scrollBarHandle.classList.remove("dragged");
		}
		
		if(this._scrollTopButtonPressedIntervalID) {
			clearInterval(this._scrollTopButtonPressedIntervalID);
			this._scrollTopButtonPressedIntervalID = null;
		}

		if(this._scrollBottomButtonPressedIntervalID) {
			clearInterval(this._scrollBottomButtonPressedIntervalID);
			this._scrollBottomButtonPressedIntervalID = null;
		}

		if(this._scrollBarMouseDownIntervalID) {
			clearInterval(this._scrollBarMouseDownIntervalID);
			this._scrollBarMouseDownIntervalID  = null;
			this._scrollBar.removeEventListener("mouseout", this._bindedOnScrollBarMouseLeaveFunction);
			this._scrollBar.removeEventListener("mousemove", this._bindedOnScrollBarMouseMoveFunction);
		}
	}

	/**
	 * 
	 */
	_onDocumentMouseUp(event) {
		event.preventDefault();
		this._resetScrollControl();
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "allow-fullscreen") {
			this._allowFullScreen = !((newValue == "0") || (newValue == "false"));

			if(!this._allowFullScreen && (document.fullscreenElement === this))
				document.exitFullscreen();
		}
	}

	/**
	 * 
	 */
	disconnectedCallback() {
		super.disconnectedCallback();

		this._obselsLoadingAbortController.abort();

		if(this._updateOverflowRowsTaskID != null)
			cancelIdleCallback(this._updateOverflowRowsTaskID);

		if(this._tableBodyIntersectionObserver)
			this._tableBodyIntersectionObserver.disconnect();
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push("allow-fullscreen");
		return observedAttributes;
	}
}

customElements.define('ktbs4la2-trace-table', KTBS4LA2TraceTable);
