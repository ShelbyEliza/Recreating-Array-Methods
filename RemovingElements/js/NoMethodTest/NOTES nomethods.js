//Commit with only bindEvents in App:
/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';
	//'eq'=equal, custom helper established for filter. Options.fn and options.inverse are handlebar templete options. no second option in this html code. 
	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;
	var todoTemplate; 
	var footerTemplate;

	function uuid() {
			var i, random;
			var uuid = '';
	
			for (i = 0; i < 32; i++) {
					random = Math.random() * 16 | 0;
					if (i === 8 || i === 12 || i === 16 || i === 20) {
							uuid += '-';
					}
					uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			};
			return uuid;
	};   
	
	function pluralize(count, word) {
			return count === 1 ? word : word + 's';
	};
	
	function store(namespace, data) {
			if (arguments.length > 1) {
					return localStorage.setItem(namespace, JSON.stringify(data)); //JSON.stringify-converts to string
			} else {
					var store = localStorage.getItem(namespace); //namespace ='todos-jquery'
					return (store && JSON.parse(store)) || []; //JSON.parse - converts string to an array
					//localStorage- only saves data as string. 
					//if store = truthy(data exists) then convert string to array OR if no stored data exists, create an empty array
			}
	}

	function init () {
				App.todos = store('todos-jquery'); //store uses local storage to set up this.todos=[array-data of todolist]  
				todoTemplate = Handlebars.compile($('#todo-template').html()); //sets up handlebars template
				footerTemplate = Handlebars.compile($('#footer-template').html()); //sets up handlebars footertemplate
				App.bindEvents(); //sets up event listeners when app starts up
	
				new Router({ //Router connects url with code. Router takes an object. 
						//line below:  
						// variable is going to be used as a parameter. in this case '/:filter' is: all/completed/active
						// will need access to render and renderfooter.
						// uses ':' to indicate the following term is a variable in a defined function
						'/:filter': function (filter) {
								this.filter = filter;
								render();
						}.bind(App)//.bind(this) //'this' is bound to App obj. if within the app-NO LONGER IN APP. 
						// without '.bind' then 'this' is equal to router because it's inside a callback function. 
				}).init('/all'); //when the app starts up, go to /all url.
		}
	function indexFromEl (el) { 
      var id = $(el).closest('li').data('id');
      var todos = App.todos;
      var i = todos.length;

      while (i--) {
          if (todos[i].id === id) {
              return i;
          }
      }
  }

	function render () {
		var todos = getFilteredTodos();
		$('#todo-list').html(todoTemplate(todos));
		$('#main').toggle(todos.length > 0);
		$('#toggle-all').prop('checked', getActiveTodos().length === 0);
		renderFooter();
		$('#new-todo').focus();
}

	function renderFooter() {
		var todoCount = App.todos.length; /////
		var activeTodoCount = getActiveTodos().length;
		var template = footerTemplate({
			activeTodoCount: activeTodoCount,
			activeTodoWord: pluralize(activeTodoCount, 'item'),
			//activeTodoWord: util.pluralize(activeTodoCount, 'item'),
			completedTodos: todoCount - activeTodoCount,
			filter: App.filter //Adds border around templete tab currenting being viewed.
	});

	$('#footer').toggle(todoCount > 0).html(template);
}

	function getActiveTodos() {
		return App.todos.filter(function (todo) {
			return !todo.completed;
	});
}
	function getCompletedTodos() {
		return App.todos.filter(function (todo) {
			return todo.completed;
	});
}
	function getFilteredTodos() {
		if (App.filter === 'active') {
			return getActiveTodos();
	}

	if (App.filter === 'completed') {
			return getCompletedTodos();
	}

		return App.todos;
}
	var App = {
		bindEvents: function() {
			$('#new-todo').on('keyup', function create(e) {
				var $input = $(e.target);
				var val = $input.val().trim();
			
				if (e.which !== ENTER_KEY || !val) {
						return;
				}
				this.todos.push({
						id: uuid(),
						title: val,
						completed: false
				});
				$input.val('');
				store('todos-jquery', this.todos);
				render()
			}.bind(this)); //.bind() sets 'this' to App var
	
		$('#toggle-all').on('change', function toggleAll(e) {
				var isChecked = $(e.target).prop('checked');
			
				this.todos.forEach(function (todo) {
						todo.completed = isChecked;
				});
				store('todos-jquery', this.todos);
				render();
			}.bind(this));
		$('#footer').on('click', '#clear-completed', function destroyCompleted() {
				this.todos = getActiveTodos();
				this.filter = 'all';
				store('todos-jquery', this.todos);
				render();
			}.bind(this));
		$('#todo-list')
					.on('change', '.toggle', function toggle(e) {
							var i = indexFromEl(e.target);
							 this.todos[i].completed = !this.todos[i].completed;
							 store('todos-jquery', this.todos);
							 render();
						}.bind(this))
					
					.on('dblclick', 'label', function edit(e) {
							var $input = $(e.target).closest('li').addClass('editing').find('.edit')
							$input.focus()
							store('todos-jquery', this.todos);
						}.bind(this))
	
					.on('keyup', '.edit', function editKeyup(e) {
							if (e.which === ENTER_KEY) {
										e.target.blur();
							}
				
							if (e.which === ESCAPE_KEY) {
										$(e.target).data('abort', true).blur();
							}
							store('todos-jquery', this.todos);
						}.bind(this))
					.on('focusout', '.edit', function update(e) {
							var el = e.target;
							var $el = $(el);
							var val = $el.val().trim();
			
							if (!val) {
									this.destroy(e);
									return;
							}
			
							if ($el.data('abort')) {
									$el.data('abort', false);
							} else {
									this.todos[indexFromEl(el)].title = val;
							}
							store('todos-jquery', this.todos);
							render();
					}.bind(this))
	
					.on('click', '.destroy', function destroy(e) {
						this.todos.splice(indexFromEl(e.target), 1);
						store('todos-jquery', this.todos);
						render();
						}.bind(this));
						store('todos-jquery', this.todos); //This store is saving info to [this.todos]
		}
};

init();
});















	



//OG Commit-bindEvents method in app but separated

/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';
	//'eq'=equal, custom helper established for filter. Options.fn and options.inverse are handlebar templete options. no second option in this html code. 
	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;
	var todoTemplate; 
	var footerTemplate;

	function uuid() {
			var i, random;
			var uuid = '';
	
			for (i = 0; i < 32; i++) {
					random = Math.random() * 16 | 0;
					if (i === 8 || i === 12 || i === 16 || i === 20) {
							uuid += '-';
					}
					uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			};
			return uuid;
	};   
	
	function pluralize(count, word) {
			return count === 1 ? word : word + 's';
	};
	
	function store(namespace, data) {
			if (arguments.length > 1) {
					return localStorage.setItem(namespace, JSON.stringify(data)); //JSON.stringify-converts to string
			} else {
					var store = localStorage.getItem(namespace); //namespace ='todos-jquery'
					return (store && JSON.parse(store)) || []; //JSON.parse - converts string to an array
					//localStorage- only saves data as string. 
					//if store = truthy(data exists) then convert string to array OR if no stored data exists, create an empty array
			}
	}

	function init () {
				App.todos = store('todos-jquery'); //store uses local storage to set up this.todos=[array-data of todolist]  
				todoTemplate = Handlebars.compile($('#todo-template').html()); //sets up handlebars template
				footerTemplate = Handlebars.compile($('#footer-template').html()); //sets up handlebars footertemplate
				App.bindEvents(); //sets up event listeners when app starts up
	
				new Router({ //Router connects url with code. Router takes an object. 
						//line below:  
						// variable is going to be used as a parameter. in this case '/:filter' is: all/completed/active
						// will need access to render and renderfooter.
						// uses ':' to indicate the following term is a variable in a defined function
						'/:filter': function (filter) {
								this.filter = filter;
								render();
						}.bind(App)//.bind(this) //'this' is bound to App obj. if within the app-NO LONGER IN APP. 
						// without '.bind' then 'this' is equal to router because it's inside a callback function. 
				}).init('/all'); //when the app starts up, go to /all url.
		}
	function indexFromEl (el) { 
      var id = $(el).closest('li').data('id');
      var todos = App.todos;
      var i = todos.length;

      while (i--) {
          if (todos[i].id === id) {
              return i;
          }
      }
  }

	function render () {
		var todos = getFilteredTodos();
		$('#todo-list').html(todoTemplate(todos));
		$('#main').toggle(todos.length > 0);
		$('#toggle-all').prop('checked', getActiveTodos().length === 0);
		renderFooter();
		$('#new-todo').focus();
}

	function renderFooter() {
		var todoCount = App.todos.length; /////
		var activeTodoCount = getActiveTodos().length;
		var template = footerTemplate({
			activeTodoCount: activeTodoCount,
			activeTodoWord: pluralize(activeTodoCount, 'item'),
			//activeTodoWord: util.pluralize(activeTodoCount, 'item'),
			completedTodos: todoCount - activeTodoCount,
			filter: App.filter //Adds border around templete tab currenting being viewed.
	});

	$('#footer').toggle(todoCount > 0).html(template);
}

	function getActiveTodos() {
		return App.todos.filter(function (todo) {
			return !todo.completed;
	});
}
	function getCompletedTodos() {
		return App.todos.filter(function (todo) {
			return todo.completed;
	});
}
	function getFilteredTodos() {
		if (App.filter === 'active') {
			return getActiveTodos();
	}

	if (App.filter === 'completed') {
			return getCompletedTodos();
	}

		return App.todos;
}

function create (e) {
	var $input = $(e.target);
	var val = $input.val().trim();

	if (e.which !== ENTER_KEY || !val) {
			return;
	}

	App.todos.push({
			id: uuid(),
			title: val,
			completed: false
	});

	$input.val('');
	store('todos-jquery', this.todos);
	render();
}
function toggle (e) {
	var i = indexFromEl(e.target);
	App.todos[i].completed = !App.todos[i].completed;
	store('todos-jquery', this.todos);
	render();
}
function edit (e) {
	var $input = $(e.target).closest('li').addClass('editing').find('.edit');
	$input.focus(); //new code does what below code did, but simpler 
	//$input.val($input.val()).focus();
	//inside '$input.val() gets current value, Outside $input.val() also gets current value-doesn't do anything.. 
	//bad naming 'edit' does not edit. It changes to editing mode. 
	store('todos-jquery', this.todos);
}
function editKeyup(e) {
	if (e.which === ENTER_KEY) {
			e.target.blur();
	}

	if (e.which === ESCAPE_KEY) {
			$(e.target).data('abort', true).blur();
	}
	store('todos-jquery', this.todos);
}
function update (e) {
	var el = e.target;
	var $el = $(el);
	var val = $el.val().trim();

	if (!val) {
			destroy(e);
			return;
	}

	if ($el.data('abort')) {
			$el.data('abort', false);
	} else {
			App.todos[indexFromEl(el)].title = val;
	}
	store('todos-jquery', this.todos);
	render();
}
function destroy (e) {
	App.todos.splice(indexFromEl(e.target), 1);
	store('todos-jquery', this.todos);
	render();
}

function toggleAll(e) {
	var isChecked = $(e.target).prop('checked');

	App.todos.forEach(function (todo) {
		todo.completed = isChecked;
	});
	store('todos-jquery', this.todos);
	render();
}
function destroyCompleted () {
	App.todos = getActiveTodos();
	App.filter = 'all';
	store('todos-jquery', this.todos);
	render();
}
	var App = {
		bindEvents: function () {
			$('#new-todo').on('keyup', create.bind(this)); //'this' is being bound to App object, when create() is run. 
			$('#toggle-all').on('change', toggleAll.bind(this));
			$('#footer').on('click', '#clear-completed', destroyCompleted.bind(this));
			$('#todo-list')
				.on('change', '.toggle', toggle.bind(this))
				.on('dblclick', 'label', edit.bind(this))
				.on('keyup', '.edit', editKeyup.bind(this))
				.on('focusout', '.edit', update.bind(this))
				.on('click', '.destroy', destroy.bind(this));
		}
};

init();
});
