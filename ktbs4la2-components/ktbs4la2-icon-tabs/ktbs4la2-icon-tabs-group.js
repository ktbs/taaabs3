import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";
import "./ktbs4la2-icon-tab.js";

class KTBS4LA2IconTabsGroup extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
        super(import.meta.url, true, false);
        this._tabsNodesObserver = new MutationObserver(this._onChildNodesMutation.bind(this));
		this._tabsNodesObserver.observe(this, { childList: true, subtree: false });
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._iconsList = this.shadowRoot.getElementById("icons");
    }
    

	/**
	 * 
	 */
	connectedCallback() {
		super.connectedCallback();

		this._componentReady.then(() => {
            this._updateTabs();
        });
    }

    /**
     * 
     */
    diconnectedCallBack() {
        this._tabsNodesObserver.disconnect();
    }

    /**
     * 
     */
    _onChildNodesMutation(mutationRecord, observer) {
        this._updateTabs();
    }
    
    /**
     * 
     */
    _updateTabs() {
        let itemListNodes = this._iconsList.childNodes;

        for(let i = 0; i < itemListNodes.length; i++)
            itemListNodes[i].remove();

        let tabNodes = this.querySelectorAll("ktbs4la2-icon-tab");
        let selectedRank = 0;

        for(let i = 0; i < tabNodes.length; i++) {
            let aTabNode = tabNodes[i];
            let listItem = document.createElement("li");
            listItem.setAttribute("id", i);
            listItem.setAttribute("title", aTabNode.getAttribute("title"));
            let imgNode = document.createElement("img");
            imgNode.setAttribute("src", aTabNode.getAttribute("icon"));
            
            listItem.addEventListener("click", () => {
                this._selectItem(i);
            });

            listItem.appendChild(imgNode);
            this._iconsList.appendChild(listItem);

            if((aTabNode.getAttribute("selected") == "true") || (aTabNode.getAttribute("selected") == "1"))
                selectedRank = i;
        }

        if(tabNodes.length > 0)
            this._selectItem(selectedRank);
    }

    /**
     * 
     */
    _selectItem(itemRank) {
        let itemListNodes = this._iconsList.childNodes;

        for(let i = 0; i < itemListNodes.length; i++) {
            let aListItem = itemListNodes[i];

            if(parseInt(aListItem.getAttribute("id")) == itemRank)
                aListItem.setAttribute("selected", "true");
            else
                if(aListItem.getAttribute("selected"))
                    aListItem.removeAttribute("selected");
        }

        let tabNodes = this.querySelectorAll("ktbs4la2-icon-tab");

        for(let i = 0; i < tabNodes.length; i++) {
            let aTab = tabNodes[i];

            if(i == itemRank)
                aTab.setAttribute("slot", "selected-item");
            else
                if(aTab.getAttribute("slot"))
                    aTab.removeAttribute("slot");
        }
    }
}

customElements.define('ktbs4la2-icon-tabs-group', KTBS4LA2IconTabsGroup);