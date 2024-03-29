# Description
This component automatically detects instances of [\<ktbs4la2-timeline\>](../ktbs4la2-timeline/README.md) that are nested in it's subtree and synchronizes them between each other.

The synchronizable things are the timelines' cursors (= the vertical red bar over the timeline) and the timelines' views (zoom and position of the displayed portion of the timeline)

This component provides one custom element : **\<ktbs4la2-timeline-synchronizer\>**

# Usage
First, you have to import [ktbs4la2-timeline-synchronizer.js](./ktbs4la2-timeline-synchronizer.js),

either from HTML :
```HTML
<script type="module" src="/<path>/ktbs4la2-timeline-synchronizer/ktbs4la2-timeline-synchronizer.js"></script>
```

or from Javascript :
```javascript
import "/<path>/ktbs4la2-timeline-synchronizer/ktbs4la2-timeline-synchronizer.js";
```

In order to synchronize several timelines of your document, you must then wrap them in the same \<ktbs4la2-timeline-synchronizer\> element as following :
```HTML
<ktbs4la2-timeline-synchronizer>
    <ktbs4la2-timeline begin="timeline_begin_timestamp" end ="timeline_end_timestamp">
        <!-- events go here ... -->
    </ktbs4la2-timeline>

    <ktbs4la2-timeline begin="timeline_begin_timestamp" end ="timeline_end_timestamp">
        <!-- events go here ... -->
    </ktbs4la2-timeline>

    <!-- etc ... -->
</ktbs4la2-timeline-synchronizer>
```

This element is decribed in details below.


# \<ktbs4la2-timeline-synchronizer\>

## Attributes

### sync-view

Whether or not we should synchronize the child timelines views.

+ **format**: "true", "1", "false" or "0"
+ **optional**
+ **default**: "true"

### sync-cursor

Whether or not we should synchronize the child timelines cursors.

+ **format**: "true", "1", "false" or "0"
+ **optional**
+ **default**: "true"

## Child nodes
Any HTML content can be nested inside the element.  
Any occurence of \<ktbs4la2-timeline\> found in the subtree will be automatically included in the synchronization process.  
Any other nested HTML element will stay unaffected.

# EXAMPLE
See the [sample file](./sample.html) provided alongside this one.