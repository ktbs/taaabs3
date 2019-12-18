/**
 * 
 */
onmessage = ((event) => {
    let eventsData = event.data.eventsData;
    let maxDisplayableRows = event.data.maxDisplayableRows;
    let firstRepresentedTime = event.data.firstRepresentedTime;
    let timeBeginThreshold = event.data.timeBeginThreshold;
    let timeEndThreshold = event.data.timeEndThreshold;

    let previousEventsPerRow = new Array();
    let previousEventsTimePerRow = new Array();
    let minDisplayableTime = firstRepresentedTime;
    let eventsNewRows = new Array();
    let eventsNewHiddenSiblinbgsCounts = new Array();
    let hiddenEventsCountSinceLastVisible = 0;
    let lastVisibleMaxRowEvent = null;

    // we browse visible events
    for(let i = 0; i < eventsData.length; i++) {
        let currentEvent = eventsData[i];
        let availableRow = null;

        if(currentEvent.beginTime >= minDisplayableTime) {
            // we browse the "previousEventsPerRow" Array
            for(let j = 0; (j < maxDisplayableRows) && (j < previousEventsPerRow.length); j++) {
                let rowPreviousEvent = previousEventsPerRow[j];

                if((rowPreviousEvent.shape && (rowPreviousEvent.shape != "duration-bar")) || rowPreviousEvent.hasSymbol) {
                    let timeDelta = currentEvent.beginTime - rowPreviousEvent.beginTime;

                    if(timeDelta >= timeBeginThreshold) {
                        availableRow = j;
                        break;
                    }
                }
                else {
                    let timeBeginDelta = currentEvent.beginTime - rowPreviousEvent.beginTime;
                    let timeEndDelta = currentEvent.beginTime - rowPreviousEvent.endTime;

                    if((timeBeginDelta >= timeBeginThreshold) && (timeEndDelta >= timeEndThreshold)) {
                        availableRow = j;
                        break;
                    }
                }
            }
        }

        if(availableRow == null)
            availableRow = previousEventsPerRow.length;

        if(availableRow < maxDisplayableRows) {
            if(availableRow == (maxDisplayableRows - 1))
                lastVisibleMaxRowEvent = currentEvent;

            if(currentEvent.row != availableRow)
                eventsNewRows[currentEvent.id] = availableRow;
            
            previousEventsPerRow[availableRow] = currentEvent;
            previousEventsTimePerRow[availableRow] = currentEvent.beginTime;

            if(previousEventsPerRow.length >= maxDisplayableRows)
                minDisplayableTime = Math.min(...previousEventsTimePerRow) + timeBeginThreshold;

            hiddenEventsCountSinceLastVisible = 0;

            if(currentEvent.hasHiddenSiblings)
                eventsNewHiddenSiblinbgsCounts[currentEvent.id] = null;
        }
        else {
            if(currentEvent.row != null)
                eventsNewRows[currentEvent.id] = null;

            if(!lastVisibleMaxRowEvent && (previousEventsPerRow.length > 0))
                lastVisibleMaxRowEvent = previousEventsPerRow[maxDisplayableRows - 1];

            if(lastVisibleMaxRowEvent) {
                if(!eventsNewHiddenSiblinbgsCounts[lastVisibleMaxRowEvent.id])
                    eventsNewHiddenSiblinbgsCounts[lastVisibleMaxRowEvent.id] = 1;
                else
                    eventsNewHiddenSiblinbgsCounts[lastVisibleMaxRowEvent.id]++;
            }
        }
    }

    postMessage({
        eventsNewRows: eventsNewRows,
        eventsNewHiddenSiblinbgsCounts: eventsNewHiddenSiblinbgsCounts
    });
});