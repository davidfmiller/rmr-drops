/* global document,window,module,console, require */


/*
 * drops
 * © 2020 David Miller
 * https://readmeansrun.com
 */

(() => {

  'use strict';

  const
  RMR = require('rmr-util'),

//  MOBILE = RMR.Browser.isTouch(),

  OPEN_CLASS = 'rmr-open';

  const Drops = function(options) {

    if (! parseInt(options.delay, 10)) {
      options.delay = 0;
    }
    options.offset = parseInt(options.offset, 10) ? parseInt(options.offset, 10) : 0;

    const
      uls = document.querySelectorAll('ul.rmr-drops'),
      timeouts = {},
      on = (e) => {
        const li = RMR.Node.ancestor(e.target, 'li', true);
        if (RMR.Object.has(timeouts, li.getAttribute('id'))) {
          window.clearTimeout(timeouts[li.getAttribute('id')]);
          delete timeouts[li.getAttribute('id')];
        }
        li.classList.add(OPEN_CLASS);

        const
          drop = li.querySelector(':scope dd'),
          target = li.querySelector(':scope dt'),
          origin = RMR.Node.getRect(target),
          dtStyle = window.getComputedStyle(target);
        let
          rect = RMR.Node.getRect(drop);

        if (options.offset) {
          drop.style.top = target.height + options.offset + 'px';
          rect = RMR.Node.getRect(drop);
        }

        if (options.center) {
          const left = parseInt(origin.width / 2 - rect.width / 2);
          drop.style.left = left + 'px';
        }

        if (rect.bottom > window.innerHeight) {
          drop.style.top = 0 - rect.height + 'px';
        }

        const lis = RMR.Node.ancestor(li, 'ul.rmr-drops').querySelectorAll(':scope > li');
        for (const i in lis) {
          if (! RMR.Object.has(lis, i) || lis[i].getAttribute('id') == li.getAttribute('id')) {
            continue;
          }
          hide(lis[i]);
        }
      },
      hide = (target) => {
        target.classList.remove(OPEN_CLASS);
        delete timeouts[target.getAttribute('id')];
      },
      off = (e) => {
        const li = RMR.Node.ancestor(e.target, 'li', true);
        timeouts[li.getAttribute('id')] = window.setTimeout(() => {
          hide(li);
        }, options.delay);
      };

    // init

    for (const i in uls) {
      if (! RMR.Object.has(uls, i)) { continue; }
      const
        ul = uls[i],
        lis = ul.querySelectorAll(':scope > li');

      for (const j in lis) {
        if (! RMR.Object.has(lis, j)) { continue; }
        const li = lis[j];

        // ensure li has unique id
        if (! li.getAttribute('id')) {
          li.setAttribute('id', RMR.String.guid());
        }

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
        li.addEventListener('mouseenter', on);
        li.addEventListener('mouseleave', off);
        if (a) {
          a.addEventListener('focus', on);
          a.addEventListener('blur', off);

          a.addEventListener('click', (e) => {
            if (! RMR.Node.ancestor(e.target.parentNode.parentNode, 'li', false).classList.contains(OPEN_CLASS)) {
              console.log('nope');
              e.preventDefault();
            }
            // proceed
          })

        }
      }
    }
  };

  module.exports = Drops;

})();
