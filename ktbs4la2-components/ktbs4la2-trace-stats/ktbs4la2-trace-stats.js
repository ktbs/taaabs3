import {KtbsResourceElement} from "../common/KtbsResourceElement.js";
import {TraceStats} from "../../ktbs-api/TraceStats.js";

import "../ktbs4la2-pie-chart/ktbs4la2-pie-chart.js";

/**
 * 
 */
class KTBS4LA2TraceStats extends KtbsResourceElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true);
		this._resolveTypeSet();
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._beginContainer = this.shadowRoot.querySelector("#begin-container");
		this._beginLabel = this.shadowRoot.querySelector("#begin-label");
		this._beginTag = this.shadowRoot.querySelector("#begin");
		this._endContainer = this.shadowRoot.querySelector("#end-container");
		this._endLabel = this.shadowRoot.querySelector("#end-label");
		this._endTag = this.shadowRoot.querySelector("#end");
		this._durationContainer = this.shadowRoot.querySelector("#duration-container");
		this._durationLabel = this.shadowRoot.querySelector("#duration-label");
		this._durationTag = this.shadowRoot.querySelector("#duration");
		this._countTag = this.shadowRoot.querySelector("#count");
		this._countLabel = this.shadowRoot.querySelector("#count-label");
		this._pieChart = this.shadowRoot.querySelector("#obsels-types-pie-chart");
		this._errorNameDiv = this.shadowRoot.querySelector("#error-name");
		this._errorMessageDiv = this.shadowRoot.querySelector("#error-message");
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
	formatTimeStampDeltaToDuration(timestampDelta) {
		let days = Math.floor(timestampDelta / 86400000);
		let rest = timestampDelta - (86400000 * days);
		let hours = Math.floor(rest / 3600000);
		rest -= 3600000 * hours;
		let minutes = Math.floor(rest / 60000);
		rest -= 60000 * minutes;
		let seconds = Math.floor(rest / 1000);
		rest -= 1000 * seconds;

		let durationString = "";

		if(days > 0)
			durationString = days + this._translateString(" d. ");

		if((durationString != "") || (hours > 0))
			durationString += hours + this._translateString(" h. ");

		if((durationString != "") || (minutes > 0))
			durationString += minutes + this._translateString(" m. ");

		if((durationString != "") || (seconds > 0))
			durationString += seconds + this._translateString(" s. ");

		durationString += rest + this._translateString(" ms.");
		
		return durationString;
	}

	/**
	 * 
	 */
	onktbsResourceLoaded() {
		this._componentReady.then(() => {
			let minTime = this._ktbsResource.get_min_time();

			if(minTime != null)
				this._beginTag.innerText = this.formatTimeStampToDate(minTime);
			else
				this._beginContainer.style.display = "none";

			let maxTime = this._ktbsResource.get_max_time();

			if(maxTime != null)
				this._endTag.innerText = this.formatTimeStampToDate(maxTime);
			else
				this._endContainer.style.display = "none";

			let duration = this._ktbsResource.get_duration();

			if(duration != null)
				this._durationTag.innerText = this.formatTimeStampDeltaToDuration(duration);
			else
				this._durationContainer.style.display = "none";

			let obselCount = this._ktbsResource.get_obsel_count();
			this._countTag.innerText = obselCount;

			if(obselCount > 0) {
				let obselCountPerType = this._ktbsResource.get_obsel_count_per_type();

				for(let i = 0; i < obselCountPerType.length; i++) {
					let type = obselCountPerType[i]["stats:hasObselType"];
					let count = obselCountPerType[i]["stats:nb"];
					let sliceElement = document.createElement("ktbs4la2-pie-slice");
					sliceElement.setAttribute("string", type);
					sliceElement.setAttribute("number", count);
					this._pieChart.appendChild(sliceElement);
				}
			}
			else
				this._pieChart.style.display = "none";
		});
	}

	/**
	 * 
	 */
	onktbsResourceLoadFailed(error) {
		super.onktbsResourceLoadFailed(error);

		this._componentReady.then(() => {
			this.setAttribute("status", "error");
			this._errorNameDiv.innerText = error.name;
			this._errorMessageDiv.innerText = error.message;
		});
	}

	/**
	 * 
	 */
	_getKtbsResourceClass() {
		return TraceStats;
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this._beginLabel.innerText = this._translateString("Begin") + " :";
		this._endLabel.innerText = this._translateString("End") + " :";
		this._durationLabel.innerText = this._translateString("Duration") + " :";

		let duration = this._ktbsResource.get_duration();

		if(duration != null)
			this._durationTag.innerText = this.formatTimeStampDeltaToDuration(duration);
		else
			this._durationContainer.style.display = "none";

		this._countLabel.innerText = this._translateString("Obsels count") + " :";
		this._pieChart.setAttribute("title", this._translateString("Obsels count per obsel types"));
	}
}

customElements.define('ktbs4la2-trace-stats', KTBS4LA2TraceStats);
