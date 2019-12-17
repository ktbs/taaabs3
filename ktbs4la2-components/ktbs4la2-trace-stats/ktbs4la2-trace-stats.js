import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";
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

		this._originTime = 0;

		this._resolveTraceLoaded;
		this._rejectTraceLoaded;

		this._traceLoaded =  new Promise((resolve, reject) => {
			this._resolveTraceLoaded = resolve;
			this._rejectTraceLoaded = reject;
		});

		this._traceLoaded.then(() => {
			this._onTraceLoaded();
		})

		this._resolveStatsLoaded;
		this._rejectStatsLoaded;

		this._statsLoaded =  new Promise((resolve, reject) => {
			this._resolveStatsLoaded = resolve;
			this._rejectStatsLoaded = reject;
		});

		this._statsLoaded.then(() => {
			this._onStatsLoaded();
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
			this._trace = new Trace(newValue);

			this._trace._read_data(this._abortController.signal)
				.then(() => {
					this._resolveTraceLoaded();
				})
				.catch((error) => {
					this._rejectTraceLoaded(error);

					if((error.name != "AbortError") || !this._abortController.signal.aborted)
						this._setError(error);
				});

			let statsUri = newValue + "@stats";
			this._stats = new TraceStats(statsUri);

			this._stats._read_data(this._abortController.signal)
				.then(() => {
					this._resolveStatsLoaded();
				})
				.catch((error) => {
					this._rejectStatsLoaded();

					if((error.name != "AbortError") || !this._abortController.signal.aborted)
						this._setError(error);
				});
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
	_onTraceLoaded() {
		let traceOriginString = this._trace.get_origin();

		if(traceOriginString != undefined) {
			let parsedOrigin = Date.parse(traceOriginString);

			if(!isNaN(parsedOrigin))
				this._originTime = parsedOrigin;
		}
	}

	/**
	 * 
	 */
	_onStatsLoaded() {
		this._componentReady.then(() => {
			this._traceLoaded.then(() => {
				if(this._stats.get_min_time() != undefined) {
					let minTime = parseInt(this._stats.get_min_time(), 10) + this._originTime;
					this._beginTag.innerText = this.formatTimeStampToDate(minTime);
				}
				else
					this._beginContainer.style.display = "none";

				if(this._stats.get_max_time() != undefined) {
					let maxTime = parseInt(this._stats.get_max_time(), 10) + this._originTime;
					this._endTag.innerText = this.formatTimeStampToDate(maxTime);
				}
				else
					this._endContainer.style.display = "none";
			});

			let duration = this._stats.get_duration();

			if(duration != null)
				this._durationTag.innerText = this.formatTimeStampDeltaToDuration(duration);
			else
				this._durationContainer.style.display = "none";

			let obselCount = this._stats.get_obsel_count();
			this._countTag.innerText = obselCount;

			if(obselCount > 0) {
				let obselCountPerType = this._stats.get_obsel_count_per_type();

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

			if(this._container.classList.contains("waiting"))
				this._container.classList.remove("waiting");
		});
	}

	/**
	 * 
	 */
	_setError(error) {
		this._componentReady.then(() => {
			this._container.className = "error";
			this._errorMessage.innerText = "Error : " + error;
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

		let duration = this._stats.get_duration();

		if(duration != null)
			this._durationTag.innerText = this.formatTimeStampDeltaToDuration(duration);
		else
			this._durationContainer.style.display = "none";

		this._countLabel.innerText = this._translateString("Obsels count") + " :";
		this._pieChart.setAttribute("title", this._translateString("Obsels count per obsel types"));
	}
}

customElements.define('ktbs4la2-trace-stats', KTBS4LA2TraceStats);
