/* global $, Prism */
$(document).ready(function() {

  // Check for click events on the navbar burger icon
  $(".navbar-burger").click(function() {
    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
  });
});

!function(){if("undefined"!=typeof self&&self.Prism||"undefined"!=typeof global&&global.Prism){var n=function(n){return n},s={classMap:n,prefixString:""};Prism.plugins.customClass={map:function(i){s.classMap="function"==typeof i?i:function(n){return i[n]||n}},prefix:function(n){s.prefixString=n}},Prism.hooks.add("wrap",function(i){(s.classMap!==n||s.prefixString)&&(i.classes=i.classes.map(function(n){return s.prefixString+s.classMap(n,i.language)}))})}}();

Prism.plugins.customClass.map({
  tag: 'node'
});
