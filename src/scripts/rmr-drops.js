/* global  */


/*
 * rmr-drops
 * © 2020 David Miller
 * https://readmeansrun.com
 */

(() => {

  'use strict';

  const
  RMR = require('rmr-util'),

  MOBILE = RMR.Browser.isTouch(),
  ARROW = {
    size: 5,
    class: 'arrow'
  },
  OPEN_CLASS = 'rmr-open',
  SHOW_CLASS = 'rmr-show';

//console.log(MOBILE);

  /**
    
     @param options {Object} - 
   
   */
  const Drops = function(options) {

    if (! parseInt(options.delay, 10)) {
      options.delay = 0;
    }
    options.offset = parseInt(options.offset, 10) > 0 ? parseInt(options.offset, 10) : 0;

    const
      uls = options.node ? RMR.Node.getAll(options.node) : document.querySelectorAll('ul.rmr-drops'),

      // hash of all 
      timeouts = {},

      // event handler to open a dropdown 
      on = (e) => {
        const li = RMR.Node.ancestor(e.target, 'li', true);

        // remove timeouts for hiding this dropdown
        if (RMR.Object.has(timeouts, li.getAttribute('id'))) {
          window.clearTimeout(timeouts[li.getAttribute('id')]);
          delete timeouts[li.getAttribute('id')];
        }

        li.classList.add(OPEN_CLASS);
        window.setTimeout(function() { li.classList.add(SHOW_CLASS) }, ! options.hover || MOBILE || e.type === 'focus' ? 0 : 1000 );

        const
          drop = li.querySelector(':scope dd'),
          target = li.querySelector(':scope dt'),
          origin = RMR.Node.getRect(target),
          targetStyle = window.getComputedStyle(target),
          arrowColor = window.getComputedStyle(drop.querySelector(':scope > div')).backgroundColor;

        let arrow;
        if (options.arrow) {
          let n;

          // remove any existing arrows
          while ((n = drop.querySelector('b.' + ARROW.class)) !== null ) {
            RMR.Node.remove(n);
          }
          arrow = RMR.Node.create('b', { class: ARROW.class });
          RMR.Node.setStyles(arrow, {
            borderBottomColor: arrowColor,
            borderLeftWidth: ARROW.size + 'px',
            borderRightWidth = ARROW.size + 'px',
            borderBottomWidth = ARROW.size + 'px'
          });

          drop.insertBefore(arrow, drop.firstChild);
          arrow.style.marginLeft = parseInt(targetStyle.width, 10) / 2 - (ARROW.size / 2) + 'px'; 
        }

        let
          rect = RMR.Node.getRect(drop);

        drop.style.top = parseInt(targetStyle.height, 10) + options.offset + 'px';
        rect = RMR.Node.getRect(drop);

        if (options.center) {
          drop.style.left = parseInt(origin.width / 2 - rect.width / 2) + 'px';
          rect = RMR.Node.getRect(drop);
        }

        if (rect.right >= window.innerWidth) {
          drop.style.left = (window.innerWidth - rect.right - 15) + 'px';
          rect = RMR.Node.getRect(drop);
        }

        if (rect.left < 0) {
          drop.style.left = 10 + 'px';
          rect = RMR.Node.getRect(drop);
        }

        if (rect.bottom > window.innerHeight) {
          if (options.arrow) {
            RMR.Node.remove(arrow);
            arrow.classList.add('rmr-bottom');
            RMR.Node.setStyles(arrow, {
              borderTopColor: arrowColor;
              borderTopWidth: ARROW.size + 'px';
              borderBottomWidth: 0;
            });
            drop.appendChild(arrow);
            rect = RMR.Node.getRect(drop);
          }

          drop.style.top = 0 - rect.height - options.offset + 'px';
        }

        const lis = RMR.Node.ancestor(li, 'ul.rmr-drops').querySelectorAll(':scope > li');
        for (const i in lis) {
          if (! RMR.Object.has(lis, i) || lis[i].getAttribute('id') == li.getAttribute('id')) {
            continue;
          }
          hide(lis[i]);
        }
      },

      // force a dropdown to close
      hide = (target) => {
        target.classList.remove(OPEN_CLASS);
        target.classList.remove(SHOW_CLASS);
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
      if (! options.hover || MOBILE) {
        document.body.addEventListener('click', (e) => {
          const ul = RMR.Node.ancestor(e.target, 'ul.rmr-drops', false);
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
            // if the target is clicked and its dropdown is NOT open (or we're on mobile where there is no hover event)
            a.addEventListener('click', (e) => {
              const li = RMR.Node.ancestor(e.target, 'li', false);
              if (! li.classList.contains(OPEN_CLASS)) {
                e.preventDefault();
                on(e);
              }
            });
          }
        }

        // add listeners to target link
        if (a) {
          a.addEventListener('focus', on);
          a.addEventListener('blur', off);
        }
      }
    }
  };

  module.exports = Drops;

})();
