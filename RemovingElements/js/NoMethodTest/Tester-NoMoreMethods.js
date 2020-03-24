function create (e) {
    var $input = $(e.target);
    var val = $input.val().trim();

    if (e.which !== ENTER_KEY || !val) {
        return;
    }

    App.todos.push({
        id: util.uuid(),
        title: val,
        completed: false
    });

    $input.val('');

    render();
}
function toggle (e) {
    var i = indexFromEl(e.target);
    App.todos[i].completed = !App.todos[i].completed;
    render();
}
function edit (e) {
    var $input = $(e.target).closest('li').addClass('editing').find('.edit');
    $input.focus(); //new code does what below code did, but simpler 
    //$input.val($input.val()).focus();
    //inside '$input.val() gets current value, Outside $input.val() also gets current value-doesn't do anything.. 
    //bad naming 'edit' does not edit. It changes to editing mode. 
}
function editKeyup(e) {
    if (e.which === ENTER_KEY) {
        e.target.blur();
    }

    if (e.which === ESCAPE_KEY) {
        $(e.target).data('abort', true).blur();
    }
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

    render();
}
function destroy (e) {
    App.todos.splice(indexFromEl(e.target), 1);
    render();
}
bindEvents: function () {
    $('#new-todo').on('keyup', this.create.bind(this)); //'this' is being bound to App object, when create() is run. 
    $('#toggle-all').on('change', this.toggleAll.bind(this));
    $('#footer').on('click', '#clear-completed', this.destroyCompleted.bind(this));
    $('#todo-list')
        .on('change', '.toggle', this.toggle.bind(this))
        .on('dblclick', 'label', this.edit.bind(this))
        .on('keyup', '.edit', this.editKeyup.bind(this))
        .on('focusout', '.edit', this.update.bind(this))
        .on('click', '.destroy', this.destroy.bind(this));
},