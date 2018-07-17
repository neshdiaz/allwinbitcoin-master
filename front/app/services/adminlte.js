import Ember from 'ember';

const {
  Service,
  $
} = Ember;

export default Service.extend({
  navbarMenuSlimscroll: true,
  navbarMenuSlimscrollWidth: '3px', //The width of the scroll bar
  navbarMenuHeight: '200px', //The height of the inner menu
  //General animation speed for JS animated elements such as box collapse/expand and
  //sidebar treeview slide up/down. This options accepts an integer as milliseconds,
  //'fast', 'normal', or 'slow'
  animationSpeed: 500,
  //Sidebar push menu toggle button selector
  sidebarToggleSelector: '[data-toggle="offcanvas"]',
  //Activate sidebar push menu
  sidebarPushMenu: true,
  //Activate sidebar slimscroll if the fixed layout is set (requires SlimScroll Plugin)
  sidebarSlimScroll: true,
  //Enable sidebar expand on hover effect for sidebar mini
  //This option is forced to true if both the fixed layout and sidebar mini
  //are used together
  sidebarExpandOnHover: false,
  //BoxRefresh Plugin
  enableBoxRefresh: true,
  //Bootstrap.js tooltip
  enableBSToppltip: true,
  BSTooltipSelector: '[data-toggle="tooltip"]',
  //Enable Fast Click. Fastclick.js creates a more
  //native touch experience with touch devices. If you
  //choose to enable the plugin, make sure you load the script
  //before AdminLTE's app.js
  enableFastclick: false,
  //Control Sidebar Tree views
  enableControlTreeView: true,
  //Control Sidebar Options
  enableControlSidebar: true,
  controlSidebarOptions: {
    //Which button should trigger the open/close event
    toggleBtnSelector: '[data-toggle="control-sidebar"]',
    //The sidebar selector
    selector: '.control-sidebar',
    //Enable slide over content
    slide: true
  },
  //Box Widget Plugin. Enable this plugin
  //to allow boxes to be collapsed and/or removed
  enableBoxWidget: true,
  //Box Widget plugin options
  boxWidgetOptions: {
    boxWidgetIcons: {
      //Collapse icon
      collapse: 'fa-minus',
      //Open icon
      open: 'fa-plus',
      //Remove icon
      remove: 'fa-times'
    },
    boxWidgetSelectors: {
      //Remove button selector
      remove: '[data-widget="remove"]',
      //Collapse button selector
      collapse: '[data-widget="collapse"]'
    }
  },
  //Direct Chat plugin options
  directChat: {
    //Enable direct chat by default
    enable: true,
    //The button to open and close the chat contacts pane
    contactToggleSelector: '[data-widget="chat-pane-toggle"]'
  },
  //Define the set of colors to use globally around the website
  colors: {
    lightBlue: '#3c8dbc',
    red: '#f56954',
    green: '#00a65a',
    aqua: '#00c0ef',
    yellow: '#f39c12',
    blue: '#0073b7',
    navy: '#001F3F',
    teal: '#39CCCC',
    olive: '#3D9970',
    lime: '#01FF70',
    orange: '#FF851B',
    fuchsia: '#F012BE',
    purple: '#8E24AA',
    maroon: '#D81B60',
    black: '#222222',
    gray: '#d2d6de'
  },
  //The standard screen sizes that bootstrap uses.
  //If you change these in the variables.less file, change
  //them here too.
  screenSizes: {
    xs: 480,
    sm: 768,
    md: 992,
    lg: 1200
  },

  init() {
    Ember.$('body').removeClass('hold-transition');
    this.activate();
    this.pushMenuActivate();
  },

  pushMenuActivate() {
    const toggleBtn = this.get('sidebarToggleSelector');
    const screenSizes = this.get('screenSizes');

    //Enable sidebar toggle
    $(document).on('click', toggleBtn, function (e) {
      e.preventDefault();

      //Enable sidebar push menu
      if ($(window).width() > (screenSizes.sm - 1)) {
        if ($('body').hasClass('sidebar-collapse')) {
          $('body').removeClass('sidebar-collapse').trigger('expanded.pushMenu');
        } else {
          $('body').addClass('sidebar-collapse').trigger('collapsed.pushMenu');
        }
      }
      //Handle sidebar push menu for small screens
      else {
        if ($('body').hasClass('sidebar-open')) {
          $('body').removeClass('sidebar-open').removeClass('sidebar-collapse')
            .trigger('collapsed.pushMenu');
        } else {
          $('body').addClass('sidebar-open').trigger('expanded.pushMenu');
        }
      }
    });

    $('.content-wrapper').click(function () {
      //Enable hide menu when clicking on the content-wrapper on small screens
      if ($(window).width() <= (screenSizes.sm - 1) && $("body").hasClass("sidebar-open")) {
        $("body").removeClass('sidebar-open');
      }
    });

    //Enable expand on hover for sidebar mini
    if (this.get('sidebarExpandOnHover') ||
      ($('body').hasClass('fixed') &&
      $('body').hasClass('sidebar-mini'))) {

      this.pushMenuExpandOnHover();
    }
  },

  pushMenuExpand: function () {
    $("body").removeClass('sidebar-collapse').addClass('sidebar-expanded-on-hover');
  },

  pushMenuCollapse: function () {
    if ($('body').hasClass('sidebar-expanded-on-hover')) {
      $('body').removeClass('sidebar-expanded-on-hover').addClass('sidebar-collapse');
    }
  },

  pushMenuExpandOnHover() {
    const screenWidth = this.get('screenSizes.sm') - 1;

    //Expand sidebar on hover
    $('.main-sidebar').hover(() => {
      if ($('body').hasClass('sidebar-mini') &&
        $("body").hasClass('sidebar-collapse') &&
        $(window).width() > screenWidth) {

        this.pushMenuExpand();
      }
    }, () => {
      if ($('body').hasClass('sidebar-mini') &&
        $('body').hasClass('sidebar-expanded-on-hover') &&
        $(window).width() > screenWidth) {

        this.pushMenuCollapse();
      }
    });
  },

  fix() {
    $('.layout-boxed > .wrapper').css('overflow', 'hidden');

    //Get window height and the wrapper height
    var footer_height = $('.main-footer').outerHeight() || 0;
    var neg = $('.main-header').outerHeight() + footer_height;
    var window_height = $(window).height();
    var sidebar_height = $('.sidebar').height() || 0;

    //Set the min-height of the content and sidebar based on the
    //the height of the document.
    if ($('body').hasClass('fixed')) {
      $('.content-wrapper, .right-side').css('min-height', window_height - footer_height);
    }
    else {
      var postSetWidth;
      if (window_height >= sidebar_height) {
        $('.content-wrapper, .right-side').css('min-height', window_height - neg);
        postSetWidth = window_height - neg;
      } else {
        $('.content-wrapper, .right-side').css('min-height', sidebar_height);
        postSetWidth = sidebar_height;
      }

      //Fix for the control sidebar height
      var controlSidebar = $(this.get('controlSidebarOptions.selector'));
      if (typeof controlSidebar !== 'undefined') {
        if (controlSidebar.height() > postSetWidth) {
          $('.content-wrapper, .right-side').css('min-height', controlSidebar.height());
        }
      }
    }
  },

  fixSidebar() {
    //Make sure the body tag has the .fixed class
    if (!$('body').hasClass('fixed')) {
      if (typeof $.fn.slimScroll !== 'undefined') {
        $('.sidebar').slimScroll({ destroy: true }).height('auto');
      }
      return;
    }
    else if (typeof $.fn.slimScroll === 'undefined' && window.console) {
      window.console.error('Error: the fixed layout requires the slimscroll plugin!');
    }
    //Enable slimscroll for fixed layout
    if (this.get('sidebarSlimScroll')) {
      if (typeof $.fn.slimScroll !== 'undefined') {
        //Destroy if it exists
        $('.sidebar').slimScroll({ destroy: true }).height('auto');
        //Add slimscroll
        $('.sidebar').slimScroll({
          height: ($(window).height() - $('.main-header').height()) + 'px',
          color: 'rgba(0,0,0,0.2)',
          size: '3px'
        });
      }
    }
  },

  activate() {
    this.fix();
    this.fixSidebar();

    $('body, html, .wrapper').css('height', 'auto');

    $(window, '.wrapper').resize(() => {
      this.fix();
      this.fixSidebar();
    });
  }
});
