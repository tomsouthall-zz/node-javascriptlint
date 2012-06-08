var lint = require('./index.js');

//Do a lint test on myself
lint(
  __dirname+'/test.js', 
  {
    'anon_no_return_value': false,
    'comparison_type_conv': false,
    'ambiguous_newline': false,
    'missing_default_case': false,
    'parseint_missing_radix': false
  }, 
  function(result){
    console.log('Test complete', result);
  }
);