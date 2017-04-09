"use strict";

(function(){

console.log("menu-button.js loaded");

var toggles = document.querySelectorAll(".c-hamburger");

for (var i = toggles.length - 1; i >= 0; i--) {
  var toggle = toggles[i];
  toggleHandler(toggle);
};

function toggleHandler(toggle) {
  toggle.addEventListener( "click", function(e) {
    e.preventDefault();

    var menuColor = "#58a";
    var darkMenuColor = "#479";

    var hideMenuHandler = function(element){
      element.classList.remove("is-active");
      $(".dialog-menu nav").css("display", "none");
    };

    var openMenuHandler = function(element){
      element.classList.add("is-active");
      $(".dialog-menu nav").css("display", "block");
    };

    (this.classList.contains("is-active") === true) ? hideMenuHandler(this): openMenuHandler(this);
  });
}

})();