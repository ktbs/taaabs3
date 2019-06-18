import {TemplatedHTMLElement} from "../common/TemplatedHTMLElement.js";

class KTBS4LA2Timeline extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url);

		this._slicesNodesObserver = new MutationObserver(this.onSlicesNodesMutation.bind(this));
		this._slicesNodesObserver.observe(this, { childList: true, subtree: false });
	}

	/**
	 * 
	 */
	static get observedAttributes() {
		let observedAttributes = super.observedAttributes;
		//observedAttributes.push('title');
		return observedAttributes;
	}

	/**
	 * 
	 */
	attributeChangedCallback(attributeName, oldValue, newValue) {
		super.attributeChangedCallback(attributeName, oldValue, newValue);

		// ...
	}

	/**
	 * 
	 */
	onComponentReady() {
		this._time = this.shadowRoot.querySelector("#time");
		this._initTimeDivisions();
	}

	_initTimeDivisions() {
		console.log("begin time divisions");

		if(this.getAttribute("begin") && this.getAttribute("end")) {
			let beginTime = parseInt(this.getAttribute("begin"));
			let endTime = parseInt(this.getAttribute("end"));

			if((beginTime != NaN) && (endTime != NaN) && (beginTime < endTime)) {
				let beginDate = new Date(beginTime);
				let endDate = new Date(endTime);
		
				
				for(let year = beginDate.getFullYear(); year <= endDate.getFullYear(); year++) {
					let yearDivision = document.createElement("div");
					yearDivision.setAttribute("id", "year-" + year);
					yearDivision.classList.add("time-division");
					yearDivision.classList.add("time-division-year");

					let yearLabel = document.createElement("div");
					yearLabel.classList.add("label");
					yearLabel.innerText = year;
					//yearDivision.appendChild(yearLabel);

					let beginMonth = (year == beginDate.getFullYear())?(beginDate.getMonth() + 1):1;
					let endMonth = (year == endDate.getFullYear())?(endDate.getMonth() + 1):12;

					for(let month = beginMonth; month <= endMonth; month++) {
						let monthDivision = document.createElement("div");
						monthDivision.setAttribute("id", "month-" + year + "-" + month);
						monthDivision.classList.add("time-division");
						monthDivision.classList.add("time-division-month");

						let monthLabel = document.createElement("div");
						monthLabel.classList.add("label");
						monthLabel.innerText = month;
						//monthDivision.appendChild(monthLabel);

						let beginDay = ((year == beginDate.getFullYear()) && (month == (beginDate.getMonth() + 1)))?(beginDate.getDate()):1;
						let endDay = ((year == endDate.getFullYear()) && (month == (endDate.getMonth() + 1)))?(endDate.getDate()):31;

						for(let day = beginDay; day <= endDay; day++) {
							let dayDivision = document.createElement("div");
							dayDivision.setAttribute("id", "day-" + year + "-" + month + "-" + day);
							dayDivision.classList.add("time-division");
							dayDivision.classList.add("time-division-day");

							let dayLabel = document.createElement("div");
							dayLabel.classList.add("label");
							dayLabel.innerText = day;
							//dayDivision.appendChild(dayLabel);

							let beginHour = ((year == beginDate.getFullYear()) && (month == (beginDate.getMonth() + 1)) && (day == beginDate.getDate()))?(beginDate.getHours()):0;
							let endHour = ((year == endDate.getFullYear()) && (month == (endDate.getMonth() + 1)) && (day == endDate.getDate()))?(endDate.getHours()):23;

							for(let hour = beginHour; hour <= endHour; hour++) {
								let hourDivision = document.createElement("div");
								hourDivision.setAttribute("id", "hour-" + year + "-" + month + "-" + day + "-" + hour);
								hourDivision.classList.add("time-division");
								hourDivision.classList.add("time-division-hour");

								let hourLabel = document.createElement("div");
								hourLabel.classList.add("label");
								hourLabel.innerText = hour;
								//hourDivision.appendChild(hourLabel);

								let beginMinute = ((year == beginDate.getFullYear()) && (month == (beginDate.getMonth() + 1)) && (day == beginDate.getDate()) && (hour == beginDate.getHours()))?(beginDate.getMinutes()):0;
								let endMinute = ((year == endDate.getFullYear()) && (month == (endDate.getMonth() + 1)) && (day == endDate.getDate()) && (hour == endDate.getHours()))?(endDate.getMinutes()):59;

								for(let minute = beginMinute; minute <= endMinute; minute++) {
									let minuteDivision = document.createElement("div");
									minuteDivision.setAttribute("id", "minute-" + year + "-" + month + "-" + day + "-" + hour + "-" + minute);
									minuteDivision.classList.add("time-division");
									minuteDivision.classList.add("time-division-minute");

									let minuteLabel = document.createElement("div");
									minuteLabel.classList.add("label");
									minuteLabel.innerText = minute;
									//minuteDivision.appendChild(minuteLabel);

									let beginSecond = ((year == beginDate.getFullYear()) && (month == (beginDate.getMonth() + 1)) && (day == beginDate.getDate()) && (hour == beginDate.getHours()) && (minute == beginDate.getMinutes()))?(beginDate.getSeconds()):0;
									let endSecond = ((year == endDate.getFullYear()) && (month == (endDate.getMonth() + 1)) && (day == endDate.getDate()) && (hour == endDate.getHours()) && (minute == endDate.getMinutes()))?(endDate.getSeconds()):59;

									for(let second = beginSecond; second <= endSecond; second++) {
										let secondDivision = document.createElement("div");
										secondDivision.setAttribute("id", "second-" + year + "-" + month + "-" + day + "-" + hour + "-" + minute + "-" + second);
										secondDivision.classList.add("time-division");
										secondDivision.classList.add("time-division-second");

										let secondLabel = document.createElement("div");
										secondLabel.classList.add("label");
										secondLabel.innerText = second;
										//secondDivision.appendChild(secondLabel);

										minuteDivision.appendChild(secondDivision);
									}

									hourDivision.appendChild(minuteDivision);
								}

								dayDivision.appendChild(hourDivision);
							}

							monthDivision.appendChild(dayDivision);
						}

						yearDivision.appendChild(monthDivision);
					}

					this._time.appendChild(yearDivision);
				}
			}
			else
				this.emitErrorEvent(new Error("Invalid attribute value"));
		}
		else
			this.emitErrorEvent(new Error("Missing required attribute"));

		console.log("end time divisions");
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

					/*if((addedNode.localName == "ktbs4la2-pie-slice") && addedNode.getAttribute("string") && addedNode.getAttribute("number")) {
						this._GoogleApiReady.then(() => {
							this._chartData.addRow([addedNode.getAttribute("string"), parseFloat(addedNode.getAttribute("number"))]);
						});
					}*/
				}

				/*Promise.all([this.templateReady, this._GoogleApiReady]).then(() => {
					this._chart.draw(this._chartData, this._chartOptions);
				});*/
			}
		}
	}
}

customElements.define('ktbs4la2-timeline', KTBS4LA2Timeline);
