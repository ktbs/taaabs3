import {Resource} from "./Resource.js";
import {KtbsError} from "./Errors.js";

/**
 * Class to help reading the statistics of a Trace
 */
export class TraceStats extends Resource {

	/**
	 * Gets the minimum time (= begin) of the Trace
	 * \return string
	 * \public
	 */
	get min_time() {
		return this._JSONData['stats:minTime'];
	}

	/**
	 * Gets the maximum time (= end) of the Trace
	 * \return string
	 * \public
	 */
	get max_time() {
		return this._JSONData['stats:maxTime'];
	}

	/**
	 * Gets the total obsels count of the trace
	 * \return int
	 * \public
	 */
	get obsel_count() {
		if(this._JSONData['stats:obselCount'] != undefined)
			return this._JSONData['stats:obselCount'];
		else
			return 0;
	}

	/**
	 * Gets the duration of the Trace
	 * \return string
	 * \public
	 */
	get duration() {
		if(this._JSONData['stats:duration'] != undefined)
			return this._JSONData['stats:duration'];
		else
			return null;
	}

	/**
	 * Gets the obsels count of the trace for each obsel type of the model
	 * \return Array
	 * \public
	 */
	get obsel_count_per_type() {
		if(this._JSONData['stats:obselCountPerType'] != undefined) {
			if(this._JSONData['stats:obselCountPerType'] instanceof Array)
				return this._JSONData['stats:obselCountPerType'];
			else
				return new Array(this._JSONData['stats:obselCountPerType']);
		}
		else
			return new Array();
	}

	/**
	 * Stores a new resource as a child of the current resource
	 * \throws KtbsError always throws a KtbsError when invoked for a TraceStats as it is not a container resource
	 * \public
	 */
	post(new_child_resource, abortSignal = null, credentials = null) {
		throw new KtbsError("Only Ktbs roots, Bases and Traces can contain child resources");
	}
}
