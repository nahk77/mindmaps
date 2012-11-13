/**
* Creates a new EditURLsView. This view renders a dialog where the user can
* save the mind map.
* 
* @constructor
*/
mindmaps.EditURLsView = function() {
  var self = this;

  var $dialog = $("#template-urls").tmpl().dialog({
    autoOpen : false,
    modal : true,
    zIndex : 5000,
    width : 550,
    close : function() {
      // remove dialog from DOM
      $(this).dialog("destroy");
      $(this).remove();
    }
  });

  var $directInputDiv = $("#urls-direct-input");

  var $directInputText = $("#urls-direct-input input");
  var $directInputButton = $("#urls-direct-input button");

  var $multiUrlDisplay = $("#template-urls-multi-url-display").tmpl();

  var $multiUrlList = $multiUrlDisplay.find(".url-list");
  var $multiUrlListBody = $multiUrlList.find("tbody");

  if (mindmaps.Config.allowMultipleUrls) {
    // Multi-URL setup

    // Set up click on "Add" button
    $directInputButton.click(function(){
      self.urlAdded($directInputText.val());
      $directInputText.val("");
    });

    // Pressing enter in text field should behave like "Add" click
    $directInputText.keypress(function(e) {
      if (e.which === 13) {
        self.urlAdded($directInputText.val());
        $directInputText.val("");
      }
    });
  }
  else {
    // Single-URL setup

    // Save any changes in the text field immediately.
    $directInputText.bind("change keyup", function() {
      self.singleUrlChanged($directInputText.val());
    });

    $directInputButton.css({ "display": "none" });
  }

  $multiUrlListBody.delegate("a.delete", "click", function() {
    var t = $(this).tmplItem();
    self.urlRemoved(t.data.url);
  });

  this.setUrls = function(urls) {
    if (mindmaps.Config.allowMultipleUrls) {
      $multiUrlListBody.empty();

      if (urls.length === 0) {
        $multiUrlListBody.append("<tr><td>No URLs added yet.</td></tr>");
      }
      else {
        urls.forEach(function(url) {
          $("#template-urls-table-item").tmpl({
            "url": url
          }).appendTo($multiUrlListBody);
        });
      }
    }
    else {
      $directInputText.val(urls[0]);
    }
  }

  this.showDialog = function() {
    if (mindmaps.Config.activateDirectUrlInput) {
      if (mindmaps.Config.allowMultipleUrls) {
        $dialog.append($multiUrlDisplay);
      }
    }
    else {
      $directInputDiv.css({
        "display": "none"
      });
    }


    $dialog.dialog("open");
  };
};

/**
* Creates a new EditURLsPresenter. The presenter can edit the URLs attached to
* a node in various ways.
* 
* @constructor
* @param {mindmaps.EventBus} eventBus
* @param {mindmaps.MindMapModel} mindmapModel
* @param {mindmaps.EditURLsView} view
*/
mindmaps.EditURLsPresenter = function(eventBus, mindmapModel, view) {
  view.singleUrlChanged = function(url) {
    var action = new mindmaps.action.ChangeURLsAction(
        mindmapModel.selectedNode, url);
    mindmapModel.executeAction(action);
  }

  view.urlAdded = function(url) {
    var action = new mindmaps.action.AddURLsAction(
        mindmapModel.selectedNode, url);
    mindmapModel.executeAction(action);
  }

  view.urlRemoved = function(url) {
    var action = new mindmaps.action.RemoveURLsAction(
        mindmapModel.selectedNode, url);
    mindmapModel.executeAction(action);
  }

  eventBus.subscribe(mindmaps.Event.NODE_URLS_ADDED, function(node) {
    view.setUrls(mindmapModel.selectedNode.urls);
  });
  
  eventBus.subscribe(mindmaps.Event.NODE_URLS_REMOVED, function(node) {
    view.setUrls(mindmapModel.selectedNode.urls);
  });

  this.go = function() {
    view.setUrls(mindmapModel.selectedNode.urls)
    view.showDialog();
  };
};
