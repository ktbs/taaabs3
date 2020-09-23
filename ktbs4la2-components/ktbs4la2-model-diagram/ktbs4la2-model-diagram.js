import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {Model} from "../../ktbs-api/Model.js";

/**
 * 
 */
class KTBS4LA2ModelDiagram extends KtbsResourceElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, false);
	}

	/**
	 * 
	 */
	onComponentReady() {
		/*this._containerDiv = this.shadowRoot.querySelector("#container");
		this.titleTag = this.shadowRoot.querySelector("#title");
		this.linkTag = this.shadowRoot.querySelector("#resource-link");
		this.resourceStatusTag = this.shadowRoot.querySelector("#resource-status");*/
	}

	/**
	 * 
	 */
	connectedCallback() {
		super.connectedCallback();

		/*this._componentReady.then(() => {
			
		});*/
	}

	/**
	 * 
	 */
	_onKtbsResourceSyncInSync() {
		this._componentReady.then(() => {

		});
	}

	/**
	 * 
	 */
	_onKtbsResourceSyncError(old_syncStatus, error) {
		super.onktbsResourceLoadFailed(old_syncStatus, error);

		this._componentReady.then(() => {

		});
	}

	/**
	 * 
	 */
	_getKtbsResourceClass() {
		return Model;
	}
}

customElements.define('ktbs4la2-model-diagram', KTBS4LA2ModelDiagram);
