import {HubbleSubRule} from "./HubbleSubRule.js";
import {KtbsError} from "./Errors.js";

/**
 * Class for Hubble rules. Please note that this class is NOT a descendant from "Resource". Therefore, HubbleRule instances don't support get/put/post/delete as Hubble rules data management is the responsibility of their respective parent Model instance.
 */
export class HubbleRule {

    /**
     * Constructor for class HubbleRule
     * \param Object JSONData - the data describing the Hubble rule
     * \public
     */
    constructor(JSONData = {}, parent) {

        /**
         * The data describing the Hubble rule
         * \var Object
         * \protected
         */
        this._JSONData = JSONData;

        /**
         * The parent for the Hubble rule
         * \var {*}
         * \protected
         */
        this._parent = parent;
    }

    /**
     * Gets the rule's parent
     * \return {*}
     * \public
     */
    get parent() {
        return this._parent;
    }

    /**
     * Gets the ID of the Hubble rule
     * \return string
     * \public
     */
    get id() {
        return this._JSONData["id"];
    }

    /**
     * Sets the ID of the Hubble rule
     * \param string new_id - the new ID for the Hubble rule
     * \public
     */
    set id(new_id) {
        this._JSONData["id"] = new_id;
    }

    /**
     * Gets the symbol associated with the rule
     * \return char
     * \public
     */
    get symbol() {
        if(this._JSONData["symbol"])
            return this._JSONData["symbol"];
        else
            return {};
    }

    /**
     * Sets the symbol associated with the rule
     * \param char new_symbol - the new symbol associated with the rule
     * \public
     */
    set symbol(new_symbol) {
        this._JSONData["symbol"] = new_symbol;
    }

    /**
     * Gets whether or not the Obsels matching the Hubble rule should be visibles
     * \return boolean
     * \public
     */
    get visible() {
        return (this._JSONData["visible"] != false);
    }

    /**
     * Sets whether or not an Obsel matching the Hubble rule should be visible
     * \param boolean new_visible - the new visibility for Obsels matching the Hubble rule
     * \public
     */
    set visible(new_visible) {
        if(typeof new_visible === "boolean")
            this._JSONData["visible"] = new_visible;
        else
            throw new TypeError("Value for \"visible\" property must be a boolean");
    }

    /**
     * Gets the Hubble rule rules as an Array of HubbleSubRule
     * \return Arrayof HubbleSubRule
     * \public
     */
    get rules() {
        if(!this._rules) {
            this._rules = new Array();

            if(this._JSONData["rules"] instanceof Array) {
                for(let i = 0; i < this._JSONData["rules"].length; i++) {
                    let aRuleRuleData = this._JSONData["rules"][i];
                    let aRuleRule = new HubbleSubRule(aRuleRuleData, this);
                    this._rules.push(aRuleRule);
                }
            }
        }

        return this._rules;
    }

    /**
     * Sets the rules of the Hubble rule
     * \param Array of HubbleSubRule - new_rules the new rules for the Hubble rule
     * \public
     */
    set rules(new_rules) {
        this._JSONData["rules"] = new Array();

        for(let i = 0; i < new_rules.length; i++)
            this._JSONData["rules"].push(new_rules[i]._JSONData);

        this._rules = new_rules;
    }

    /**
     * Gets the rank of a subrule within the current rule's subrules
     * \param HubbleSubRule subrule
     * \throws TypeError throws a TypeError if the provided argument is not an instance of HubbleSubRule
     * \throws KtbsError throws a KtbsError if the subrule provided as argument does not belong to the current rule
     * \return int the rank of the subrule within the current rule's subrules, or null if it can't be determined
     * \public
     */
    get_subrule_rank(subrule) {
        if(subrule instanceof HubbleSubRule) {
            if(subrule.parent == this) {
                for(let i = 0; i < this.rules.length; i++)
                    if(subrule == this.rules[i])
                        return i;

                return null;
            }
            else
                throw new KtbsError("The provided subrule does not belong to the current rule");
        }
        else
            throw new TypeError("Argument must be an instance of HubbleSubRule");
    }

    /**
     * Checks if the obsel provided as an argument matches the current rule
     * \param Obsel obsel - the obsel to check if it matches the current rule
     * \return boolean
     * \public
     */
    matchedByObsel(obsel) {
		let matches = false;

		for(let i = 0; (!matches) && (i < this.rules.length); i++) {
			let subrule = this.rules[i];
			matches = subrule.matchedByObsel(obsel);
		}

		return matches;
    }
    
    /**
     * Gets a default "catch-all" rule that matches any obsel
     * \return HubbleRule
     * \static
     * \public
     */
    static get_catchAllRule(parent) {
        let catchAllRule = new HubbleRule({}, parent);
        let subRule = new HubbleSubRule({}, catchAllRule);
        subRule.type = "*";
        catchAllRule.rules.push(subRule);
        return catchAllRule;
	}
}