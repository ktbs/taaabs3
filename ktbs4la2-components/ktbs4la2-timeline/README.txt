DESCRIPTION :
-------------
This component provides an interactive widget allowing precise visualization of large timed events collections.

By "precise", I mean the timeline can be zoomed-in up to millisecond detail level, and each event can display a popup containing custom additional data.

By "large", I mean the UI design allows a virtually unlimited number of events, but the more data you feed it the more resource-consumming it gets. 
So it might become slow at a certain point, depending on the amount of instanciated events and the user's system performance. 
It should run smoothly with a couple thousands events on an average performance PC, might get less smooth somewhere around 10 000 events.

The component provides two custom elements :
    - <ktbs4la2-timeline> : the parent element intanciating the timeline
    - <ktbs4la2-timeline-event> : the child element for each event in the timeline

Each of these elements is decribed in details below.


<ktbs4la2-timeline> :
---------------------
    Attributes :
    ------------
        - begin (required)
            Description : the maximum begining time of the timeline. Note that the widget might choose to start the timeline representation a little bit earlier (but never later) for conveniance, in order to display a consistant time-division level at initial state.
            Format : millisecond timestamp
        - end (required)
            Description : the minimum ending time of the timeline. Note that the widget might choose to end the timeline representation a little bit later (but never earlier) for conveniance, in order to display a consistant time-division level at initial state.
            Format : millisecond timestamp
        - allow-fullscreen (optional)
            Description : whether or not the widget should display a "fullscreen" button and allow switching to fullscreen mode
            Accepted values : "true", "1", "false", "0"
            Default : "true"
        - cursor-time (optional)
            Description : allows to temporarily force the position of the timeline's cursor (= the vertical red line under the mouse pointer).
            Format : millisecond timestamp
            !!! Note this will be ignored when the user manually moves the cursor. Besides, this attribute value will not be automatically updated to expose the cursor's position (for this purpose, use instead the "cursor-move" events described further below).
        - view-begin (optional)
            Description : allows to temporarily force the begining of the displayed portion of the timeline.
            Format : millisecond timestamp
            !!! Note this will be ignored when the user manually changes the view. Besides, this attribute value will not be automatically updated to expose the view's state (for this purpose, use instead the "view-change" events described further below).
        - zoom-level (optional)
            Description : allows to temporarily force the smallest time-division unit displayed in the view.
            Accepted values : "year", "month", "day", "hour", "tenminutes", "minute", "tenseconds", "second", "ahundredmilliseconds", "tenmilliseconds" or "millisecond"
            !!! Note this will be ignored when the user manually changes the view. Besides, this attribute value will not be automatically updated to expose the view's state (for this purpose, use instead the "view-change" events described further below).
        - div-width (optional)
            Description : allows to temporarily force the width (in pixels) for each time division of the smallest unit currently displayed in the view.
            Format : integer (in pixels)
            !!! Note this will be ignored when the user manually changes the view. Besides, this attribute value will not be automatically updated to expose the view's state (for this purpose, use instead the "view-change" events described further below).

    Emitted events :
    ----------------
        - request-fullscreen
            Description : a "request-fullscreen" event is emitted when the users clicks the "fullscreen" button. A third-party script can listen to this event to perform tasks before the widget switches to fullscreen, or even cancel the event in order to prevent the user from switching to fullscreen.
            cancelable : true
        - cursor-move
            Description : a "cursor-move" event is emitted when the users moves the timeline's cursor (= the vertical red line under the mouse pointer) over the timeline.
            bubbles : true
            cancelable : false
			detail :
                cursor_time : the new time of the cursor (format : millisecond timestamp) 
        - view-change
            Description : a "view-change" event is emitted when the users zooms in/out or scrolls through the timeline.
            bubbles : true
			cancelable : false
            detail :
					begin: the begining of the displayed portion of the timeline (format millisecond timestamp)
					zoom_level: the smallest time-division unit displayed in the view (can be either one of "year", "month", "day", "hour", "tenminutes", "minute", "tenseconds", "second", "ahundredmilliseconds", "tenmilliseconds" or "millisecond")
					div_width: the width (in pixels) of each time-division of "zoom_level".

    Child nodes :
    -------------
        Only children <ktbs4la2-timeline-event> elements will be represented, any other content will be discarded.


<ktbs4la2-timeline-event> :
---------------------
    Attributes :
    ------------
        - id (required)
            Description : a unique identifier for the event.
            Accepted values: almost anything as long as it's valid HTML-wise , and unique within the parent timeline
        - begin (required)
            Description : the begining time of the event
            Format : millisecond timestamp
        - end (optional)
            Description : the ending time of the event. If none is provided, the event will be considered an "instant" event, meaning it's ending time is the same as it's begining time.
            Format : millisecond timestamp
            Default : same as "begin"
            !!! Only events with a "duration-bar" shape (default) can represent the event's length over the timeline
        - title (optional)
            Description : a string that will be displayed as a "tootltip" (or "hint") to the user when hovering the event's marker.
        - href (optional)
            Description : if provided, the event's marker will also be a hyperlink pointing to the URL provided by this attribute.
            Format: URL
        - color (optional)
            Description : a color for the event's maker, aswell as detail-popup's header and border.
            Format : any valid HTML/CSS color.
            Default : #888 (grey)
        - shape (optional)
            Description : a pre-defined shape for the event's marker.
            Accepted values : "duration-bar", "circle", "diamond" or "star"
            Default: duration-bar
            !!! Note this attribute is mutually exclusive with "symbol".
            !!! Only events with a "duration-bar" shape (default) can represent the event's length over the timeline
        - symbol (optional)
            Description : an arbitrary symbol (character or emoji) that will be used to represent the event's marker.
            Format : the whole Unicode range should be supported thanks to the included "unifont" and "unifont_upper" font files.
            !!! Note this attribute is mutually exclusive with "shape".
        - visible (optional)
            Description : allows to hide or unhide the event.
            Accepted values : "true", "1", "false", "0"
            Default : "true"

    Emitted events :
    ----------------
        - select-timeline-event
            Description : a "select-timeline-event" event is emitted when the users clicks an event, before it's details popup gets opened. A third-party script can listen to this event type to perform operations before the popup gets opened, or can even cancel the event in order to prevent the popup from opening.
            Bubbles : true
			Cancelable : true

    Child nodes:
    ------------
        All the children nested inside the element will be shown as the content of the details popup, when opened. The widget will not alter the styling of this content, which is let to the responsibility of the site's developpers.


EXAMPLE :
---------
See the "sample.html" file provided alongside this one.
