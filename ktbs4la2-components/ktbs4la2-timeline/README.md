# Description
This component provides an interactive widget allowing precise visualization of large events collections over time.

By *precise*, understand the timeline can be zoomed-in up to millisecond detail level, and each event can display a popup containing custom additional data.  

By *large*, understand the UI design allows a virtually unlimited number of events and the code has been wrote with performance in mind.
However, the more data you feed it, the more resource-consumming it gets. So it *can* become slow at a certain point, depending on the amount of instanciated events and the user's system performance. It *should* run smoothly with a couple thousands events on an average performance PC, but *might* get less smooth somewhere around 10 000 events.

This component provides two custom elements : 
- **\<ktbs4la2-timeline\>**  
The parent element holding the timeline
- **\<ktbs4la2-timeline-event\>**  
The children element to instanciate for each event in the timeline  

# Usage
First, you have to import [ktbs4la2-timeline.js](./ktbs4la2-timeline.js),

either from HTML :
```HTML
<script type="module" src="/<path>/ktbs4la2-timeline/ktbs4la2-timeline.js"></script>
```

or from Javascript :
```javascript
import "/<path>/ktbs4la2-timeline/ktbs4la2-timeline.js";
```

In order to create a timeline widget populated with events, you must then add a \<ktbs4la2-timeline\> element with \<ktbs4la2-timeline-event\> childs to your HTML document as following :
```HTML
<ktbs4la2-timeline begin="timeline_begin_timestamp" end ="timeline_end_timestamp">
    <ktbs4la2-timeline-event id="event1" begin="event_begin_timestamp">
        Event's popup content goes here ...
    </ktbs4la2-timeline-event>

     <ktbs4la2-timeline-event id="event1" begin="event_begin_timestamp">
        Event's popup content goes here ...
    </ktbs4la2-timeline-event>

    <!-- etc ... -->
</ktbs4la2-timeline>
```

Each of these two elements is decribed in details below.

# \<ktbs4la2-timeline\>

## Attributes

### begin

The maximum begining time of the timeline.

Note that the widget might choose to start the timeline representation a little bit earlier (but never later) for conveniance, in order to display a consistant time-division level at initial state.

+ **format**: Millisecond timestamp
+ **required**
  
### end

The minimum ending time of the timeline.
  
Note that the widget might choose to end the timeline representation a little bit later (but never earlier) for conveniance, in order to display a consistant time-division level at initial state.
  
+ **format**: Millisecond timestamp
+ **required**
  
### allow-fullscreen

Whether or not the widget should display a "fullscreen" button and allow switching to fullscreen mode.
  
+ **format**: "true", "1", "false" or "0"
+ **optional**
+ **default**: "true"

### cursor-time

Allows to temporarily force the position of the timeline's cursor (= the vertical red line under the mouse pointer).
  
**Important** : note this will be ignored when the user manually moves the cursor. Besides, this attribute value will not be automatically updated to expose the cursor's position (for this purpose, use instead the "cursor-move" events described further below).
  
+ **fomat**: Millisecond timestamp
+ **optional**
  
### view-begin

Allows to temporarily force the begining of the displayed portion of the timeline.
  
**Important** : note this will be ignored when the user manually changes the view. Besides, this attribute value will not be automatically updated to expose the view's state (for this purpose, use instead the "view-change" events described further below).
  
+ **format**: Millisecond timestamp
+ **optional**

### zoom-level

Allows to temporarily force the smallest time-division unit displayed in the view.
  
**Important** : note this will be ignored when the user manually changes the view. Besides, this attribute value will not be automatically updated to expose the view's state (for this purpose, use instead the "view-change" events described further below).
  
+ **format**: "year", "month", "day", "hour", "tenminutes", "minute", "tenseconds", "second", "ahundredmilliseconds", "tenmilliseconds" or "millisecond"
+ **optional**
  
### div-width

Allows to temporarily force the width (in pixels) for each time division of the smallest unit currently displayed in the view.
  
**Important** : note this will be ignored when the user manually changes the view. Besides, this attribute value will not be automatically updated to expose the view's state (for this purpose, use instead the "view-change" events described further below).
 
+ **format**: Integer
+ **optional**


## Emitted events

### request-fullscreen

Emitted when the users clicks the "fullscreen" button.<br> A third-party script can listen to this event to perform tasks before the widget switches to fullscreen, or even cancel the event in order to prevent the user from switching to fullscreen.
  
+ **bubbles**: true
+ **cancelable**: true
  
### cursor-move

Emitted when the users moves the timeline's cursor (= the vertical red line under the mouse pointer) over the timeline.
  
+ **bubbles**: true
+ **cancelable**: false

Details:

+ **cursor_time**: the new time of the cursor (format : millisecond timestamp)
    
### view-change

Emitted when the users zooms in/out or scrolls through the timeline.
  
+ **bubbles**: true
+ **cancelable**: false

Details:

+ **begin**: the begining of the displayed portion of the timeline (format millisecond timestamp)
+ **zoom_level**: the smallest time-division unit displayed in the view (can be either one of "year", "month", "day", "hour", "tenminutes", "minute", "tenseconds", "second", "ahundredmilliseconds", "tenmilliseconds" or "millisecond")
+ **div_width**: the width (in pixels) of each time-division of "zoom_level"


## Child nodes
Only children **\<ktbs4la2-timeline-event\>** elements will be represented, any other content will be discarded.

# \<ktbs4la2-timeline-event\>

## Attributes


| Name | Description | Format | Required | Default |
| ----:|:----------- |:------ |:-------- |:------- |
| id | A unique identifier for the event. | Almost anything as long as it's valid HTML-wise , and unique within the parent timeline. | Required | |
| begin | The begining time of the event. | Millisecond timestamp | Required | |
| end | The ending time of the event.<br> If none is provided, the event will be considered an "instant" event, meaning it's ending time is the same as it's begining time.<br><br> **Important**: only events with "duration-bar" shape (default) can represent the event's length over the timeline| Millisecond timestamp | Optional | Same as *begin* |
| title | A string that will be displayed as a "tootltip" (or "hint") to the user when hovering the event's marker. | String | Optional | |
| href | If provided, the event's marker will also be a hyperlink pointing to the URL provided by this attribute. | URL | Optional | |
| color | A color for the event's maker, aswell as detail-popup's header and border. | Any valid HTML/CSS color. | Optional | #888 (grey) |
| shape | A pre-defined shape for the event's marker. <br>Only events with a "duration-bar" shape (default) can represent the event's length over the timeline. <br><br> **Important**: note this attribute is mutually exclusive with "symbol".| "duration-bar", "circle", "diamond" or "star" | Optional | "duration-bar" |
| symbol | An arbitrary symbol (printable character / emoji) that will be used to represent the event's marker. <br/>!!! Note this attribute is mutually exclusive with "shape". | Character (whole Unicode range supported) | Optional | |
| visible | Allows to hide or unhide the event. | true", "1", "false", "0" | Optional | "true" |

## Emitted events
| Type | Description | Bubbles | Cancelable | Detail |
| ----:|:----------- |:------- |:---------- |:------ |
| select-timeline-event | Emitted when the users clicks an event, before it's details popup gets opened.<br> A third-party script can listen to this event type to perform operations before the popup gets opened, or can even cancel the event in order to prevent the popup from opening. | true | true | |

## Child nodes
All the children nested inside the element will be shown as the content of the details popup, when opened. The widget will not alter the styling of this content, which is let to the responsibility of the site's developpers.

# EXAMPLE
See the [sample file](./sample.html) provided alongside this one.
