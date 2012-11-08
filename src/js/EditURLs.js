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

  var $urlTextInput = $("#url-text-input");

  $urlTextInput.bind("change keyup", function(changeEvent) {
    self.urlChanged($urlTextInput.val());
  });

  this.setURLTextInput = function(url) {
    $urlTextInput.val(url);
  }

  this.showDialog = function() {
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
    view.setURLTextInput(mindmapModel.selectedNode.url)
    view.showDialog();
  };
};
