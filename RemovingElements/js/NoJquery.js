/*global jQuery, Handlebars, Router */

	'use strict';
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
			}
		}
	};

	var App = {
		init: function () {
			this.todos = util.store('todos-jquery');

			var todoTemp = document.getElementById('todo-template');
			this.todoTemplate = Handlebars.compile(todoTemp.innerHTML);

			var footerTemp = document.getElementById('footer-template');
			this.footerTemplate = Handlebars.compile(footerTemp.innerHTML);
			//this.footerTemplate = Handlebars.compile(document.getElementById('footer-template').innerHTML);

		
			this.handleBindEvents();
			
			new Router({
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');
		},

		handleBindEvents: function () {
			var newTodo = document.getElementById('new-todo');
			var toggleAllTodos = document.getElementById('toggle-all');
			var footerTodo = document.getElementById('footer');
			var todoList = document.getElementById('todo-list');
		
			newTodo.addEventListener('keyup', this.create.bind(this));
			toggleAllTodos.addEventListener('change', this.toggleAll.bind(this));
		  todoList.addEventListener('dblclick', this.edit.bind(this));
			todoList.addEventListener('keyup', this.editKeyup.bind(this));
			
			todoList.addEventListener('focusout', function(event){
				if (event.target.matches('.edit')) {
					App.update(event);
				};
			}, false)
 
			todoList.addEventListener('click', function(event){
				if (event.target.matches('.destroy')) {
					App.destroy(event);
				};
			}, false)

			todoList.addEventListener('change', function(event){
				if (event.target.matches('.toggle')) {
					App.toggle(event);
				};
			}, false)

			footerTodo.addEventListener('click', function(event){
				if (event.target.matches('#clear-completed')) {
					App.destroyCompleted(event);
				};
			}, false)
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
			var isChecked = e.target.checked; 
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
			var editTodo = e.target.parentNode.parentNode; 
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
				filter: this.filter 
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
		}
	};

	App.init();