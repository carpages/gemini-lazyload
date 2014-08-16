/**
 * @fileoverview

Works the same as http://www.appelsiini.net/projects/lazyload v1.8.4
The only different is you bind it to the containers, and send the images
selector as an option.

 *
 * @namespace gemini.lazyload
 * @copyright Carpages.ca 2014
 * @author Matt Rose <matt@mattrose.ca>
 *
 * @requires gemini
 * @requires gemini.fold
 *
 * @example
  G('#js-container').lazyload({images:'img.lazy'});
 */

define(['gemini', 'gemini.fold'], function($){

  $.boiler('lazyload', {

    // plugin's default options
    defaults: {
      threshold       : 0,
      failure_limit   : 0,
      event           : "scroll",
      effect          : "show",
      images          : 'img.lazy',
      data_attribute  : "original",
      skip_invisible  : true,
      appear          : null,
      load            : null,
      placeholder     : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
      bindWindow      : false
    },

    // the method that initiates DOM listeners and manipulation
    init: function(){
      var plugin = this;

      //Cache
      plugin.$window = $(window);
      plugin.$imgs = plugin.$el.find(plugin.settings.images);
      plugin.elToBind = plugin.settings.bindWindow ? window : plugin.el;
      plugin.$elToBind = $(plugin.elToBind);

      // Bind the (scroll?) event to the container
      // Fire one scroll event per scroll. Not one scroll event per image.
      if (0 === plugin.settings.event.indexOf("scroll")) {
        // only trigger on intervals of 250ms
        // http://ejohn.org/blog/learning-from-twitter/
        var scrollTriggered = false;

        plugin.$elToBind.bind(plugin.settings.event, function(event) {
          scrollTriggered = true;
        });

        setInterval(function(){
          if(scrollTriggered){
            plugin.update();
            scrollTriggered = false;
          }
        }, 250);
      }

      plugin.$imgs.each(function(){
        var img = this;
        var $img = $(this);

        img.loaded = false;

        /* If no src attribute given use data:uri. */
        if ($img.attr("src") === undefined || $img.attr("src") === false || $img.attr("src") === '') {
          $img.attr("src", plugin.settings.placeholder);
        }

        /* When appear is triggered load original image. */
        $img.one("appear", function() {
          if (!this.loaded) {
            var imgUrl = plugin.getImgUrl(img);

            if (plugin.settings.appear) {
              var elements_left = plugin.$imgs.length;
              plugin.settings.appear.call(img, elements_left, plugin.settings);
            }
            $("<img />")
              .bind("load", function() {
                $img
                  .hide()
                  .attr("src", imgUrl)
                  [plugin.settings.effect](plugin.settings.effect_speed);
                img.loaded = true;

                /* Remove image from array so it is not looped next time. */
                var temp = $.grep(plugin.$imgs, function(img) {
                  return !img.loaded;
                });
                plugin.$imgs = $(temp);

                if (plugin.settings.load) {
                  var elements_left = plugin.$imgs.length;
                  plugin.settings.load.call(img, elements_left, plugin.settings);
                }
              })
              .attr("src", imgUrl);
          }
        });

        // If not scroll event, bind the img with the event
        if (0 !== plugin.settings.event.indexOf("scroll")) {
          $img.bind(plugin.settings.event, function(event) {
            $img.trigger("appear");
          });
        }
      });

      /* Check if something appears when window is resized. */
      $(window).bind("resize", function(event) {
        plugin.update();
      });

      /* With IOS5 force loading images when navigating with back button. */
      /* Non optimal workaround. */
      if ((/iphone|ipod|ipad.*os 5/gi).test(navigator.appVersion)) {
        plugin.$window.bind("pageshow", function(event) {
          if (event.originalEvent.persisted) {
            plugin.$imgs.each(function() {
              $(this).trigger("appear");
            });
          }
        });
      }

      /* Force initial check if images should appear. */
      plugin.update();

      /* Load all images on print */
      $(document).on('print', function(){
        plugin.$imgs.each(function(){
          $(this).trigger('appear');
        });
      });

    },

    getImgUrl: function(img) {
      var plugin = this,
          $img = $(img),
          width = $window.width(),
          url = $img.data(plugin.settings.data_attribute);

      _.each($.respond.sortedBreakpoints(), function(bp){
        if(width > bp.size) {
          var isUrl = $img.data(bp.screen);
          url = !!isUrl ? isUrl : url;
        }
      });

      return url;
    },

    update: function(){
      var plugin = this;
      var counter = 0;

      plugin.$imgs.each(function() {
        var $this = $(this);
        if (plugin.settings.skip_invisible && !$this.is(":visible")) {
          return;
        }
        if ($.abovethetop(this, {container: plugin.elToBind, threshold: plugin.settings.threshold}) ||
          $.leftofbegin(this, {container: plugin.elToBind, threshold: plugin.settings.threshold})) {
            /* Nothing. */
        } else if (!$.belowthefold(this, {container: plugin.elToBind, threshold: plugin.settings.threshold}) &&
          !$.rightoffold(this, {container: plugin.elToBind, threshold: plugin.settings.threshold})) {
            $this.trigger("appear");
            /* if we found an image we'll load, reset the counter */
            counter = 0;
        } else {
          if (++counter > plugin.settings.failure_limit) {
            return false;
          }
        }
      });
    }

  });

  return $;

});
