import {StylesheetRuleRule} from "./StylesheetRuleRule.js";

/**
 * Class for style sheets rules. Please note that this class is NOT a descendant from "Resource". Therefore, StylesheetRule instances don't support get/put/post/delete as style sheets rules data management is the responsibility of their respective parent Model instance.
 */
export class StylesheetRule {

    /**
     * Constructor for class StylesheetRule
     * @param Model parentModel the Model the style sheet rule is described in
     * @param Object JSONData the data describing the style sheet rule
     */
    constructor(parentModel, JSONData = {}) {

        /**
         * The Model the style sheet rule is described in
         * @type Model
         */
        this._parentModel = parentModel;

        /**
         * The data describing the style sheet rule
         * @type Object
         */
        this._JSONData = JSONData;
    }

    /**
     * Gets the ID of the style sheet rule
     * @return string
     */
    get id() {
        return this._JSONData["id"];
    }

    /**
     * Sets the ID of the style sheet rule
     * @param string new_id the new ID for the style sheet rule
     */
    set id(new_id) {
        this._JSONData["id"] = new_id;
    }

    /**
     * 
     */
    get symbol() {
        if(this._JSONData["symbol"])
            return this._JSONData["symbol"];
        else
            return {};
    }

    /**
     * 
     */
    set symbol(new_symbol) {
        this._JSONData["symbol"] = new_symbol;
    }

    /**
     * Gets whether or not the Obsels matching the style sheet rule should be visibles
     * @return boolean
     */
    get visible() {
        return (this._JSONData["visible"] != false);
    }

    /**
     * Sets whether or not an Obsel matching the style sheet rule should be visible
     * @param boolean new_visible the new visibility for Obsels matching the style sheet rule
     */
    set visible(new_visible) {
        if(typeof new_visible === "boolean")
            this._JSONData["visible"] = new_visible;
        else
            throw new TypeError("Value for \"visible\" property must be a boolean");
    }

    /**
     * Gets the style sheet rule rules as an Array of StylesheetRuleRule
     * @return Array
     */
    get rules() {
        if(!this._rules) {
            this._rules = new Array();

            if(this._JSONData["rules"] instanceof Array) {
                for(let i = 0; i < this._JSONData["rules"].length; i++) {
                    let aRuleRuleData = this._JSONData["rules"][i];
                    let aRuleRule = new StylesheetRuleRule(this._parentModel, aRuleRuleData);
                    this._rules.push(aRuleRule);
                }
            }
        }

        return this._rules;
    }

    /**
     * Sets the rules of the style sheet rule
     * @param Array new_rules the new rules for the style sheet rule
     */
    set rules(new_rules) {
        this._rules = new_rules;
    }

    /**
     * 
     * @param Obsel obsel
     * @return boolean
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
     * 
     */
    static get catchAllRule() {
        if(!StylesheetRule._catchAllRule) {
            StylesheetRule._catchAllRule = new StylesheetRule();
            let aRuleRule = new StylesheetRuleRule();
            aRuleRule.type = "*";
            StylesheetRule._catchAllRule.rules.push(aRuleRule);
        }

		return StylesheetRule._catchAllRule;
	}
}