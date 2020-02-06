DESCRIPTION :
-------------
This component fetches the obsels' data from a KTBS trace, and instanciates a ktbs4la2-timeline widget to represent obsels as it's events.
It also offers support for KTBS stylesheets (stylesheet selection and current stylesheet legend) aswell as data load control tools.
Wheteher or not any stylesheet is described in the trace's model, the widget always provides a "default" stylesheet built on the fly from the model's obsel types if possible, or from obsel's if the model fails to be fetched.

It provides one custom element : <ktbs4la2-trace-timeline> described below.


<ktbs4la2-trace-timeline> :
---------------------------
    Attributes :
    ------------
        - uri (required)
            Description : the uri of the KTBS trace to fetch and display
            Format: URL
        - allow-fullscreen (optional)
            Description : whether or not the widget should display a "fullscreen" button and allow switching to fullscreen mode
            Accepted values : "true", "1", "false", "0"
            Default : "true"
        - stylesheet (optional)
            Description: sets which stylesheet should be applied to obsels at startup
            Accepted values: "default" or a valid stylesheet ID from the trace's Model
            Default : "default" 
            !!! This attribute value will not be automatically updated to expose the widgets' state (for this purpose, use instead the "set-stylesheet" events described further below).
        - allow-change-stylesheet (optional)
            Description : whether or not the user should be able to change the stylesheet currently applied to the obsels.
            Accepted values: "true", "1", "false", "0"
            Default : "true"
        - show-stylesheet-legend (optional)
            Description : whether or not the user should see a legend for the current stylesheet
            Accepted values: "true", "1", "false", "0"
            Default : "true"

    Emitted events :
    ----------------
        - set-stylesheet
            Description : a "set-stylesheet" event is emitted when the users changes the current stylesheet
            bubbles: true
            cancelable: false
            detail :
                stylesheet_id: ID of the newly selected stylesheet

    Child nodes :
    -------------
       Any nested content will be discarded.


EXAMPLE :
---------
See the "sample.html" file provided alongside this one.