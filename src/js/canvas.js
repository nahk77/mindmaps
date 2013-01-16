var canvasOffsetLeft,   // the left offset for the canvas elements
    canvasOffsetTop,    // the top offset for the canvas elements
    drawingCanvas,      // canvas element for the drawing canvas
    drawingCanvasCxt,   // 2D drawing context for the drawing canvas
    overlayCanvas,      // canvas element for the overlay canvas
    overlayCanvasCxt,   // 2D drawing context for the overlay canvas
    outputImage,        // output image
    currentBrush,       // the brush selected to paint on the drawing canvas
    strokeColour,       // the span element showing the current stroke colour
    currentColour,      // what's the colour to use with the current brush
    backgroundColour,   // the background colour
    brushes,            // the available brushes
    undoArr,
    undoLength,
    undoMaxLength,
    undoIndex;
// changes the stroke colour of the drawing canvas
function setColour(colour) {
    currentColour = colour;
    currentBrush.setColour(currentColour);

    strokeColour.css("background", colour);

    $("#stroke-colour-picker").ColorPickerSetColor(colour);
}

function setBrushSize(size){
    for(brush in brushes){
        brushes[brush].setSize(size);
    }
}
function unbindMouseEvents() {
    overlayCanvas.unbind("mousemove").unbind("mouseup").unbind("mouseout");
}

// clear the drawing panel
function clearDrawing() {
    drawingCanvasCxt.fillStyle = backgroundColour;
    drawingCanvasCxt.fillRect(0, 0, drawingCanvas.width(), drawingCanvas.height());
    var img = new Image();
    //img.src = 'images/chicken.jpg';
    //img.src = initImgUrl;
    img.onload = function(){
        drawingCanvasCxt.drawImage(img, 0,0);
        img = null;
    };
}

// work out the element left and top offset by recursively going through its
// tree of offsetParents
function getElementOffset(element) {
    var offsetLeft = element.offsetLeft, offsetTop = element.offsetTop;
    if (element.offsetParent !== null) {
        var parentOffset = getElementOffset(element.offsetParent);
        offsetLeft += parentOffset.OffsetLeft;
        offsetTop += parentOffset.OffsetTop;
    }

    return { OffsetLeft: offsetLeft, OffsetTop: offsetTop };
}

// works out the X, Y position of the click INSIDE the canvas from the X, Y 
// position on the page
function getMPosition(mouseEvent, element) {
    var x, y;
    if (mouseEvent.pageX !== undefined && mouseEvent.pageY !== undefined) {
        x = mouseEvent.pageX;
        y = mouseEvent.pageY;
    } else {
        x = mouseEvent.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = mouseEvent.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return { X: x - canvasOffsetLeft, Y: y - canvasOffsetTop };
}

// use the specified brush as the current brush
function setBrush(brushName) {
    currentBrush = brushes[brushName];
    currentBrush.setColour(currentColour);

    unbindMouseEvents();

    // start drawing when the mousedown event fires, and attach handlers to 
    // draw a line to wherever the mouse moves to
    overlayCanvas.unbind("mousedown").mousedown(function (mouseEvent) {
        setCanvasOffsets();
        var overlayCanvasElement = overlayCanvas.get(0);
        var position = getMPosition(mouseEvent, overlayCanvasElement);

        currentBrush.startDrawing(position);

        // attach event handlers
        $(this).mousemove(function (event) {
            var newPosition = getMPosition(event, overlayCanvasElement);
            currentBrush.draw(newPosition);
        }).mouseup(function (event) {
            var newPosition = getMPosition(event, overlayCanvasElement);
            currentBrush.finishDrawing(newPosition);

            unbindMouseEvents();
        }).mouseout(function (event) {
            var newPosition = getMPosition(event, overlayCanvasElement);
            currentBrush.finishDrawing(newPosition);

            unbindMouseEvents();
        });
    }).css({ cursor: currentBrush.getCursor() });
}

// set the cursor for the specified element to the cursor associated with the
// current brush, e.g. pencil cursor for the pencil brush, etc.
function setCursor(element) {
    element.style.cursor = currentBrush.getCursor();
}

function setCanvasOffsets() {
    // calculate the canvas offset
    var canvasOffset = getElementOffset(drawingCanvas.get(0));
    canvasOffsetLeft = canvasOffset.OffsetLeft;
    canvasOffsetTop = canvasOffset.OffsetTop;
}

function undoBackup(){
    undoArr[undoIndex%undoMaxLength] = drawingCanvasCxt.getImageData(0, 0, 500, 500);;
    undoIndex++;
    if(undoLength<=undoMaxLength){
        undoLength++;
    }
}

function undo(){
    if(undoLength > 0){
        undoIndex--;
        undoLength--;
        drawingCanvasCxt.putImageData(undoArr[(undoIndex)%undoMaxLength], 0,0);
        undoArr[(undoIndex)%undoMaxLength]=null;
    }
}

function initializeCanvas() {
    undoArr=[];
    undoIndex=0;
    undoLength=0;
    undoMaxLength=30;
    // get references to the canvas element as well as the 2D drawing context
    drawingCanvas = $("#drawingCanvas");
    drawingCanvasCxt = drawingCanvas.get(0).getContext("2d");

    overlayCanvas = $("#overlay");
    overlayCanvasCxt = overlayCanvas.get(0).getContext("2d");

    outputImage = document.getElementById("output-img");
    var img = new Image();
//    img.src = 'images/chicken.jpg';
    //img.src=initImgUrl;
    img.onload = function(){
        drawingCanvasCxt.drawImage(img, 0,0);
        img = null;
    };
    strokeColour = $("#stroke-colour");

    setCanvasOffsets();

    // when the window is resized, update the canvas offset as well
    $(window).resize(function () {
        setCanvasOffsets();
    });

    var pencilBrush = new PencilBrush(10, drawingCanvasCxt),
        sprayBrush = new SprayBrush(10, 15, drawingCanvasCxt),
        eraserBrush = new EraserBrush(10, drawingCanvasCxt),
        paintBrush = new PaintBrush(50, drawingCanvasCxt),
        colourPicker = new ColourPicker(drawingCanvasCxt, function (colour) {
            setColour(colour);
        });

    // define the available brushes
    brushes = {
        "pencil": pencilBrush,
        "spray": sprayBrush,
        "eraser": eraserBrush,
        "paint": paintBrush,
        "colour-picker": colourPicker
    };

    // set default colour to black
    currentColour = "#000";

    // set background colour to white
    backgroundColour = "#fff";

    // default brush is the pencil
    setBrush("pencil");

    clearDrawing();
}

// save the content of the canvas to the output image
function saveCanvasToImage() {
    var strDataUri = drawingCanvas.get(0).toDataURL();
    outputImage.src = strDataUri;
}