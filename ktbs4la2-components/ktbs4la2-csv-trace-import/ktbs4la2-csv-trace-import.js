import {TemplatedHTMLElement} from '../common/TemplatedHTMLElement.js';

import {ResourceMultiton} from '../../ktbs-api/ResourceMultiton.js';
import {Base} from '../../ktbs-api/Base.js';
import {Model} from '../../ktbs-api/Model.js';
import {ObselType} from '../../ktbs-api/ObselType.js';
import {AttributeType} from '../../ktbs-api/AttributeType.js';
import {StoredTrace} from '../../ktbs-api/Trace.js';
import {Obsel} from '../../ktbs-api/Obsel.js';

import "../ktbs4la2-resource-picker/ktbs4la2-resource-picker.js";
import "../ktbs4la2-obsel-type-select/ktbs4la2-obsel-type-select.js";
import "../ktbs4la2-resource-id-input/ktbs4la2-resource-id-input.js";
import "../ktbs4la2-multiple-translations-text-input/ktbs4la2-multiple-translations-text-input.js";
import "./ktbs4la2-attributes-mapping-table.js";


/**
 * 
 */
class KTBS4LA2CsvTraceImport extends TemplatedHTMLElement {

	/**
	 * 
	 */
	constructor() {
		super(import.meta.url, true);

        /**
         * 
         * \var Array
         * \protected
         */
        this._fulfilledSteps = new Array();

        /**
         * 
         * \var int
         * \protected
         */
        this._previewChunkSize = 50;

        this._bindedOnBeforeUnloadWindowMethod = this._onBeforeUnloadWindow.bind(this);
        this._bindedOnBeforeRemoveMethod = this._onBeforeRemove.bind(this);
	}

    /**
	 * 
	 */
	static get observedAttributes() {
		let _observedAttributes = super.observedAttributes;
        _observedAttributes.push("parent-uri");
		return _observedAttributes;
    }

    /**
	 * 
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);

        if(name == "parent-uri") {
            this._componentReady.then(() => {
                this._existingModelPicker.setAttribute("browse-start-uri", newValue);
                this._newModelBaseUriSpan.innerText = newValue;
                this._newModelParentPicker.setAttribute("value", newValue);
                this._newModelParentPicker.setAttribute("browse-start-uri", newValue);
                this._traceIdParentPathSpan.innerText = newValue;
                const parentBase = ResourceMultiton.get_resource(Base, newValue);

                parentBase.get_root(this._abortController.signal)
                    .then((root) => {
                        this._existingModelPicker.setAttribute("root-uri", root.uri);
                        this._newModelParentPicker.setAttribute("root-uri", root.uri);
                        this._existingModelPicker.setAttribute("root-label", root.label);
                        this._newModelParentPicker.setAttribute("root-label", root.label);
                    })
                    .catch((error) => {
                        this.emitErrorEvent(error);
                    });
            })
            .catch(() => {});
        }
    }

    /**
	 * 
	 */
	onComponentReady() {
        /* --- Common --- */
        window.addEventListener("beforeunload", this._bindedOnBeforeUnloadWindowMethod);
        this.addEventListener("beforeremove", this._bindedOnBeforeRemoveMethod);
        this._previewTableHoveredColStyle = this.shadowRoot.styleSheets[1];
        this._previewTableClickedColStyle = this.shadowRoot.styleSheets[2];
        this._main = this.shadowRoot.querySelector("#main");
        this._importStepsNavList = this.shadowRoot.querySelector("#import-steps-nav-list");
        this._stepChooseFileNavItem = this.shadowRoot.querySelector("#step-choose-file-nav-item");
        this._stepLoadProfileNavItem = this.shadowRoot.querySelector("#step-load-profile-nav-item");
        this._stepCsvParsingNavItem = this.shadowRoot.querySelector("#step-csv-parsing-nav-item");
        this._stepChooseModelNavItem = this.shadowRoot.querySelector("#step-choose-model-nav-item");
        this._stepDefineObselTypesNavItem = this.shadowRoot.querySelector("#step-define-obsel-types-nav-item");
        this._stepAttributesMappingNavLabel = this.shadowRoot.querySelector("#step-attributes-mapping-nav-label");
        this._stepAttributesMappingNavSub = this.shadowRoot.querySelector("#step-attributes-mapping-nav-sub");
        this._stepSaveProfileNavItem = this.shadowRoot.querySelector("#step-save-profile-nav-item");
        this._stepImportNavItem = this.shadowRoot.querySelector("#step-import-nav-item");
        this._mainContent = this.shadowRoot.querySelector("#main-content");
        this._previousStepButton = this.shadowRoot.querySelector("#previous-step-button");
        this._previousStepButton.addEventListener("click", this._onClickPreviousStepButton.bind(this));
        this._nextStepButton = this.shadowRoot.querySelector("#next-step-button");
        this._nextStepButton.addEventListener("click", this._onClickNextStepButton.bind(this));

        /* --- Step choose file --- */
        this._stepChooseFileSection = this.shadowRoot.querySelector("#step-choose-file");
        this._stepChooseFileTitle = this.shadowRoot.querySelector("#step-choose-file-title");
        this._stepChooseFileForm = this.shadowRoot.querySelector("#step-choose-file-form");
        this._importFileInput = this.shadowRoot.querySelector("#import-file");
        this._importFileInput.addEventListener("change", this._onChangeImportFileInput.bind(this));
        this._importFileLabel = this.shadowRoot.querySelector("#import-file-label");
        this._importFileDetailsDiv = this.shadowRoot.querySelector("#import-file-details");
        this._importFileDetailsNoFile = this.shadowRoot.querySelector("#import-file-details-no-file");
        this._importFileDetailsNameTitle = this.shadowRoot.querySelector("#import-file-details-name-title");
        this._importFileDetailsNameValue = this.shadowRoot.querySelector("#import-file-details-name-value");
        this._importFileDetailsSizeTitle = this.shadowRoot.querySelector("#import-file-details-size-title");
        this._importFileDetailsSizeValue = this.shadowRoot.querySelector("#import-file-details-size-value");
        this._importFileDetailsLastmodifiedTitle = this.shadowRoot.querySelector("#import-file-details-lastmodified-title");
        this._importFileDetailsLastmodifiedValue = this.shadowRoot.querySelector("#import-file-details-lastmodified-value");
        
        /* --- Step load profile --- */
        this._stepLoadProfileSection = this.shadowRoot.querySelector("#step-load-profile");
        this._stepLoadProfileTitle = this.shadowRoot.querySelector("#step-load-profile-title");
        this._stepLoadProfileForm = this.shadowRoot.querySelector("#step-load-profile-form");
        this._loadProfileNoRadioButton = this.shadowRoot.querySelector("#load-profile-no");
        this._loadProfileNoRadioButton.addEventListener("change", this._onChangeProfileChoice.bind(this));
        this._loadProfileNoLabel = this.shadowRoot.querySelector("#load-profile-no-label");
        this._loadProfileYesRadioButton = this.shadowRoot.querySelector("#load-profile-yes");
        this._loadProfileYesRadioButton.addEventListener("change", this._onChangeProfileChoice.bind(this));
        this._loadProfileYesLabel = this.shadowRoot.querySelector("#load-profile-yes-label");
        this._importProfileSelect = this.shadowRoot.querySelector("#import-profile");
        this._importProfileNoProfileAvailableOption = this.shadowRoot.querySelector("#import-profile-no-profile-available-option");

        /* --- Step CSV parsing --- */
        this._stepCsvParsingSection = this.shadowRoot.querySelector("#step-csv-parsing");
        this._stepCsvParsingTitle = this.shadowRoot.querySelector("#step-csv-parsing-title");
        this._stepCsvParsingForm = this.shadowRoot.querySelector("#step-csv-parsing-form");
        this._charsetLabel = this.shadowRoot.querySelector("#charset-label");
        this._charsetSelect = this.shadowRoot.querySelector("#charset");
        this._charsetSelect.addEventListener("change", this._onChangeCharsetSelect.bind(this));
        this._separatorLabel = this.shadowRoot.querySelector("#separator-label");
        this._separatorSelect = this.shadowRoot.querySelector("#separator");
        this._separatorSelect.addEventListener("change", this._onChangeSeparatorSelect.bind(this));
        this._separatorTabOption = this.shadowRoot.querySelector("#separator-tab-option");
        this._separatorCommaOption = this.shadowRoot.querySelector("#separator-comma-option");
        this._separatorSemicolonOption = this.shadowRoot.querySelector("#separator-semicolon-option");
        this._separatorSpaceOption = this.shadowRoot.querySelector("#separator-space-option");
        this._separatorCustomOption = this.shadowRoot.querySelector("#separator-custom-option");
        this._separatorCustomInput = this.shadowRoot.querySelector("#separator-custom-input");
        this._separatorCustomInput.addEventListener("change", this._onChangeCustomSeparatorInput.bind(this));
        this._separatorCustomInput.addEventListener("input", this._onChangeCustomSeparatorInput.bind(this));
        this._firstLineIsHeaderCheckbox = this.shadowRoot.querySelector("#first-line-is-header");
        this._firstLineIsHeaderCheckbox.addEventListener("change", this._onChangeFirstLineIsHeaderCheckbox.bind(this));
        this._firstLineIsHeaderLabel = this.shadowRoot.querySelector("#first-line-is-header-label");
        this._parsingPreviewTitle = this.shadowRoot.querySelector("#parsing-preview-title");
        this._parsingPreviewContainer = this.shadowRoot.querySelector("#parsing-preview-container");

        this._parsingPreviewContainerIntersectionObserver = new IntersectionObserver(
            this._onParsingPreviewContainerIntersection.bind(this), 
            {
                root: this._parsingPreviewContainer,
                rootMargin: '0px 0px 10px 0px',
                threshold: 0.3
            }
        );

        this._parsingPreviewTable = this.shadowRoot.querySelector("#parsing-preview");
        this._parsingPreviewTable.addEventListener("mouseleave", this._onMouseLeaveParsingPreviewTable.bind(this));
        this._loadingPreviewMessage = this.shadowRoot.querySelector("#loading-preview-message");
        this._parsingPreviewContainerIntersectionObserver.observe(this._loadingPreviewMessage);

        /*--- Step choose model ---*/
        this._stepChooseModelSection = this.shadowRoot.querySelector("#step-choose-model");
        this._stepChooseModelTitle = this.shadowRoot.querySelector("#step-choose-model-title");
        this._stepChooseModelForm = this.shadowRoot.querySelector("#step-choose-model-form");
        this._modelChoiceNewCheckbox = this.shadowRoot.querySelector("#model-choice-new");
        this._modelChoiceNewCheckbox.addEventListener("change", this._onChangeModelChoice.bind(this));
        this._modelChoiceExistingCheckbox = this.shadowRoot.querySelector("#model-choice-existing");
        this._modelChoiceExistingCheckbox.addEventListener("change", this._onChangeModelChoice.bind(this));
        this._newModelIdLabel = this.shadowRoot.querySelector("#new-model-id-label");
        this._newModelBaseUriSpan = this.shadowRoot.querySelector("#new-model-base-uri");
        this._newModelIdInput = this.shadowRoot.querySelector("#new-model-id");
        this._newModelIdInput.addEventListener("change", this._updateNextStepButton.bind(this));
        this._newModelIdInput.addEventListener("input", this._updateNextStepButton.bind(this));
        this._newModelIdInput.setAttribute("lang", this._lang);
        this._newModelLabelLabel = this.shadowRoot.querySelector("#new-model-label-label");
        this._newModelLabelInput = this.shadowRoot.querySelector("#new-model-label");
        this._newModelLabelInput.setAttribute("lang", this._lang);
        this._newModelParentLabel = this.shadowRoot.querySelector("#new-model-parent-label");
        this._newModelParentPicker = this.shadowRoot.querySelector("#new-model-parent");
        this._newModelParentPicker.addEventListener("change", this._updateNextStepButton.bind(this));
        this._newModelParentPicker.addEventListener("input", this._updateNextStepButton.bind(this));
        this._newModelParentPicker.setAttribute("lang", this._lang);
        this._existingModelPicker = this.shadowRoot.querySelector("#existing-model");
        this._existingModelPicker.setAttribute("lang", this._lang);
        this._existingModelPicker.addEventListener("change", this._updateNextStepButton.bind(this));
        this._existingModelPicker.addEventListener("input", this._updateNextStepButton.bind(this));

        /* --- Step define obsel types --- */
        this._stepDefineObselTypesSection = this.shadowRoot.querySelector("#step-define-obsel-types");
        this._stepDefineObselTypesTitle = this.shadowRoot.querySelector("#step-define-obsel-types-title");
        this._stepDefineObselTypesForm = this.shadowRoot.querySelector("#step-define-obsel-types-form");
        this._obselTypesNumberLegend = this.shadowRoot.querySelector("#obsel-types-number-legend");
        this._obselTypesNumberUniqueRadioButton = this.shadowRoot.querySelector("#obsel-types-number-unique");
        this._obselTypesNumberUniqueRadioButton.addEventListener("change", this._onChangeObselTypesNumber.bind(this));
        this._obselTypesNumberUniqueLabel = this.shadowRoot.querySelector("#obsel-types-number-unique-label");
        this._obselTypesNumberMultipleRadioButton = this.shadowRoot.querySelector("#obsel-types-number-multiple");
        this._obselTypesNumberMultipleRadioButton.addEventListener("change", this._onChangeObselTypesNumber.bind(this));
        this._obselTypesNumberMultipleLabel = this.shadowRoot.querySelector("#obsel-types-number-multiple-label");
        this._existingModelUniqueObselTypeLabel = this.shadowRoot.querySelector("#existing-model-unique-obsel-type-label");
        this._existingModelUniqueObselTypeSelect = this.shadowRoot.querySelector("#existing-model-unique-obsel-type");
        this._existingModelUniqueObselTypeSelect.addEventListener("change", this._updateNextStepButton.bind(this));
        this._newModelUniqueObselTypeIdLabel = this.shadowRoot.querySelector("#new-model-unique-obsel-type-id-label");
        this._newModelUniqueObselTypeIdInput = this.shadowRoot.querySelector("#new-model-unique-obsel-type-id");
        this._newModelUniqueObselTypeIdInput.addEventListener("change", this._updateNextStepButton.bind(this))
        this._newModelUniqueObselTypeIdInput.addEventListener("input", this._updateNextStepButton.bind(this))
        this._newModelUniqueObselTypeLabelLabel = this.shadowRoot.querySelector("#new-model-unique-obsel-type-label-label");
        this._newModelUniqueObselTypeLabelInput = this.shadowRoot.querySelector("#new-model-unique-obsel-type-label");
        this._multipleObselTypesParametersDiv = this.shadowRoot.querySelector("#multiple-obsel-types-parameters");
        this._chooseObselTypeColumnTitle = this.shadowRoot.querySelector("#choose-obsel-type-column-title");
        this._obselTypesMappingTitle = this.shadowRoot.querySelector("#obsel-types-mapping-title");
        this._obselTypesMappingTable = this.shadowRoot.querySelector("#obsel-types-mapping");
        this._obselTypesMappingtableHeaderFor = this.shadowRoot.querySelector("#obsel-types-mapping-header-for");
        this._obselTypesMappingtableHeaderMap = this.shadowRoot.querySelector("#obsel-types-mapping-header-map");
        this._obselTypesMappingtableHeaderId = this.shadowRoot.querySelector("#obsel-types-mapping-header-id");
        this._obselTypesMappingtableHeaderLabel = this.shadowRoot.querySelector("#obsel-types-mapping-header-label");
        this._obselTypesMappingTableBody = this._obselTypesMappingTable.querySelector("tbody");
        this._obselTypesMappingTableEmptyRow = this.shadowRoot.querySelector("#obsel-types-mapping-empty-row");
        this._obselTypesMappingTableEmptyCell = this.shadowRoot.querySelector("#obsel-types-mapping-empty-cell");

        /* --- Step attributes mapping --- */
        this._stepAttributesMappingSection = this.shadowRoot.querySelector("#step-attributes-mapping");
        this._stepAttributesMappingTitle = this.shadowRoot.querySelector("#step-attributes-mapping-title");
        this._attributesMappingTablesContainer = this.shadowRoot.querySelector("#attributes-mapping-tables-container");

        this._attributesMappingTablesContainerIntersectionObserver = new IntersectionObserver(
            this._onAttributesMappingTablesContainerIntersection.bind(this), 
            {
                root: this._attributesMappingTablesContainer
            }
        );

        /* --- Step trace parameters --- */
        this._traceIdLabel = this.shadowRoot.querySelector("#trace-id-label");
        this._traceIdParentPathSpan = this.shadowRoot.querySelector("#trace-id-parent-path");
        this._traceIdInput = this.shadowRoot.querySelector("#trace-id");
        this._traceIdInput.addEventListener("change", this._onChangeTraceIdInput.bind(this));
        this._traceIdInput.addEventListener("input", this._onChangeTraceIdInput.bind(this));
        this._traceLabelLabel = this.shadowRoot.querySelector("#trace-label-label");
        this._traceLabelInput = this.shadowRoot.querySelector("#trace-label");
        this._traceOriginLabel = this.shadowRoot.querySelector("#trace-origin-label");
        this._traceOriginInput = this.shadowRoot.querySelector("#trace-origin");
        this._startImportButton = this.shadowRoot.querySelector("#start-import-button");
        this._startImportButton.addEventListener("click", this._onClickStartImportButton.bind(this));

        /* --- Step import ---*/
        this._stepImportSection = this.shadowRoot.querySelector("#step-import");
        this._stepImportTitle = this.shadowRoot.querySelector("#step-import-title");
        this._progressBar = this.shadowRoot.querySelector("#progress-bar");
        this._importMessageDiv = this.shadowRoot.querySelector("#import-message");
        this._errorsCountDiv = this.shadowRoot.querySelector("#errors-count");
        this._importErrorsList = this.shadowRoot.querySelector("#import-errors");
        this._undoImportButton = this.shadowRoot.querySelector("#undo-import-button");
        this._undoImportButton.addEventListener("click", this._onClickUndoImportButton.bind(this));

        /* --- Step save profile --- */
        this._stepSaveProfileSection = this.shadowRoot.querySelector("#step-save-profile");
        this._stepSaveProfileTitle = this.shadowRoot.querySelector("#step-save-profile-title");
        this._stepSaveProfileForm = this.shadowRoot.querySelector("#step-save-profile-form");
        this._saveProfileExplanationP = this.shadowRoot.querySelector("#save-profile-explanation");
        this._profileNameLabel = this.shadowRoot.querySelector("#profile-name-label");
        this._profileNameInput = this.shadowRoot.querySelector("#profile-name");
        this._profileNameInput.addEventListener("change", this._onChangeProfileNameInput.bind(this));
        this._profileNameInput.addEventListener("input", this._onChangeProfileNameInput.bind(this));
        this._profileDescriptionLabel = this.shadowRoot.querySelector("#profile-description-label");
        this._profileDescriptionTextarea = this.shadowRoot.querySelector("#profile-description");
        this._saveProfileButton = this.shadowRoot.querySelector("#save-profile-button");
        this._saveProfileButton.addEventListener("click", this._onClickSaveProfileButton.bind(this));
        this._closeButton = this.shadowRoot.querySelector("#close-button");
        this._closeButton.addEventListener("click", this._onClickCloseButton.bind(this));
    }

    /**
     * 
     */
    _updateStringsTranslation() {
        this._stepChooseFileNavItem.innerText = this._translateString("CSV file selection");
        this._stepLoadProfileNavItem.innerText = this._translateString("Import profile");
        this._stepCsvParsingNavItem.innerText = this._translateString("CSV parsing parameters");
        this._stepChooseModelNavItem.innerText = this._translateString("Choose model");
        this._stepDefineObselTypesNavItem.innerText = this._translateString("Define obsel types");
        this._stepAttributesMappingNavLabel.innerText = this._translateString("Attributes mapping");
        this._stepSaveProfileNavItem.innerText = this._translateString("Save import profile");
        this._stepImportNavItem.innerText = this._translateString("Import");
        this._stepChooseFileTitle.innerText = this._translateString("CSV file selection");
        this._importFileLabel.innerText = this._translateString("Choose a file...");
        this._importFileDetailsNoFile.innerText = this._translateString("No file selected");
        this._importFileDetailsNameTitle.innerText = this._translateString("File name");
        this._importFileDetailsSizeTitle.innerText = this._translateString("Size");
        this._importFileDetailsLastmodifiedTitle.innerText = this._translateString("Last modified");
        this._stepLoadProfileTitle.innerText = this._translateString("Import profile");
        this._loadProfileNoLabel.innerText = this._translateString("Do not use an import profile");
        this._loadProfileYesLabel.innerText = this._translateString("Use import profile :");
        this._importProfileNoProfileAvailableOption.innerText = this._translateString("No profile available yet");
        this._stepCsvParsingTitle.innerText = this._translateString("CSV parsing parameters");
        this._charsetLabel.innerText = this._translateString("Character set");
        this._separatorLabel.innerText = this._translateString("Separator");
        this._separatorTabOption.innerText = this._translateString("Tabulation (\\t)");
        this._separatorCommaOption.innerText = this._translateString("Comma (,)");
        this._separatorSemicolonOption.innerText = this._translateString("Semicolon (;)");
        this._separatorSpaceOption.innerText = this._translateString("Space ( )");
        this._separatorCustomOption.innerText = this._translateString("Custom...");
        this._firstLineIsHeaderLabel.innerText = this._translateString("First line is the header");
        this._parsingPreviewTitle.innerText = this._translateString("Preview");
        this._loadingPreviewMessage.innerText = this._translateString("Loading...");
        this._newModelParentPicker.setAttribute("lang", this._lang);
        this._existingModelPicker.setAttribute("lang", this._lang);
        this._stepDefineObselTypesTitle.innerText = this._translateString("Define obsel types");
        this._obselTypesNumberLegend.innerText = this._translateString("How do rows map to obsel type(s) ?");
        this._obselTypesNumberUniqueLabel.innerText = this._translateString("All rows map to the same obsel type");
        this._obselTypesNumberMultipleLabel.innerText = this._translateString("Rows map to different obsel types depending on a column's value");
        this._existingModelUniqueObselTypeLabel.innerText = this._translateString("Map rows to the obsel type :");
        this._existingModelUniqueObselTypeSelect.setAttribute("lang", this._lang);
        this._newModelUniqueObselTypeIdLabel.innerText = this._translateString("New obsel type ID :");
        this._newModelUniqueObselTypeIdInput.setAttribute("lang", this._lang);
        this._newModelUniqueObselTypeLabelLabel.innerText = this._translateString("New obsel type label :");
        this._newModelUniqueObselTypeLabelInput.setAttribute("lang", this._lang);
        this._chooseObselTypeColumnTitle.innerText = this._translateString("Which column allows to determinate obsel type in each row ?");
        //this._chooseObselTypeColumnTableCaption.innerText = this._translateString("Please pick a non-empty column from this table");
        this._obselTypesMappingTitle.innerText = this._translateString("Obsel type mapping for each distinct value in this column :");
        this._obselTypesMappingtableHeaderFor.innerText = this._translateString("For value :");
        this._obselTypesMappingtableHeaderMap.innerText = this._translateString("Map to :");
        this._obselTypesMappingtableHeaderId.innerText = this._translateString("Obsel type ID");
        this._obselTypesMappingtableHeaderLabel.innerText = this._translateString("Obsel type label");
        this._obselTypesMappingTableEmptyCell.innerText = this._translateString("Please choose a non-empty column in the table above");
        this._stepAttributesMappingTitle.innerText = this._translateString("Attributes mapping");
        this._stepSaveProfileTitle.innerText = this._translateString("Save import profile");
        this._stepImportTitle.innerText = this._translateString("Import");
        this._traceOriginLabel.innerText = this._translateString("Origin :");
        this._previousStepButton.innerText = this._translateString("< Previous step");
        this._nextStepButton.innerText = this._translateString("Next step >");
    }

    /**
     * 
     */
    _format_file_size(int_size) {
        if(int_size < 1024)
            return int_size + " " + this._translateString("bytes");
        else if(int_size < 1048576)
            return (Math.round(int_size / 102.4) / 10) + " " + this._translateString("Kb");
        else if(int_size < 1073741824)
            return (Math.round(int_size / 104857.6) / 10) + " " + this._translateString("Mb");
        else
            return (Math.round(int_size / 107374182.4) / 10) + " " + this._translateString("Gb");
    }

    /**
     * 
     */
    _format_date(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    /**
     * 
     */
    _checkStepImportFileValidity() {
        
    }

    /**
     * 
     */
    get _currentStep() {
        return this._main.className;
    }

    /**
     * 
     */
    get _currentStepForm() {
        return this._mainContent.querySelector("section#" + CSS.escape(this._currentStep) + " form#" + CSS.escape(this._currentStep) + "-form");
    }

    /**
     * 
     */
    _checkCurrentStepValidity() {
        let isValid;

        switch(this._currentStep) {
            case "step-choose-file" :
                isValid = this._importFileInput.checkValidity();
                break;
            case "step-load-profile":
                isValid = true;
                break;
            case "step-csv-parsing":
                isValid = (this._importParameters.separator && (this._importParameters.separator != ""));
                break;
            case "step-choose-model":
                isValid = (
                    (
                            this._modelChoiceNewCheckbox.checked 
                        &&  (
                                this._newModelIdInput.checkValidity()
                            &&  this._newModelParentPicker.checkValidity()
                        )
                    )
                    ||  (
                            this._modelChoiceExistingCheckbox.checked 
                        &&  this._existingModelPicker.checkValidity()
                    )
                );

                break;
            case "step-define-obsel-types":
                if(this._obselTypesNumberMultipleRadioButton.checked) {
                    if(this._importParameters.obseltype_column_index != undefined) {
                        if(this._importParameters.model_mode == "new") {
                            const newObselTypesIdInputs = this._obselTypesMappingTableBody.querySelectorAll("tr.new-obsel-type td.obsel-type-id ktbs4la2-resource-id-input");

                            if(newObselTypesIdInputs.length > 0) {
                                isValid = true;

                                for(let i = 0; isValid && (i < newObselTypesIdInputs.length); i++)
                                    isValid = newObselTypesIdInputs[i].checkValidity();
                            }
                            else
                                isValid = false;
                        }
                        else
                            isValid = (this._obselTypesMappingTableBody.querySelectorAll("tr.existing-obsel-type").length > 0);
                    }
                    else
                        isValid = false;
                }
                else {
                    if(this._importParameters.model_mode == "new")
                        isValid = this._newModelUniqueObselTypeIdInput.checkValidity();
                    else
                        isValid = this._existingModelUniqueObselTypeSelect.checkValidity();
                }

                break;
            case "step-attributes-mapping": 
                const currentAttributesMappingTable = this._getCurrentAttributesMappingTable();

                if(currentAttributesMappingTable)
                    isValid = currentAttributesMappingTable.checkValidity();
                else
                    isValid = false;

                break;
            case "step-import" :
                isValid = !this._stepImportSection.classList.contains("importing");
                break;
            default:
                isValid = false;
        }

        if(this._currentStepForm && !isValid)
            this._currentStepForm.dispatchEvent(new Event("invalid", {bubbles: false, cancelable: true}));

        return isValid;
    }

    /**
     * 
     */
    _onChangeTraceIdInput() {
        if(this._traceIdInput.checkValidity()) {
            if(this._startImportButton.hasAttribute("disabled"))
                this._startImportButton.removeAttribute("disabled");
        }
        else {
            if(!this._startImportButton.hasAttribute("disabled"))
                this._startImportButton.setAttribute("disabled", true);
        }
    }

    /**
     * 
     */
    _getCurrentAttributesMappingTable() {
        return this._attributesMappingTablesContainer.querySelector("ktbs4la2-attributes-mapping-table:not(.hidden)");
    }

    /**
     * 
     */
    _updateNextStepButton() {
        if(this._checkCurrentStepValidity()) {
            if(this._nextStepButton.hasAttribute("disabled"))
                this._nextStepButton.removeAttribute("disabled");
        }
        else {
            if(!this._nextStepButton.hasAttribute("disabled"))
                this._nextStepButton.setAttribute("disabled", true);
        }
    }

    /**
     * 
     */
    _onChangeImportFileInput(event) {
        if(this._importFileInput.files.length > 0) {
            if(this._importFileDetailsDiv.classList.contains("no-file"))
                this._importFileDetailsDiv.classList.remove("no-file");

            this._importFile = this._importFileInput.files[0];
            this._importFileDetailsNameValue.innerText = this._importFile.name;
            this._importFileDetailsSizeValue.innerText = this._format_file_size(this._importFile.size);
            this._importFileDetailsLastmodifiedValue.innerText = this._format_date(this._importFile.lastModified);

            if(this._importFile.size == 0) {
                if(!this._importFileDetailsDiv.classList.contains("empty-file"))
                    this._importFileDetailsDiv.classList.add("empty-file");

                this._importFileInput.setCustomValidity(this._translateString("Provided file is empty"));
            }
            else {
                if(this._importFileDetailsDiv.classList.contains("empty-file"))
                    this._importFileDetailsDiv.classList.remove("empty-file");

                this._importFileInput.setCustomValidity("");
            }
        }
        else {
            this._importFile = null;
            this._importFileDetailsNameValue.innerText = "";
            this._importFileDetailsSizeValue.innerText = "";
            this._importFileDetailsLastmodifiedValue.innerText = "";

            if(this._importFileDetailsDiv.classList.contains("empty-file"))
                this._importFileDetailsDiv.classList.remove("empty-file");

            this._importFileInput.setCustomValidity("");

            if(!this._importFileDetailsDiv.classList.contains("no-file"))
                this._importFileDetailsDiv.classList.add("no-file");
        }

        this._updateNextStepButton();
        this._importFileInput.reportValidity();
    }

    /**
     * 
     */
    _switchToNextStep(next_step) {
        if(!this._fulfilledSteps.includes(this._currentStep))
            this._fulfilledSteps.push(this._currentStep);
        
        this._main.className = next_step;
        this._main.scrollTop = 0;
        this._updateNextStepButton();
    }

    /**
     * 
     */
    _switchToPreviousStep() {
        const lastFullfilledStep = this._fulfilledSteps.pop();
        this._main.className = lastFullfilledStep;
        this._updateNextStepButton();
    }

    /**
     * 
     */
    _onClickNextStepButton(event) {
        if(this._checkCurrentStepValidity())
            switch(this._currentStep) {
                case "step-choose-file" :
                    this._import_file = this._importFileInput.files[0];
                    const fileReader = new FileReader();

                    fileReader.addEventListener("load", (event) => {
                        this._raw_file_content = fileReader.result;
                        this._switchToNextStep("step-load-profile");
                    });

                    fileReader.addEventListener("error", (event) => {
                        alert(fileReader.error.name + " : " + fileReader.error.message);
                    });

                    fileReader.readAsArrayBuffer(this._import_file);

                    // rebuild the profiles list, in case it was already builded previously and now outdated
                    const oldProfilesOptions = this._importProfileSelect.querySelectorAll("option:not(#import-profile-no-profile-available-option)");

                    for(let i = 0; i < oldProfilesOptions.length; i++)
                        oldProfilesOptions[i].remove();

                    try {
                        const currentProfilesString = window.localStorage.getItem("import-profiles");
                        
                        if(currentProfilesString != null) {
                            const currentProfiles = JSON.parse(currentProfilesString);

                            if((currentProfiles instanceof Array) && (currentProfiles.length > 0)) {
                                for(let i = 0; i < currentProfiles.length; i++) {
                                    const profileOption = document.createElement("option");
                                    profileOption.innerText = currentProfiles[i].name;

                                    if(currentProfiles[i].description && (currentProfiles[i].description != ""))
                                        profileOption.setAttribute("title", currentProfiles[i].description);

                                    this._importProfileSelect.appendChild(profileOption);
                                }

                                this._importProfileSelect.selectedIndex = 1;

                                if(this._loadProfileYesRadioButton.hasAttribute("disabled"))
                                    this._loadProfileYesRadioButton.removeAttribute("disabled");
                            }
                            else {
                                if(!this._loadProfileYesRadioButton.hasAttribute("disabled"))
                                    this._loadProfileYesRadioButton.setAttribute("disabled", true);
                            }
                        }
                        else {
                            if(!this._loadProfileYesRadioButton.hasAttribute("disabled"))
                                this._loadProfileYesRadioButton.setAttribute("disabled", true);
                        }
                    }
                    catch(error) {
                        console.error(error);
                        this.emitErrorEvent(error);
                        alert(error.name + " : " + error.message);
                    }
                    // done rebuilding the profiles list

                    break;
                case "step-load-profile" :
                    const use_profile = (this._stepLoadProfileForm["load-profile"].value == "yes");

                    if(use_profile) {
                        const selected_profile_id = this._importProfileSelect.value;
                    
                        try {
                            let selectedProfile;
                            const currentProfilesString = window.localStorage.getItem("import-profiles");
                            
                            if(currentProfilesString != null) {
                                const currentProfiles = JSON.parse(currentProfilesString);
    
                                if(currentProfiles instanceof Array) {
                                    for(let i = 0; i < currentProfiles.length; i++) {
                                        if(currentProfiles[i].name == selected_profile_id) {
                                            selectedProfile = currentProfiles[i];
                                            break;
                                        }
                                    }
                                }
                            }

                            if(selectedProfile) {
                                this._importParameters = selectedProfile.parameters;
                                const textDecoder = new TextDecoder(this._importParameters.charset);
                                this._decoded_file_content = textDecoder.decode(this._raw_file_content);
                                this._parsed_CSV_data = KTBS4LA2CsvTraceImport._parseCSV(this._decoded_file_content, this._importParameters.separator);
                                this._parsed_CSV_data_columns_count = this._getColumnsCount(this._parsed_CSV_data);
                                this._switchToNextStep("step-trace-parameters");
                            }
                            else
                                throw new Error("Could not retrieve profile \"" + selected_profile_id + "\" from local storage");
                        }
                        catch(error) {
                            console.error(error);
                            this.emitErrorEvent(error);
                            alert(error.name + " : " + error.message);
                        }
                    }
                    else {
                        this._importParameters = {};
                        this._parsingPreviewTable.innerHTML = "";
                        
                        setTimeout(() => {
                            this._readCharset();
                            const guessedDelimiter = KTBS4LA2CsvTraceImport._guessDelimiter(this._decoded_file_content, [",", ";", "\t", " "], 250);

                            if(guessedDelimiter != null) {
                                if(!this._separatorCustomInput.classList.contains("hidden"))
                                    this._separatorCustomInput.classList.add("hidden");

                                this._importParameters.separator = guessedDelimiter;

                                switch(guessedDelimiter) {
                                    case ",":
                                        this._separatorSelect.value = "comma";
                                        break;
                                    case ";":
                                        this._separatorSelect.value = "semicolon";
                                        break;
                                    case "\t":
                                        this._separatorSelect.value = "tab";
                                        break;
                                    case " ":
                                        this._separatorSelect.value = "space";
                                        break;
                                }

                                this._parsed_CSV_data = KTBS4LA2CsvTraceImport._parseCSV(this._decoded_file_content, this._importParameters.separator);
                                this._parsed_CSV_data_columns_count = this._getColumnsCount(this._parsed_CSV_data);
                            }
                            else
                                this._readSeparator();
                            
                            this._initCSVParsingPreview();
                            this._switchToNextStep("step-csv-parsing");
                        });
                    }
                    break;
                case "step-csv-parsing" :
                    this._switchToNextStep("step-choose-model");

                    if(this._modelChoiceNewCheckbox.checked)
                        this._newModelIdInput.focus();
                    else
                        this._existingModelPicker.focus();
                    break;
                case "step-choose-model":
                    if(this._modelChoiceNewCheckbox.checked) {
                        this._importParameters.model_mode = "new";

                        this._importParameters.model = {
                            id: this._newModelIdInput.value,
                            labels: JSON.parse(this._newModelLabelInput.value),
                            parent_uri: this._newModelParentPicker.value
                        }

                        if(this._importParameters.model_uri)
                            delete this._importParameters.model_uri;

                        if(this._model)
                            delete this._model;

                        if(this._existingModelUniqueObselTypeSelect.hasAttribute("model-uri"))
                            this._existingModelUniqueObselTypeSelect.removeAttribute("model-uri");

                        if(this._stepDefineObselTypesForm.classList.contains("model-existing"))
                            this._stepDefineObselTypesForm.classList.remove("model-existing");

                        if(!this._stepDefineObselTypesForm.classList.contains("model-new"))
                            this._stepDefineObselTypesForm.classList.add("model-new");
                    }
                    else {
                        this._importParameters.model_mode = "existing";
                        this._importParameters.model_uri = this._existingModelPicker.value

                        if(this._importParameters.model)
                            delete this._importParameters.model;

                        this._model = ResourceMultiton.get_resource(Model, this._existingModelPicker.value);
                        this._existingModelUniqueObselTypeSelect.setAttribute("model-uri", this._existingModelPicker.value);

                        if(this._stepDefineObselTypesForm.classList.contains("model-new"))
                            this._stepDefineObselTypesForm.classList.remove("model-new");

                        if(!this._stepDefineObselTypesForm.classList.contains("model-existing"))
                            this._stepDefineObselTypesForm.classList.add("model-existing");
                    }

                    this._multipleObselTypesParametersDiv.insertBefore(this._parsingPreviewContainer, this._obselTypesMappingTitle);
                    this._switchToNextStep("step-define-obsel-types");
                    break;
                case "step-define-obsel-types" :
                    if(this._importParameters.model_mode == "new") {
                        let guessedColumnsDataTypes = new Array();

                        for(let colIndex = 0; colIndex < this._parsed_CSV_data_columns_count; colIndex++)
                            guessedColumnsDataTypes[colIndex] = this._guessColumnDataType(colIndex);

                        if(this._obselTypesNumberUniqueRadioButton.checked) {
                            this._importParameters.obsel_types_mapping_mode = "unique";

                            if(this._importParameters.obsel_types_mapping)
                                delete this._importParameters.obsel_types_mapping;

                            if(this._importParameters.obsel_type_id)
                                delete this._importParameters.obsel_type_id;

                            this._importParameters.obsel_type = {
                                id: this._newModelUniqueObselTypeIdInput.value,
                                labels: JSON.parse(this._newModelUniqueObselTypeLabelInput.value)
                            };

                            const aMappingTable = document.createElement("ktbs4la2-attributes-mapping-table");
                            aMappingTable.setAttribute("lang", this._lang);
                            aMappingTable.addEventListener("change", this._onChangeAttributeMappingTable.bind(this));

                            const tableValue = new Array();

                            for(let colIndex = 0; colIndex < this._parsed_CSV_data_columns_count; colIndex++) {
                                const aMapping = {};

                                if(this._dataColumnIsEmpty(colIndex))
                                    aMapping.mapping_type = "<do-not-import>";
                                else
                                    aMapping.mapping_type = "<new>";

                                if(
                                        this._importParameters.has_header
                                    &&  (this._parsed_CSV_data[0] instanceof Array)
                                    &&  this._parsed_CSV_data[0][colIndex]
                                    &&  (this._parsed_CSV_data[0][colIndex] != "")
                                )
                                    aMapping.attribute_id = this._parsed_CSV_data[0][colIndex];

                                aMapping.attribute_data_type = guessedColumnsDataTypes[colIndex];
                                tableValue.push(aMapping);
                            }

                            aMappingTable.set_value(tableValue)
                                .then(() => {
                                    aMappingTable.dispatchEvent(new Event("change", {bubbles: true, cancelable: false, composed: false}));
                                });

                            aMappingTable.addBodyContent(this._getDataRowsMatchingColValue("*", "*", this._importParameters.has_header?1:0, 50))
                                .then(() => {
                                    const mappingTableLastRow = aMappingTable.last_data_row;

                                    if(mappingTableLastRow)
                                        this._attributesMappingTablesContainerIntersectionObserver.observe(mappingTableLastRow);
                                });

                            this._attributesMappingTablesContainer.appendChild(aMappingTable);
                        }
                        else {
                            this._importParameters.obsel_types_mapping_mode = "multiple";

                            if(this._importParameters.obsel_type)
                                delete this._importParameters.obsel_type;

                            if(this._importParameters.obsel_type_id)
                                delete this._importParameters.obsel_type_id;

                            this._importParameters.obsel_types_mapping = [];
                            const mappingRows = this._obselTypesMappingTableBody.querySelectorAll("tr:not(#obsel-types-mapping-empty-row)");

                            for(let i = 0; i < mappingRows.length; i++) {
                                const aMappingRow = mappingRows[i];
                                const aMappingValue = aMappingRow.querySelector("td").innerText;
                                const aMappingSelect = aMappingRow.querySelector("select");

                                if(aMappingSelect.value != "do-not-import") {
                                    if(aMappingSelect.value == "new") {
                                        const aMappingIdInput = aMappingRow.querySelector("td.obsel-type-id ktbs4la2-resource-id-input");
                                        const aMappingLabelInput = aMappingRow.querySelector("td.obsel-type-label ktbs4la2-multiple-translations-text-input");

                                        this._importParameters.obsel_types_mapping.push({
                                            value: aMappingValue,
                                            obsel_type: {
                                                id: aMappingIdInput.value,
                                                labels: JSON.parse(aMappingLabelInput.value)
                                            }
                                        });
                                    }
                                    else {
                                        this._importParameters.obsel_types_mapping.push({
                                            value: aMappingValue,
                                            obsel_type_id: aMappingSelect.value.substring(9)
                                        });
                                    }

                                    const aMappingTable = document.createElement("ktbs4la2-attributes-mapping-table");
                                    aMappingTable.setAttribute("lang", this._lang);
                                    aMappingTable.addEventListener("change", this._onChangeAttributeMappingTable.bind(this));
                                    aMappingTable.discriminatingColumnIndex = this._importParameters.obseltype_column_index;

                                    if(this._parsed_CSV_data[0] && (this._parsed_CSV_data[0][this._importParameters.obseltype_column_index] != undefined))
                                        aMappingTable.discriminatingColumnLabel = new String(this._parsed_CSV_data[0][this._importParameters.obseltype_column_index]);
                                    
                                    aMappingTable.discriminatingValue = aMappingValue;

                                    if(i == 0) {
                                        const tableValue = new Array();

                                        for(let colIndex = 0; colIndex < this._parsed_CSV_data_columns_count; colIndex++) {
                                            const aMapping = {};

                                            if(this._dataColumnIsEmpty(colIndex))
                                                aMapping.mapping_type = "<do-not-import>";
                                            else
                                                aMapping.mapping_type = "<new>";

                                            if(
                                                    this._importParameters.has_header
                                                &&  (this._parsed_CSV_data[0] instanceof Array)
                                                &&  this._parsed_CSV_data[0][colIndex]
                                                &&  (this._parsed_CSV_data[0][colIndex] != "")
                                            )
                                                aMapping.attribute_id = this._parsed_CSV_data[0][colIndex];

                                            aMapping.attribute_data_type = guessedColumnsDataTypes[colIndex];
                                            tableValue.push(aMapping);
                                        }

                                        aMappingTable.set_value(tableValue)
                                            .then(() => {
                                                aMappingTable.dispatchEvent(new Event("change", {bubbles: true, cancelable: false, composed: false}));
                                            });
                                    }
                                    else
                                        aMappingTable.classList.add("hidden");

                                    aMappingTable.addBodyContent(this._getDataRowsMatchingColValue(this._importParameters.obseltype_column_index, aMappingValue, (this._importParameters.has_header)?1:0, 50))
                                        .then(() => {
                                            const mappingTableLastRow = aMappingTable.last_data_row;

                                            if(mappingTableLastRow)
                                                this._attributesMappingTablesContainerIntersectionObserver.observe(mappingTableLastRow);
                                        });

                                    this._attributesMappingTablesContainer.appendChild(aMappingTable);
                                }
                            }
                        }
                    }
                    else {
                        if(this._obselTypesNumberUniqueRadioButton.checked) {
                            this._importParameters.obsel_types_mapping_mode = "unique";

                            if(this._importParameters.obsel_types_mapping)
                                delete this._importParameters.obsel_types_mapping;

                            if(this._importParameters.obsel_type)
                                delete this._importParameters.obsel_type;

                            const obsel_type_uri = new URL(this._existingModelUniqueObselTypeSelect.value);
                            this._importParameters.obsel_type_id = obsel_type_uri.hash.substring(1);
                            
                            const aMappingTable = document.createElement("ktbs4la2-attributes-mapping-table");
                            aMappingTable.setAttribute("lang", this._lang);
                            aMappingTable.setAttribute("allow-create-new", false);
                            aMappingTable.addEventListener("change", this._onChangeAttributeMappingTable.bind(this));

                            const obselType = this._model.get_obsel_type(this._importParameters.obsel_type_id);

                            if(obselType) {
                                const tableValue = new Array();

                                for(let colIndex = 0; colIndex < this._parsed_CSV_data_columns_count; colIndex++) {
                                    const aMapping = {};

                                    if(this._dataColumnIsEmpty(colIndex))
                                        aMapping.mapping_type = "<do-not-import>";
                                    else {
                                        if(
                                                this._importParameters.has_header
                                            &&  (this._parsed_CSV_data[0] instanceof Array)
                                            &&  this._parsed_CSV_data[0][colIndex]
                                            &&  (this._parsed_CSV_data[0][colIndex] != "")
                                            
                                        ) {
                                            const attributeType = this._model.get_attribute_type(this._parsed_CSV_data[0][colIndex]);

                                            if(
                                                    attributeType
                                                &&  attributeType.isAssignedToObselType(obselType)
                                            ) {
                                                aMapping.mapping_type = "<existing>";
                                                aMapping.attribute_id = this._parsed_CSV_data[0][colIndex];
                                            }
                                        }
                                    }

                                    tableValue.push(aMapping);
                                }

                                const allAdditionalAttributeTypes = new Array();
                                const obselTypeAttributeTypes = obselType.attribute_types;

                                for(let i = 0; i < obselTypeAttributeTypes.length; i++) {
                                    const attributeType = obselTypeAttributeTypes[i];
                                    const anAdditionalAttributeType = {id: attributeType.id};

                                    // --- find what label we should use ---
                                    let preferred_label = attributeType.get_translated_label(this._lang);
                                    
                                    if(!preferred_label)
                                        preferred_label = attributeType.label;

                                    if(preferred_label)
                                        anAdditionalAttributeType.label = preferred_label;
                                    // --- done ---

                                    allAdditionalAttributeTypes.push(anAdditionalAttributeType);
                                }

                                if(allAdditionalAttributeTypes.length > 0)
                                    aMappingTable.setAdditionalAttributeTypes(allAdditionalAttributeTypes);

                                aMappingTable.set_value(tableValue)
                                    .then(() => {
                                        aMappingTable.dispatchEvent(new Event("change", {bubbles: true, cancelable: false, composed: false}));
                                    });
                            }

                            aMappingTable.addBodyContent(this._getDataRowsMatchingColValue("*", "*", this._importParameters.has_header?1:0, 50))
                                .then(() => {
                                    const mappingTableLastRow = aMappingTable.last_data_row;

                                    if(mappingTableLastRow)
                                        this._attributesMappingTablesContainerIntersectionObserver.observe(mappingTableLastRow);
                                });

                            this._attributesMappingTablesContainer.appendChild(aMappingTable);
                        }
                        else {
                            this._importParameters.obsel_types_mapping_mode = "multiple";

                            if(this._importParameters.obsel_type)
                                delete this._importParameters.obsel_type;

                            if(this._importParameters.obsel_type_id)
                                delete this._importParameters.obsel_type_id;

                            this._importParameters.obsel_types_mapping = [];
                            const mappingRows = this._obselTypesMappingTableBody.querySelectorAll("tr:not(#obsel-types-mapping-empty-row)");

                            for(let i = 0; i < mappingRows.length; i++) {
                                const aMappingRow = mappingRows[i];
                                const aMappingValue = aMappingRow.querySelector("td").innerText.trim();
                                const aMappingSelect = aMappingRow.querySelector("select");
                                
                                if(aMappingSelect.value != "do-not-import") {
                                    const obselTypeId = aMappingSelect.value.substring(9);

                                    this._importParameters.obsel_types_mapping.push({
                                        value: aMappingValue,
                                        obsel_type_id: obselTypeId
                                    });

                                    const aMappingTable = document.createElement("ktbs4la2-attributes-mapping-table");
                                    aMappingTable.setAttribute("lang", this._lang);
                                    aMappingTable.setAttribute("allow-create-new", false);
                                    aMappingTable.addEventListener("change", this._onChangeAttributeMappingTable.bind(this));
                                    aMappingTable.discriminatingColumnIndex = this._importParameters.obseltype_column_index;

                                    if(this._parsed_CSV_data[0] && (this._parsed_CSV_data[0][this._importParameters.obseltype_column_index] != undefined))
                                        aMappingTable.discriminatingColumnLabel = new String(this._parsed_CSV_data[0][this._importParameters.obseltype_column_index]);
                                    
                                    aMappingTable.discriminatingValue = aMappingValue;

                                    const obselType = this._model.get_obsel_type(obselTypeId);
                                
                                    if(obselType) {
                                        const allAdditionalAttributeTypes = new Array();
                                        const obselTypeAttributeTypes = obselType.attribute_types;
        
                                        for(let i = 0; i < obselTypeAttributeTypes.length; i++) {
                                            const attributeType = obselTypeAttributeTypes[i];
                                            const anAdditionalAttributeType = {id: attributeType.id};
        
                                            // --- find what label we should use ---
                                            let preferred_label = attributeType.get_translated_label(this._lang);
                                            
                                            if(!preferred_label)
                                                preferred_label = attributeType.label;
        
                                            if(preferred_label)
                                                anAdditionalAttributeType.label = preferred_label;
                                            // --- done ---
        
                                            allAdditionalAttributeTypes.push(anAdditionalAttributeType);
                                        }
        
                                        if(allAdditionalAttributeTypes.length > 0)
                                            aMappingTable.setAdditionalAttributeTypes(allAdditionalAttributeTypes);
        
                                        if(i == 0) {
                                            const tableValue = new Array();
        
                                            for(let colIndex = 0; colIndex < this._parsed_CSV_data_columns_count; colIndex++) {
                                                const aMapping = {};
            
                                                if(this._dataColumnIsEmpty(colIndex))
                                                    aMapping.mapping_type = "<do-not-import>";
                                                else {
                                                    if(
                                                            this._importParameters.has_header
                                                        &&  (this._parsed_CSV_data[0] instanceof Array)
                                                        &&  this._parsed_CSV_data[0][colIndex]
                                                        &&  (this._parsed_CSV_data[0][colIndex] != "")
                                                        
                                                    ) {
                                                        const attributeType = this._model.get_attribute_type(this._parsed_CSV_data[0][colIndex]);
            
                                                        if(
                                                                attributeType
                                                            &&  attributeType.isAssignedToObselType(obselType)
                                                        ) {
                                                            aMapping.mapping_type = "<existing>";
                                                            aMapping.attribute_id = this._parsed_CSV_data[0][colIndex];
                                                        }
                                                    }
                                                }
            
                                                tableValue.push(aMapping);
                                            }
                                            
                                            aMappingTable.set_value(tableValue)
                                                .then(() => {
                                                    aMappingTable.dispatchEvent(new Event("change", {bubbles: true, cancelable: false, composed: false}));
                                                });
                                        }
                                    }

                                    aMappingTable.addBodyContent(this._getDataRowsMatchingColValue(this._importParameters.obseltype_column_index, aMappingValue, this._importParameters.has_header?1:0, 50))
                                        .then(() => {
                                            const mappingTableLastRow = aMappingTable.last_data_row;

                                            if(mappingTableLastRow)
                                                this._attributesMappingTablesContainerIntersectionObserver.observe(mappingTableLastRow);
                                        });

                                    if(i > 0)
                                        aMappingTable.classList.add("hidden");

                                    this._attributesMappingTablesContainer.appendChild(aMappingTable);
                                }
                            }
                        }
                    }

                    this._switchToNextStep("step-attributes-mapping");
                    break;
                case "step-attributes-mapping":
                    const allMappingTables = this._attributesMappingTablesContainer.querySelectorAll("ktbs4la2-attributes-mapping-table");
                    const currentAttributesMappingTable = this._getCurrentAttributesMappingTable();
                    let nextMappingTable = null;

                    for(let i = 0; (nextMappingTable == null) && (i < allMappingTables.length - 1); i++) {
                        if(allMappingTables[i] == currentAttributesMappingTable)
                            nextMappingTable = allMappingTables[i + 1];
                    }

                    if(nextMappingTable != null) {
                        currentAttributesMappingTable.classList.add("hidden");
                        nextMappingTable.classList.remove("hidden");
                        this._attributesMappingTablesContainer.scrollTop = 0;
                        this._attributesMappingTablesContainer.scrollLeft = 0;
                        this._updateNextStepButton();
                    }
                    else {
                        this._importParameters.attributes_mapping = new Array();

                        for(let i = 0; i < allMappingTables.length; i++)
                            this._importParameters.attributes_mapping.push({
                                value: allMappingTables[i].discriminatingValue,
                                mapping_parameters: allMappingTables[i].value
                            });

                        this._switchToNextStep("step-trace-parameters");
                        this._traceIdInput.focus();
                    }

                    break;
                case "step-trace-parameters":
                    this._switchToNextStep("step-import");
                    break;
                case "step-import":
                    this._switchToNextStep("step-save-profile");
                    break;
            }
    }

    /**
     * 
     */
    _onChangeAttributeMappingTable(event) {
        const changedTable = event.target;
        const mappingCopy = JSON.parse(JSON.stringify(changedTable.value));

        for(let j = 0; j < mappingCopy.length; j++) {
            if(mappingCopy[j].mapping_type == "<new>") {
                mappingCopy[j].mapping_type = "<existing>";

                if(mappingCopy[j].attribute_label)
                    delete mappingCopy[j].attribute_label;

                if(mappingCopy[j].attribute_data_type)
                    delete mappingCopy[j].attribute_data_type;
            }
        }

        const allMappingTables = this._attributesMappingTablesContainer.querySelectorAll("ktbs4la2-attributes-mapping-table");

        if(this._importParameters.model_mode == "new") {
            const allAdditionalAttributeTypes = [];

            for(let i = 0; i < allMappingTables.length; i++) {
                const aMappingTable = allMappingTables[i];
                const aMappingTable_value = aMappingTable.value;

                if(aMappingTable_value instanceof Array)
                    for(let j = 0; j < aMappingTable_value.length; j++) {
                        const aMapping = aMappingTable_value[j];

                        if((aMapping.mapping_type == "<new>") && (aMapping.attribute_id)) {
                            const anAdditionalAttributeType = {id: aMapping.attribute_id};

                            // --- find what label we should use ---
                            let preferred_label = null;
                            const labels = aMapping.attribute_label

                            if(labels instanceof Array) {
                                for(let i = 0; i < labels.length; i++)
                                    if(labels[i].lang == this._lang) {
                                        preferred_label = labels[i].value;
                                        break;
                                    }

                                if(preferred_label == null)
                                    for(let i = 0; i < labels.length; i++)
                                        if(labels[i].lang == "*") {
                                            preferred_label = labels[i].value;
                                            break;
                                        }
                            }

                            if(preferred_label != null)
                                anAdditionalAttributeType.label = preferred_label;
                            // --- done ---

                            allAdditionalAttributeTypes.push(anAdditionalAttributeType);
                        }
                    }
            }

            const allTablesAdditionalAttributeTypesSetPromises = new Array();

            for(let i = 0; i < allMappingTables.length; i++)
                allTablesAdditionalAttributeTypesSetPromises.push(allMappingTables[i].setAdditionalAttributeTypes(allAdditionalAttributeTypes));

            Promise.all(allTablesAdditionalAttributeTypesSetPromises)
                .then(() => {
                    for(let i = 0; i < allMappingTables.length; i++)
                        if(allMappingTables[i] == changedTable) {
                            for(let j = i + 1; j < allMappingTables.length; j++)
                                allMappingTables[j].set_value(mappingCopy);
            
                            break;
                        }
            
                    this._updateNextStepButton();
                });
        }
        else {
            for(let i = 0; i < allMappingTables.length; i++)
                if(allMappingTables[i] == changedTable) {
                    for(let j = i + 1; j < allMappingTables.length; j++)
                        allMappingTables[j].set_value(mappingCopy);
    
                    break;
                }
    
            this._updateNextStepButton();
        }
    }

    /**
     * 
     */
    _getDataRowsMatchingColValue(col_index = "*", col_value = "*", startIndex = 0, max_rows = 50) {
        const dataRows = document.createDocumentFragment();
        
        if(this._parsed_CSV_data) {
            let createdRowsCount = 0;

            for(let lineIndex = startIndex; (createdRowsCount < max_rows) && (lineIndex < this._parsed_CSV_data.length); lineIndex++) {
                const aDataLine = this._parsed_CSV_data[lineIndex];

                if(
                        (col_value == "*")
                    ||  ((col_index != "*") &&  (aDataLine[col_index] == col_value))
                    ||  ((col_index == "*") && (aDataLine.includes(col_value)))
                    
                ) {
                    const newRow = document.createElement("tr");
                    newRow.setAttribute("x-data-lineindex", lineIndex);

                    for(let cellIndex = 0; cellIndex < aDataLine.length; cellIndex++) {
                        const newCell = document.createElement("td");

                        if(aDataLine[cellIndex])
                            newCell.innerText = aDataLine[cellIndex];
                        else
                            newCell.innerHTML = "&nbsp;";

                        newCell.addEventListener("mouseover", this._onMouseOverParsingPreviewTableCell.bind(this));
                        newCell.addEventListener("click", this._onClickParsingPreviewTableCell.bind(this));
                        newRow.appendChild(newCell);
                    }

                    // add empty table cells at the end if needed, so each line has the same width
                    for(let cellIndex = aDataLine.length; cellIndex < this._parsed_CSV_data_columns_count; cellIndex++) {
                        const newEmptyCell = document.createElement("td");
                        newEmptyCell.innerHTML = "&nbsp;";
                        newEmptyCell.addEventListener("mouseover", this._onMouseOverParsingPreviewTableCell.bind(this));
                        newEmptyCell.addEventListener("click", this._onClickParsingPreviewTableCell.bind(this));
                        newRow.appendChild(newEmptyCell);
                    }

                    dataRows.appendChild(newRow);
                    createdRowsCount++;
                }
            }
        }

        return dataRows;
    }

    /**
     * 
     */
    _onMouseOverParsingPreviewTableCell(event) {
        if(this._currentStep == "step-define-obsel-types")
            this._setHoveredColumnStyle(event.target.cellIndex);
    }

    /**
     * 
     */
    _onMouseLeaveParsingPreviewTable(event) {
        if(this._currentStep == "step-define-obsel-types")
            this._setHoveredColumnStyle(null);
    }

    /**
     * 
     * @param {*} colIndex 
     */
    _setHoveredColumnStyle(colIndex) {
        if(this.updateHoveredColStyleTaskID)
            clearTimeout(this.updateHoveredColStyleTaskID);

        this.updateHoveredColStyleTaskID = setTimeout(() => {
            while(this._previewTableHoveredColStyle.cssRules.length > 0)
                this._previewTableHoveredColStyle.deleteRule(0);

            if(colIndex != null)
                this._previewTableHoveredColStyle.insertRule("#parsing-preview td:nth-child(" + (colIndex +1) + ") {background-color: var(--hovered-column-color);}");

            this.updateHoveredColStyleTaskID = null;
        });
    }

    /**
     * 
     */
    _getColDistinctValues(colIndex) {
        const values = new Array();

        for(let rowIndex = this._importParameters.has_header?1:0; rowIndex < this._parsed_CSV_data.length; rowIndex++)
            if((this._parsed_CSV_data[rowIndex][colIndex] != undefined) && !values.includes(this._parsed_CSV_data[rowIndex][colIndex]))
                values.push(this._parsed_CSV_data[rowIndex][colIndex]);
        
        return values;
    }

    /**
     * 
     */
    _onClickParsingPreviewTableCell(event) {
        if(this._currentStep == "step-define-obsel-types") {
            let proceed;

            if(
                    (this._previewTableClickedColStyle.cssRules.length > 0)
                &&  this._previewTableClickedColStyle.cssRules[0].cssText.includes("--clicked-column-color")
            )
                proceed = window.confirm(this._translateString("If you change the column choice, current obsel type mapping settings will be reset.\nAre you sure ?"));
            else
                proceed = true;

            if(proceed) {
                const currentLines = this._obselTypesMappingTableBody.querySelectorAll("tr:not(#obsel-types-mapping-empty-row)");

                for(let i = currentLines.length - 1; i >=0; i--)
                    currentLines[i].remove();
                    
                const clickedColIndex = event.target.cellIndex;
                const distinctValues = this._getColDistinctValues(clickedColIndex);
                
                if(distinctValues.length > 1) {
                    this._importParameters.obseltype_column_index = clickedColIndex;
                    this._setClickedColumnStyle(clickedColIndex);

                    this._initObselTypesMappingTable(distinctValues);//.finally(() => {
                        this._updateNextStepButton();
                    //});

                    const firstObselTypeInputId = this._obselTypesMappingTableBody.querySelector("tr.new-obsel-type td.obsel-type-id ktbs4la2-resource-id-input");

                    if(firstObselTypeInputId)
                        setTimeout(() => {
                            firstObselTypeInputId.focus();
                        });
                }
                else {
                    if(this._importParameters.obseltype_column_index)
                        delete this._importParameters.obseltype_column_index;

                    this._setErrorColumnStyle(clickedColIndex);
                    this._updateNextStepButton();
                }
            }
        }
    }

    /**
     * 
     */
    _initObselTypesMappingTable(distinctValues) {
        //const idInputsValuesSetPromises = new Array();

        for(let i = 0; i < distinctValues.length; i++) {
            const aDistinctValue = distinctValues[i];
            const valueRow = document.createElement("tr");

            if(this._importParameters.model_mode == "new")
                valueRow.className = "new-obsel-type";
            /*else
                valueRow.className = "do-not-import";*/

            const valueForCell = document.createElement("td");
            valueForCell.innerText = aDistinctValue;
            valueRow.appendChild(valueForCell);

            const valueMapCell = document.createElement("td");
            const valueMapSelect = document.createElement("select");
            valueMapSelect.setAttribute("tabindex", 5 + (i * 3));

            const valueMapDontImportOption = document.createElement("option");
            valueMapDontImportOption.setAttribute("value", "do-not-import");
            valueMapDontImportOption.innerText = this._translateString("Don't import");

            if(this._importParameters.model_mode != "new")
                valueMapDontImportOption.setAttribute("selected", true);

            valueMapSelect.appendChild(valueMapDontImportOption);

            if(this._importParameters.model_mode == "new") {
                const valueMapToNewObselTypeOption = document.createElement("option");
                valueMapToNewObselTypeOption.setAttribute("value", "new");
                valueMapToNewObselTypeOption.innerText = this._translateString("+ New obsel type (create)");
                valueMapToNewObselTypeOption.setAttribute("selected", true);
                valueMapSelect.appendChild(valueMapToNewObselTypeOption);
                valueMapSelect.addEventListener("change", this._onChangeObselTypeMappingSelect.bind(this));
                valueMapCell.appendChild(valueMapSelect);
                valueRow.appendChild(valueMapCell);
            }
            else {
                const existingObselTypes = this._model.obsel_types;

                for(let j = 0; j < existingObselTypes.length; j++) {
                    const anExistingObselType = existingObselTypes[j];
                    const valueMapToExistingObselTypeOption = document.createElement("option");
                    valueMapToExistingObselTypeOption.setAttribute("value", "existing-" + anExistingObselType.id);
                    valueMapToExistingObselTypeOption.innerText = anExistingObselType.get_preferred_label(this._lang);

                    if(aDistinctValue == anExistingObselType.id)
                        valueMapToExistingObselTypeOption.setAttribute("selected", true);

                    valueMapSelect.appendChild(valueMapToExistingObselTypeOption);
                    valueMapSelect.addEventListener("change", this._onChangeObselTypeMappingSelect.bind(this));
                    valueMapCell.appendChild(valueMapSelect);
                    valueRow.appendChild(valueMapCell);
                }

                if(valueMapSelect.querySelector("option[selected]"))
                    valueRow.className = "existing-obsel-type";
                else
                    valueRow.className = "do-not-import";
            }

            const obselTypeIdCell = document.createElement("td");
            obselTypeIdCell.classList.add("obsel-type-id");
            const obselTypeIdCellLabel = document.createElement("span");
            obselTypeIdCell.appendChild(obselTypeIdCellLabel);
            const obselTypeIdCellInput = document.createElement("ktbs4la2-resource-id-input");
            obselTypeIdCellInput.addEventListener("change", this._onChangeObselTypeIdCellInput.bind(this));
            obselTypeIdCellInput.addEventListener("input", this._onChangeObselTypeIdCellInput.bind(this));
            obselTypeIdCellInput.setAttribute("tabindex", 6 + (i * 3));
            obselTypeIdCellInput.setAttribute("placeholder", "<id>");
            obselTypeIdCellInput.setAttribute("required", true);
            obselTypeIdCell.appendChild(obselTypeIdCellInput);
            valueRow.appendChild(obselTypeIdCell);

            /*const anIdInputValueSetPromise = */obselTypeIdCellInput.setAttribute("value", aDistinctValue);
            //idInputsValuesSetPromises.push(anIdInputValueSetPromise);
            
            //if(this._importParameters.model_mode == "new")
                //anIdInputValueSetPromise.then(() => {
                    obselTypeIdCellInput.dispatchEvent(
                        new Event(
                            "change", {
                                bubbles: true,
                                cancelable: false,
                                composed: false
                            }
                        )
                    );
                //});

            const obselTypeLabelCell = document.createElement("td");
            obselTypeLabelCell.classList.add("obsel-type-label");
            const obselTypeLabelCellLabel = document.createElement("span");
            obselTypeLabelCell.appendChild(obselTypeLabelCellLabel);
            const obselTypeLabelCellInput = document.createElement("ktbs4la2-multiple-translations-text-input");
            obselTypeLabelCellInput.addEventListener("change", this._onChangeObselTypeLabelCellInput.bind(this));
            obselTypeLabelCellInput.addEventListener("input", this._onChangeObselTypeLabelCellInput.bind(this));
            obselTypeLabelCellInput.setAttribute("tabindex", 7 + (i * 3));
            obselTypeLabelCellInput.setAttribute("placeholder", this._translateString("Label"));
            obselTypeLabelCellInput.setAttribute("required", true);
            obselTypeLabelCell.appendChild(obselTypeLabelCellInput);
            valueRow.appendChild(obselTypeLabelCell);
            
            this._obselTypesMappingTableBody.appendChild(valueRow);
        }

        //return Promise.all(idInputsValuesSetPromises);
    }

    /**
     * 
     */
    _onChangeObselTypeLabelCellInput(event) {
        const labelInput = event.target;
        const currentRow = event.target.closest("tr");
        const currentRowIdInput = currentRow.querySelector("td.obsel-type-id ktbs4la2-resource-id-input");

        if(currentRowIdInput.old_value != undefined) {
            // --- find what label we should use ---
            const labels = JSON.parse(labelInput.value);
            let preferred_label = null;

            for(let i = 0; i < labels.length; i++)
                if(labels[i].lang == this._lang) {
                    preferred_label = labels[i].value;
                    break;
                }

            if(preferred_label == null)
                for(let i = 0; i < labels.length; i++)
                    if(labels[i].lang == "*") {
                        preferred_label = labels[i].value;
                        break;
                    }

            if(preferred_label == null)
                preferred_label = currentRowIdInput.value;
            // --- done ---

            const currentRowSelect = currentRow.querySelector("select");
            const mappingSelects = this._obselTypesMappingTableBody.querySelectorAll("select");

            for(let i = 0; i < mappingSelects.length; i++) {
                if(mappingSelects[i] != currentRowSelect) {
                    const anOtherMappingSelect = mappingSelects[i];
                    const anOtherMappingSameobseltypeOption = anOtherMappingSelect.querySelector("option[value = \"existing-" + CSS.escape(currentRowIdInput.old_value) + "\"]");
                    anOtherMappingSameobseltypeOption.innerText = preferred_label;

                    if(anOtherMappingSelect.value == ("existing-" + currentRowIdInput.old_value)) {
                        // update label spans
                        const anOtherMappingRow = anOtherMappingSelect.closest("tr");
                        const anOtherMappingLabelSpan = anOtherMappingRow.querySelector("td.obsel-type-label span");
                        anOtherMappingLabelSpan.innerText = preferred_label;
                    }
                }
            }
        }
    }

    /**
     * 
     */
    _onChangeObselTypeIdCellInput(event) {
        if(this._importParameters.model_mode == "new") {
            const idInput = event.target;
            const currentRow = event.target.closest("tr");
            const mappingSelects = this._obselTypesMappingTableBody.querySelectorAll("select");
            const currentRowSelect = currentRow.querySelector("select");

            // --- find what label we should use for the new option ---
            const labelInput = currentRow.querySelector("td.obsel-type-label ktbs4la2-multiple-translations-text-input");
            const labels = JSON.parse(labelInput.value);
            let preferred_label = null;

            for(let i = 0; i < labels.length; i++)
                if(labels[i].lang == this._lang) {
                    preferred_label = labels[i].value;
                    break;
                }

            if(preferred_label == null)
                for(let i = 0; i < labels.length; i++)
                    if(labels[i].lang == "*") {
                        preferred_label = labels[i].value;
                        break;
                    }
            
            if(preferred_label == null)
                preferred_label = idInput.value;
            // --- done ---

            if(idInput.old_value != undefined) {
                // update options in the selects
                for(let i = 0; i < mappingSelects.length; i++) {
                    if(mappingSelects[i] != currentRowSelect) {
                        const anOtherMappingSelect = mappingSelects[i];
                        const anOtherMappingSelect_value = anOtherMappingSelect.value;
                        const anOtherMappingSameobseltypeOption = anOtherMappingSelect.querySelector("option[value = \"existing-" + CSS.escape(idInput.old_value) + "\"]");
                        
                        if(idInput.checkValidity())
                            anOtherMappingSameobseltypeOption.setAttribute("value", "existing-" + idInput.value);

                        anOtherMappingSameobseltypeOption.innerText = preferred_label;

                        if(anOtherMappingSelect_value == ("existing-" + idInput.old_value)) {
                            // update spans
                            const anOtherMappingRow = anOtherMappingSelect.closest("tr");
                            const anOtherMappingIdSpan = anOtherMappingRow.querySelector("td.obsel-type-id span");
                            anOtherMappingIdSpan.innerText = idInput.value;
                            const anOtherMappingLabelSpan = anOtherMappingRow.querySelector("td.obsel-type-label span");
                            anOtherMappingLabelSpan.innerText = preferred_label;
                        }
                    }
                }
            }

            if(idInput.checkValidity()) {
                if(idInput.old_value == undefined) {
                    // create new options in the selects
                    for(let i = 0; i < mappingSelects.length; i++) {
                        if(mappingSelects[i] != currentRowSelect) {
                            const anOtherMappingSelect = mappingSelects[i];
                            const newOption = document.createElement("option");
                            newOption.setAttribute("value", "existing-" + idInput.value);
                            newOption.innerText = preferred_label;
                            anOtherMappingSelect.insertBefore(newOption, anOtherMappingSelect.options[anOtherMappingSelect.options.length - 1]);
                        }
                    }
                }

                idInput.old_value = idInput.value;
            }
        }

        this._updateNextStepButton();
    }

    /**
     * 
     */
    _onChangeObselTypeMappingSelect(event) {
        const tableRow = event.target.closest("tr");
        const idSpan = tableRow.querySelector("td.obsel-type-id span");
        const labelSpan = tableRow.querySelector("td.obsel-type-label span");
        const newMappingType = event.target.value;

        if((tableRow.className == "new-obsel-type") && (newMappingType != "new")) {
            const idInput = tableRow.querySelector("td.obsel-type-id ktbs4la2-resource-id-input");

            if(idInput.old_value != undefined) {
                const labelInput = tableRow.querySelector("td.obsel-type-label ktbs4la2-multiple-translations-text-input");
                const otherSelects = this._obselTypesMappingTableBody.querySelectorAll("tr.existing-obsel-type select");
                let replacementFound = false;

                for(let i = 0; i < otherSelects.length; i++) {
                    const anOtherSelect = otherSelects[i];

                    if(anOtherSelect.value == ("existing-" + idInput.old_value)) {
                        replacementFound = true;
                        const replacementRow = anOtherSelect.closest("tr");
                        const replacementIdInput = replacementRow.querySelector("td.obsel-type-id ktbs4la2-resource-id-input");
                        
                        
                        replacementIdInput.setAttribute("value", idInput.value);//.then(() => {
                            replacementIdInput.old_value = idInput.old_value;
                            this._updateNextStepButton();
                        //});

                        const replacementLabelInput = replacementRow.querySelector("td.obsel-type-label ktbs4la2-multiple-translations-text-input");
                        replacementLabelInput.value = labelInput.value;

                        for(let j = 0; j < anOtherSelect.options.length; j++) {
                            if(anOtherSelect.options[j].getAttribute("value") == ("existing-" + idInput.old_value)) {
                                anOtherSelect.options[j].remove();
                                break;
                            }
                        }

                        anOtherSelect.value = "new";
                        replacementRow.className = "new-obsel-type";
                        break;
                    }
                }

                if(replacementFound) {
                    // --- find what label we should use for the new option ---
                    const labels = JSON.parse(labelInput.value);
                    let preferred_label = null;

                    for(let i = 0; i < labels.length; i++)
                        if(labels[i].lang == this._lang) {
                            preferred_label = labels[i].value;
                            break;
                        }

                    if(preferred_label == null)
                        for(let i = 0; i < labels.length; i++)
                            if(labels[i].lang == "*") {
                                preferred_label = labels[i].value;
                                break;
                            }
                    
                    if(preferred_label == null)
                        preferred_label = idInput.value;
                    // --- done ---

                    // create new option in the select
                    const newOption = document.createElement("option");
                    newOption.setAttribute("value", "existing-" + idInput.old_value);
                    newOption.innerText = preferred_label;
                    event.target.insertBefore(newOption, event.target.options[event.target.options.length - 1]);
                }
                else {
                    const oldOptions = this._obselTypesMappingTableBody.querySelectorAll("select option[value = \"existing-" + CSS.escape(idInput.old_value) + "\"]");

                    for(let i = 0; i < oldOptions.length; i++)
                        oldOptions[i].remove();
                }
            }
        }

        switch(newMappingType) {
            case "do-not-import":
                tableRow.className = "do-not-import";
                break;
            case "new":
                const idInput = tableRow.querySelector("td.obsel-type-id ktbs4la2-resource-id-input");
                const labelInput = tableRow.querySelector("td.obsel-type-label ktbs4la2-multiple-translations-text-input");
                
                idInput.setAttribute("value", "");

                if(idInput.old_value)
                    delete idInput.old_value;

                labelInput.setAttribute("value", "[{\"lang\": \"*\", \"value\": \"\"}]");
                tableRow.className = "new-obsel-type";
                this._updateNextStepButton();
                break;
            default:
                const obselTypeId = newMappingType.substring(9);

                if(this._importParameters.model_mode == "new") {
                    const otherIdInputs = this._obselTypesMappingTableBody.querySelectorAll("tr.new-obsel-type td.obsel-type-id ktbs4la2-resource-id-input");

                    for(let i =0; i < otherIdInputs.length; i++) {
                        if(otherIdInputs[i].old_value == obselTypeId) {
                            const sourceRow = otherIdInputs[i].closest("tr");
                            const sourceIdInput = sourceRow.querySelector("td.obsel-type-id ktbs4la2-resource-id-input");
                            const sourceLabelInput = sourceRow.querySelector("td.obsel-type-label ktbs4la2-multiple-translations-text-input");
                            
                            // --- find what label we should use ---
                            const labels = JSON.parse(sourceLabelInput.value);
                            let preferred_label = null;

                            for(let i = 0; i < labels.length; i++)
                                if(labels[i].lang == this._lang) {
                                    preferred_label = labels[i].value;
                                    break;
                                }

                            if(preferred_label == null)
                                for(let i = 0; i < labels.length; i++)
                                    if(labels[i].lang == "*") {
                                        preferred_label = labels[i].value;
                                        break;
                                    }

                            if(preferred_label == null)
                                preferred_label = sourceIdInput.value;
                            // --- done ---

                            idSpan.innerText = sourceIdInput.value;
                            labelSpan.innerText = preferred_label;
                            break;
                        }
                    }
                }
                else {
                    idSpan.innerText = obselTypeId;
                    const obselType = this._model.get_obsel_type(obselTypeId);
                    labelSpan.innerText = obselType.get_preferred_label(this._lang);
                }

                tableRow.className = "existing-obsel-type";
        }

        this._updateNextStepButton();
    }

    /**
     * 
     * @param {*} colIndex 
     */
    _setClickedColumnStyle(colIndex) {
        while(this._previewTableClickedColStyle.cssRules.length > 0)
            this._previewTableClickedColStyle.deleteRule(0);

        if(colIndex != null)
            this._previewTableClickedColStyle.insertRule("#parsing-preview td:nth-child(" + (colIndex + 1) + ") {background-color: var(--clicked-column-color) !important;}");
    }

    /**
     * 
     * @param {*} colIndex 
     */
    _setErrorColumnStyle(colIndex) {
        while(this._previewTableClickedColStyle.cssRules.length > 0)
            this._previewTableClickedColStyle.deleteRule(0);

        if(colIndex != null) {
            this._previewTableClickedColStyle.insertRule("#parsing-preview td:nth-child(" + (colIndex +1) + ") {background-color: var(--error-column-color) !important;}");
        }
    }

    /**
     * 
     */
    _initCSVParsingPreview() {
        this._parsingPreviewTable.innerHTML = "";

        if(this._parsingPreviewTable.classList.contains("loaded"))
            this._parsingPreviewTable.classList.remove("loaded");

        this._parsingPreviewContainer.scrollTop = 0;
        this._loadCSVParsingPreviewLines(0, this._previewChunkSize);
    }

    /**
     * 
     * @param {*} fromLine 
     * @param {*} maxLines 
     */
    _loadCSVParsingPreviewLines(fromLine = 0, maxLines = null) {
        if(!this._parsingPreviewContainer.classList.contains("loading"))
            this._parsingPreviewContainer.classList.add("loading");

        setTimeout(() => {
            const parsingPreviewTableContent = document.createDocumentFragment();

            if(this._parsed_CSV_data) {
                for(let lineIndex = fromLine; ((maxLines == null) || (lineIndex < (fromLine + maxLines))) && (lineIndex < this._parsed_CSV_data.length); lineIndex++) {
                    const aDataLine = this._parsed_CSV_data[lineIndex];
                    const tableLine = document.createElement("tr");

                    for(let colIndex = 0; colIndex < aDataLine.length; colIndex++) {
                        const tableCell = document.createElement("td");

                        if(aDataLine[colIndex])
                            tableCell.innerText = aDataLine[colIndex];
                        else
                            tableCell.innerHTML = "&nbsp;";

                        tableCell.addEventListener("mouseover", this._onMouseOverParsingPreviewTableCell.bind(this));
                        tableCell.addEventListener("click", this._onClickParsingPreviewTableCell.bind(this));
                        tableLine.appendChild(tableCell);
                    }

                    // add empty table cells at the end if needed, so each line has the same width
                    for(let i = aDataLine.length; i < this._parsed_CSV_data_columns_count; i++) {
                        const emptyTableCell = document.createElement("td");
                        emptyTableCell.innerHTML = "&nbsp;";
                        emptyTableCell.addEventListener("mouseover", this._onMouseOverParsingPreviewTableCell.bind(this));
                        emptyTableCell.addEventListener("click", this._onClickParsingPreviewTableCell.bind(this));
                        tableLine.appendChild(emptyTableCell);
                    }

                    parsingPreviewTableContent.appendChild(tableLine);
                }
            }

            this._parsingPreviewTable.appendChild(parsingPreviewTableContent);

            if(this._parsingPreviewTable.rows.length >= this._parsed_CSV_data.length)
                if(!this._parsingPreviewTable.classList.contains("loaded"))
                    this._parsingPreviewTable.classList.add("loaded");

            if(this._parsingPreviewContainer.classList.contains("loading"))
                this._parsingPreviewContainer.classList.remove("loading");
        }, 50);
    }

    /**
     * 
     */
    _readCharset() {
        this._importParameters.charset = this._charsetSelect.value;
        const textDecoder = new TextDecoder(this._importParameters.charset);
        this._decoded_file_content = textDecoder.decode(this._raw_file_content);
        this._updateNextStepButton();
    }

    /**
     * 
     */
    _onChangeCharsetSelect(event) {
        setTimeout(() => {
            this._readCharset();
            this._readSeparator();
            this._initCSVParsingPreview();
        });
    }

    /**
     * 
     */
    _readSeparator() {
        switch(this._separatorSelect.value) {
            case "tab":
                if(!this._separatorCustomInput.classList.contains("hidden"))
                    this._separatorCustomInput.classList.add("hidden");

                this._importParameters.separator = "\t";
                break;
            case "comma":
                if(!this._separatorCustomInput.classList.contains("hidden"))
                    this._separatorCustomInput.classList.add("hidden");

                this._importParameters.separator = ",";
                break;
            case "semicolon":
                if(!this._separatorCustomInput.classList.contains("hidden"))
                    this._separatorCustomInput.classList.add("hidden");

                this._importParameters.separator = ";";
                break;
            case "space":
                if(!this._separatorCustomInput.classList.contains("hidden"))
                    this._separatorCustomInput.classList.add("hidden");

                this._importParameters.separator = " ";
                break;
            case "custom":
                if(this._separatorCustomInput.classList.contains("hidden"))
                    this._separatorCustomInput.classList.remove("hidden");

                this._importParameters.separator = this._separatorCustomInput.value;
                this._separatorCustomInput.reportValidity();
                this._separatorCustomInput.focus();
                break;
        }

        if(this._importParameters.separator) {
            this._parsed_CSV_data = KTBS4LA2CsvTraceImport._parseCSV(this._decoded_file_content, this._importParameters.separator);
            this._parsed_CSV_data_columns_count = this._getColumnsCount(this._parsed_CSV_data);
        }
        else {
            if(this._parsed_CSV_data)
                delete this._parsed_CSV_data;

            if(this._parsed_CSV_data_columns_count)
                delete this._parsed_CSV_data_columns_count;
        }

        this._updateNextStepButton();
    }

    /**
     * 
     */
    _onChangeSeparatorSelect(event) {
        setTimeout(() => {
            this._readSeparator();
            this._initCSVParsingPreview();
        });
    }

     /**
     * 
     */
    _onChangeCustomSeparatorInput() {
        setTimeout(() => {
            this._readSeparator();
            this._initCSVParsingPreview();
        });
    }

    /**
     * 
     */
    _onClickPreviousStepButton(event) {
        const currenstepBeforeSwitch = this._currentStep;
        
        switch(currenstepBeforeSwitch) {
            case "step-load-profile" :
                this._switchToPreviousStep();

                if(this._importParameters)
                    delete this._importParameters;

                break;
            case "step-csv-parsing" :
                this._switchToPreviousStep();
                break;
            case "step-choose-model" :
                this._switchToPreviousStep();
                break;
            case "step-define-obsel-types" :
                this._switchToPreviousStep();
                const currentLines = this._obselTypesMappingTableBody.querySelectorAll("tr:not(#obsel-types-mapping-empty-row)");

                for(let i = currentLines.length - 1; i >=0; i--)
                    currentLines[i].remove();
                    
                this._setClickedColumnStyle(null);
                this._setHoveredColumnStyle(null);
                this._parsingPreviewTitle.parentNode.insertBefore(this._parsingPreviewContainer, null);

                if(this._importParameters.obseltype_column_index)
                    delete this._importParameters.obseltype_column_index;

                break;
            case "step-attributes-mapping" :
                const allMappingTables = this._attributesMappingTablesContainer.querySelectorAll("ktbs4la2-attributes-mapping-table");
                const currentAttributesMappingTable = this._getCurrentAttributesMappingTable();
                let previousMappingTable = null;

                for(let i = 1; (previousMappingTable == null) && (i < allMappingTables.length); i++) {
                    if(allMappingTables[i] == currentAttributesMappingTable)
                        previousMappingTable = allMappingTables[i - 1];
                }

                if(previousMappingTable != null) {
                    currentAttributesMappingTable.classList.add("hidden");
                    previousMappingTable.classList.remove("hidden");
                    this._attributesMappingTablesContainer.scrollTop = 0;
                    this._attributesMappingTablesContainer.scrollLeft = 0;
                    this._updateNextStepButton();
                }
                else {
                    for(let i = 0; i < allMappingTables.length; i++)
                        allMappingTables[i].remove();

                    if(this._importParameters.attributes_mapping)
                        delete this._importParameters.attributes_mapping;

                    this._switchToPreviousStep();
                }

                break;
            case "step-trace-parameters" :
                this._switchToPreviousStep();
                break;
            case "step-import" :
                this._switchToPreviousStep();
                break;
            case "step-save-profile" :
                this._switchToPreviousStep();
                break;
        }
    }

    /**
     * 
     */
    _getColumnsCount(parsedData) {
        const columns_per_lines = [0];

        for(let lineIndex = 0; lineIndex < this._parsed_CSV_data.length; lineIndex++)
            columns_per_lines.push(this._parsed_CSV_data[lineIndex].length);

        return Math.max(...columns_per_lines);
    }

    /**
     * This will parse a delimited string into an array of arrays. The default delimiter is the comma, but this can be overriden in the second argument.
     * \param String strData the raw CSV data to parse
     * \param String strDelimiter the char used as a delimiter for columns
     * \return Array a 2-D Array (= Array of Array) containing the parsed data
     * \see adapted from https://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm
     * \protected
     * \static
     */
	static _parseCSV(strData, strDelimiter = ",") {
        // Create an array to hold our data. Give the array a default empty first row.
		const arrData = [[]];

		// Create a regular expression to parse the CSV values.
		const objPattern = new RegExp (
			(
				"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" + // Delimiters.
				"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + // Quoted fields.
				"([^\"\\" + strDelimiter + "\\r\\n]*))" // Standard fields.
			),
            "gi"
		);

		// an array to hold our individual pattern matching groups.
		let arrMatches;

		// Keep looping over the regular expression matches until we can no longer find a match.
		while(arrMatches = objPattern.exec(strData)) {
			// Get the delimiter that was found.
			const strMatchedDelimiter = arrMatches[1];

			// Check to see if the given delimiter has a length (is not the start of string) and if it matches field delimiter. 
            // If id does not, then we know that this delimiter is a row delimiter.
			if(strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter))
				// Since we have reached a new row of data add an empty row to our data array.
				arrData.push([]);

            let strMatchedValue;

			// Now that we have our delimiter out of the way, let's check to see which kind of value we captured (quoted or unquoted).
			if(arrMatches[2])
				// We found a quoted value. When we capture this value, unescape any double quotes.
				strMatchedValue = arrMatches[2].replace(new RegExp( "\"\"", "g" ), "\"");
			else
				// We found a non-quoted value.
				strMatchedValue = arrMatches[3];
            
			// Now that we have our value string, let's add it to the data array.
			arrData[arrData.length - 1].push(strMatchedValue.trim());
		}

        if((arrData[arrData.length - 1].length == 1) && (arrData[arrData.length - 1][0].length == 0))
            arrData.splice(arrData.length - 1, 1);

		// Return the parsed data.
		return(arrData);
	}

    /**
     * Guesses which delimiter is the best candidate to parse CSV content
     * \see adapted from https://www.codeproject.com/Articles/231582/Auto-detect-CSV-separator
     * \param String strData the CSV content to parse
     * \param Array of String candidateDelimiters the candidate delimiters
     * \param int maxRowCount the maximum number of rows of strData to process. If not provided or null, all the rows in strData will be processed.
     * \return String the candidate delimiter who scored the most occurences out of quoted values
     * \protected
     * \static
     */
    static _guessDelimiter(strData, candidateDelimiters, maxRowCount = null) {
        const separatorsOccurencesCount = new Array(candidateDelimiters.length).fill(0);
        let currentCharacter;
        let currentValueIsQuoted = false;
        let currentCharIsValueFirstChar = true;
        let rowIndex = 0;
        let charIndex = 0;
        let endOfFileReached = false;

        while(!endOfFileReached && ((maxRowCount == null) || (rowIndex < maxRowCount))) {
            currentCharacter = strData.charAt(charIndex);
            charIndex++;
            
            switch (currentCharacter) {
                case '"':
                    if(currentValueIsQuoted) {
                        if (strData.charAt(charIndex) != '"')
                            // Value is quoted and current character is " and next character is not ".
                            currentValueIsQuoted = false;
                        else
                            // Value is quoted and current and next characters are "" - read (skip) peeked quote.
                            charIndex++;
                    }
                    else {
                        if(currentCharIsValueFirstChar) 	
                            // Set value as quoted only if this quote is the first char in the value.
                            currentValueIsQuoted = true;
                    }

                    break;
                case '\n':
                    if(!currentValueIsQuoted) {
                        rowIndex++;
                        currentCharIsValueFirstChar = true;
                        continue;
                    }

                    break;
                case "":
                    endOfFileReached = true;
                    break;
                default:
                    if(!currentValueIsQuoted) {
                        const index = candidateDelimiters.indexOf(currentCharacter);

                        if (index != -1) {
                            separatorsOccurencesCount[index]++;
                            currentCharIsValueFirstChar = true;
                            continue;
                        }
                    }

                    break;
            }

            if (currentCharIsValueFirstChar)
                currentCharIsValueFirstChar = false;
        }

        const maxOccurencesCount = Math.max(...separatorsOccurencesCount);

        if(maxOccurencesCount != 0) {
            const maxOccurencesCountRank = separatorsOccurencesCount.indexOf(maxOccurencesCount);

            if(maxOccurencesCountRank != -1)
                return candidateDelimiters[maxOccurencesCountRank];
            else
                return null;
        }
        else
            return null;
    }

    /**
     * 
     * @param {*} entries 
     * @param {*} observer 
     */
    _onParsingPreviewContainerIntersection(entries, observer) {
        if(
                entries[0] 
            &&  entries[0].isIntersecting 
            &&  this._parsed_CSV_data 
            &&  !this._parsingPreviewTable.classList.contains("loaded")
            &&  (this._parsingPreviewTable.rows.length < this._parsed_CSV_data.length)
            &&  (!this._parsingPreviewContainer.classList.contains("loading"))
        ) {
            this._loadCSVParsingPreviewLines(this._parsingPreviewTable.rows.length, this._previewChunkSize);
        }
    }

    /**
     * 
     */
    _onAttributesMappingTablesContainerIntersection(entries, observer) {
        if(
                entries[0] 
            &&  entries[0].isIntersecting
        )
        {
            const targetRow = entries[0].target;
            const mappingTable = targetRow.getRootNode().host;

            if(
                    mappingTable
                &&  !mappingTable.classList.contains("loading")
                &&  !mappingTable.classList.contains("loaded")
            ) {
                mappingTable.classList.add("loading");

                setTimeout(() => {
                    this._attributesMappingTablesContainerIntersectionObserver.unobserve(targetRow);
                    const col_index = (mappingTable.discriminatingColumnIndex != undefined)?mappingTable.discriminatingColumnIndex:"*";
                    const col_value = (mappingTable.discriminatingValue != undefined)?mappingTable.discriminatingValue:"*";
                    const startIndex = parseInt(targetRow.getAttribute("x-data-lineindex"));
                    const newRows = this._getDataRowsMatchingColValue(col_index, col_value, startIndex, 50);
                    const newRowsCount = newRows.querySelectorAll("tr").length;

                    if(newRowsCount > 0) {
                        mappingTable.addBodyContent(newRows)
                            .then(() => {
                                this._attributesMappingTablesContainerIntersectionObserver.observe(mappingTable.last_data_row);
                                mappingTable.classList.remove("loading");
                            });

                        if(newRowsCount < 50)
                            mappingTable.classList.add("loaded");
                    }
                    else {
                        mappingTable.classList.remove("loading");
                        mappingTable.classList.add("loaded");
                    }
                });
            }
        }
    }

    /**
     * 
     */
    _onChangeFirstLineIsHeaderCheckbox(event) {
        this._importParameters.has_header = this._firstLineIsHeaderCheckbox.checked;

        if(this._importParameters.has_header) {
            if(!this._parsingPreviewTable.classList.contains("has-header"))
                this._parsingPreviewTable.classList.add("has-header");
        }
        else {
            if(this._parsingPreviewTable.classList.contains("has-header"))
                this._parsingPreviewTable.classList.remove("has-header");
        }
    }

    /**
     * 
     */
    _onChangeObselTypesNumber() {
        if(this._obselTypesNumberUniqueRadioButton.checked) {
            if(this._stepDefineObselTypesForm.classList.contains("obsel-types-number-multiple"))
                this._stepDefineObselTypesForm.classList.remove("obsel-types-number-multiple");

            if(!this._stepDefineObselTypesForm.classList.contains("obsel-types-number-unique"))
                this._stepDefineObselTypesForm.classList.add("obsel-types-number-unique");
        }
        else {
            if(this._stepDefineObselTypesForm.classList.contains("obsel-types-number-unique"))
                this._stepDefineObselTypesForm.classList.remove("obsel-types-number-unique");

            if(!this._stepDefineObselTypesForm.classList.contains("obsel-types-number-multiple"))
                this._stepDefineObselTypesForm.classList.add("obsel-types-number-multiple");
        }

        this._updateNextStepButton();
    }

    /**
     * 
     */
    _onChangeModelChoice(event) {
        if(this._modelChoiceNewCheckbox.checked) {
            if(this._stepChooseModelForm.classList.contains("model-choice-existing"))
                this._stepChooseModelForm.classList.remove("model-choice-existing");

            if(!this._stepChooseModelForm.classList.contains("model-choice-new"))
                this._stepChooseModelForm.classList.add("model-choice-new");
            }
            else {
            if(this._stepChooseModelForm.classList.contains("model-choice-new"))
                this._stepChooseModelForm.classList.remove("model-choice-new");

            if(!this._stepChooseModelForm.classList.contains("model-choice-existing"))
                this._stepChooseModelForm.classList.add("model-choice-existing");
        }

        this._updateNextStepButton();
    }

    /**
     * 
     */
    _onChangeProfileChoice(event) {
        if(this._loadProfileYesRadioButton.checked) {
            if(this._importProfileSelect.hasAttribute("disabled"))
                this._importProfileSelect.removeAttribute("disabled");

            if(!this._mainContent.classList.contains("with-import-profile"))
                this._mainContent.classList.add("with-import-profile");

            if(!this._importStepsNavList.classList.contains("with-import-profile"))
                this._importStepsNavList.classList.add("with-import-profile");
        }
        else {
            if(!this._importProfileSelect.hasAttribute("disabled"))
                this._importProfileSelect.setAttribute("disabled", true);

            if(this._mainContent.classList.contains("with-import-profile"))
                this._mainContent.classList.remove("with-import-profile");

            if(this._importStepsNavList.classList.contains("with-import-profile"))
                this._importStepsNavList.classList.remove("with-import-profile");
        }
    }

    /**
     * 
     */
    _onClickStartImportButton(event) {
        event.preventDefault();
        event.stopPropagation();

        if(!this._stepImportSection.classList.contains("importing"))
            this._stepImportSection.classList.add("importing");

        this._progressBar.style.width = "0px";
        this._importMessageDiv.innerText = this._translateString("Import in progress, be carefull not close until completion");

        const errorLogs = this._importErrorsList.querySelectorAll("li");

        for(let i = 0; i < errorLogs.length; i++)
            errorLogs[i].remove();

        if(this._stepImportSection.classList.contains("has-errors"))
            this._stepImportSection.classList.remove("has-errors");

        this._switchToNextStep("step-import");

        let importModel, importModelReady;
        let uniqueObselType;

        if(this._importParameters.model_mode == "new") {
            let resolveNewModelCreated, rejectNewModelCreated;

            importModelReady = new Promise((resolve, reject) => {
                resolveNewModelCreated = resolve;
                rejectNewModelCreated = reject;
            })

            importModel = new Model();
            importModel.id = this._importParameters.model.id;

            if(this._importParameters.model.labels) {
                for(let i = 0; i < this._importParameters.model.labels.length; i++) {
                    const aLabel = this._importParameters.model.labels[i];

                    if(aLabel.lang == "*")
                        importModel.label = aLabel.value;
                    else
                        importModel.set_translated_label(aLabel.value, aLabel.lang);
                }
            }

            if(this._importParameters.obsel_types_mapping_mode == "multiple") {
                // build the obsel types list
                for(let i = 0; i < this._importParameters.obsel_types_mapping.length; i++) {
                    const anObselTypeMapping = this._importParameters.obsel_types_mapping[i];
                    
                    if(anObselTypeMapping.obsel_type) {
                        const newObselType = new ObselType(importModel);
                        newObselType.id = anObselTypeMapping.obsel_type.id;

                        if(anObselTypeMapping.obsel_type.labels instanceof Array) {
                            for(let i = 0; i < anObselTypeMapping.obsel_type.labels.length; i++) {
                                const aLabel = anObselTypeMapping.obsel_type.labels[i];
            
                                if(aLabel.lang == "*")
                                    newObselType.label = aLabel.value;
                                else
                                    newObselType.set_translated_label(aLabel.value, aLabel.lang);
                            }
                        }

                        const modelObselTypes = importModel.obsel_types;
                        modelObselTypes.push(newObselType);
                        importModel.obsel_types = modelObselTypes;
                    }
                }
            }
            else {
                uniqueObselType = new ObselType(importModel);
                uniqueObselType.id = this._importParameters.obsel_type.id;

                if(this._importParameters.obsel_type.labels instanceof Array) {
                    for(let i = 0; i < this._importParameters.obsel_type.labels.length; i++) {
                        const aLabel = this._importParameters.obsel_type.labels[i];
    
                        if(aLabel.lang == "*")
                            uniqueObselType.label = aLabel.value;
                        else
                            uniqueObselType.set_translated_label(aLabel.value, aLabel.lang);
                    }
                }

                importModel.obsel_types = [uniqueObselType];
            }

            // build the attribute types list
            for(let i = 0; i < this._importParameters.attributes_mapping.length; i++) {
                const anAttributeMapping = this._importParameters.attributes_mapping[i];

                for(let j = 0; j < anAttributeMapping.mapping_parameters.length; j++) {
                    const anAttributeMappingParameter = anAttributeMapping.mapping_parameters[j];

                    if(anAttributeMappingParameter.mapping_type == "<new>") {
                        const newAttributeType = new AttributeType(importModel);
                        newAttributeType.id = anAttributeMappingParameter.attribute_id;
                        newAttributeType.data_types = [anAttributeMappingParameter.attribute_data_type];
    
                        if(anAttributeMappingParameter.attribute_label instanceof Array) {
                            for(let i = 0; i < anAttributeMappingParameter.attribute_label.length; i++) {
                                const aLabel = anAttributeMappingParameter.attribute_label[i];
            
                                if(aLabel.lang == "*")
                                    newAttributeType.label = aLabel.value;
                                else
                                    newAttributeType.set_translated_label(aLabel.value, aLabel.lang);
                            }
                        }
    
                        const modelAttributeTypes = importModel.attribute_types;
                        modelAttributeTypes.push(newAttributeType);
                        importModel.attribute_types = modelAttributeTypes;
                    }
                }
            }

            // map attributes types to obsel types
            for(let i = 0; i < this._importParameters.attributes_mapping.length; i++) {
                const anAttributeMapping = this._importParameters.attributes_mapping[i];
                let mappedObselType;

                if(this._importParameters.obsel_types_mapping_mode == "multiple") {
                    for(let j = 0; !mappedObselType && (j < this._importParameters.obsel_types_mapping.length); j++) {
                        const anObselTypeMapping = this._importParameters.obsel_types_mapping[j];

                        if(anAttributeMapping.value == anObselTypeMapping.value) {
                            let mappedObselType_id;

                            if(anObselTypeMapping.obsel_type_id)
                                mappedObselType_id = anObselTypeMapping.obsel_type_id;
                            else if(anObselTypeMapping.obsel_type && anObselTypeMapping.obsel_type.id)
                                mappedObselType_id = anObselTypeMapping.obsel_type.id;

                            if(mappedObselType_id)
                                mappedObselType = importModel.get_obsel_type(mappedObselType_id);
                        }
                    }
                }
                else
                    mappedObselType = uniqueObselType;

                if(mappedObselType) {
                    for(let j = 0; j < anAttributeMapping.mapping_parameters.length; j++) {
                        const anAttributeMappingParameter = anAttributeMapping.mapping_parameters[j];

                        if(
                                (anAttributeMappingParameter.mapping_type == "<new>")
                            ||  (
                                    (anAttributeMappingParameter.mapping_type == "<existing>")
                                &&  (
                                        (anAttributeMappingParameter.attribute_id != "id")
                                    &&  (anAttributeMappingParameter.attribute_id != "begin")
                                    &&  (anAttributeMappingParameter.attribute_id != "beginDT")
                                    &&  (anAttributeMappingParameter.attribute_id != "end")
                                    &&  (anAttributeMappingParameter.attribute_id != "endDT")
                                    &&  (anAttributeMappingParameter.attribute_id != "subject")
                                )
                            )
                        ) {
                            const anAttributeType = importModel.get_attribute_type(anAttributeMappingParameter.attribute_id);

                            if(anAttributeType) {
                                const obselTypeAttributesTypes = mappedObselType.attribute_types;

                                if(!obselTypeAttributesTypes.includes(anAttributeType)) {
                                    obselTypeAttributesTypes.push(anAttributeType);
                                    mappedObselType.attribute_types = obselTypeAttributesTypes;
                                }
                            }
                            else
                                throw new Error("Failure to find the appropriate AttributeType");
                        }
                    }
                }
                else
                    throw new Error("Failure to find the appropriate ObselType");
            }

            const modelParentBase = ResourceMultiton.get_resource(Base, this._importParameters.model.parent_uri);

            modelParentBase.get(this._abortController.signal)
                .then(() => {
                    modelParentBase.post(importModel, this._abortController.signal)
                        .then(resolveNewModelCreated)
                        .catch(rejectNewModelCreated);
                })
                .catch(rejectNewModelCreated);
        }
        else {
            importModel = ResourceMultiton.get_resource(Model, this._importParameters.model_uri);

            importModelReady = importModel.get(this._abortController.signal)
                .then(() => {
                    if(this._importParameters.obsel_types_mapping_mode == "unique")
                        uniqueObselType = importModel.get_obsel_type(this._importParameters.obsel_type_id);
                });
        }

        importModelReady
            .then(() => {
                // build the obsels
                this._newObsels = new Array();
                let csvLineStartIndex = this._importParameters.has_header?1:0;

                // browse the CSV data
                for(let csvLineIndex = csvLineStartIndex; csvLineIndex < this._parsed_CSV_data.length; csvLineIndex++) {
                    const aDataLine = this._parsed_CSV_data[csvLineIndex];
                    const obselMappingValue = aDataLine[this._importParameters.obseltype_column_index];

                    // determine the obsel type for this line
                    let mappedObselType;

                    if(this._importParameters.obsel_types_mapping_mode == "multiple") {
                        for(let i = 0; !mappedObselType && (i < this._importParameters.obsel_types_mapping.length); i++) {
                            const anObselTypeMapping = this._importParameters.obsel_types_mapping[i];

                            if(anObselTypeMapping.value == obselMappingValue) {
                                let mappedObselType_id;

                                if(anObselTypeMapping.obsel_type_id)
                                    mappedObselType_id = anObselTypeMapping.obsel_type_id;
                                else if(anObselTypeMapping.obsel_type && anObselTypeMapping.obsel_type.id)
                                    mappedObselType_id = anObselTypeMapping.obsel_type.id;

                                if(mappedObselType_id)
                                    mappedObselType = importModel.get_obsel_type(mappedObselType_id);
                            }
                        }
                    }
                    else
                        mappedObselType = uniqueObselType;
                    // done

                    if(mappedObselType) {
                        // Find the attributes mapping parameters
                        let attributesMappingParameters;

                        if(this._importParameters.obsel_types_mapping_mode == "multiple") {
                            for(let i = 0; !attributesMappingParameters && (i < this._importParameters.attributes_mapping.length); i++) {
                                const anAttributeMapping = this._importParameters.attributes_mapping[i];

                                if(anAttributeMapping.value == obselMappingValue)
                                    attributesMappingParameters = anAttributeMapping.mapping_parameters;
                            }
                        }
                        else
                            if(this._importParameters.attributes_mapping[0])
                                attributesMappingParameters = this._importParameters.attributes_mapping[0].mapping_parameters;
                        // done
                            
                        if(attributesMappingParameters) {
                            const newObsel = new Obsel();
                            newObsel.type = mappedObselType;

                            // build obsel's attributes
                            for(let colIndex = 0; colIndex < aDataLine.length; colIndex++) {
                                const cellValue = aDataLine[colIndex];
                                const cellMappingParameters = attributesMappingParameters[colIndex];

                                if(cellMappingParameters) {
                                    if(cellMappingParameters.mapping_type != "<do-not-import>") {
                                        if(cellMappingParameters.attribute_id != "id") {
                                            let cellAttributeType;

                                            if(AttributeType.builtin_attribute_types_ids.includes(cellMappingParameters.attribute_id))
                                                cellAttributeType = AttributeType.get_builtin_attribute_type(cellMappingParameters.attribute_id);
                                            else
                                                cellAttributeType = importModel.get_attribute_type(cellMappingParameters.attribute_id);

                                            if(cellAttributeType) {
                                                let importValue = cellValue;

                                                if(
                                                        (cellAttributeType.id == "begin")
                                                    ||  (cellAttributeType.id == "end")
                                                )
                                                    importValue = parseInt(cellValue);

                                                newObsel.add_attribute(cellAttributeType, importValue);
                                            }
                                            else
                                                throw new Error("Cannot find attribute type for this cell");
                                        }
                                        else
                                            newObsel.id = cellValue;
                                    }
                                }
                                else
                                    throw new Error("Cannot find attribute mapping parameter for this cell");
                            }
                            // done

                            this._newObsels.push(newObsel);
                        }
                        else
                            throw new Error("Cannot find attributes mapping parameters for this line");
                    }
                }

                const traceParentBase = ResourceMultiton.get_resource(Base, this.getAttribute("parent-uri"));

                traceParentBase.get(this._abortController.signal)
                    .then(() => {
                        this._newTrace = new StoredTrace();
                        this._newTrace.model = importModel;
                        this._newTrace.id = this._traceIdInput.value;
                        this._newTrace.origin = this._traceOriginInput.value;
                        const trace_labels = JSON.parse(this._traceLabelInput.value);

                        if(trace_labels instanceof Array) {
                            for(let i = 0; i < trace_labels.length; i++) {
                                const aLabel = trace_labels[i];

                                if(aLabel.lang == "*")
                                    this._newTrace.label = aLabel.value;
                                else
                                    this._newTrace.set_translated_label(aLabel.value, aLabel.lang);
                            }
                        }

                        traceParentBase.post(this._newTrace, this._abortController.signal)
                            .then(() => {
                                if(this._newObsels.length > 0) {
                                    const allObselPacketTreatedPromises = new Array();
                                    this._allObselPacketTreatedPromisesCallbacks = new Array();
                                    this._importErrors = new Array();
                                    this._nextImportObselPacketIndex = 0;
                                    const packetSize = 50;
                                    const packetCounts = Math.ceil(this._newObsels.length / packetSize);

                                    for(let i = 0; i < packetCounts; i++) {
                                        const anObselPacketTreatedPromise = new Promise((resolve, reject) => {
                                            this._allObselPacketTreatedPromisesCallbacks.push({
                                                resolve: resolve,
                                                reject: reject
                                            });
                                        });

                                        allObselPacketTreatedPromises.push(anObselPacketTreatedPromise);
                                    }

                                    Promise.all(allObselPacketTreatedPromises)
                                        .finally(() => {
                                            this._importMessageDiv.innerText = this._translateString("Import complete");
                                            this._errorsCountDiv.innerText = this._importErrors.length + " " + this._translateString("error(s)");

                                            if(this._importErrors.length > 0) {
                                                for(let i = 0; i < this._importErrors.length; i++) {
                                                    const anError = this._importErrors[i];
                                                    const anErrorLog = document.createElement("li");
                                                    anErrorLog.innerText = anError.name + " : " + anError.message;
                                                    this._importErrorsList.appendChild(anErrorLog);
                                                }

                                                if(!this._stepImportSection.classList.contains("has-errors"))
                                                    this._stepImportSection.classList.add("has-errors");
                                            }

                                            if(this._stepImportSection.classList.contains("importing"))
                                                this._stepImportSection.classList.remove("importing");

                                            this._updateNextStepButton();
                                        });

                                    this._importNextObselPacket();
                                }
                                else
                                    throw new Error("No obsel to import !");
                            })
                            .catch((error) => {
                                console.error(error);
                                this.emitErrorEvent(error);
                                alert(error.name + " : " + error.message);
                            });
                    })
                    .catch((error) => {
                        console.error(error);
                        this.emitErrorEvent(error);
                        alert(error.name + " : " + error.message);
                    });
            })
            .catch((error) => {
                console.error(error);
                this.emitErrorEvent(error);
                alert(error.name + " : " + error.message);
            });
    }

    /**
     * 
     */
    _onClickUndoImportButton(event) {
        event.preventDefault();
        event.stopPropagation();

        if(confirm(this._translateString("WARNING: this will delete the newly created trace !\nIf you created a new model during this import, it will be deleted too.\nAre you sure ?"))) {
            const newlyCreatedTrace = ResourceMultiton.get_resource(StoredTrace, this._newTrace.uri);
            
            newlyCreatedTrace.get(this._abortController.signal)
                .then(() => {
                    const traceModel = this._newTrace.model;

                    this._newTrace.delete(this._abortController.signal)
                        .then(() => {
                            if(this._importParameters.model_mode == "new") {
                                traceModel.get(this._abortController.signal)
                                    .then(() => {
                                        traceModel.delete(this._abortController.signal)
                                            .then(() => {
                                                const traceParametersStep = this._fulfilledSteps.pop();
                                                this._main.className = traceParametersStep;
                                                this._updateNextStepButton();
                                            })
                                            .catch((error) => {
                                                console.error(error);
                                                this.emitErrorEvent(error);
                                                alert(error.name + " : " + error.message);
                                            });
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                        this.emitErrorEvent(error);
                                        alert(error.name + " : " + error.message);
                                    });
                            }
                            else {
                                const traceParametersStep = this._fulfilledSteps.pop();
                                this._main.className = traceParametersStep;
                                this._updateNextStepButton();
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                            this.emitErrorEvent(error);
                            alert(error.name + " : " + error.message);
                        });
                })
                .catch((error) => {
                    console.error(error);
                    this.emitErrorEvent(error);
                    alert(error.name + " : " + error.message);
                });
        }
    }

    /**
     * 
     */
    _importNextObselPacket() {
        const packetSize = 50;
        const obselPacket = this._newObsels.slice(this._nextImportObselPacketIndex * packetSize, (this._nextImportObselPacketIndex + 1) * packetSize);

        this._newTrace.post(obselPacket, this._abortController.signal)
            .then(this._allObselPacketTreatedPromisesCallbacks[this._nextImportObselPacketIndex].resolve)
            .catch((error) => {
                this._importErrors.push(error);
                this._allObselPacketTreatedPromisesCallbacks[this._nextImportObselPacketIndex].reject();
            })
            .finally(() => {
                const packetCounts = Math.ceil(this._newObsels.length / packetSize);
                this._nextImportObselPacketIndex++;
                const treatedPercentage = (this._nextImportObselPacketIndex / packetCounts) * 100;
                this._progressBar.style.width = treatedPercentage + "%";

                if(this._nextImportObselPacketIndex < packetCounts)
                    setTimeout(() => {
                        if(!this._abortController.signal.aborted)
                            this._importNextObselPacket();
                    });
            });
    }

    /**
     * 
     */
    _dataColumnIsEmpty(checked_col_index, dicriminating_col_index = "*", dicriminating_col_value = "*") {
        for(let lineIndex = this._importParameters.has_header?1:0; lineIndex < this._parsed_CSV_data.length; lineIndex++) {
            const aDataLine = this._parsed_CSV_data[lineIndex];

            if(
                (
                        (dicriminating_col_value == "*")
                    ||  ((dicriminating_col_index != "*") &&  (aDataLine[dicriminating_col_index] == dicriminating_col_value))
                    ||  ((dicriminating_col_index == "*") && (aDataLine.includes(dicriminating_col_value)))
                    
                )
                &&  aDataLine[checked_col_index]
                &&  (aDataLine[checked_col_index] != "")
            )
                return false;
        }

        return true;
    }

    /**
     * 
     */
     _dataColumnMatchesBoolean(col_index) {
        for(let lineIndex = this._importParameters.has_header?1:0; lineIndex < this._parsed_CSV_data.length; lineIndex++) {
            const aDataLine = this._parsed_CSV_data[lineIndex];
            const aDataValue = aDataLine[col_index];

            if(
                    (aDataValue != "1")
                &&  (aDataValue != "true")
                &&  (aDataValue != "0")
                &&  (aDataValue != "false")
            )
                return false;
        }

        return true;
    }

    /**
     * 
     */
    _dataColumnMatchesInteger(col_index) {
        for(let lineIndex = this._importParameters.has_header?1:0; lineIndex < this._parsed_CSV_data.length; lineIndex++) {
            const aDataLine = this._parsed_CSV_data[lineIndex];
            const aDataValue = aDataLine[col_index];

            if(!(/^[-+]?(\d+)$/.test(aDataValue)))
                return false;
        }

        return true;
    }

    /**
     * 
     */
    _dataColumnMatchesFloat(col_index) {
        for(let lineIndex = this._importParameters.has_header?1:0; lineIndex < this._parsed_CSV_data.length; lineIndex++) {
            const aDataLine = this._parsed_CSV_data[lineIndex];
            const aDataValue = aDataLine[col_index];

            if(!(/^[-+]?(\d*[.])?\d+$/.test(aDataValue)))
                return false;
        }

        return true;
    }

    /**
     * 
     */
    _dataColumnMatchesDatetime(col_index) {
        for(let lineIndex = this._importParameters.has_header?1:0; lineIndex < this._parsed_CSV_data.length; lineIndex++) {
            const aDataLine = this._parsed_CSV_data[lineIndex];
            const aDataValue = aDataLine[col_index];

            if(isNaN(Date.parse(aDataValue)))
                return false;
        }

        return true;
    }

    /**
     * 
     */
    _guessColumnDataType(col_index) {
        if(!this._dataColumnIsEmpty(col_index)) {
            if(this._dataColumnMatchesBoolean(col_index))
                return "xsd:boolean";
            else if(this._dataColumnMatchesInteger(col_index))
                return "xsd:integer";
            else if(this._dataColumnMatchesFloat(col_index))
                return "xsd:float";
            else if(this._dataColumnMatchesDatetime(col_index))
                return "xsd:dateTime";
        }

        return "xsd:string";
    }

    /**
     * 
     */
    _onBeforeUnloadWindow(event) {
        event.preventDefault();
        const confirmMessage = this._translateString("Some data has not been saved yet. Are you sure you want to leave ?");
        event.returnValue = confirmMessage;
        return confirmMessage;
    }
        
    /**
     * 
     */
    _onBeforeRemove(event) {
        if(!confirm(this._translateString("Some data has not been saved yet. Are you sure you want to leave ?")))
            event.preventDefault();
    }

    /**
     * 
     */
     disconnectedCallback() {
        window.removeEventListener("beforeunload", this._bindedOnBeforeUnloadWindowMethod);
        this.removeEventListener("beforeremove", this._bindedOnBeforeRemoveMethod);
        super.disconnectedCallback();
    }

    /**
     * 
     */
    _onChangeProfileNameInput(event) {
        if(this._profileNameInput.value != "") {
            if(this._saveProfileButton.hasAttribute("disabled"))
                this._saveProfileButton.removeAttribute("disabled");
        }
        else {
            if(!this._saveProfileButton.hasAttribute("disabled"))
                this._saveProfileButton.setAttribute("disabled", true);
        }
    }

    /**
     * 
     */
    _onClickSaveProfileButton(event) {
        event.preventDefault();
        event.stopPropagation();
        const currentProfilesString = window.localStorage.getItem("import-profiles");
        
        try {
            let currentProfiles;

            if(currentProfilesString != null)
                currentProfiles = JSON.parse(currentProfilesString);
            else
                currentProfiles = new Array();

            if(currentProfiles instanceof Array) {
                const profileObject = {
                    name: this._profileNameInput.value,
                    description: this._profileDescriptionTextarea.value
                };

                const profileParameters = JSON.parse(JSON.stringify(this._importParameters));
                
                // alter import parameters to link to the model that is now existing
                if(profileParameters.model_mode == "new") {
                    profileParameters.model_mode = "existing";
                    delete profileParameters.model;
                    profileParameters.model_uri = this._newTrace.model.uri.toString();

                    if(profileParameters.obsel_types_mapping_mode == "unique") {
                        profileParameters.obsel_type_id = profileParameters.obsel_type.id;
                        delete profileParameters.obsel_type;
                    }
                    else {
                        for(let i = 0; i < profileParameters.obsel_types_mapping.length; i++) {
                            if(profileParameters.obsel_types_mapping[i].obsel_type) {
                                profileParameters.obsel_types_mapping[i].obsel_type_id = profileParameters.obsel_types_mapping[i].obsel_type.id;
                                delete profileParameters.obsel_types_mapping[i].obsel_type;
                            }
                        }
                    }

                    for(let i =0; i < profileParameters.attributes_mapping.length; i++) {
                        for(let j = 0; j < profileParameters.attributes_mapping[i].mapping_parameters.length; j++) {
                            if(profileParameters.attributes_mapping[i].mapping_parameters[j].mapping_type == "<new>") {
                                profileParameters.attributes_mapping[i].mapping_parameters[j].mapping_type = "<existing>";

                                if(profileParameters.attributes_mapping[i].mapping_parameters[j].attribute_label)
                                    delete profileParameters.attributes_mapping[i].mapping_parameters[j].attribute_label;

                                if(profileParameters.attributes_mapping[i].mapping_parameters[j].attribute_data_type)
                                    delete profileParameters.attributes_mapping[i].mapping_parameters[j].attribute_data_type;
                            }
                        }
                    }
                }
                // ---

                profileObject.parameters = profileParameters;
                currentProfiles.push(profileObject);
                window.localStorage.setItem("import-profiles", JSON.stringify(currentProfiles));
                alert(this._translateString("Import profile saved"));
                this._requestClose();
            }
            else
                throw new TypeError("Existing JSON data in local storage at key 'import-profile' does not represent an Array");
        }
        catch(error) {
            console.error(error);
            this.emitErrorEvent(error);
            alert(error.name + " : " + error.message);
        }
    }

    /**
     * 
     */
    _onClickCloseButton(event) {
        event.preventDefault();
        event.stopPropagation();
        this._requestClose();
    }

    /**
     * 
     */
    _requestClose() {
        window.removeEventListener("beforeunload", this._bindedOnBeforeUnloadWindowMethod);
        this.removeEventListener("beforeremove", this._bindedOnBeforeRemoveMethod);
        this.dispatchEvent(new CustomEvent("close", {bubbles: true, composed: true, cancelable: false}));
    }
}

customElements.define('ktbs4la2-csv-trace-import', KTBS4LA2CsvTraceImport);