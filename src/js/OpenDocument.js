/**
 * Creates a new OpenDocumentView. This view shows a dialog from which the user
 * can select a mind map from the local storage or a hard disk.
 * 
 * @constructor
 */
mindmaps.OpenDocumentView = function() {
  var self = this;

  // create dialog
  var $dialog = $("#template-open").tmpl().dialog({
    autoOpen : false,
    modal : true,
    zIndex : 5000,
    width : 550,
    close : function() {
      $(this).dialog("destroy");
      $(this).remove();
    }
  });

  var $openCloudButton = $("#button-open-cloud").button().click(function() {
    if (self.openCloudButtonClicked) {
      self.openCloudButtonClicked();
    }
  });

  var $openStorageServerButton = $("#button-open-storageserver").button().click(function() {
    if (self.openStorageServerButtonClicked) {
      self.openStorageServerButtonClicked();
    }
  });

  $dialog.find(".file-chooser input").bind("change", function(e) {
    if (self.openExernalFileClicked) {
      self.openExernalFileClicked(e);
    }
  });

  var $table = $dialog.find(".localstorage-filelist");
  $table.delegate("a.title", "click", function() {
    if (self.documentClicked) {
      var t = $(this).tmplItem();
      self.documentClicked(t.data);
    }
  }).delegate("a.delete", "click", function() {
    if (self.deleteDocumentClicked) {
      var t = $(this).tmplItem();
      self.deleteDocumentClicked(t.data);
    }
  });

  /**
  * Render list of documents in the local storage
  * 
  * @param {mindmaps.Document[]} docs
  */
  this.render = function(docs) {
    // empty list and insert list of documents
    var $list = $(".document-list", $dialog).empty();

    $("#template-open-table-item").tmpl(docs, {
      format : function(date) {
        if (!date) return "";

        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        return day + "/" + month + "/" + year;
      }
    }).appendTo($list);
  };

  /**
  * Shows the dialog.
  * 
  * @param {mindmaps.Document[]} docs
  */
  this.showOpenDialog = function(docs) {
    this.render(docs);
    $dialog.dialog("open");
  };

  /**
  * Hides the dialog.
  */
  this.hideOpenDialog = function() {
    $dialog.dialog("close");
  };

  this.showCloudError = function(msg) {
    $dialog.find('.cloud-loading').removeClass('loading');
    $dialog.find('.cloud-error').text(msg);
  };

  this.showCloudLoading = function() {
    $dialog.find('.cloud-error').text('');
    $dialog.find('.cloud-loading').addClass('loading');
  };

  this.hideCloudLoading = function() {
    $dialog.find('.cloud-loading').removeClass('loading');
  };

  this.showStorageServerError = function(msg) {
    $dialog.find('.storageserver-loading').removeClass('loading');
    $dialog.find('.storageserver-error').text(msg);
  };

  this.showStorageServerLoading = function() {
    $dialog.find('.storageserver-error').text('');
    $dialog.find('.storageserver-loading').addClass('loading');
  };

  this.hideStorageServerLoading = function() {
    $dialog.find('.storageserver-loading').removeClass('loading');
  };
};

/**
* Creates a new OpenDocumentPresenter. The presenter can load documents from
* the local storage or hard disk.
* 
* @constructor
* @param {mindmaps.EventBus} eventBus
* @param {mindmaps.MindMapModel} mindmapModel
* @param {mindmaps.OpenDocumentView} view
* @param {mindmaps.FilePicker} filePicker
*/
mindmaps.OpenDocumentPresenter = function(eventBus, mindmapModel, view, filePicker) {

  /**
   * Open file via cloud
   */
  view.openCloudButtonClicked = function(e) {
    mindmaps.Util.trackEvent("Clicks", "cloud-open");

    filePicker.open({
      load: function() {
        view.showCloudLoading();
      },
      success: function() {
        view.hideOpenDialog();
      },
      error: function(msg) {
        view.showCloudError(msg);
      }
    });
  };

  /**
   * Open file via storage server.
   */
  view.openStorageServerButtonClicked = function(e) {
    mindmaps.Util.trackEvent("Clicks", "storageserver-open");

    var doc = mindmaps.ServerStorage.loadDocument({
      start: function() {
        view.showStorageServerLoading();
      },
      success: function(doc) {
        mindmapModel.setDocument(doc);
        view.hideOpenDialog();
      },
      error: function() {
        var msg = "Error while loading from storage server.";
        view.showStorageServerError(msg);
      }
    });
    
  };

  

  // http://www.w3.org/TR/FileAPI/#dfn-filereader
  /**
  * View callback: external file has been selected. Try to read and parse a
  * valid mindmaps Document.
  * 
  * @ignore
  */
  view.openExernalFileClicked = function(e) {
    mindmaps.Util.trackEvent("Clicks", "hdd-open");

    var files = e.target.files;
    var file = files[0];

    var reader = new FileReader();
    reader.onload = function() {
      try {
        if ( document.getElementById('myOptions_decodeKey').value !="")  { //     decode key present
  	      var to_dec=reader.result ;
		      to_dec=  to_dec.replace(/caption":"(.*?)","font/g, function(a, b) {  
			      var xor_key=document.getElementById('myOptions_decodeKey').value ;
			      var the_res="";//the result will be here
					  for(i=0;i<b.length;i++){
				        the_res += String.fromCharCode(xor_key^b.charCodeAt(i));
			      }
			      return ('caption":"'+ the_res+'","font');
			     }) ; 
			    var doc = mindmaps.Document.fromJSON( to_dec);  
	      } else { //no decode key present
			    var doc = mindmaps.Document.fromJSON(reader.result);
	      } ;
	      //~ end of decode sequence
      } catch (e) {
        eventBus.publish(mindmaps.Event.NOTIFICATION_ERROR, 'File is not a valid mind map!');
        throw new Error('Error while opening map from hdd', e);
      }
      mindmapModel.setDocument(doc);
      view.hideOpenDialog();
    };

    reader.readAsText(file);
  };

  /**
  * View callback: A document in the local storage list has been clicked.
  * Load the document and close view.
  * 
  * @ignore
  * @param {mindmaps.Document} doc
  */
  view.documentClicked = function(doc) {
    mindmaps.Util.trackEvent("Clicks", "localstorage-open");
    
    mindmapModel.setDocument(doc);
    view.hideOpenDialog();
  };

  /**
  * View callback: The delete link the local storage list has been clicked.
  * Delete the document, and render list again.
  * 
  * @ignore
  * @param {mindmaps.Document} doc
  */
  view.deleteDocumentClicked = function(doc) {
    // TODO event
    mindmaps.LocalDocumentStorage.deleteDocument(doc);

    // re-render view
    var docs = mindmaps.LocalDocumentStorage.getDocuments();
    view.render(docs);
  };

  /**
  * Initialize.
  */
  this.go = function() {
    var docs = mindmaps.LocalDocumentStorage.getDocuments();
    docs.sort(mindmaps.Document.sortByModifiedDateDescending);
    view.showOpenDialog(docs);
  };
};
