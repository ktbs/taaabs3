import {Trace} from "./Trace.js";

/**
 * 
 */
export class StoredTrace extends Trace {

	/**
	 * @param Model model
	 */
	set_model(model) {

	}

	/**
	 * @param string origin
	 */
	set_origin(origin) {

	}

	/**
	 * @param int begin
	 */
	set_trace_begin(begin) {

	}

	/**
	 * @param string begin_dt
	 */
	set_trace_begin_dt(begin_dt) {

	}

	/**
	 * @param int end
	 */
	set_trace_end(end) {

	}

	/**
	 * @param string end_dt
	 */
	set_trace_end_dt(end_dt) {

	}

	/**
	 * The default subject is associated to new obsels if they do not specify a subject at creation time.
	 * @return string
	 */
	get_default_subject() {

	}

	/**
	 * @param string subject
	 */
	set_default_subject(subject) {

	}

	/**
	 * @param string id
	 * @param ObselType type
	 * @param int begin
	 * @param int end
	 * @param string subject
	 * @param AttributeType[] attributes
	 * @param [(RelationType, Obsel)] relations
	 * @param [(Obsel, RelationType)] inverse_relations
	 * @param Obsel[] source_obsels
	 * @param string label
	 * @return Obsel
	 */
	create_obsel(id = null, type, begin, end = null, subject, attributes = Array(), relations = Array(), inverse_relations = Array(), source_obsels = Array(), label = null) {

	}
}
