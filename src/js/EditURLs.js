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

  var $dropdownInputDiv = $("#urls-dropdown-input");
  var $dropdownInputSelect = $("#urls-dropdown-input select");
  var $dropdownInputButton = $("#urls-dropdown-input button");

  var $multiUrlDisplay = $("#template-urls-multi-url-display").tmpl();
  var $multiUrlList = $multiUrlDisplay.find(".url-list");
  var $multiUrlListBody = $multiUrlList.find("tbody");

  if (mindmaps.Config.allowMultipleUrls) {
    // Multi-URL setup

    // Set up "Add" button (direct input)
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

    // Set up "Add" button (dropdown)
    $dropdownInputButton.click(function() {
      self.urlAdded($dropdownInputSelect.val());
    });
  }
  else {
    // Single-URL setup

    // Save any changes in the text field immediately.
    $directInputText.bind("change keyup", function() {
      self.singleUrlChanged($directInputText.val());
    });

    $directInputButton.css({ "display": "none" });
    $dropdownInputButton.css({ "display": "none" });
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

  this.setDropDownUrls = function(urls, nodeUrls) {
    $dropdownInputSelect.empty();

    urls.urls.forEach(function(url) {
      var $option = $('<option value="' +url.url+ '">' +url.label+ '</option>');
      $dropdownInputSelect.append($option);
    });

    if (!mindmaps.Config.allowMultipleUrls) {
      var $option = $('<option value="">No URL selected.</option>');
      $dropdownInputSelect.prepend($option);

      $dropdownInputSelect.val(nodeUrls[0]).change();
    }
  }

  this.showDropdownError = function(msg) {
    $dialog.find('.dropdown-error').text(msg);
  }

  this.showDialog = function() {
    if (mindmaps.Config.allowMultipleUrls) {
      $dialog.append($multiUrlDisplay);
    }

    if (!mindmaps.Config.activateDirectUrlInput) {
      $directInputDiv.css({
        "display": "none"
      });
    }

    if (!mindmaps.Config.activateUrlsFromServerWithoutSearch) {
      $dropdownInputDiv.css({
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
    if (mindmaps.Config.activateUrlsFromServerWithoutSearch) {
      $.ajax({
        type: "GET",
        url: mindmaps.Config.urlServerAddress
      }).done(function(json) {
        var urls = JSON.parse(json);
        view.setDropDownUrls(urls, mindmapModel.selectedNode.urls);
      }).fail(function() {
        view.showDropdownError("Error while requesting URLs from server.");
      });
    }

    view.setUrls(mindmapModel.selectedNode.urls)
    view.showDialog();
  };
};
