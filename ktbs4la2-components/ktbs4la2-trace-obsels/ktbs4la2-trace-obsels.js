import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {ObselList} from "../../ktbs-api/ObselList.js";

import "../ktbs4la2-main-subsection/ktbs4la2-main-subsection.js";

/**
 * 
 */
class KTBS4LA2TraceObsels extends KtbsResourceElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url);
		this._resolveTypeSet();
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._filtersSubsection = this.shadowRoot.querySelector("#filters-subsection");
		this._beginsLabel = this.shadowRoot.querySelector("#begins-label");
		this._beginsBetweenLabel = this.shadowRoot.querySelector("#begins-between-label");
		this._beginLower = this.shadowRoot.querySelector("#begin-lower");
		this._beginHigherLabel = this.shadowRoot.querySelector("#begin-higher-label");
		this._beginHigher = this.shadowRoot.querySelector("#begin-higher");
		this._endsLabel = this.shadowRoot.querySelector("#ends-label");
		this._endsBetweenLabel = this.shadowRoot.querySelector("#ends-between-label");
		this._endLower = this.shadowRoot.querySelector("#end-lower");
		this._endHigherLabel = this.shadowRoot.querySelector("#end-higher-label");
		this._endHigher = this.shadowRoot.querySelector("#end-higher");
		this._obselBetweenLabel = this.shadowRoot.querySelector("#obsel-between-label");
		this._obselObselsLabel = this.shadowRoot.querySelector("#obsel-obsels-label");
		this._obselLower = this.shadowRoot.querySelector("#obsel-lower");
		this._obselHigherLabel = this.shadowRoot.querySelector("#obsel-higher-label");
		this._obselHigher = this.shadowRoot.querySelector("#obsel-higher");
		this._applyButton = this.shadowRoot.querySelector("#apply");
		this._clearButton = this.shadowRoot.querySelector("#clear");
		this._clearButton.addEventListener("click", this._onClickClearButton.bind(this));
		this._obselperpageSelect = this.shadowRoot.querySelector("#obselsperpage-select");
		this._obselperpageSelect.addEventListener("change", this._onChangeObselperpageSelect.bind(this));
		this._obselperpageSelectLabel = this.shadowRoot.querySelector("#obselsperpage-select-label");
		this._obselperpageSelectAll = this.shadowRoot.querySelector("#obselsperpage-select-all");
		this._tableHeaderId = this.shadowRoot.querySelector("#table-header-id");
		this._toggleReverseButton = this.shadowRoot.querySelector("#toggle-reverse-button");
		this._toggleReverseButton.addEventListener("click", this._onClickToggleReverseButton.bind(this));
		this._tableHeaderIdLabel = this.shadowRoot.querySelector("#table-header-id-label");
		this._tableHeaderType = this.shadowRoot.querySelector("#table-header-type");
		this._tableHeaderBegin = this.shadowRoot.querySelector("#table-header-begin");
		this._tableHeaderEnd = this.shadowRoot.querySelector("#table-header-end");
		this._tableHeaderAttributes = this.shadowRoot.querySelector("#table-header-attributes");
		this._filtersForm = this.shadowRoot.querySelector("#filters");
		this._filtersForm.addEventListener("submit", this._onSubmitFiltersForm.bind(this));
		this._obselsTableBody = this.shadowRoot.querySelector("#obsels-table-body");
		this._tableContainer = this.shadowRoot.querySelector("#table-container");
		this._errorMessageDiv = this.shadowRoot.querySelector("#error-message");
		this._waitMessageContent = this.shadowRoot.querySelector("#wait-message-content");
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
	_onSubmitFiltersForm(event) {
		if(event)
			event.preventDefault();
		
		if(this._beginLower.value && (this._beginLower.value != ""))
			this._ktbsResource._minb = this._dateToTimeStamp(this._beginLower.value);
		else
			this._ktbsResource._minb = null;

		if(this._beginHigher.value && (this._beginHigher.value != ""))
			this._ktbsResource._maxb = this._dateToTimeStamp(this._beginHigher.value);
		else
			this._ktbsResource._maxb = null;

		if(this._endLower.value && (this._endLower.value != ""))
			this._ktbsResource._mine = this._dateToTimeStamp(this._endLower.value);
		else
			this._ktbsResource._mine = null;

		if(this._endHigher.value && (this._endHigher.value != ""))
			this._ktbsResource._maxe = this._dateToTimeStamp(this._endHigher.value);
		else
			this._ktbsResource._maxe = null;

		if(this._obselLower.value && (this._obselLower.value != ""))
			this._ktbsResource._after = this._obselLower.value;
		else
			this._ktbsResource._after = null;

		if(this._obselHigher.value && (this._obselHigher.value != ""))
			this._ktbsResource._before = this._obselHigher.value;
		else
			this._ktbsResource._before = null;

		this._setReversed(false);
		this._reloadObsels();
	}

	/**
	 * 
	 */
	_onClickClearButton(event) {
		event.preventDefault();
		this._filtersForm.reset();
		this._setReversed(false);
		this._onSubmitFiltersForm();
	}

	/**
	 * 
	 */
	_reloadObsels() {
		if(!this._tableContainer.classList.contains("pending"))
			this._tableContainer.classList.add("pending");

		this._ktbsResource.force_state_refresh()
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
	_onChangeObselperpageSelect(event) {
		let newValue;

		if(this._obselperpageSelect.value == "all")
			newValue = null;
		else
			newValue = parseInt(this._obselperpageSelect.value);

		if(this._ktbsResource._limit != newValue) {
			this._ktbsResource._limit = newValue;

			if(this._ktbsResource._offset != null) {
				this._ktbsResource._offset = null;
				this._setReversed(false);
			}

			this._reloadObsels();
		}
	}

	/**
	 * 
	 */
	_isReversed() {
		return this._toggleReverseButton.classList.contains("reversed");
	}

	/**
	 * 
	 */
	_setReversed(reversed) {
		if(reversed == true) {
			this._ktbsResource._reverse = true;

			this._toggleReverseButton.setAttribute("title", this._translateString("Restore normal obsel ordering"));

			if(!this._toggleReverseButton.classList.contains("reversed"))
				this._toggleReverseButton.classList.add("reversed");
		}
		else {
			this._ktbsResource._reverse = false;

			this._toggleReverseButton.setAttribute("title", this._translateString("Reverse obsel ordering"));

			if(this._toggleReverseButton.classList.contains("reversed"))
				this._toggleReverseButton.classList.remove("reversed");
		}
	}

	/**
	 * 
	 */
	_onClickToggleReverseButton(event) {
		this._setReversed(!this._isReversed());
		this._reloadObsels();
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
	_getObselCustomAttributes(obsel) {
		let customAttributes = new Array();
		let sysAttributes = ["@id", "@type", "begin", "beginDT", "end", "hasSourceObsel"];

		for(let property in obsel) {
			if(!sysAttributes.includes(property))
				customAttributes[property] = obsel[property];
		}

		return customAttributes;
	}

	/**
	 * 
	 */
	_getFormattedObselCustomAttributes(obsel) {
		let customAttributes = this._getObselCustomAttributes(obsel);
		let htmlList = document.createElement("ul");

		for(var attribute_id in customAttributes) {
			let listItem = document.createElement("li");
			listItem.innerText = attribute_id + " : " + customAttributes[attribute_id];
			htmlList.appendChild(listItem);
		}

		return htmlList;
	}

	/**
	 * 
	 */
	_addObselToTable(obsel) {
		let tableRow = document.createElement("tr");
				
		let tableCellId = document.createElement("td");
		let obselLink = document.createElement("a");
		obselLink.setAttribute("target", "_blank");
		obselLink.setAttribute("title", this._translateString("See this obsel in the REST console (opens in a new tab)"));
		obselLink.setAttribute("href", this._getObselUri(obsel));
		obselLink.classList.add("obsel-link");
		obselLink.innerText = obsel["@id"];
		tableCellId.appendChild(obselLink);
		tableRow.appendChild(tableCellId);
		
		let tableCellType = document.createElement("td");
		tableCellType.innerText = obsel["@type"];
		tableRow.appendChild(tableCellType);

		let tableCellBegin = document.createElement("td");
		tableCellBegin.innerText = this.formatTimeStampToDate(obsel.begin);
		tableRow.appendChild(tableCellBegin);

		let tableCellEnd = document.createElement("td");
		tableCellEnd.innerText = this.formatTimeStampToDate(obsel.end);
		tableRow.appendChild(tableCellEnd);

		let tableCellAttributes = document.createElement("td");
		let attributesList = this._getFormattedObselCustomAttributes(obsel);
		attributesList.classList.add("attributes-list");
		tableCellAttributes.appendChild(attributesList);
		tableRow.appendChild(tableCellAttributes);

		this._obselsTableBody.appendChild(tableRow);
	}

	/**
	 * 
	 */
	onktbsResourceLoaded() {
		let obsels = this._ktbsResource.obsels;

		this._componentReady.then(() => {
			while(this._obselsTableBody.firstChild)
				this._obselsTableBody.removeChild(this._obselsTableBody.firstChild);

			if(!this._isReversed()) {
				for(let i = 0; i < obsels.length; i++) {
					let obsel = obsels[i];
					this._addObselToTable(obsel);
				}
			}
			else {
				for(let i = obsels.length - 1; i >= 0 ; i--) {
					let obsel = obsels[i];
					this._addObselToTable(obsel);
				}
			}

			if(this._tableContainer.classList.contains("error"))
				this._tableContainer.classList.remove("error");

			if(this._errorMessageDiv.innerText && (this._errorMessageDiv.innerText != ""))
				this._errorMessageDiv.innerText = "";

			if(this._tableContainer.classList.contains("pending"))
				this._tableContainer.classList.remove("pending");
		});
	}

	/**
	 * 
	 */
	_getObselUri(obsel) {
		let uri = this.getAttribute("uri");
		let obselId;

		if(obsel.hasSourceObsel && (obsel.hasSourceObsel instanceof Array) && (obsel.hasSourceObsel.length == 1))
			obselId = obsel.hasSourceObsel[0];
		else
			obselId = obsel["@id"];

		if(uri.substring(uri.length - 7, uri.length) == "@obsels") {
			let traceUri = uri.substring(0, uri.length - 7);
			return traceUri + obselId;
		}
		else
			return obselId;
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
		return ObselList;
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this._filtersSubsection.setAttribute("title", this._translateString("Filters"));
		this._filtersSubsection.setAttribute("lang", this._lang);
		this._beginsLabel.innerText = this._translateString("Begins");
		this._beginsBetweenLabel.innerText = this._translateString("between");
		this._beginLower.setAttribute("placeholder", "-- " + this._translateString("Any") + " --");
		this._beginHigherLabel.innerText = this._translateString("and");
		this._beginHigher.setAttribute("placeholder", "-- " + this._translateString("Any") + " --");
		this._endsLabel.innerText = this._translateString("Ends");
		this._endsBetweenLabel.innerText = this._translateString("between");
		this._endLower.setAttribute("placeholder", "-- " + this._translateString("Any") + " --");
		this._endHigherLabel.innerText = this._translateString("and");
		this._endHigher.setAttribute("placeholder", "-- " + this._translateString("Any") + " --");
		this._obselBetweenLabel.innerText = this._translateString("Between");
		this._obselObselsLabel.innerText = this._translateString("obsels");
		this._obselLower.setAttribute("placeholder", "-- " + this._translateString("Any") + " --");
		this._obselHigherLabel.innerText = this._translateString("and");
		this._obselHigher.setAttribute("placeholder", "-- " + this._translateString("Any") + " --");
		this._applyButton.innerText = this._translateString("Apply");
		this._clearButton.innerText = this._translateString("Clear");
		this._obselperpageSelectLabel.innerText = this._translateString("Obsels / page");
		this._obselperpageSelectAll.innerText = "-- " + this._translateString("All") + " --";
		this._tableHeaderIdLabel.innerText = this._translateString("@id");
		this._tableHeaderType.innerText = this._translateString("Type");
		this._tableHeaderBegin.innerText = this._translateString("Begin");
		this._tableHeaderEnd.innerText = this._translateString("End");
		this._tableHeaderAttributes.innerText = this._translateString("Attributes");
		this._waitMessageContent.innerText = this._translateString("Querying server, please wait...");
		let obselLinks = this.shadowRoot.querySelectorAll("#obsels-table-body .obsel-link");

		for(let i = 0; i < obselLinks.length; i++) 
			obselLinks[i].setAttribute("title", this._translateString("See this obsel in the REST console (opens in a new tab)"));

		if(this._isReversed())
			this._toggleReverseButton.setAttribute("title", this._translateString("Restore normal obsel ordering"));
		else
			this._toggleReverseButton.setAttribute("title", this._translateString("Reverse obsel ordering"));
	}
}

customElements.define('ktbs4la2-trace-obsels', KTBS4LA2TraceObsels);
