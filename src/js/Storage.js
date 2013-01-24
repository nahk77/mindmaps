// TODO store a wrapper object with doc title, modified date and document as string in localstorage.
// in open document window show wrapper object and only parse document on demand.
// when many large documents are stored in LS, opening of window takes a rather long time
mindmaps.LocalStorage = (function() {
  return {
    put : function(key, value) {
      localStorage.setItem(key, value);
    },
    get : function(key) {
      return localStorage.getItem(key);
    },
    clear : function() {
      localStorage.clear();
    }
  };
})();

mindmaps.SessionStorage = (function() {
  return {
    put : function(key, value) {
      sessionStorage.setItem(key, value);
    },
    get : function(key) {
      return sessionStorage.getItem(key);
    },
    clear : function() {
      sessionStorage.clear();
    }
  };
})();

/**
 * @namespace
 */
mindmaps.LocalDocumentStorage = (function() {
  var prefix = "mindmaps.document.";

  var getDocumentByKey = function(key) {
    var json = localStorage.getItem(key);
    if (json === null) {
      return null;
    }

    /**
     * Catch any SytaxErrors when document can't be parsed.
     */
    try {
      return mindmaps.Document.fromJSON(json);
    } catch (error) {
      console.error("Error while loading document from local storage",
          error);
      return null;
    }
  };

  /**
   * Public API
   * @scope mindmaps.LocalDocumentStorage
   */
  return {
    /**
     * Saves a document to the localstorage. Overwrites the old document if
     * one with the same id exists.
     * 
     * @param {mindmaps.Document} doc
     * 
     * @returns {Boolean} true if save was successful, false otherwise.
     */
    saveDocument : function(doc) {
      try {
    if(document.getElementById('myOptions_local').checked) {
  	     localStorage.setItem(prefix + doc.id, doc.serialize()); //this is the original line, save to localStorage
		}else if(document.getElementById('myOptions_file').checked) {
	    var mmm  ="";
		  if ( document.getElementById('myOptions_encodeKey').value !=""){//encoding key present
			  var hash = 0;
			  for (var i = 0; i <document.getElementById('myOptions_encodeKey').value.length; i++) {
			  	hash = document.getElementById('myOptions_encodeKey').value.charCodeAt(i) + ((hash << 5) - hash);
			  }
			  mmm = doc.serialize().replace(/caption":"(.*?)","font/g, function(a, b) {  
			      var to_enc = b;
			      var xor_key=document.getElementById('myOptions_encodeKey').value ;
			      var the_res="";//the result will be here
			      for(i=0;i<to_enc.length;++i)
			        {
				       the_res+=String.fromCharCode(xor_key^to_enc.charCodeAt(i));
			        }
			      return ('caption":"'+ the_res+'","font');
			    }) ;
		  } else {   mmm  =doc.serialize(); } //no encoding key present
		  uriContent = "data:application/octet-stream," + encodeURIComponent(mmm); 
		  alert (doc["mindmap"].getRoot().getCaption().toString()+".json" );	newWindow=window.open(uriContent, 'neuesDokument');
	  }else if( (document.getElementById('myOptions_createPresentationVisible').checked) || (document.getElementById('myOptions_createPresentation').checked) || (document.getElementById('myOptions_codePresentation').checked)) {
	    var slideId = 1;
		  var myPresentation = '<article style="left: 100px;" class="activeSlide" id="'+ slideId +'" contenteditable="true"> <center><h1><br><br><br>' + doc.title+'</h1>  </center>  ...  </article>	' ;
		  slideId += 1;
	 	  if(doc.mindmap.root.children) {
				for ( i in doc.mindmap.root.children.nodes) {
					myPresentation += '<hr width="50%" style="color:'+ doc.mindmap.root.children.nodes[i].branchColor+'"  ><article style="left: 100px;" class="activeSlide" id="'+ slideId +'" contenteditable="true">  <h1 style="color:'+ doc.mindmap.root.children.nodes[i].text.font.color +';font-style:'+doc.mindmap.root.children.nodes[i].text.font.style +';text-decoration:'+ doc.mindmap.root.children.nodes[i].text.font.decoration+';font-weight:' +doc.mindmap.root.children.nodes[i].text.font.weight+';"> ' + doc.mindmap.root.children.nodes[i].text.caption+'</h1>    	' ;
					var theBranch =  doc.mindmap.root.children.nodes[i];
					(function foo (theBranch) {
							var myChildren = []; 
							for (c in theBranch.children.nodes) myChildren.push(theBranch.children.nodes[c].text.caption);
							if (myChildren.length != 0) {
								if (  (document.getElementById('myOptions_createPresentationVisible').checked == 0 )  || ((document.getElementById('myOptions_createPresentationVisible').checked)  && (theBranch.foldChildren== 0 )) ){
								myPresentation += '<ul>' ;
								for (c in theBranch.children.nodes) {myPresentation += '<li style="color:'+ theBranch.children.nodes[c].branchColor +'"   ><span style="color:'+ theBranch.children.nodes[c].text.font.color +';font-style:'+theBranch.children.nodes[c].text.font.style +';text-decoration:'+ theBranch.children.nodes[c].text.font.decoration+';font-weight:' +theBranch.children.nodes[c].text.font.weight+';" >' +theBranch.children.nodes[c].text.caption+'</span></li>'  ; foo(theBranch.children.nodes[c]);  }
								myPresentation += '</ul>';
								} 
							}
					}(  doc.mindmap.root.children.nodes[i]));
		
					myPresentation += '   </article>';
					slideId += 1;
				}
		} 
		 
		if ( (document.getElementById('myOptions_createPresentation').checked) || (document.getElementById('myOptions_createPresentationVisible').checked) ){
			newWindow=window.open('', 'presentation');
			newWindow.document.write( '<html><body>'+myPresentation + '</body></html>');
		}else if  (document.getElementById('myOptions_codePresentation').checked) {
		 uriContent = "data:application/octet-stream," + encodeURIComponent('<html><body>'+myPresentation + '</body></html>'); 
			alert (doc["mindmap"].getRoot().getCaption().toString()+".json" );	newWindow=window.open(uriContent, 'neuesDokument');
		}
		
	}
        return true;
      } catch (error) {
        // QUOTA_EXCEEDED
        console.error("Error while saving document to local storage",
            error);
        return false;
      }
    },

    /**
     * Loads a document from the local storage.
     * 
     * @param {String} docId
     * 
     * @returns {mindmaps.Document} the document or null if not found.
     */
    loadDocument : function(docId) {
      return getDocumentByKey(prefix + docId);
    },

    /**
     * Finds all documents in the local storage object.
     * 
     * @returns {Array} an Array of documents
     */
    getDocuments : function() {
      var documents = [];
      // search localstorage for saved documents
      for ( var i = 0, max = localStorage.length; i < max; i++) {
        var key = localStorage.key(i);
        // value is a document if key confirms to prefix
        if (key.indexOf(prefix) == 0) {
          var doc = getDocumentByKey(key);
          if (doc) {
            documents.push(doc);
          }
        }
      }
      return documents;
    },

    /**
     * Gets all document ids found in the local storage object.
     * 
     * @returns {Array} an Array of document ids
     */
    getDocumentIds : function() {
      var ids = [];
      // search localstorage for saved documents
      for ( var i = 0, max = localStorage.length; i < max; i++) {
        var key = localStorage.key(i);
        // value is a document if key confirms to prefix
        if (key.indexOf(prefix) == 0) {
          ids.push(key.substring(prefix.length));
        }
      }
      return ids;
    },

    /**
     * Deletes a document from the local storage.
     * 
     * @param {mindmaps.Document} doc
     */
    deleteDocument : function(doc) {
      localStorage.removeItem(prefix + doc.id);
    },

    /**
     * Deletes all documents from the local storage.
     */
    deleteAllDocuments : function() {
      this.getDocuments().forEach(this.deleteDocument);
    }
  };
})();

/**
 * @namespace
 */
mindmaps.ServerStorage = (function() {
  /**
   * Public API
   * @scope mindmaps.ServerStorage
   */
  return {
    /**
     * Saves a document to the storage server via POST request.
     * 
     * @param {mindmaps.Document} doc
     * 
     * @returns {Boolean} true if save was successful, false otherwise.
     */
    saveDocument : function(doc, callbacks) {
      data = doc.serialize(); // TODO: Remove after testing.

      callbacks.start();

      $.ajax({
        type: "POST",
        url: mindmaps.Config.storageServerAddress,
        data: { data: doc.serialize() }
      }).done(function() {
        callbacks.success();
      }).fail(function() {
        callbacks.error();
      });
    },

    /**
     * Loads a document from the storage server.
     * 
     * @returns {mindmaps.Document} the document or null if not found.
     */
    loadDocument : function(callbacks) {
      callbacks.start();

      $.ajax({
        type: "GET",
        url: mindmaps.Config.storageServerAddress
      }).done(function(json) {
        var doc = mindmaps.Document.fromJSON(json);
        callbacks.success(doc);
      }).fail(function() {
        callbacks.error();
      });
    }
  };
})();
