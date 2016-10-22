/* eslint key-spacing: ["error", { "align": "colon" }] */
requirejs.config({
  baseUrl: '../',
  paths  : {
    'underscore'    : 'bower_components/underscore/underscore',
    'jquery'        : 'bower_components/jquery/dist/jquery',
    'handlebars'    : 'bower_components/handlebars/handlebars.runtime',
    'jquery.boiler' : 'bower_components/jquery-boiler/jquery.boiler',
    'gemini.support': 'bower_components/gemini-support/gemini.support',
    'gemini'        : 'bower_components/gemini-loader/gemini',
    'gemini.fold'   : 'bower_components/gemini-fold/gemini.fold',
    'gemini.respond': 'bower_components/gemini-respond/gemini.respond'
  }
});

require([ 'gemini', 'gemini.lazyload' ], function( G ) {
  G( '#js-container' ).lazyload({
    images    : 'img.lazy',
    bindWindow: true
  });
});
