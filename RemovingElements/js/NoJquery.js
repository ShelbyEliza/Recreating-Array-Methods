/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';
	//'eq'=equal, custom helper established for filter. Options.fn and options.inverse are handlebar templete options. no second option in this html code. 
	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var util = {
		uuid: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		},
		store: function (namespace, data) {
			if (arguments.length > 1 ) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
				//if store=truthy then convert out of a string OR if no stored data exists, create an empty array. 
			}
		}
	};

	var App = {
		init: function () {
			this.todos = util.store('todos-jquery');
			this.todoTemplate = Handlebars.compile($('#todo-template').html());
			this.footerTemplate = Handlebars.compile($('#footer-template').html());
			this.bindEvents();
			this.handleBindEvents();
			
			new Router({
				//line below uses ':' to indicate the following term is a variable in a defined function. filter=all/completed/active
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');
			//line above says, when the app starts up, go to /all url.
		},
	
		bindEvents: function () {
			// $('#new-todo').on('keyup', this.create.bind(this)); //'this' is being bound to App object, when create() is run. 
			//$('#toggle-all').on('change', this.toggleAll.bind(this));
			$('#footer').on('click', '#clear-completed', this.destroyCompleted.bind(this));
			$('#todo-list')
			 .on('change', '.toggle', this.toggle.bind(this))
		//.on('dblclick', 'label', this.edit.bind(this)) //dbclick label space to edit. 
			 //.on('keyup', '.edit', this.editKeyup.bind(this))
				//.on('focusout', '.edit', this.update.bind(this))
				.on('click', '.destroy', this.destroy.bind(this));
		},


		handleBindEvents: function () {
			var newTodo = document.getElementById('new-todo');
			var toggleAllTodos = document.getElementById('toggle-all');
			var footerTodo = document.getElementById('footer');
			var todoList = document.getElementById('todo-list');
		


			newTodo.addEventListener('keyup', this.create.bind(this));
			toggleAllTodos.addEventListener('change', this.toggleAll.bind(this));
			//footerTodo.addEventListener('click', this.destroyCompleted(this));

			//todoList.addEventListener('change', this.toggle.bind(this));
		  todoList.addEventListener('dblclick', this.edit.bind(this));
			todoList.addEventListener('keyup', this.editKeyup.bind(this));
			todoList.addEventListener('focusout', this.update.bind(this));
			//todoList.addEventListener('click',this.destroy.bind(this));

			// document.addEventListener('click', function(event) {
			// 	if (event.target.matches('#clear-completed')) {
			// 		App.destroyCompleted();
			// 	};
			// 	if (event.target.matches('.destroy')) {
			// 		this.destroy(event);
			// 	};
			// 	App.destroyCompleted(this)
			// });

	},



		
		create: function (e) {
			var createTodo = (e.target);
			var val = createTodo.value.trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			this.todos.push({
				id: util.uuid(),
				title: val,
				completed: false
			});

			createTodo.value= '';
			this.render();
		},
		toggleAll: function (e) {
			var isChecked = e.target.checked; //.checked acts like a switch

			this.todos.forEach(function (todo) {
				todo.completed = isChecked;
			});

			this.render();
		},
		destroyCompleted: function () {
			this.todos = this.getActiveTodos();
			this.filter = 'all';
			this.render();
		},
		toggle: function (e) {
			var i = this.indexFromEl(e.target);
			this.todos[i].completed = !this.todos[i].completed;
			this.render();
		},
		edit: function (e) {
			var editTodo = e.target.parentNode.parentNode; //parentNode twice, looking for the div and then the li
			editTodo.classList.add('editing')
			var targetElementList = e.target.closest('li').children[1];
			targetElementList.focus();
			},
		editKeyup: function (e) {
				if (e.which === ENTER_KEY) {
					e.target.aborted = false;
					e.target.blur();
				}
	
				if (e.which === ESCAPE_KEY) {
					e.target.aborted = true;
					e.target.blur();
				}
			},

		update: function (e) {
				var el = e.target;
				var val = el.value.trim();

	
				if (!val) {
					this.destroy(e);
					return;
				}
	
				if (e.target.aborted === true) {
					e.target.aborted = false;
				} else {
					this.todos[this.indexFromEl(el)].title = val;
				}
	
				this.render();
			},

		destroy: function (e) {
				this.todos.splice(this.indexFromEl(e.target), 1);
				this.render();
			},
		indexFromEl: function (el) {
			var id = el.closest('li').getAttribute('data-id');
			var todos = this.todos;
			var i = todos.length;

			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.getActiveTodos().length;
			var template = this.footerTemplate({
				activeTodoCount: activeTodoCount,
				activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount,
				filter: this.filter //Adds border around templete tab currenting being viewed.
			});
			var footer = document.getElementById('footer');
			footer.innerHTML = template;
			if (todoCount > 0) {
				footer.style.display = 'block';
			}
		},
		render: function () {
			var todos = this.getFilteredTodos();
			var todoList = document.getElementById('todo-list');
			var main = document.getElementById('main');
			var toggleAll = document.getElementById('toggle-all');
			var newTodo = document.getElementById('new-todo');

			todoList.innerHTML = this.todoTemplate(todos);
			if (todos.length > 0) {
				main.style.display = 'block';
			} else {
				main.style.display = 'none';
			};
			if (this.getActiveTodos().length === 0) {
				toggleAll.value = 'checked';
			} else {
				toggleAll.value = 'unchecked';
			}
			newTodo.focus();
			this.renderFooter();
			util.store('todos-jquery', this.todos);
		},
	
		
		
		


		//Method Chaining-Use 'this'?
		// render: function () {
		// var todos = this.getFilteredTodos(); //gives todos based on filter applied.
		// $('#todo-list').html(this.todoTemplate(todos)); //injecting HTML into code.
		// $('#main').toggle(todos.length > 0); //hide or show. Takes true or false. show todos if we have todos. shows todos and toggleall button.
		// $('#toggle-all').prop('checked', this.getActiveTodos().length === 0); //determines whether toggle all button is checked or not. 
		// 	this.renderFooter();
		// 	$('#new-todo').focus();
		// 	util.store('todos-jquery', this.todos);
		// },


		// renderFooter: function () {
		// 	var todoCount = this.todos.length;
		// 	var activeTodoCount = this.getActiveTodos().length;
		// 	var template = this.footerTemplate({
		// 		activeTodoCount: activeTodoCount,
		// 		activeTodoWord: util.pluralize(activeTodoCount, 'item'),
		// 		completedTodos: todoCount - activeTodoCount,
		// 		filter: this.filter //Adds border around templete tab currenting being viewed.
		// 	});

		// 	$('#footer').toggle(todoCount > 0).html(template);
		// },
		// toggleAll: function (e) {
		// 	var isChecked = $(e.target).prop('checked');

		// 	this.todos.forEach(function (todo) {
		// 		todo.completed = isChecked;
		// 	});

		// 	this.render();
		// },
		getActiveTodos: function () {
			return this.todos.filter(function (todo) {
				return !todo.completed;
			});
		},
		getCompletedTodos: function () {
			return this.todos.filter(function (todo) {
				return todo.completed;
			});
		},
		getFilteredTodos: function () {
			if (this.filter === 'active') {
				return this.getActiveTodos();
			}

			if (this.filter === 'completed') {
				return this.getCompletedTodos();
			}

			return this.todos;
		},
		// destroyCompleted: function () {
		// 	this.todos = this.getActiveTodos();
		// 	this.filter = 'all';
		// 	this.render();
		// },
		// accepts an element from inside the `.item` div and
		// returns the corresponding index in the `todos` array
		// indexFromEl: function (el) {
		// 	var id = el.closest('li').getAttribute('data-id');

		// 	//var id = $(el).closest('li').data('id');
		// 	var todos = this.todos;
		// 	var i = todos.length;

		// 	while (i--) {
		// 		if (todos[i].id === id) {
		// 			return i;
		// 		}
		// 	}
		// },

		// create: function (e) {
		// 	var $input = $(e.target);
		// 	var val = $input.val().trim();

		// 	if (e.which !== ENTER_KEY || !val) {
		// 		return;
		// 	}

		// 	this.todos.push({
		// 		id: util.uuid(),
		// 		title: val,
		// 		completed: false
		// 	});

		// 	$input.val('');
		// 	this.render();
		// },
		// toggle: function (e) {
		// 	var i = this.indexFromEl(e.target);
		// 	this.todos[i].completed = !this.todos[i].completed;
		// 	this.render();
		// },
		// edit: function (e) {
		// 	var $input = $(e.target).closest('li').addClass('editing').find('.edit');
		// 	$input.focus();
		// 	//new code does what below code did, but simpler 
		// 	//$input.val($input.val()).focus();
		// 	//inside '$input.val() gets current value, Outside $input.val() also gets current value-doesn't do anything.. 
		// 	//bad naming 'edit' does not edit. It changes to editing mode. 
		// },
		// editKeyup: function (e) {
		// 	if (e.which === ENTER_KEY) {
		// 		e.target.blur();
		// 	}

		// 	if (e.which === ESCAPE_KEY) {
		// 		$(e.target).data('abort', true).blur();
		// 	}
		// },
		// update: function (e) {
		// 	var el = e.target;
		// 	var $el = $(el);
		// 	var val = $el.val().trim();

		// 	if (!val) {
		// 		this.destroy(e);
		// 		return;
		// 	}

		// 	if ($el.data('abort')) {
		// 		$el.data('abort', false);
		// 	} else {
		// 		this.todos[this.indexFromEl(el)].title = val;
		// 	}

		// 	this.render();
		// },
		// destroy: function (e) {
		// 	this.todos.splice(this.indexFromEl(e.target), 1);
		// 	this.render();
		// }
	};

	App.init();
});
