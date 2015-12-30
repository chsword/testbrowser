'use strict';

const remote = require('electron').remote;

/**
 * HackBrowserWindow controls all activities related to a browser window
 *
 * @constructor
 */
function HackBrowserWindow() {
	var _this = this;

	/* ====================================
	 private member variables
	 ====================================== */
	var activeTabView;
	var createdTabViewCount;
	var openTabViewCount;
	var tabList;
	var menuBar;
	var addTabBtnEl;


	/* ====================================
	 private methods
	 ====================================== */
	var init = function() {
		// create a new MenuBar object associated with current browser window
		menuBar = new MenuBar(_this);
		createdTabViewCount = 0;
		openTabViewCount = 0;
		tabList = {};
		addTabBtnEl = document.getElementById("add-tab");

		_this.addNewTab("http://www.google.com/", true);

		attachEventHandlers();
	};

	var attachEventHandlers = function() {
		addTabBtnEl.addEventListener("click", function(e) {
			_this.addNewTab(null, true);

			e.preventDefault();
		});
	};


	/* ====================================
	 public methods
	 ====================================== */
	_this.navigateTo = function(url) {
		activeTabView.navigateTo(url);
	};

	_this.updateWindowTitle = function(title) {
		document.title = title;
	};

	_this.addNewTab = function(url, activate) {
		var newTabView = new TabView(_this, url);
		var newTabViewId = newTabView.getId();

		tabList[newTabViewId] = newTabView;

		if (activate === true) {
			_this.activateTabById(newTabViewId);
		}

		openTabViewCount++;
	};

	_this.activateTabById = function(tabViewId) {
		console.log("activateTabById(" + tabViewId + ")");

		if (activeTabView && (activeTabView.getId() === tabViewId)) {
			console.log("already active tab");
			return;
		}

		if(tabList.hasOwnProperty(tabViewId) === true) {
			if (activeTabView) {
				activeTabView.deactivate();
			}

			activeTabView = tabList[tabViewId];

			// activate new tab view
			activeTabView.activate();

			_this.updateWindowControls();
		}
	};


	_this.updateWindowControls = function() {
		// check if active webview is still loading
		// if webViewEl.canGoBack() or webViewEl.canGoForward() is called in menuBar.updateBtnStatus()
		// before <webview> element is loaded, an exception will be thrown
		if (activeTabView.isDOMReady() === true) {
			// update back/forward button status
			menuBar.updateBtnStatus(activeTabView.getWebViewEl());
		} else {
			menuBar.disableBackBtn();
			menuBar.disableForwardBtn();
		}

		_this.updateWindowTitle(activeTabView.getWebViewTitle());
		menuBar.updateUrl(activeTabView.getURL());
	};

	_this.getMenuBar = function() {
		return menuBar;
	};

	_this.getActiveTabView = function() {
		return activeTabView;
	};

	_this.increaseCreatedTabViewCount = function() {
		createdTabViewCount++;
	};

	_this.getCreatedTabViewCount = function() {
		return createdTabViewCount;
	};

	_this.goBack = function() {
		if ((activeTabView.isDOMReady() === true) && (activeTabView.getWebViewEl().canGoBack() === true)) {
			activeTabView.getWebViewEl().goBack();
		}
	};

	_this.goForward = function() {
		if ((activeTabView.isDOMReady() === true) && (activeTabView.getWebViewEl().canGoForward() === true)) {
			activeTabView.getWebViewEl().goForward();
		}
	};

	_this.reload = function() {
		activeTabView.getWebViewEl().reload();
	};

	/**
	 * remove specific TabView object from tabList object
	 * for garbage collection
	 *
	 * this method should be called when a tab is closed in the browser
	 *
	 * @param tabViewId
	 */
	_this.closeTabViewById = function(tabViewId, tabIndex) {
		delete tabList[tabViewId];

		openTabViewCount--;

		// if no tabs are open, close window
		if (openTabViewCount === 0) {
			var currentWindow = remote.getCurrentWindow();
			currentWindow.close();
		}
	};

	init();
}
