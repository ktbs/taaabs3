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
		this._bindedOnDocumentMouseMoveFunction = this._onDocumentMouseMove.bind(this);
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
		this._tableHeaderId = this.shadowRoot.querySelector("#table-header-id");
		this._tableHeaderType = this.shadowRoot.querySelector("#table-header-type");
		this._tableHeaderSubject = this.shadowRoot.querySelector("#table-header-subject");
		this._tableHeaderBegin = this.shadowRoot.querySelector("#table-header-begin");
		this._tableHeaderEnd = this.shadowRoot.querySelector("#table-header-end");
		this._tableHeaderAttributes = this.shadowRoot.querySelector("#table-header-attributes");
		this._tableHeaderAttributesType = this.shadowRoot.querySelector("#table-header-attributes-type");
		this._tableHeaderAttributesValue = this.shadowRoot.querySelector("#table-header-attributes-value");
		this._toggleFullscreenButton = this.shadowRoot.querySelector("#toggle-fullscreen-button");
		this._toggleFullscreenButton.addEventListener("click", this._onClickToggleFullscreenButton.bind(this));
		
		this._scrollTools = this.shadowRoot.querySelector("#scroll-tools");

		this._scrollTopButton = this.shadowRoot.querySelector("#scroll-top-button");
		this._scrollTopButton.addEventListener("mousedown", this._onScrollTopButtonMouseDown.bind(this));
		this._scrollTopButton.addEventListener("mouseout", this._onScrollTopButtonMouseOut.bind(this));
		this._scrollTopButton.addEventListener("mouseup", this._onScrollTopButtonMouseOut.bind(this));

		this._scrollBar = this.shadowRoot.querySelector("#scroll-bar");
		this._scrollBar.addEventListener("wheel", this._onScrollBarMouseWheel.bind(this), { passive: false });
		this._scrollBar.addEventListener("mousedown", this._onScrollBarMouseDown.bind(this));

		this._scrollBarHandle = this.shadowRoot.querySelector("#scroll-bar-handle");
		this._scrollBarHandle.addEventListener("mousedown", this._onScrollBarHandleMouseDown.bind(this));
		
		this._scrollBottomButton = this.shadowRoot.querySelector("#scroll-bottom-button");
		this._scrollBottomButton.addEventListener("mousedown", this._onScrollBottomButtonMouseDown.bind(this));
		this._scrollBottomButton.addEventListener("mouseout", this._onScrollBottomButtonMouseOut.bind(this));
		this._scrollBottomButton.addEventListener("mouseup", this._onScrollBottomButtonMouseOut.bind(this));

		// observe resize of tableHeader & tableFooter
		this._tableSectionsResizeObserver = new ResizeObserver(this._onTableViewChanged.bind(this));
		this._tableSectionsResizeObserver.observe(this._tableContainer);
		
		this._tableContainer.addEventListener("scroll", this._onTableViewChanged.bind(this));

		this._errorMessageDiv = this.shadowRoot.querySelector("#error-message");
		this._waitMessageContent = this.shadowRoot.querySelector("#wait-message-content");

		window.document.addEventListener("mouseup", this._onDocumentMouseUp.bind(this), true);
	}

	/**
	 * 
	 */
	_getTableViewData() {
		let tableViewData = {};

		// find number of obsel data rows (= without header and footer) in the table
		let headerRowsCount = this._tableHeader.querySelectorAll("tr").length;
		let footerRowsCount = this._tableFooter.querySelectorAll("tr").length;
		tableViewData.totalObselRowsCount = this._table.rows.length - (headerRowsCount + footerRowsCount);

		if(tableViewData.totalObselRowsCount > 0) {
			tableViewData.firstObselDataRow = this._table.rows[headerRowsCount];
			tableViewData.lastObselDataRow = this._table.rows[headerRowsCount + tableViewData.totalObselRowsCount - 1];
		}
		else {
			tableViewData.firstObselDataRow = null;
			tableViewData.lastObselDataRow = null;
		}

		let tableContainerBoundingClientRect = this._tableContainer.getBoundingClientRect();
		let tableContainerAbsoluteTop = tableContainerBoundingClientRect.top;
		let tableContainerAbsoluteBottom = tableContainerBoundingClientRect.bottom;

		let tableHeaderBoundingClientRect = this._tableHeader.getBoundingClientRect();
		tableViewData.tableHeaderAbsoluteBottom = tableContainerAbsoluteTop + tableHeaderBoundingClientRect.height;
		
		let tableFooterBoundingClientRect = this._tableFooter.getBoundingClientRect();
		let tableFooterAbsoluteTop = tableContainerAbsoluteBottom - tableFooterBoundingClientRect.height;

		tableViewData.visibleBodyHeight = Math.max(tableFooterAbsoluteTop - tableViewData.tableHeaderAbsoluteBottom, 0);

		if(tableViewData.visibleBodyHeight > 0) {
			let visibleRowsQueryString = "tr:not(.overflow)";
			let visibleRows = this._tableBody.querySelectorAll(visibleRowsQueryString);

			let firstVisibleRow;

			for(let i = 0; i < visibleRows.length; i++) {
				let aRow = visibleRows[i];
				let aRowBoundingClientRect = aRow.getBoundingClientRect();

				if(aRowBoundingClientRect.bottom  >= tableViewData.tableHeaderAbsoluteBottom) {
					firstVisibleRow = aRow;
					break;
				}
			}

			tableViewData.firstVisibleRow = firstVisibleRow;

			if(firstVisibleRow) {
				// find visible ratio of firstVisibleRow
				let firstVisibleRowBoundingRect = firstVisibleRow.getBoundingClientRect();
				let firstVisibleRowVisibleHeight = Math.min(firstVisibleRowBoundingRect.height, firstVisibleRowBoundingRect.bottom - tableViewData.tableHeaderAbsoluteBottom);
				tableViewData.firstVisibleRowRatio = firstVisibleRowVisibleHeight / firstVisibleRowBoundingRect.height;
			}
			else
				tableViewData.firstVisibleRowRatio = 0;

			let lastVisibleRow;

			for(let i = (visibleRows.length - 1); i >= 0; i--) {
				let aRow = visibleRows[i];
				let aRowBoundingClientRect = aRow.getBoundingClientRect();

				if(aRowBoundingClientRect.top  <= tableFooterAbsoluteTop) {
					lastVisibleRow = aRow;
					break;
				}
			}

			tableViewData.lastVisibleRow = lastVisibleRow;

			if(lastVisibleRow) {
				// find visible ratio of lastVisibleRow
				let lastVisibleRowBoundingRect = lastVisibleRow.getBoundingClientRect();
				let lastVisibleRowVisibleHeight = Math.min(lastVisibleRowBoundingRect.height, (tableFooterAbsoluteTop + 1) - lastVisibleRowBoundingRect.top);
				tableViewData.lastVisibleRowRatio = lastVisibleRowVisibleHeight / lastVisibleRowBoundingRect.height;
			}
			else
				tableViewData.lastVisibleRowRatio = 0;
		}
		else {
			tableViewData.firstVisibleRow = null;
			tableViewData.firstVisibleRowRatio = 0;
			tableViewData.lastVisibleRow = null;
			tableViewData.lastVisibleRowRatio = 0;
		}

		return tableViewData;
	}

	/**
	 * 
	 */
	_onTableViewChanged() {
		if(this._onTableViewChangedTaskID)
			clearTimeout(this._onTableViewChangedTaskID);

		if(this._updateOverflowRowsTaskID) {
			cancelIdleCallback(this._updateOverflowRowsTaskID);
			this._updateOverflowRowsTaskID = null;
		}

		if(!this._scrollBarHandle.classList.contains("dragged")) {
			this._onTableViewChangedTaskID = setTimeout(() => {
				let tableViewData = this._getTableViewData();

				if(tableViewData.firstVisibleRow && tableViewData.lastVisibleRow) {
					this._updateScrollBar(tableViewData);

					this._updateOverflowRowsTaskID = requestIdleCallback((idleDeadline) => {
						if(!idleDeadline.didTimeout && (idleDeadline.timeRemaining() > 0)) {
							let firstVisibleRowTopBefore = tableViewData.firstVisibleRow.getBoundingClientRect().top;
							this._updateOverflowRows(tableViewData.firstVisibleRow, firstVisibleRowTopBefore, tableViewData.lastVisibleRow);
						}

						this._updateOverflowRowsTaskID = null;
					});
				}

				this._onTableViewChangedTaskID = null;
			}, 50);
		}
		else
			this._onTableViewChangedTaskID = null;
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
						let currentVisibleLinesCount = this._tableBody.querySelectorAll("tr:not(.overflow").length;
						
						for(let i = 0; i < obsels.length; i++) {
							let anObsel = obsels[i];
							let anObselFragment = this._getObselFragment(anObsel, ((i%2) == 0), (currentVisibleLinesCount > this._maxVisibleRows));
							currentVisibleLinesCount += anObselFragment.querySelectorAll("tr:not(.overflow").length;
							obselRowsFragment.appendChild(anObselFragment);
							this._onTableViewChanged();
						}

						this._tableBody.appendChild(obselRowsFragment);
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
		this._tableHeaderId.innerText = this._translateString("@id");
		this._tableHeaderType.innerText = this._translateString("Obsel type");
		this._tableHeaderSubject.innerText = this._translateString("Subject");
		this._tableHeaderBegin.innerText = this._translateString("Begin");
		this._tableHeaderEnd.innerText = this._translateString("End");
		this._tableHeaderAttributes.innerText = this._translateString("Attributes");
		this._tableHeaderAttributesType.innerText = this._translateString("Attribute type");
		this._tableHeaderAttributesValue.innerText = this._translateString("Value");
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
	 * 
	 */
	_updateOverflowRows(firstVisibleRow, firstVisibleRowTop, lastVisibleRow) {
		// unhide rows in the visible range, if any is hidden
		let aRow = firstVisibleRow;

		do {
			if(aRow.classList.contains("obsel-entry-row") && aRow.classList.contains("overflow"))
				this._unsetObselRowOverflow(aRow);

			aRow = aRow.nextSibling;
		} while(aRow && (aRow != lastVisibleRow));

		// unhide rows immediatly above minVisibleRank and below maxVisibleRank
		let topRow = firstVisibleRow;
		let bottomRow = lastVisibleRow;
		let firstUnhiddenRowIndex = topRow.rowIndex;
		let lastUnhiddenRowIndex = bottomRow.rowIndex;
		let visibleRowsCount = lastUnhiddenRowIndex - firstUnhiddenRowIndex + 1;
		
		while((topRow || bottomRow) && (visibleRowsCount <= this._maxVisibleRows)) {
			if(topRow) {
				topRow = topRow.previousSibling;

				while(topRow && !(topRow.classList && topRow.classList.contains("obsel-entry-row")))
					topRow = topRow.previousSibling;

				if(topRow && topRow.classList) {
					if(topRow.classList.contains("overflow"))
						this._unsetObselRowOverflow(topRow);
					
					firstUnhiddenRowIndex = topRow.rowIndex;
					visibleRowsCount = lastUnhiddenRowIndex - firstUnhiddenRowIndex + 1;
				}
			}

			if(bottomRow && (visibleRowsCount <= this._maxVisibleRows)) {
				bottomRow = bottomRow.nextSibling;

				while(bottomRow && !(bottomRow.classList && bottomRow.classList.contains("obsel-entry-row")))
					bottomRow = bottomRow.nextSibling;

				if(bottomRow && bottomRow.classList) {
					if(bottomRow.classList.contains("overflow"))
						this._unsetObselRowOverflow(bottomRow);

					while(bottomRow.nextSibling && !bottomRow.nextSibling.classList.contains("obsel-entry-row"))
						bottomRow = bottomRow.nextSibling;
					
					lastUnhiddenRowIndex = bottomRow.rowIndex;
					visibleRowsCount = lastUnhiddenRowIndex - firstUnhiddenRowIndex + 1;
				}
			}
		}

		// hide non-overflow rows that are above new minVisibleRank and below new maxVisibleRank
		let visibleObselEntryRowsQueryString = ":not(.overflow).obsel-entry-row";
		let visibleObselEntryRows = this._tableBody.querySelectorAll(visibleObselEntryRowsQueryString);
		
		for(let i = 0; i < visibleObselEntryRows.length; i++) {
			let aRow = visibleObselEntryRows[i];

			if((aRow.rowIndex < firstUnhiddenRowIndex) || (aRow.rowIndex > lastUnhiddenRowIndex))
				this._setObselRowOverflow(aRow);
		}

		// re-position scrollTop if necessary, so the manipulations are invisible to the user and Firefox doesn't trigger an infinite callbacks loop
		let firstVisibleRowTopAfter = firstVisibleRow.getBoundingClientRect().top;

		if(firstVisibleRowTopAfter != firstVisibleRowTop)
			this._tableContainer.scrollTop += (firstVisibleRowTopAfter - firstVisibleRowTop);
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
			if(!this._scrollTools.hasAttribute("disabled"))
				this._scrollTools.setAttribute("disabled", true);
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

			if(this._scrollTools.hasAttribute("disabled"))
				this._scrollTools.removeAttribute("disabled");
		}
	}

	/**
	 * 
	 */
	_onScrollBarMouseWheel(event) {
		if(!this._scrollTools.hasAttribute("disabled")) {
			let verticalMovement = event.deltaY;
			let stepHeight = this._tableContainer.clientHeight / 15;
					
			if(verticalMovement && (verticalMovement != 0)) {
				let movementUnit = event.deltaMode;

				if(movementUnit == 0)
					verticalMovement = verticalMovement / 28;

				this._requestIncrementScroll(verticalMovement * stepHeight);
			}
		}
	}

	/**
	 * 
	 */
	_onScrollBarMouseDown(event) {
		if(!this._scrollTools.hasAttribute("disabled")) {
			let mouseRelativeY = event.offsetY;
			let scrollBarHandleRelativeTop = this._scrollBarHandle.getBoundingClientRect().top - this._scrollBar.getBoundingClientRect().top;
			let scrollBarHandleRelativeBottom = this._scrollBarHandle.getBoundingClientRect().bottom - this._scrollBar.getBoundingClientRect().top;
			let stepHeight = this._tableContainer.clientHeight / 5;

			if(mouseRelativeY < scrollBarHandleRelativeTop)
				this._requestIncrementScroll(-stepHeight);
			else if(mouseRelativeY > scrollBarHandleRelativeBottom)
				this._requestIncrementScroll(stepHeight);
			
			if(this._scrollBarMouseDownIntervalID)
				clearInterval(this._scrollBarMouseDownIntervalID);
		
			this._scrollBarMouseDownIntervalID = setInterval(() => {
				let scrollBarHandleRelativeTop = this._scrollBarHandle.getBoundingClientRect().top - this._scrollBar.getBoundingClientRect().top;
				let scrollBarHandleRelativeBottom = this._scrollBarHandle.getBoundingClientRect().bottom - this._scrollBar.getBoundingClientRect().top;
			
				if(mouseRelativeY < scrollBarHandleRelativeTop)
					this._requestIncrementScroll(-stepHeight);
				else if(mouseRelativeY > scrollBarHandleRelativeBottom)
					this._requestIncrementScroll(stepHeight);
				else {
					clearInterval(this._scrollBarMouseDownIntervalID);
					this._scrollBarMouseDownIntervalID  = null;
				}
			}, 50);
		}
	}

	/**
	 * 
	 */
	_requestIncrementScroll(steps) {
		if(this._requestIncrementScrollTaskId)
			clearTimeout(this._requestIncrementScrollTaskId);

		this._requestIncrementScrollTaskId = setTimeout(() => {
			this._tableContainer.scrollTop += steps * 17.5;
		});
	}

	/**
	 * 
	 */
	_onScrollTopButtonMouseDown(event) {
		event.preventDefault();
		this._requestIncrementScroll(-1);

		if(this._scrollTopButtonPressedIntervalID)
			clearInterval(this._scrollTopButtonPressedIntervalID);
		
		this._scrollTopButtonPressedIntervalID = setInterval(() => {
			if(this._tableContainer.scrollTop >= 0)
				this._requestIncrementScroll(-1);
			else {
				clearInterval(this._scrollTopButtonPressedIntervalID);
				this._scrollTopButtonPressedIntervalID = null;
			}
		}, 50);
	}

	/**
	 * 
	 */
	_onScrollTopButtonMouseOut(event) {
		event.preventDefault();
		
		if(this._scrollTopButtonPressedIntervalID) {
			clearInterval(this._scrollTopButtonPressedIntervalID);
			this._scrollTopButtonPressedIntervalID = null;
		}
	}

	/**
	 * 
	 */
	_onScrollBottomButtonMouseDown(event) {
		event.preventDefault();
		this._requestIncrementScroll(1);

		if(this._scrollBottomButtonPressedIntervalID)
			clearInterval(this._scrollBottomButtonPressedIntervalID);

		let visibleBodyHeight = this._getTableViewData().visibleBodyHeight;
		
		this._scrollBottomButtonPressedIntervalID = setInterval(() => {
			if(this._tableContainer.scrollTop <= (this._table.getBoundingClientRect().height - visibleBodyHeight))
				this._requestIncrementScroll(1);
			else {
				clearInterval(this._scrollBottomButtonPressedIntervalID);
				this._scrollBottomButtonPressedIntervalID = null;
			}
		}, 50);
	}

	/**
	 * 
	 */
	_onScrollBottomButtonMouseOut(event) {
		event.preventDefault();
		
		if(this._scrollBottomButtonPressedIntervalID) {
			clearInterval(this._scrollBottomButtonPressedIntervalID);
			this._scrollBottomButtonPressedIntervalID = null;
		}
	}

	/**
	 * 
	 */
	_onScrollBarHandleMouseDown(event) {
		event.preventDefault();
		
		if(!this._scrollTools.hasAttribute("disabled")) {
			if(!this._scrollBarHandle.classList.contains("dragged"))
				this._scrollBarHandle.classList.add("dragged");

			this._scrollBarHandleDragOrigin = event.clientY;
			let scrollBarHandleTopValue = this._scrollBarHandle.style.top;
			this._scrollBarHandleOrigin = parseFloat(scrollBarHandleTopValue.substring(0, scrollBarHandleTopValue.length - 2));
			this._tableViewDataAtDragScrollbarBegin = this._getTableViewData();
			window.document.addEventListener("mousemove", this._bindedOnDocumentMouseMoveFunction, true);
		}
	}

	/**
	 * 
	 */
	_onDocumentMouseMove(event) {
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
	_onDocumentMouseUp(event) {
		event.preventDefault();
		
		if(this._scrollBarHandle.classList.contains("dragged")) {
			this._scrollBarHandle.classList.remove("dragged");
			window.document.removeEventListener("mousemove", this._bindedOnDocumentMouseMoveFunction, true);
		}
		else if(this._scrollTopButtonPressedIntervalID) {
			clearInterval(this._scrollTopButtonPressedIntervalID);
			this._scrollTopButtonPressedIntervalID = null;
		}
		else if(this._scrollBottomButtonPressedIntervalID) {
			clearInterval(this._scrollBottomButtonPressedIntervalID);
			this._scrollBottomButtonPressedIntervalID = null;
		}
		else if(this._scrollBarMouseDownIntervalID) {
			clearInterval(this._scrollBarMouseDownIntervalID);
			this._scrollBarMouseDownIntervalID  = null;
		}
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
