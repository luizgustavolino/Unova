// Projeto Unova
// 

Handlebars.registerHelper('push', function(context) {
    return "home.pushViewController('"+context+"')";
});

Handlebars.registerHelper('insert', function(context) {
	var cid = "chunck-" + Date.now()
	setTimeout(function(){ unova.tpl.insert(cid, context) }, 1);
    return new Handlebars.SafeString("<div id='"+cid+"'></div>");
});

var unova = {}

// ---[ UNOVA NAV CONTROLLER ]---

unova.nav = {

	counter: 0,

	makeControllerForTemplate: function(templateName, data, then){

		var newController = document.createElement('div');
		newController.className = "unova-nav viewing"
		newController.templateName = templateName
		newController.id = "unova-nav"+(unova.nav.counter++)

		unova.tpl.compile(newController, data, function(div){
			then(div)
		})

	},

	makeNavigationController: function(){

		var navigation = document.createElement('div');
		navigation.className = "unova-nav-controller"
		navigation.stack = []
		
		navigation.setRootController = function(templateName, data){
			unova.nav.makeControllerForTemplate(templateName, data,
				function(controller){
					navigation.stack = [controller]
					while (navigation.firstChild){
						navigation.removeChild(navigation.firstChild);
					}
					navigation.appendChild(controller);
				}
			)
		}

		navigation.pushViewController = function(templateName, data){

			// TODO cerulean.nav.setUserInteractionEnabled(false);
			unova.nav.makeControllerForTemplate(templateName, data,
				function(controller){

					var prevController = navigation.stack.last()
					navigation.stack.push(controller);
					navigation.appendChild(controller);

					unova.dom.removeClass(prevController, "viewing");
					unova.dom.addClass(prevController, "pushed");

					var backBtn = document.getElementById("back-button");
					unova.dom.removeClass(backBtn, "hidden")
					
				}
			)
		}

		navigation.popViewController = function(){

			var poppedController = navigation.stack.pop()
			var newTopController = navigation.stack.last()

			unova.dom.removeClass(newTopController, "pushed");
			unova.dom.addClass(newTopController, "viewing");

			if(navigation.stack[0] == newTopController){
				var backBtn = document.getElementById("back-button")
				unova.dom.addClass(backBtn, "hidden");
			}

			poppedController.remove()

		}

		return navigation
	}

}

// ---[ UNOVA LOG HELPER ]---

unova.log = function(msg){
	console.log(msg)
}

// ---[ UNOVA TEMPLATE PARSER ]---

unova.tpl = {

    precompiled_templates:{},

    insert: function(divId, templateName) {

    	function display(){
    		var tag = document.getElementById(divId);
			tag.innerHTML = unova.tpl.precompiled_templates[templateName]()
		}

		if(unova.tpl.precompiled_templates[templateName]){
	        display();
		}else{
		
            var r = new XMLHttpRequest();
            var base = "templates/";
            var loc = base + templateName + ".template.html";
            
            unova.log("loading html template: " + loc);
            
            r.open("GET", loc, true);
            r.onreadystatechange = function () {
                if (r.readyState == 4 && r.status == 200){
                    unova.tpl.precompiled_templates[templateName] = Handlebars.compile(r.responseText);
                	display();
                }
            };

            r.send();
		}

    },

	compile: function(divTag, data, then){

		function display(){
			divTag.innerHTML = unova.tpl.precompiled_templates[divTag.templateName](data)
			then(divTag)
		}

		if(unova.tpl.precompiled_templates[divTag.templateName]){
	        display();
		}else{
		
            var r = new XMLHttpRequest();
            var base = "templates/";
            var templateName = divTag.templateName
            var loc = base + templateName + ".template.html";
            
            unova.log("loading html template: " + loc);
            
            r.open("GET", loc, true);
            r.onreadystatechange = function () {
                if (r.readyState == 4 && r.status == 200){
                    unova.tpl.precompiled_templates[templateName] = Handlebars.compile(r.responseText);
                	display();
                }
            };

            r.send();
		}
	}
}

// ---[ UNOVA DOM ]---

unova.dom = {}

unova.dom.addClass = function(tag, className){
	if(tag.className.indexOf(className) == -1){
		tag.className += " " + className;
	}
}

unova.dom.removeClass = function(tag, className) {
	if(tag.className.indexOf(className) != -1){
		var regex = new RegExp('(?:^|\\s)'+className+'(?!\\S)',"g");
		tag.className = tag.className.replace( regex ,'')
	}
}


// ---- [ UNOVA JS EXTENSIONS ] ---

if (!Element.prototype.remove){
	Element.prototype.remove = function() {
    	this.parentElement.removeChild(this);
	}
}

if (!NodeList.prototype.remove){
	NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
	    for(var i = this.length - 1; i >= 0; i--) {
	        if(this[i] && this[i].parentElement) {
	            this[i].parentElement.removeChild(this[i]);
	        }
	    }
	}
}

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

if (!Element.prototype.toHTMLString){
	Element.prototype.toHTMLString = function() {
    	var tmpNode = document.createElement( "div" );
   		tmpNode.appendChild(this.cloneNode(true));
   		var str = tmpNode.innerHTML;
   		tmpNode = node = null;
   		return str;
	}
}