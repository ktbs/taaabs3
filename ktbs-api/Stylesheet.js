import {StylesheetRule} from "./StylesheetRule.js";

/**
 * Class for style sheets. Please note that this class is NOT a descendant from "Resource". Therefore, Stylesheet instances don't support get/put/post/delete as style sheets data management is the responsibility of their respective parent Model instance.
 */
export class Stylesheet {
    
    /**
     * Constructor for class Stylesheet
     * @param Model parentModel the Model the style sheet is described in
     * @param Object JSONData the data describing the style sheet
     */
    constructor(parentModel, JSONData = {}) {

        /**
         * The Model the style sheet is described in
         * @type Model
         */
        this._parentModel = parentModel;

        /**
         * The data describing the style sheet
         * @type Object
         */
       this._JSONData = JSONData;
    }

    /**
     * Gets the name of the stylesheet
     * @return string
     */
    get name() {
        return this._JSONData["name"];
    }

    /**
     * Sets the name of the style sheet
     * @param string new_name the new name for the style sheet
     */
    set name(new_name) {
        this._JSONData["name"] = new_name;
    }

    /**
     * Gets the description of the stylesheet
     * @return string
     */
    get description() {
        return this._JSONData["description"];
    }

    /**
     * Sets the description of the style sheet
     * @param string new_description the new description for the style sheet
     */
    set description(new_description) {
        this._JSONData["description"] = new_description;
    }

    /**
     * Gets the rules of the stylesheet
     * @return Array
     */
    get rules() {
        if(!this._rules) {
            this._rules = new Array();

            if(this._JSONData["rules"] instanceof Array) {
                for(let i = 0; i < this._JSONData["rules"].length; i++) {
                    let aRuleJSONData = this._JSONData["rules"][i];
                    let aRule = new StylesheetRule(this._parentModel, aRuleJSONData);
                    this._rules.push(aRule);
                }
            }
        }

        return this._rules;
    }

    /**
     * Sets the rules of the style sheet
     * @param Array new_rules the new rules for the style sheet
     */
    set rules(new_rules) {
        this._rules = new_rules;
    }

    /**
     * 
     * @param Obsel obsel 
     * @return StylesheetRule
     */
    getFirstRuleMatchedByObsel(obsel) {
		let firstMatchedRule = null;

        for(let i = 0; (firstMatchedRule == null) && (i < this.rules.length); i++) {
            let testedRule = this.rules[i];

            if(testedRule.matchedByObsel(obsel))
                firstMatchedRule = testedRule;
        }

		return firstMatchedRule;
	}
}