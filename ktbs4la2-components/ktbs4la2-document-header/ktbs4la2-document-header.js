/**
 * 
 */
class KTBS4LA2DocumentHeader extends HTMLElement {

    /**
	 * 
	 */
	connectedCallback() {
        if(!this.hasAttribute("id") || !KTBS4LA2DocumentHeader._alreadyInjectedHeadersIDs.includes(this.getAttribute("id"))) {
            document.head.append(...this.childNodes);

            if(this.hasAttribute("id"))
                KTBS4LA2DocumentHeader._alreadyInjectedHeadersIDs.push(this.getAttribute("id"));
        }
    }
}

KTBS4LA2DocumentHeader._alreadyInjectedHeadersIDs = new Array();

customElements.define('ktbs4la2-document-header', KTBS4LA2DocumentHeader);