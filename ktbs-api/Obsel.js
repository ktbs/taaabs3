import {ResourceProxy} from "./ResourceProxy.js";
import {Resource} from "./Resource.js";
import {AttributeType} from "./AttributeType.js";
import {Attribute} from "./Attribute.js";
import {Trace} from "./Trace.js";

/**
 * Class for the "Obsel" resource-type
 */
export class Obsel extends Resource {

    /**
     * Gets the relative ID of the Obsel's type (relative to the Model the ObselType is described in)
     * @returns string
     */
    get type_id() {
        if(!this._type_id) {
            // @TODO : handle the case when the Obsel has several types
            let type_link = (this._JSONData["@type"] instanceof Array)?this._JSONData["@type"][0]:this._JSONData["@type"];
            let type_uri = this.resolve_link_uri(type_link);

            if(type_uri.hash && type_uri.hash.startsWith('#'))
                this._type_id = decodeURIComponent(type_uri.hash.substring(1));
            else
                this._type_id = decodeURIComponent(this._JSONData["@type"]);
        }

        return this._type_id;
    }

    /**
     * Gets the Obsel's type
     * @returns ObselType
     */
    get type() {
        if(!this._type && this.parent && this.parent.model)
            this._type = this.parent.model.get_obsel_type(this.type_id);

        return this._type;
    }

    /**
	 * Gets the parent Trace of this Obsel
	 * @return Trace the Obsel's parent Trace if any, or undefined if the Obsel's Trace is unknown (i.e. the Obsel hasn't been read or recorded yet).
	 */
	get parent() {
        if(!this._parent && this._JSONData.hasTrace)
            this._parent = ResourceProxy.get_resource(Trace, this.resolve_link_uri(this._JSONData.hasTrace));
            
        return this._parent;
    }

    /**
     * Sets the parent trace of the Obsel
     * @param Trace new_parent the new parent Trace for the Obsel
     */
    set parent(new_parent) {
        if(new_parent instanceof Trace) {
            this._parent = new_parent;
            this._JSONData.hasTrace = new_parent.uri.toString();
        }
        else
            throw new TypeError("Obsel's parent must be of type Trace");
    }
    
    /**
     * Gets the begin timestamp of the obsel
     * @returns int
     */
    get begin() {
        if((this._begin == undefined) && (this._JSONData.begin != undefined))
            this._begin = parseInt(this._JSONData.begin, 10);

        return this._begin;
    }

    /**
     * Gets the begin Date of the obsel
     * @returns Date
     */
    get beginDT() {
        if(!this._beginDT && this._JSONData.beginDT)
            this._beginDT = new Date(this._JSONData.beginDT);
        
        return this._beginDT;
    }

    /**
     * Gets the end timestamp of the obsel
     * @returns int
     */
    get end() {
        if((this._end == undefined) && (this._JSONData.end != undefined))
            this._end = parseInt(this._JSONData.end, 10);
        
        return this._end;
    }

    /**
     * Gets the end Date of the obsel
     * @returns Date
     */
    get endDT() {
        if(!this._endDT && this._JSONData.endDT)
            this._endDT = new Date(this._JSONData.endDT);
        
        return this._endDT;
    }

    /**
     * Gets the subject of the obsel
     * @returns string
     */
    get subject() {
        return this._JSONData.subject;
    }

    /**
     * Gets the source obsels of the current obsel (when it belongs to a computed trace)
     * @returns Obsel[]
     */
    get sourceObsels() {
        if(!this._sourceObsels && this._JSONData.hasSourceObsel) {
            this._sourceObsels = new Array();
            let source_obsels_links = this._JSONData.hasSourceObsel;
            
            for(let i = 0; i < source_obsels_links.length; i++) {
                let a_source_obsel_link = source_obsels_links[i];
                let aSourceObsel = ResourceProxy.get_resource(Obsel, this.resolve_link_uri(a_source_obsel_link));
                this._sourceObsels.push(aSourceObsel);
            }
        }
        
        return this._sourceObsels;
    }

    /**
     * Gets the non-system attributes of the Obsel
     * @returns Array
     */
    get attributes() {
        if(!this._attributes) {
            this._attributes = new Array();

            for(let attribute_type_link in this._JSONData) {
                if(!AttributeType.system_types_ids.includes(attribute_type_link)) {
                    let attribute_value = this._JSONData[attribute_type_link];
                    let attribute = new Attribute(this, attribute_type_link, attribute_value);
                    this._attributes.push(attribute);
                }
            }
        }
        return this._attributes;
    }
}