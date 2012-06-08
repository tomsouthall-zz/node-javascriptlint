var fs = require('fs'),
    spawn = require('child_process').spawn,
    _ = require('underscore'),

/*
  Arguments
  =========

  ### files [array] - Specify which javascript and/or html files to lint

  Example: 

  ['myfile1.js', '/path/to/*.js', '/path/to/*.html']
  
  
  ### options [hash] - A hash of boolean options

  Files
  -----  
  recurse                             # enable recursion (default: false)

  Warnings
  --------
  no_return_value                     # function {0} does not always return a value (default: true)
  duplicate_formal                    # duplicate formal argument {0} (default: true)
  equal_as_assign                     # test for equality (==) mistyped as assignment (=)?{0} (default: true)
  var_hides_arg                       # variable {0} hides argument (default: true)
  redeclared_var                      # redeclaration of {0} {1} (default: true)
  anon_no_return_value                # anonymous function does not always return a value (default: true)
  missing_semicolon                   # missing semicolon (default: true)
  meaningless_block                   # meaningless block; curly braces have no impact (default: true)
  comma_separated_stmts               # multiple statements separated by commas (use semicolons?) (default: true)
  unreachable_code                    # unreachable code (default: true)
  missing_break                       # missing break statement (default: true)
  missing_break_for_last_case         # missing break statement for last case in switch (default: true)
  comparison_type_conv                # comparisons against null, 0, true, false, or an empty string allowing implicit type conversion (use === or !==) (default: true)
  inc_dec_within_stmt                 # increment (++) and decrement (--) operators used as part of greater statement (default: true)
  useless_void                        # use of the void type may be unnecessary (void is always undefined) (default: true)
  multiple_plus_minus                 # unknown order of operations for successive plus (e.g. x+++y) or minus (e.g. x---y) signs (default: true)
  use_of_label                        # use of label (default: true)
  block_without_braces                # block statement without curly braces (default: false)
  leading_decimal_point               # leading decimal point may indicate a number or an object member (default: true)
  trailing_decimal_point              # trailing decimal point may indicate a number or an object member (default: true)
  octal_number                        # leading zeros make an octal number (default: true)
  nested_comment                      # nested comment (default: true)
  misplaced_regex                     # regular expressions should be preceded by a left parenthesis, assignment, colon, or comma (default: true)
  ambiguous_newline                   # unexpected end of line; it is ambiguous whether these lines are part of the same statement (default: true)
  empty_statement                     # empty statement or extra semicolon (default: true)
  missing_option_explicit             # the "option explicit" control comment is missing (default: false)
  partial_option_explicit             # the "option explicit" control comment, if used, must be in the first script tag (default: true)
  dup_option_explicit                 # duplicate "option explicit" control comment (default: true)
  useless_assign                      # useless assignment (default: true)
  ambiguous_nested_stmt               # block statements containing block statements should use curly braces to resolve ambiguity (default: true)
  ambiguous_else_stmt                 # the else statement could be matched with one of multiple if statements (use curly braces to indicate intent) (default: true)
  missing_default_case                # missing default case in switch statement (default: true)
  duplicate_case_in_switch            # duplicate case in switch statements (default: true)
  default_not_at_end                  # the default case is not at the end of the switch statement (default: true)
  legacy_cc_not_understood            # couldn't understand control comment using @keyword@ syntax (default: true)
  jsl_cc_not_understood               # couldn't understand control comment using jsl:keyword syntax (default: true)
  useless_comparison                  # useless comparison; comparing identical expressions (default: true)
  with_statement                      # with statement hides undeclared variables; use temporary variable instead (default: true)
  trailing_comma_in_array             # extra comma is not recommended in array initializers (default: true)
  assign_to_function_call             # assignment to a function call (default: true)
  parseint_missing_radix              # parseInt missing radix parameter (default: true)

  Context
  -------
  context                             # parseInt missing radix parameter (default: true)

  Semicolons
  ----------
  lambda_assign_requires_semicolon    # by default, assignments of an anonymous function to a variable or property (such as a function prototype) must be followed by a semicolon. (default: true)

  Control Comments
  ----------------
  Both JavaScript Lint and the JScript interpreter confuse each other with the syntax for
  the @keyword@ control comments and JScript conditional comments. (The latter is
  enabled in JScript with @cc_on@). The jsl:keyword syntax is preferred for this reason,
  although legacy control comments are enabled by default for backward compatibility.
  ----------------
  legacy_control_comments             # (default: true)

  JScript Function Extensions
  ---------------------------
  JScript allows member functions to be defined like this:
      function MyObj() { }
      function MyObj.prototype.go() { }
  
  It also allows events to be attached like this:
      function window::onload() { }
  
  This is a Microsoft-only JavaScript extension. Enable this setting to allow them.
  ---------------------------
  jscript_function_extensions         # (default: false)

  Defining identifiers
  --------------------
  # By default, "option explicit" is enabled on a per-file basis.
  # To enable this for all files, use "+always_use_option_explicit"
  --------------------
  always_use_option_explicit          # (default: false)

  ### callback [function] - Callback function to be executed once the lint is complete.

*/

defaultOptions = {
  //Files
  'recurse':false,

  //Warnings
  'no_return_value':true,
  'duplicate_formal':true,
  'equal_as_assign':true,
  'var_hides_arg':true,
  'redeclared_var':true,
  'anon_no_return_value':true,
  'missing_semicolon':true,
  'meaningless_block':true,
  'comma_separated_stmts':true,
  'unreachable_code':true,
  'missing_break':true,
  'missing_break_for_last_case':true,
  'comparison_type_conv':true,
  'inc_dec_within_stmt':true,
  'useless_void':true,
  'multiple_plus_minus':true,
  'use_of_label':true,
  'block_without_braces':false,
  'leading_decimal_point':true,
  'trailing_decimal_point':true,
  'octal_number':true,
  'nested_comment':true,
  'misplaced_regex':true,
  'ambiguous_newline':true,
  'empty_statement':true,
  'missing_option_explicit':false,
  'partial_option_explicit':true,
  'dup_option_explicit':true,
  'useless_assign':true,
  'ambiguous_nested_stmt':true,
  'ambiguous_else_stmt':true,
  'missing_default_case':true,
  'duplicate_case_in_switch':true,
  'default_not_at_end':true,
  'legacy_cc_not_understood':true,
  'jsl_cc_not_understood':true,
  'useless_comparison':true,
  'with_statement':true,
  'trailing_comma_in_array':true,
  'assign_to_function_call':true,
  'parseint_missing_radix':true,

  //Context
  'context':true,

  //Semicolons
  'lambda_assign_requires_semicolon':true,

  //Control Comments
  'legacy_control_comments':true,

  //JScript Function Extensions
  'jscript_function_extensions':false,

  //Defining identifiers
  'always_use_option_explicit':false
},

createOptionsFile = function(tmpFile, files, options){
  var fileContent = '',
      fileOptions = _.extend({}, defaultOptions, options);
  
  //Check we are only being passed permitted options
  _.each(options, function(value, option){
    if(_.isUndefined(defaultOptions[option])) throw new Error('\033[31mThere is no JavascriptLint option called ' + option + '\033[0m');
  });
  
  //Create file content based on options
  _.each(fileOptions, function(value, option){
    fileContent += (value) ? '+' : '-';
    fileContent += option + '\n';
  });
  
  //Add in output format
  fileContent += '+output-format __FILE__:__LINE__: __ERROR__' + '\n';
  
  //Add in files
  _.each(files, function(file){
    fileContent += '+process ' + file + '\n';
  });
  
  //Write out file
  fs.writeFileSync(tmpFile, fileContent, 'ascii');
},


lint = function(files, options, callback) {
    var optionsFile = __dirname + '/' + new Date().getTime().toString() + '.conf', //Filename for temporary config file
        lintProcess,
        result;
        
    //If files is not an array, make it one
    if(_.isString(files)) files = [files];
    
    //Create temporary options file
    createOptionsFile(optionsFile, files, options);

    //Run lint process
    lintProcess = spawn(__dirname + '/lib/javascriptlint/jsl', ['-conf', optionsFile]);

    lintProcess.stdout.on('data', function(data) {
      var dataLines = data.toString().split('\n');
      
      //Convert data to a string
      data = data.toString();
      
      _.each(dataLines, function(line){
        if(line.indexOf('error(s)') >= 0 && line.indexOf('warning(s)') >= 0){
          result = line.replace(' error(s)', '').replace(' warning(s)', '').split(',');
          result = {
            errors: parseInt(result[0]),
            warnings: parseInt(result[1]),
            message: data
          };
        }
      });
    });
    
    lintProcess.stderr.on('data', function(data) {
      result = {
        errors: 1,
        warnings: 0,
        message: data.toString()
      };
    });

    lintProcess.on('exit', function(code) {
      //Delete temporary options file
      fs.unlinkSync(optionsFile);
      
      //Execute callback
      if(callback) callback(result);
    });
};

module.exports = lint;
