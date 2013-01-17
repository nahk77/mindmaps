mindmaps.DrawView = function(savingCallBack) {
  var self = this;
     
  var $content = $("#template-draw").tmpl();
  

  


  /**
   * Returns a jquery object.
   * 
   * @returns {jQuery}
   */
   this.getContent = function() {
    return $content;
  };

  
  /**
   * Initialise
   */
   this.init =  function() {
    var imagesLoaded = $(document).toObservable("images-loaded");
    var cursorsLoaded = $(document).toObservable("cursors-loaded");

    // fade out the splash panel when images and cursors are loaded
    imagesLoaded.Zip(cursorsLoaded, function (left, right) { return right; })
    .Delay(1000)
    .Subscribe(function () {
      $("#splash").fadeOut("slow");
    });

    $( "#brush_slider" ).slider( {
      change: function(e, ui){
        setBrushSize(ui.value);
      },
      min: 1,
      max: 100,
    }).slider({value:10});

    

    // initialize the canvas
    initializeCanvas();

    // load the images
    loadImages();   

    initDrawPanel (this.imgDataSaving);



    

  };

  

  function loadImages() {
    var images = ["images/tools_panel_colour_picker_button.png",
    "images/tools_panel_delete_button.png",
    "images/tools_panel_eraser_button.png",
    "images/tools_panel_paint_button.png",
    "images/tools_panel_pencil_button.png",
    "images/tools_panel_spray_button.png"],
    cursors = ["cursors/colour_picker_cursor.cur",
    "cursors/eraser_cursor.cur",
    "cursors/paint_cursor.cur",
    "cursors/pencil_cursor.cur",
    "cursors/spray_cursor.cur"];

    // fire the images-loaded event when all images are loaded
    Asset.images(images, {
      onComplete: function () {
        $(document).trigger("images-loaded");
      }
    });

    // fire the cursors-loaded event when all cursors are loaded
    Asset.images(cursors, {
      onComplete: function () {
        $(document).trigger("cursors-loaded");
      }
    });
  }
}


mindmaps.DrawPresenter = function(eventBus, mindmapModel, commandRegistry, view) {
  var self = this;

  eventBus.subscribe(mindmaps.Event.NODE_SELECTED, function(node) {
      updateView(node);
    });

  this.go = function() {
    view.init();
  };

  function updateView(node){
    self.setImgData(node.imgData)
  }

  this.setImgData=function(dataURL){

    if(dataURL==""){
      clearDrawing();
    }

    var canvas =drawingCanvas.get(0)
    var context = canvas.getContext('2d');

    // load image from data url
    var imageObj = new Image();
    imageObj.onload = function() {
      context.drawImage(this, 0, 0);
    };

    imageObj.src = dataURL;
  }


view.imgDataSaving = function(data) {
  console.log("action here");
    var action = new mindmaps.action.ChangeImgDataAction(
        mindmapModel.selectedNode, data);
    mindmapModel.executeAction(action);
  }


};

