import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

import {ResourceMultiton} from "../../ktbs-api/ResourceMultiton.js";
import {Trace} from "../../ktbs-api/Trace.js";
import {TraceStats} from "../../ktbs-api/TraceStats.js";

import "../ktbs4la2-pie-chart/ktbs4la2-pie-chart.js";

/**
 * 
 */
class KTBS4LA2TraceStats extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true, true);
		this._originTime = undefined;

		this._modelReady = new Promise((resolve, reject) => {
			this._resolveModelReady = resolve;
			this._rejectModelReady = resolve;
		});
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		observedAttributes.push('uri');
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		if(attributeName == "uri") {
			this._trace = ResourceMultiton.get_resource(Trace, newValue);
			this._trace.registerObserver(this._onTraceNotification.bind(this));
			this._onTraceNotification();
		}
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._container = this.shadowRoot.querySelector("#container");
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
		this._waitMessage = this.shadowRoot.querySelector("#wait-message");
		this._errorMessage = this.shadowRoot.querySelector("#error-message");
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
	_onTraceNotification() {
		switch(this._trace.syncStatus) {
			case "needs_sync":
				this._onTraceOrStatsPending();
				this._trace.get(this._abortController.signal);
				break;
			case "pending":
				this._onTraceOrStatsPending();
				break;
			case "in_sync" :
				this._onTraceReady();
				break;
			default:
				this._onTraceError();
				break;
		}
	}

	/**
	 * 
	 */
	_onModelNotification() {
		switch(this._model.syncStatus) {
			case "needs_sync":
				this._model.get(this._abortController.signal).catch(() => {});
				break;
			case "in_sync" :
				this._resolveModelReady();
				break;
			case "pending" :
				break;
			default:
				this._rejectModelReady(this._model.error);
				break;
		}
	}

	/**
	 * 
	 */
	_onStatsNotification() {
		switch(this._stats.syncStatus) {
			case "needs_sync":
				this._onTraceOrStatsPending();
				this._stats.get(this._abortController.signal);
				break;
			case "pending":
				this._onTraceOrStatsPending();
				break;
			case "in_sync" :
				this._onStatsReady();
				break;
			default:
				this._onStatsError();
				break;
		}
	}

	/**
	 * 
	 */
	_onTraceReady() {
		let traceOriginString = this._trace.origin;

		if(traceOriginString != undefined) {
			let parsedOrigin = Date.parse(traceOriginString);

			if(!isNaN(parsedOrigin))
				this._originTime = parsedOrigin;
		}

		if(!this._model || (this._trace.model != this._model)) {
			if(this._model) {
				this._model.unregisterObserver(this._onModelNotification.bind(this));
				delete this._model;
			}

			this._model = this._trace.model;
			this._model.registerObserver(this._onModelNotification.bind(this), "sync-status-change");
			this._onModelNotification(this._model, "sync-status-change");
		}

		if(this._stats)
			this._stats.unregisterObserver(this._onStatsNotification.bind(this));

		this._stats = this._trace.stats;
		this._stats.registerObserver(this._onStatsNotification.bind(this));
		this._onStatsNotification();
		this._updateBeginEnd();
	}

	/**
	 * 
	 */
	_updateBeginEnd() {
		this._componentReady.then(() => {
			if(this.stats && (this._stats.min_time != undefined) && (this._originTime != undefined)){
				let minTime = parseInt(this._stats.min_time, 10) + this._originTime;
				this._beginTag.innerText = this.formatTimeStampToDate(minTime);
			}
			else
				this._beginContainer.style.display = "none";

			if(this.stats && (this._stats.max_time != undefined) && (this._originTime != undefined)) {
				let maxTime = parseInt(this._stats.max_time, 10) + this._originTime;
				this._endTag.innerText = this.formatTimeStampToDate(maxTime);
			}
			else
				this._endContainer.style.display = "none";
		});
	}

	/**
	 * 
	 */
	_updatePieChart() {
		while(this._pieChart.firstChild)
		this._pieChart.removeChild(this._pieChart.firstChild);

		let obselCount = this._stats.obsel_count;
		this._countTag.innerText = obselCount;

		if(obselCount > 0) {
			let obselCountPerType = this._stats.obsel_count_per_type;
			let sorted_slices = new Array();

			for(let i = 0; i < obselCountPerType.length; i++) {
				let type = obselCountPerType[i]["stats:hasObselType"];
				let count = obselCountPerType[i]["stats:nb"];
				let sliceElement = document.createElement("ktbs4la2-pie-slice");
				sliceElement.setAttribute("string", type);

				this._modelReady.then(() => {
					const obseltype_id = type.startsWith("m:")?type.substring(2):type;
					const obselType = this._model.get_obsel_type(obseltype_id);

					if(obselType) {
						sliceElement.setAttribute("string", obselType.get_preferred_label(this._lang));

						if(obselType.suggestedColor)
							sliceElement.setAttribute("color", obselType.suggestedColor);

						const rank = obselType.rank_within_parent_model;
						
						if(rank != undefined)
							sorted_slices[rank] = sliceElement;
					}
				})
				.catch(this.emitErrorEvent);

				sliceElement.setAttribute("number", count);
				this._pieChart.appendChild(sliceElement);
			}

			this._modelReady.then(() => {
				if(sorted_slices.length > 1) {
					// reindex the array in case it has missing keys
					sorted_slices = sorted_slices.filter(val => val);
					let inversion_occured;

					do {
						inversion_occured = false;

						for(let rank = 0; rank < sorted_slices.length; rank++) {
							const aSlice = sorted_slices[rank];

							if(aSlice) {
								const nextSibling = this._pieChart.childNodes[rank];

								if(nextSibling && (nextSibling != aSlice)) {
									this._pieChart.insertBefore(aSlice, nextSibling);
									inversion_occured = true;
								}
							}
						}
					} while(inversion_occured);
				} 
			})
			.catch(this.emitErrorEvent);
		}
		else
			this._pieChart.style.display = "none";
	}

	/**
	 * 
	 */
	_onStatsReady() {
		this._updateBeginEnd();

		this._componentReady.then(() => {
			let duration = this._stats.duration;

			if(duration != null)
				this._durationTag.innerText = this.formatTimeStampDeltaToDuration(duration);
			else
				this._durationContainer.style.display = "none";

			
			this._updatePieChart();

			if(this._container.classList.contains("waiting"))
				this._container.classList.remove("waiting");

			if(this._container.classList.contains("error"))
				this._container.classList.remove("error");
		});
	}

	/**
	 * 
	 */
	_onStatsError() {
		this._setError(this._stats.error);
	}

	/**
	 * 
	 */
	_onTraceError() {
		this._setError(this._trace.error);
	}

	/**
	 * 
	 */
	_setError(error) {
		this.emitErrorEvent(error);
		
		this._componentReady.then(() => {
			this._container.className = "error";
			this._errorMessage.innerText = "Error : " + error;
		});
	}

	/**
	 * 
	 */
	_onTraceOrStatsPending() {
		this._componentReady.then(() => {
			this._container.className = "waiting";
		});
	}

	/**
	 * 
	 */
	_updateStringsTranslation() {
		this._waitMessage.innerText = this._translateString("Waiting for server response...");
		this._beginLabel.innerText = this._translateString("Begin") + " :";
		this._endLabel.innerText = this._translateString("End") + " :";
		this._durationLabel.innerText = this._translateString("Duration") + " :";

		let duration = this._stats.duration;

		if(duration != null)
			this._durationTag.innerText = this.formatTimeStampDeltaToDuration(duration);
		else
			this._durationContainer.style.display = "none";

		this._countLabel.innerText = this._translateString("Obsels count") + " :";
		this._pieChart.setAttribute("title", this._translateString("Obsels count per obsel types"));
		this._updatePieChart();
	}
}

customElements.define('ktbs4la2-trace-stats', KTBS4LA2TraceStats);
