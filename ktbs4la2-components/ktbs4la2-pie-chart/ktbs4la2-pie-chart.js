import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

class KTBS4LA2PieChart extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, false, false);

		this._GoogleApiReady = new Promise(function(resolve, reject) {
			this.loadHeadScriptElement("https://www.gstatic.com/charts/loader.js").then(function() {

				// Load the Visualization API and the corechart package.
				google.charts.load('current', {'packages':['corechart']});

				// Set a callback to run when the Google Visualization API is loaded.
				google.charts.setOnLoadCallback(function() {
					// Create the data table.
					this._chartData = new google.visualization.DataTable();
					this._chartData.addColumn("string");
					this._chartData.addColumn("number");
					resolve();
				}.bind(this));
			}.bind(this));
		}.bind(this));

		this._slicesNodesObserver = new MutationObserver(this.onSlicesNodesMutation.bind(this));
		this._slicesNodesObserver.observe(this, { childList: true, subtree: false });
		
		this._chartOptions = {'title': "",
								'width': 400,
								'height': 300};

		this._stringLabel = "String";
		this._numberLabel = "Number";
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push('title');
		observedAttributes.push('width');
		observedAttributes.push('height');
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "title")
			this._chartOptions.title = newValue;
		else if (attributeName == "width")
			this._chartOptions.width = parseInt(newValue);
		else if (attributeName == "height")
			this._chartOptions.height = parseInt(newValue);

		Promise.all([this._componentReady, this._GoogleApiReady]).then(function() {
			this._chart.draw(this._chartData, this._chartOptions);
		}.bind(this));
	}

	/**
	 * Looks for a script tag pointing to the url passed as "src" in the document header, and creates it if it doesn't exists yet.
	 * @param src the URL of the script
	 * @returns a Promise
	 */
	loadHeadScriptElement(src) {
		return new Promise((resolve, reject) => {
			let existingScriptTag = document.head.querySelector("script[src=\"" + src + "\"]");

			if(existingScriptTag)
				resolve();
			else {
				let newScriptTag = document.createElement("script");
				newScriptTag.src = src;
				document.head.appendChild(newScriptTag);
				
				newScriptTag.addEventListener("load", function(event) {
					resolve();
				});
			}
		});
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._chartDiv = this.shadowRoot.querySelector("#chart");

		this._GoogleApiReady.then(function() {
			// Instantiate our chart, passing in some options
			this._chart = new google.visualization.PieChart(this._chartDiv);
		}.bind(this));
	}

	/**
	 * 
	 */
	onSlicesNodesMutation(mutationRecord, observer) {
		for(let i = 0; i < mutationRecord.length; i++) {
			let addedNodes = mutationRecord[i].addedNodes;
	
			if(addedNodes.length > 0) {
				for(let j = 0; j < addedNodes.length; j++) {
					let addedNode = addedNodes[j];

					if((addedNode.localName == "ktbs4la2-pie-slice") && addedNode.getAttribute("string") && addedNode.getAttribute("number")) {
						this._GoogleApiReady.then(() => {
							this._chartData.addRow([addedNode.getAttribute("string"), parseFloat(addedNode.getAttribute("number"))]);
						});
					}
				}

				Promise.all([this.templateReady, this._GoogleApiReady]).then(() => {
					this._chart.draw(this._chartData, this._chartOptions);
				});
			}
		}
	}
}

customElements.define('ktbs4la2-pie-chart', KTBS4LA2PieChart);
