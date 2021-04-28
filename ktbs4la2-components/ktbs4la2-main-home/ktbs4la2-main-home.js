import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import "../ktbs4la2-main-subsection/ktbs4la2-main-subsection.js";
import "../ktbs4la2-main-related-resource/ktbs4la2-main-related-resource.js";

class KTBS4LA2MainHome extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true);
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._mainSubtitle = this.shadowRoot.querySelector("#main-subtitle");
		this._roots = this.shadowRoot.querySelector("#roots");
		this._addRootButton = this.shadowRoot.querySelector("#add-root-button");
		this._addRootButton.addEventListener("click", this._onClickAddRootButton.bind(this));
		//this._dashboards = this.shadowRoot.querySelector("#dashboards");
		//this._addDashboardButton = this.shadowRoot.querySelector("#add-dashboard-button");
		//this._addDashboardButton.addEventListener("click", this._onClickAddDashboardButton.bind(this));
		this._gettingStartedLink = this.shadowRoot.querySelector("#getting-started");
		this._gettingStartedLink.addEventListener("click", this._onClickHelpLink.bind(this));
		this._gettingStartedTitle = this.shadowRoot.querySelector("#getting-started-title");
		this._gettingStartedDescription = this.shadowRoot.querySelector("#getting-started-description");
		this._faqLink = this.shadowRoot.querySelector("#faq");
		this._faqLink.addEventListener("click", this._onClickHelpLink.bind(this));
		this._faqTitle = this.shadowRoot.querySelector("#faq-title");
		this._faqDescription = this.shadowRoot.querySelector("#faq-description");
		this._ktbsDocTitle = this.shadowRoot.querySelector("#ktbs-doc-title");
		this._ktbsDocDescription = this.shadowRoot.querySelector("#ktbs-doc-description");

		if(window.localStorage.getItem("ktbs-roots") != null) {
			try {
				const ktbsRoots = JSON.parse(window.localStorage.getItem("ktbs-roots"));

				for(let i = 0; i < ktbsRoots.length; i++) {
					let aRootData = ktbsRoots[i];
					const aRootLink = document.createElement("ktbs4la2-main-related-resource");
					aRootLink.setAttribute("resource-type", "Ktbs");
					aRootLink.setAttribute("uri", aRootData.uri);

					if(aRootData.label)
						aRootLink.setAttribute("label", aRootData.label);

					this._roots.insertBefore(aRootLink, this._addRootButton);
				}
			}
			catch(error) {
				this.emitErrorEvent(error);
			}
		}

		this.addEventListener("added-ktbs-root", this._onAddedKtbsRoot.bind(this));
    }

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this._mainSubtitle.innerText = this._translateString("A user interface for kTBS");
		this._roots.setAttribute("title", this._translateString("My kTBS roots"));
		this._addRootButton.setAttribute("title", this._translateString("Add new kTBS root"));
		//this._dashboards.setAttribute("title", this._translateString("My dashboards"));
		//this._addDashboardButton.setAttribute("title", this._translateString("Add new dashboard"));
		this._gettingStartedTitle.innerText = this._translateString("Getting started");
		this._gettingStartedDescription.innerText = this._translateString("A quick introduction tutorial to KTBS4LA2");
		this._faqTitle.innerText = this._translateString("F.A.Q.");
		this._faqDescription.innerText = this._translateString("Frequently asked questions");
		this._ktbsDocTitle.innerText = this._translateString("kTBS Documentation");
		this._ktbsDocDescription.innerText = this._translateString("Learn more about kTBS on readthedocs.io");
	}

	/**
	 * 
	 */
	_onClickHelpLink(event) {
		event.preventDefault();
		event.stopPropagation();
		const clickedLink = (event.target.localName == "a")?event.target:event.target.closest("a");

		if(clickedLink && clickedLink.hasAttribute("href")) {
			const clickedLink_url = new URL(clickedLink.getAttribute("href"));
			let queryString = clickedLink_url.hash.substring(1);
			let queryParameterStrings = queryString.split('&');
			let queryParameters = new Array();

			if(queryParameterStrings instanceof Array) {
				for(let i =0; i < queryParameterStrings.length; i++) {
					let parameterString = queryParameterStrings[i];
					let parameterParts = parameterString.split('=');

					if((parameterParts instanceof Array) && (parameterParts.length == 2)) {
						let key = parameterParts[0];
						let value = parameterParts[1];
						queryParameters[key] = decodeURIComponent(value);
					}
				}
			}

			const doc_page = queryParameters["doc"];

			if(doc_page)
				this.dispatchEvent(new CustomEvent("request-documentation-page", {
					bubbles: true, 
					cancelable: false, 
					composed: true, 
					detail: {page: doc_page}
				}));
		}
	}

	/**
     * 
     */
	_onClickAddRootButton() {
        this.dispatchEvent(new Event("request-add-ktbs-root", {
            bubbles: true, 
            cancelable: true,
			composed: true
        }));
    }

	/**
	 * 
	 */
	_onAddedKtbsRoot(event) {
		if(event.detail && event.detail.uri) {
			const newRootElement = document.createElement("ktbs4la2-main-related-resource");
			newRootElement.setAttribute("resource-type", "Ktbs");
			newRootElement.setAttribute("uri", event.detail.uri);
			newRootElement.classList.add("new");

			if(event.detail.label)
				newRootElement.setAttribute("label", event.detail.label);

			this._roots.insertBefore(newRootElement, this._addRootButton);
		}
	}
}

customElements.define('ktbs4la2-main-home', KTBS4LA2MainHome);