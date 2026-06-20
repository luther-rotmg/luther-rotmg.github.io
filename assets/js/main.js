import { initPalette } from "./palette.js";
import { initContact } from "./contact.js";
import { initDemo } from "./demo.js";

(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // nav hairline on scroll
  var nav = document.getElementById('nav');
  function onScroll(){ nav.classList.toggle('scrolled', window.scrollY > 12); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // one-shot scroll reveal — position-based so fast scrolls never strand hidden content
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if(reduce){
    reveals.forEach(function(r){ r.classList.add('in'); });
  } else {
    var ticking = false;
    function check(){
      var vh = window.innerHeight || document.documentElement.clientHeight;
      reveals = reveals.filter(function(r){
        if(r.getBoundingClientRect().top < vh * 0.92){ r.classList.add('in'); return false; }
        return true;
      });
      ticking = false;
    }
    function onReveal(){ if(!ticking){ ticking = true; requestAnimationFrame(check); } }
    window.addEventListener('scroll', onReveal, {passive:true});
    window.addEventListener('resize', onReveal);
    check();
  }
})();

const demoRoot = document.querySelector("[data-demo]");
if (demoRoot) initDemo(demoRoot);

const cf = document.querySelector(".contact-form");
if (cf) initContact(cf);

initPalette();
