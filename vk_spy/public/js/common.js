'use strict';

$(".account-selector-menu").css("display", "block");
$(".nano").nanoScroller();
$(".account-selector-menu").css("display", "none");

var totalHeight = 0;
$("div.message-wrap").each(function(index){
  totalHeight += parseInt($(this).height(), 10);
});

if(totalHeight >= 666){
  $(".im-history").css("justify-content", "none");
  $(".im-history-wrapper .nano").nanoScroller({ scroll: 'bottom' });
} else {
  $(".im-history").css("justify-content", "flex-end");
}

var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));

elems.forEach(function(html) {
  var switchery = new Switchery(html, { size: "small", color: "#479" });
});


$(".friends").on("click", function(event){
  $(".friends li.selected").removeClass("selected");
  $(event.target).closest("li").addClass("selected");
});

$(".dialog-menu nav a.option").on("click", function(event){
  var inputList = $(event.target).children(".js-switch");
  if(inputList.length === 0)
    return;
  var input = inputList[0];
  input.checked = !input.checked;
  onChange(input);
});

function onChange(el) {
    if (typeof Event === 'function' || !document.fireEvent) {
        var event = document.createEvent('HTMLEvents');
        event.initEvent('change', true, true);
        el.dispatchEvent(event);
    } else {
        el.fireEvent('onchange');
    }
};

$(".account-selector-menu ul li a").on("click", function(event){
  $(".account-menu li.selected").removeClass("selected");
  $(event.target).closest("li").addClass("selected");
});

$("#openUserAccounts").on("click", function(event){
  if($("#openUserAccounts").hasClass("is-active")){
    $("#openUserAccounts").removeClass("is-active");
    $(".account-selector-menu").css("display", "none");
  } else {
    $("#openUserAccounts").addClass("is-active");
    $(".account-selector-menu").css("display", "block");
  }
});