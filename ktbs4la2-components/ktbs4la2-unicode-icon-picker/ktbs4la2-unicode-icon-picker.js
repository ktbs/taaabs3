import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import "../ktbs4la2-document-header/ktbs4la2-document-header.js";

class KTBS4LA2UnicodeIconPicker extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
        super(import.meta.url, true, true);

        if(this.attachInternals)
            this._internals = this.attachInternals();

        this._bindedOnKeyUpFunction = this._onKeyUp.bind(this);
	}

    /**
     * 
     */
    static formAssociated = true;

    /**
     * 
     */
    get form() {
        if(this._internals)
            return this._internals.form;
        else
            return undefined;
    }
    
    /**
     * 
     */
    get name() {
        return this.getAttribute('name');
    }
    
    /**
     * 
     */
    get type() {
        return this.localName;
    }

    /**
     * 
     */
    get value() {
        if(this._isReady) 
            return this._input.value;
        else if(this.hasAttribute("value"))
            return this.getAttribute("value");
        else
            return null;
    }

    /**
     * 
     */
    set value(newValue) {
        if(newValue != null)
            this.setAttribute("value", newValue);
        else if(this.hasAttribute("value"))
            this.removeAttribute("value");
    }

    /**
	 * 
	 */
	static get observedAttributes() {
		let _observedAttributes = super.observedAttributes;
		_observedAttributes.push("placeholder");
		_observedAttributes.push("readonly");
        _observedAttributes.push("value");
        _observedAttributes.push("required");
		return _observedAttributes;
	}

    /**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);

        this._componentReady.then(() => {
            if(newValue == null) {
                if(this._input.hasAttribute(name))
                    this._input.removeAttribute(name);
            }
            else
                this._input.setAttribute(name, newValue);
        });
    }

    /**
     * 
     */
    static get _char_tabs() {
        return [
            {
                id: "emoticons",
                title: "Emoticons",
                from: 128512,
                to: 128591
            },
            {
                id: "transport-maps-symbols",
                title: "Transport and map symbols",
                from: 128640,
                to: 128764
            },
            {
                id: "misc-symbols-picto",
                title: "Miscellaneous symbols and pictographs",
                from: 127744,
                to: 128511
            },
            {
                id: "supplemental-symbols-picto",
                title: "Supplemental symbols and pictographs",
                from: 129280,
                to: 129535
            },
            {
                id: "musical-symbols",
                title: "Musical symbols",
                from: 119040,
                to: 119274
            },
            {
                id: "dingbats",
                title: "Dingbats",
                from: 9984,
                to: 10175
            },
            {
                id: "arrows",
                title: "Arrows",
                from: 8592,
                to: 8703
            },
            {
                id: "currencies-symbols",
                title: "Currencies symbols",
                from: 8352,
                to: 8383
            },
            {
                id: "math-operators",
                title: "Mathematical operators",
                from: 8704,
                to: 8959
            },
            {
                id: "misc-technical",
                title: "Miscellaneous technical",
                from: 8960,
                to: 9215
            },
            {
                id: "geometric-shapes",
                title: "Geometric shapes",
                from: 9632,
                to: 9727
            },
            {
                id: "enclosed-alphanumerics",
                title: "Enclosed alphanumerics",
                from: 9312,
                to: 9471
            },
            {
                id: "misc-symbols",
                title: "Miscellaneous symbols",
                from: 9728,
                to: 9983
            }
        ];
    }

    /**
	 * 
	 */
	onComponentReady() {
        this._input = this.shadowRoot.querySelector("#input");
        this._input.addEventListener("input", this._onChangeInput.bind(this));
        this._input.addEventListener("change", this._onChangeInput.bind(this));
        this._openExplorerButton = this.shadowRoot.querySelector("#open-explorer-button");
        this._openExplorerButton.addEventListener("click", this._onClickOpenExplorerButton.bind(this));
        this._explorerPanel = this.shadowRoot.querySelector("#explorer-panel");
        this._previousTabButton = this.shadowRoot.querySelector("#previous-tab-button");
        this._previousTabButton.addEventListener("click", this._onClickPreviousTabButton.bind(this));
        this._tabSelect = this.shadowRoot.querySelector("#tab-select");
        this._tabSelect.addEventListener("change", this._onChangeTabSelect.bind(this));
        this._nextTabButton = this.shadowRoot.querySelector("#next-tab-button");
        this._nextTabButton.addEventListener("click", this._onClickNextTabButton.bind(this));
        this._tableContainer = this.shadowRoot.querySelector("#table-container");
        const explorerContent = document.createDocumentFragment();
        const char_tabs = KTBS4LA2UnicodeIconPicker._char_tabs;

        for(let i = 0; i < char_tabs.length; i++) {
            const tab = document.createElement("table");
                tab.setAttribute("id", char_tabs[i].id);

                if(i == 0)
                    tab.classList.add("selected");

                const tabSelectOption = document.createElement("option");
                    tabSelectOption.setAttribute("value", char_tabs[i].id);
                    tabSelectOption.innerText = this._translateString(char_tabs[i].title);
                this._tabSelect.appendChild(tabSelectOption);

                const body = document.createElement("tbody");
                    body.addEventListener("click", this._onClickTableBody.bind(this));
                    let row = document.createElement("tr");
                    let rowCellCount = 0;

                    for(let j = char_tabs[i].from; j <= char_tabs[i].to; j++) {
                        try {
                            const char =  String.fromCodePoint(j);

                            if(char != "") {
                                const cell = document.createElement("td");
                                cell.setAttribute("tabindex", j + 7);
                                cell.innerText = char;

                                if(cell.innerText != "") {
                                    row.appendChild(cell);
                                    rowCellCount++;

                                    if(rowCellCount == 16) {
                                        body.appendChild(row);
                                        row = document.createElement("tr");
                                        rowCellCount = 0;
                                    }
                                }
                            }
                        }
                        catch(error) {}
                    }

                    if(row.hasChildNodes)
                        body.appendChild(row);

                tab.appendChild(body);
            explorerContent.appendChild(tab);
        }

        this._tableContainer.appendChild(explorerContent);
        this.addEventListener("focus", this._onFocus.bind(this));
        this.addEventListener("blur", this._onBlur.bind(this));
    }

    /**
     * 
     */
    _updatePreviousNextButtons() {
        if(this._tabSelect.selectedIndex < (this._tabSelect.options.length - 1)) {
            if(this._nextTabButton.hasAttribute("disabled"))
                this._nextTabButton.removeAttribute("disabled");
        }
        else
            if(!this._nextTabButton.hasAttribute("disabled")) {
                // prevent component from losing focus, so a blur event is not accidentally triggered
                if(this.shadowRoot.activeElement == this._nextTabButton)
                    this._tabSelect.focus();

                this._nextTabButton.setAttribute("disabled", true);
            }

        if(this._tabSelect.selectedIndex > 0) {
            if(this._previousTabButton.hasAttribute("disabled"))
                this._previousTabButton.removeAttribute("disabled");
        }
        else
            if(!this._previousTabButton.hasAttribute("disabled")) {
                // prevent component from losing focus, so a blur event is not accidentally triggered
                if(this.shadowRoot.activeElement == this._previousTabButton)
                    this._tabSelect.focus();

                this._previousTabButton.setAttribute("disabled", true);
            }
    }

    /**
     * 
     */
    _selectTabById(id) {
        // select corresponding entry in the select elements
        this._tabSelect.value = id;

        // hide previously selected icon table
        const previouslySelectedTab = this._tableContainer.querySelector("table.selected");

        if(previouslySelectedTab)
            previouslySelectedTab.classList.remove("selected");

        // unhide newly selected icon table
        const newSelectedTab = this._tableContainer.querySelector("#" + CSS.escape(id));

        if(newSelectedTab)
            newSelectedTab.classList.add("selected");

        // update "previous" and "next" buttons
        this._updatePreviousNextButtons();
    }

    /**
     * 
     */
    _selectTabByIndex(index) {
        // select corresponding entry in the select elements
        this._tabSelect.selectedIndex = index;

        // hide previously selected icon table
        const previouslySelectedTab = this._tableContainer.querySelector("table.selected");

        if(previouslySelectedTab)
            previouslySelectedTab.classList.remove("selected");

        // unhide newly selected icon table
        const newSelectedTabId = this._tabSelect.options[index].value;
        const newSelectedTab = this._tableContainer.querySelector("#" + CSS.escape(newSelectedTabId));

        if(newSelectedTab)
            newSelectedTab.classList.add("selected");

        // update "previous" and "next" buttons
        this._updatePreviousNextButtons();
    }

    /**
     * 
     */
    _onClickPreviousTabButton(event) {
        const selectedTabIndex = this._tabSelect.selectedIndex;

        if(selectedTabIndex > 0)
            this._selectTabByIndex(selectedTabIndex - 1);
    }

    /**
     * 
     */
    _onClickNextTabButton(event) {
        const selectedTabIndex = this._tabSelect.selectedIndex;

        if(selectedTabIndex < (this._tabSelect.options.length - 1))
            this._selectTabByIndex(selectedTabIndex + 1);
    }

    /**
     * 
     */
    _hideExplorer() {
        if(!this._explorerPanel.classList.contains("hidden"))
            this._explorerPanel.classList.add("hidden");

        document.removeEventListener('keyup', this._bindedOnKeyUpFunction);
    }

    /**
     * 
     */
    _onClickOpenExplorerButton(event) {
        if(this._explorerPanel.classList.contains("hidden")) {
            // update selected cell
            let selectedCell = this._tableContainer.querySelector("td.selected");

            if(
                    (!this.value && selectedCell)
                ||  (this.value && selectedCell && (selectedCell.innerText != this.value))
            ) {
                selectedCell.classList.remove("selected");
                selectedCell = null;
            }

            if(this.value && !selectedCell) {
                const allCells = this._tableContainer.querySelectorAll("td");

                for(let i = 0; i < allCells.length; i++)
                    if(allCells[i].innerText == this.value) {
                        selectedCell = allCells[i];
                        selectedCell.classList.add("selected");
                        break;
                    }

            }
            // ---

            this._explorerPanel.classList.remove("hidden");

            if(selectedCell) {
                const tabId = selectedCell.closest("table").id;
                this._selectTabById(tabId);
                selectedCell.scrollIntoView(true);
            }
            
            document.addEventListener('keyup', this._bindedOnKeyUpFunction);
        }
        else
            this._hideExplorer();

        this._input.focus();
    }

    /**
     * 
     */
    _onChangeInput(event) {
        event.stopPropagation();

        // update selected cell
        let selectedCell = this._tableContainer.querySelector("td.selected");

        if(
                (!this.value && selectedCell)
            ||  (this.value && selectedCell && (selectedCell.innerText != this.value))
        ) {
            selectedCell.classList.remove("selected");
            selectedCell = null;
        }

        if(this.value && !selectedCell) {
            const allCells = this._tableContainer.querySelectorAll("td");

            for(let i = 0; i < allCells.length; i++)
                if(allCells[i].innerText == this.value) {
                    selectedCell = allCells[i];
                    selectedCell.classList.add("selected");
                    break;
                }

        }
        // ---
 
        const componentEvent = new Event(event.type, {
            bubbles: true,
            cancelable: false,
            composed: event.composed
        });

        this.dispatchEvent(componentEvent);
    }

    /**
     * 
     */
    _onChangeTabSelect(event) {
        const newSelectedTabID = this._tabSelect.value;
        const currentlySelectedTab = this.shadowRoot.querySelector("table.selected");

        if(currentlySelectedTab && (currentlySelectedTab.getAttribute("id") != newSelectedTabID))
            currentlySelectedTab.classList.remove("selected");

        const newSelectedTab = this.shadowRoot.querySelector("table#" + CSS.escape(newSelectedTabID));
        
        if(newSelectedTab && !newSelectedTab.classList.contains("selected"))
            newSelectedTab.classList.add("selected");

        this._updatePreviousNextButtons();
    }

    /**
     * 
     */
    _onClickTableBody(event) {
        let clickedCell;

        if(event.target.localName == "td")
            clickedCell = event.target;
        else
            clickedCell = event.target.closest("td");

        if(clickedCell) {
            this._input.value = clickedCell.innerText;
            const previouslySelectedCells = this.shadowRoot.querySelectorAll("td.selected");

            for(let i = 0; i < previouslySelectedCells.length; i++)
                if(previouslySelectedCells[i] != clickedCell)
                    previouslySelectedCells[i].classList.remove("selected");

            if(!clickedCell.classList.contains("selected"))
                clickedCell.classList.add("selected");

            if(!this._explorerPanel.classList.contains("hidden"))
                this._explorerPanel.classList.add("hidden");

            const componentEvent = new Event("change", {
                bubbles: true,
                cancelable: false,
                composed: true
            });
    
            this.dispatchEvent(componentEvent);

            this._input.focus();
        }
    }

    /**
     * 
     */
    _onFocus(event) {
        event.stopPropagation();
        
        this._componentReady.then(() => {
            this._input.focus();
        }).catch(() => {});
    }

    /**
     * 
     */
    _onBlur() {
        this._componentReady.then(() => {
            this._hideExplorer();
        }).catch(() => {});
    }

    /**
     * 
     */
    _onKeyUp(event) {
        let key = event.key || event.keyCode;

		if((key === 'Escape') || (key === 'Esc') || (key === 27))
            this._hideExplorer();
    }

    /**
     * 
     */
    checkValidity() {
        return this._input.checkValidity();
    }

    /**
     * 
     */
    reportValidity() {
        this._input.reportValidity();
	}

    /**
     * 
     */
    setCustomValidity(message) {
        this._input.setCustomValidity(message);
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._openExplorerButton.setAttribute("title", this._translateString("Open/Close icon picker"));
        this._previousTabButton.setAttribute("title", this._translateString("Previous"));
        this._nextTabButton.setAttribute("title", this._translateString("Next"));

        const char_tabs = KTBS4LA2UnicodeIconPicker._char_tabs;
        
        for(let i = 0; i < char_tabs.length; i++) {
            const option = this._tabSelect.querySelector("option[value = " + CSS.escape(char_tabs[i].id) + "]");

            if(option)
                option.innerText = this._translateString(char_tabs[i].title);
        }
    }
}

customElements.define('ktbs4la2-unicode-icon-picker', KTBS4LA2UnicodeIconPicker);