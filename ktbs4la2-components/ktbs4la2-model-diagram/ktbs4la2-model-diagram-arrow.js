import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

/**
 * 
 */
 class KTBS4LA2ModelDiagramArrow extends TemplatedHTMLElement {

    /**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true);
        this._bindedOnMoveBoxMethod = this._onMoveBox.bind(this);
        this._fromAnchor = "top";
        this._toAnchor = "bottom";
    }

    /**
     * 
     */
    get fromBox() {
        return this._fromBox;
    }

    /**
     * 
     */
    set fromBox(new_from_box) {
        if(new_from_box instanceof HTMLElement) {
            if(new_from_box != this._fromBox) {
                if(this._fromBox)
                    this._fromBox.removeEventListener("move", this._bindedOnMoveBoxMethod);

                this._fromBox = new_from_box;
                this._fromBox.addEventListener("move", this._bindedOnMoveBoxMethod);
                this._requestUpdateDraw();
            }
        }
        else
            throw new TypeError("New value for property fromBox must be an instance of HTMLElement");
    }

    /**
     * 
     */
    get fromAnchor() {
        return this._fromAnchor;
    }

    /**
     * 
     */
    set fromAnchor(new_from_anchor) {
        if(
                (new_from_anchor == "left")
            ||  (new_from_anchor == "top")
            ||  (new_from_anchor == "right")
            ||  (new_from_anchor == "bottom")
        ) {
            if(new_from_anchor != this._fromAnchor) {
                this._fromAnchor = new_from_anchor;
                this._requestUpdateDraw();
            }
        }
        else
            throw new TypeError("New value for fromAnchor property must be either \"left\", \"top\", \"right\" or \"bottom\"");
    }

    /**
     * 
     */
    get toBox() {
        return this._toBox;
    }

    /**
     * 
     */
    set toBox(new_to_box) {
        if(new_to_box instanceof HTMLElement) {
            if(new_to_box != this._toBox) {
                if(this._toBox)
                    this._toBox.removeEventListener("move", this._bindedOnMoveBoxMethod);

                this._toBox = new_to_box;
                this._toBox.addEventListener("move", this._bindedOnMoveBoxMethod);
                this._requestUpdateDraw();
            }
        }
        else
            throw new TypeError("New value for property toBox must be an instance of HTMLElement");
    }

    /**
     * 
     */
     get toAnchor() {
        return this._toAnchor;
    }

    /**
     * 
     */
    set toAnchor(new_to_anchor) {
        if(
                (new_to_anchor == "left")
            ||  (new_to_anchor == "top")
            ||  (new_to_anchor == "right")
            ||  (new_to_anchor == "bottom")
        ) {
            if(new_to_anchor != this._toAnchor) {
                this._toAnchor = new_to_anchor;
                this._requestUpdateDraw();
            }
        }
        else
            throw new TypeError("New value for toAnchor property must be either \"left\", \"top\", \"right\" or \"bottom\"");
    }

    /**
     * 
     */
    connectedCallback() {
        super.connectedCallback();
        this._parentNodeObserver = new ResizeObserver(this._onParentDiagramResize.bind(this));
        this._parentNodeObserver.observe(this.parentNode);
    }

    /**
     * 
     */
    disconnectedCallback() {
        super.disconnectedCallback();

        if(this._parentNodeObserver) {
            this._parentNodeObserver.disconnect();
            delete this._parentNodeObserver;
        }
    }

    /**
     * 
     */
    _updateStringsTranslation() {

    }

    /**
     * 
     */
    _updateDraw() {
        const diagramRect = this.parentNode.getBoundingClientRect();
        const fromRect = this.fromBox.getBoundingClientRect();
        let fromX, fromY;

        switch(this.fromAnchor) {
            case "left":
                fromX = fromRect.left - diagramRect.left + this.parentNode.scrollLeft;
                fromY = fromRect.top + (fromRect.height / 2) - diagramRect.top + this.parentNode.scrollTop;
                break;
            case "top":
                fromX = fromRect.left + (fromRect.width / 2) - diagramRect.left + this.parentNode.scrollLeft;
                fromY = fromRect.top - diagramRect.top + this.parentNode.scrollTop;
                break;
            case "right":
                fromX = fromRect.left + fromRect.width - diagramRect.left + this.parentNode.scrollLeft;
                fromY = fromRect.top + (fromRect.height / 2) - diagramRect.top + this.parentNode.scrollTop;
                break;
            case "bottom":
                fromX = fromRect.left + (fromRect.width / 2) - diagramRect.left + this.parentNode.scrollLeft;
                fromY = fromRect.top + fromRect.height - diagramRect.top + this.parentNode.scrollTop;
                break;
        }

        const toRect = this.toBox.getBoundingClientRect();
        let toX, toY;

        switch(this.toAnchor) {
            case "left":
                toX = toRect.left - diagramRect.left + this.parentNode.scrollLeft;
                toY = toRect.top + (toRect.height / 2) - diagramRect.top + this.parentNode.scrollTop;
                break;
            case "top":
                toX = toRect.left + (toRect.width / 2) - diagramRect.left + this.parentNode.scrollLeft;
                toY = toRect.top - diagramRect.top + this.parentNode.scrollTop;
                break;
            case "right":
                toX = toRect.left + toRect.width - diagramRect.left + this.parentNode.scrollLeft;
                toY = toRect.top + (toRect.height / 2) - diagramRect.top + this.parentNode.scrollTop;
                break;
            case "bottom":
                toX = toRect.left + (toRect.width / 2) - diagramRect.left + this.parentNode.scrollLeft;
                toY = toRect.top + toRect.height - diagramRect.top + this.parentNode.scrollTop;
                break;
        }

        const horizontalOffset = toX - fromX;
        const verticalOffset = toY - fromY;
        const distance = Math.sqrt(horizontalOffset*horizontalOffset + verticalOffset*verticalOffset);
        
        let angle; 

        if(verticalOffset < 0)
            angle = -Math.atan(horizontalOffset / verticalOffset);
        else
            angle = -Math.atan(horizontalOffset / verticalOffset) + Math.PI;
        
        this.style.height = distance + "px";
        this.style.left = (fromX + (horizontalOffset / 2) - 9) + "px";
        this.style.top = toY - (verticalOffset / 2) - (distance / 2) + "px";
        this.style.transform = "rotate(" + angle + "rad)";
    }

    /**
     * 
     */
    _requestUpdateDraw() {
        if(this._updateDrawTaskID)
            clearTimeout(this._updateDrawTaskID);

        this._updateDrawTaskID = setTimeout(() => {
            this._componentReady.then(() => {
                this._updateDraw();
                delete this._updateDrawTaskID;
            });
        });
    }

    /**
     * 
     */
    _onParentDiagramResize(entries, observer) {
        this._requestUpdateDraw();
    }

    /**
     * 
     */
    _onMoveBox(event) {
        this._requestUpdateDraw();
    }
}

customElements.define('ktbs4la2-model-diagram-arrow', KTBS4LA2ModelDiagramArrow);