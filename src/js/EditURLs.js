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

  var $directInputDiv = $("#urls-text-field");

  var $directInputSingleUrlUi = $("#template-urls-single-url-ui").tmpl();
  var $directInputSingleUrlInput = $directInputSingleUrlUi.find("input");

  var $directInputMultiUrlUi = $("#template-urls-multi-url-ui").tmpl();

  var $directInputUrlList = $directInputMultiUrlUi.find(".url-list");
  var $directInputUrlListBody = $directInputMultiUrlUi.find(".url-list tbody");

  $directInputSingleUrlInput.bind("change keyup", function(changeEvent) {
    self.urlChanged($directInputSingleUrlInput.val());
  });

  this.setUrls = function(urls) {
    if (mindmaps.Config.allowMultipleUrls) {
      console.log(urls.length)
      if (urls.length === 0) {
        $directInputUrlListBody.append("<tr><td>No URLs added yet.</td></tr>");
      }
      else {
        urls.forEach(function(url) {
          $("#template-urls-table-item").tmpl({
            "url": url
          }).appendTo($directInputUrlListBody);
        });
      }
    }
    else {
      $directInputSingleUrlInput.val(urls[0]);
    }
  }

  this.showDialog = function() {
    if (mindmaps.Config.activateDirectUrlInput) {
      if (mindmaps.Config.allowMultipleUrls) {
        $directInputDiv.append($directInputMultiUrlUi);
      }
      else {
        $directInputDiv.append($directInputSingleUrlUi);
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
  view.urlChanged = function(url) {
    var action = new mindmaps.action.ChangeURLsAction(
        mindmapModel.selectedNode, url);
    mindmapModel.executeAction(action);
  }

  this.go = function() {
    view.setUrls(mindmapModel.selectedNode.urls)
    view.showDialog();
  };
};
