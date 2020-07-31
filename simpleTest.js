var TinyTestHelper = {
  renderStats: function(tests, failures) {
    var numberOfTests = Object.keys(tests).length;
    var successes = numberOfTests - failures;

    function pluralize (count, word) {
      return count === 1 ? word : word + 'es';
    }
    function pluralizeWithoutE (count, word) {
      return count === 1 ? word : word + 's';
    }
    var summaryString = 'Ran ' + numberOfTests + pluralizeWithoutE(numberOfTests, ' test') + ': ' 
                        + successes + pluralize(successes, ' success') + ', ' 
                        + failures + pluralizeWithoutE(failures, ' failure') + '.';

    var summaryElement = document.createElement('h1');
    summaryElement.textContent = summaryString;
    document.body.appendChild(summaryElement);
  }
};

var TinyTest = {
  run: function(tests) {
      var failures = 0;
      for (var testName in tests) {
          var testAction = tests[testName];
          try {
              testAction.apply(this); // apply binds and runs the function
              console.log('%c' + testName, 'color: green;');
          } catch (e) {
              failures++;
           // console.error('Test:' , testName, 'FAILED', e); console.LOG not console.error-1 error vs 2
           // console.log('%c' + testName, 'color: red;');
           // console.error(e.stack); // e.stack (stack trace) history of failures
              console.groupCollapsed('%c' + testName, 'color: red;');
              console.error(e.stack);
              console.groupEnd();
          }
      }
      setTimeout(function() { // Give document a chance to complete
          if (window.document && document.body) {
              document.body.style.backgroundColor = (failures == 0 ? '#99ff99' : '#ff9999');
              TinyTestHelper.renderStats(tests, failures);                     
          }
      }, 0);
  },
  fail: function(msg) {
      throw new Error('fail(): ' + msg);
  },
  assert: function(value, msg) {
      if (!value) {
          throw new Error('assert(): ' + msg);
      }
  },
  assertEquals: function(expected, actual) {
      if (expected != actual) {
          throw new Error('assertEquals() "' + expected + '" != "' + actual + '"');
      }
  },
  assertStrictEquals: function(expected, actual) {
      if (expected !== actual) {
          throw new Error('assertStrictEquals() "' + expected + '" !== "' + actual + '"');
      }
  }
};

var fail             = TinyTest.fail.bind(TinyTest),
  assert             = TinyTest.assert.bind(TinyTest),
  assertEquals       = TinyTest.assertEquals.bind(TinyTest),
  eq                 = TinyTest.assertEquals.bind(TinyTest), // alias for assertEquals
  assertStrictEquals = TinyTest.assertStrictEquals.bind(TinyTest),
  tests              = TinyTest.run.bind(TinyTest);
