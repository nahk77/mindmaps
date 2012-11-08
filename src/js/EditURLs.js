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

  var $urlsTextFieldDiv = $("#urls-text-field");
  var $urlTextInput = $("#url-text-input");
  var $directInputUrlList = $("#urls-text-field .url-list");
  var $directInputUrlListBody = $("#urls-text-field .url-list .url-list-body");

  $urlTextInput.bind("change keyup", function(changeEvent) {
    self.urlChanged($urlTextInput.val());
  });

  this.setUrls = function(urls) {
    if (mindmaps.Config.allowMultipleUrls) {
      if (urls.length === 0) {
        $directInputUrlListBody.append("<tr><td>No URLs added yet.</td></tr>");
      }
      else {
        urls.forEach(function(url) {
          $("#template-urls-table-item").tmpl({
            "url": url
          }).appendTo($directInputUrlListBody);
          // $directInputUrlListBody.append('<tr>'
          //   + '<td>' +url+ '</td>'
          //   + '<td id=""> </td>'
          //   + '</tr>');
        });
      }
    }
    else {
      $urlTextInput.val(urls[0]);
    }
  }

  this.showDialog = function() {
    if (mindmaps.Config.activateDirectUrlInput) {
      if (mindmaps.Config.allowMultipleUrls) {
        // ...
      }
      else {
        $directInputUrlList.css({
          "display": "none"
        });
      }
    }
    else {
      $urlsTextFieldDiv.css({
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
