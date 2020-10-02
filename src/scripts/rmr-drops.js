/*
 * rmr-drops
 * © 2020 David Miller
 * https://readmeansrun.com
 */

(() => {

  'use strict';

  const
  RMR = require('rmr-util'),

  // being viewed on a touch device?
  TOUCH = RMR.Browser.isTouch(),

  // attributes used throughout the widget
  ATTRS = {
    drops: 'rmr-drops',
    arrow: 'rmr-arrow',
    open: 'rmr-open',
    show: 'rmr-show'
  };

  /**
    
    @param options {Object} - 
      center {Bool} - 
      offset {Integer} - 
      arrow {Integer} -
      node {String|Element} - 
      hover {Bool} - 
      delay {Integer} - milliseconds 
   */
  const Drops = function(options) {

    if (! options) { options = {}; }
    if (! parseInt(options.delay, 10)) {
      options.delay = 0;
    }
    options.offset = parseInt(options.offset, 10) > 0 ? parseInt(options.offset, 10) : 0;
    options.arrow = parseInt(options.arrow, 10) > 0 ? parseInt(options.arrow, 10) : 0;
    options.debug = RMR.Object.has(options, 'debug') ? options.debug : false;

    const
      uls = options.node ? RMR.Node.getAll(options.node) : RMR.Node.getAll('ul.' + ATTRS.drops),

      // hash of all timeout references 
      timeouts = {},

      // event handler for li > dl > dt > a
      clicker = (e) => {
        const
          li = RMR.Node.ancestor(e.target, 'li', false),
          isOpen = li.classList.contains(ATTRS.open);

        if ((TOUCH && ! isOpen) || (options.hover || ! isOpen)) {
          e.preventDefault();
          on(e);
        }
      },

      // event handler to open a dropdown 
      on = (e) => {
        const li = RMR.Node.ancestor(e.target, 'li', true);

        // remove timeouts for hiding this dropdown
        if (RMR.Object.has(timeouts, li.getAttribute('id'))) {
          window.clearTimeout(timeouts[li.getAttribute('id')]);
          delete timeouts[li.getAttribute('id')];
        }

        // no more work necessary
        if (li.classList.contains(ATTRS.open) && li.classList.contains(ATTRS.show)) {
          return;
        }

        li.classList.add(ATTRS.open);
        window.setTimeout(function() { li.classList.add(ATTRS.show) }, ! options.hover || TOUCH || e.type === 'focus' ? 0 : 100 );

        const
          drop = li.querySelector(':scope dd'),
          target = li.querySelector(':scope dt');

        // no dropdown 
        if (! target) {
          return;
        }

        const
          origin = RMR.Node.getRect(target),
          targetStyle = window.getComputedStyle(target),
          arrowColor = window.getComputedStyle(drop.querySelector(':scope > div')).backgroundColor;

        let arrow;
        if (options.arrow) {
          RMR.Node.prune(drop, 'b.' + ATTRS.arrow);
          arrow = RMR.Node.create('b', { class: ATTRS.arrow });
          RMR.Node.setStyles(arrow, {
            borderBottomColor: arrowColor,
            borderLeftWidth: options.arrow + 'px',
            borderRightWidth: options.arrow + 'px',
            borderBottomWidth: options.arrow + 'px'
          });

          drop.insertBefore(arrow, drop.firstChild);
          arrow.style.marginLeft = parseFloat(window.getComputedStyle(drop).width, 10) / 2 - (options.arrow) + 'px'; 
        }

        // place the dropdown `offset` px away from its parent
        drop.style.top = parseInt(targetStyle.height, 10) + options.offset + 'px';
        let rect = drop.getBoundingClientRect();

        // position centered 
        if (options.center) {
          drop.style.left = (origin.width - rect.width) / (options.hover ? 2 : 4) + 'px';
          rect = drop.getBoundingClientRect();
        }

        // is the dropdown clipped by the right edge of the window?
        if (rect.right >= window.innerWidth) {
          drop.style.left = parseInt(drop.style.left, 10) - (rect.right - window.innerWidth) + 'px';
          rect = drop.getBoundingClientRect()
        }

        // is the dropdown clipped by the left edge of the window?
        if (rect.left < 0) {
          drop.style.left = '0px';
          rect = drop.getBoundingClientRect()
        }

        // is the dropdown clipped by the bottom?
        if (rect.bottom > window.innerHeight) {
          if (options.arrow) {
            RMR.Node.remove(arrow);
            arrow.classList.add('rmr-bottom');
            RMR.Node.setStyles(arrow, {
              borderTopColor: arrowColor,
              borderBottomColor: 'transparent',
              borderTopWidth:  options.arrow,
              borderBottomWidth: '0px'
            });
            drop.appendChild(arrow);
          }

          rect = drop.getBoundingClientRect();
          drop.style.top = 0 - rect.height - options.offset + 'px';
        }

        // loop through all other dropdowns in this group and hide them 
        const lis = RMR.Node.ancestor(li, 'ul.' + ATTRS.drops).querySelectorAll(':scope > li');
        for (const i in lis) {
          if (! RMR.Object.has(lis, i) || lis[i].getAttribute('id') == li.getAttribute('id')) {
            continue;
          }
          hide(lis[i]);
        }
      },

      // force a dropdown to close
      hide = (target) => {
       if (options.debug) {
         return;
       }
        target.classList.remove(ATTRS.open);
        target.classList.remove(ATTRS.show);
        window.clearTimeout(timeouts[target.getAttribute('id')]);
        delete timeouts[target.getAttribute('id')];
      },

      // event handler to close a dropdown after the designated period of time 
      off = (e) => {
        const li = RMR.Node.ancestor(e.target, 'li', true);
        timeouts[li.getAttribute('id')] = window.setTimeout(() => {
          hide(li);
        }, options.delay);
      };

    // sanity check before proceeding with initialization
    if (uls.length === 0) {
      console.error('No rmr-drops to init');
      return;
    }

    for (const i in uls) {
      if (! RMR.Object.has(uls, i)) { continue; }

      const
        ul = uls[i],
        lis = ul.querySelectorAll(':scope > li');

      // add event listener to dismiss popovers when document.body is clicked on
      if (! options.hover || TOUCH) {
        document.body.addEventListener('click', (e) => {
          const ul = RMR.Node.ancestor(e.target, 'ul.' + ATTRS.drops, false);
          if (! ul) {
            for (const i in lis) {
              if (! RMR.Object.has(lis, i)) { continue; }
              hide(lis[i]);
            }
          }
        });
      }

      // all 
      for (const j in lis) {
        if (! RMR.Object.has(lis, j)) { continue; }
        const li = lis[j];

        // ensure li has unique id
        if (! li.getAttribute('id')) {
          li.setAttribute('id', RMR.String.guid());
        }

        // add listeners to all links in the dropdown list to keep dropdown open 
        const links = li.querySelectorAll('dd a');
        for (const j in links) {
          if (! RMR.Object.has(links, j)) { continue; }

          links[j].addEventListener('focus', (e) => {
            const target = RMR.Node.ancestor(e.target.parentNode.parentNode, 'li', false); 
            on({ target: target });
          });

          links[j].addEventListener('blur', (e) => {
            const target = RMR.Node.ancestor(e.target.parentNode.parentNode, 'li', false); 
            off({ target: target });
          });

        }

        const a = li.querySelector(':scope dt a');
        if (options.hover) {
          li.addEventListener('mouseenter', on);
          li.addEventListener('mouseleave', off);
        }
        else {
          if (a) {
            // if the target is clicked and its dropdown is NOT open (or we're on a touch device where there is no hover event)
            a.addEventListener('click', clicker);
          }
        }
        // add listeners to target link
        if (a) {
          a.addEventListener('focus', (e) => {
            window.setTimeout(() => { on(e); }, 100); // delay for all browsers
          });
          a.addEventListener('blur', off);
        }
      }
    }

    // object that allows programmatic opening of drops
    return {
      drop: function(arg) {
        const n = RMR.Node.get(arg);
        if (! n) {
          console.error('No dropdown exists', arg);
          return;
        }
        on({target: n});
      }
    };
  };

  module.exports = Drops;

})();
