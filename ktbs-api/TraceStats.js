import {Resource} from "./Resource.js";

/**
 * 
 */
export class TraceStats extends Resource {

	/**
	 * 
	 */
	get_min_time() {
		if(this._parsedJson['stats:minTime'] != undefined)
			return this._parsedJson['stats:minTime'];
		else
			return null;
	}

	/**
	 * 
	 */
	get_max_time() {
		if(this._parsedJson['stats:maxTime'] != undefined)
			return this._parsedJson['stats:maxTime'];
		else
			return null;
	}

	/**
	 * 
	 */
	get_obsel_count() {
		if(this._parsedJson['stats:obselCount'] != undefined)
			return this._parsedJson['stats:obselCount'];
		else
			return 0;
	}

	/**
	 * 
	 */
	get_duration() {
		if(this._parsedJson['stats:duration'] != undefined)
			return this._parsedJson['stats:duration'];
		else
			return null;
	}

	/**
	 * 
	 */
	get_obsel_count_per_type() {
		if(this._parsedJson['stats:obselCountPerType'] != undefined) {
			if(this._parsedJson['stats:obselCountPerType'] instanceof Array)
				return this._parsedJson['stats:obselCountPerType'];
			else
				return new Array(this._parsedJson['stats:obselCountPerType']);
		}
		else
			return new Array();
	}
}
