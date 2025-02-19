(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports)
  } else if (typeof define === 'function' && define.amd) {
    define('cookieManager', ['exports'], factory)
  } else {
    (factory((global.cookieManager = {})));
  }
}(this, (function (exports) {
  'use strict';

  const defaultOptions = {
    "delete-undefined-cookies": true,
    "user-preference-cookie-name": "cm-user-preferences",
    "user-preference-cookie-secure": false,
    "user-preference-cookie-expiry-days": 365,
    "preference-form-id": false,
    "cookie-banner-id": false,
    "cookie-banner-visible-on-page-with-preference-form": true,
    "cookie-banner-auto-hide": true,
    "cookie-manifest": []
  };

  let options = {};

  const init = function (custom_options) {
    options = defaultOptions;

    for (const item in custom_options) {
      options[item] = custom_options[item];
    }

    manageCookies();
    findAndBindPreferencesForm();
    findAndBindCookieBanner();

    if(!getUserPreferences() && window.dtrum){
      //window.dtrum.disableSessionReplay();
      window.dtrum.disable();
    }
  };

  const manageCookies = function () {

    const cm_cookie = options['user-preference-cookie-name'];
    const cm_user_preferences = getUserPreferences();

    const current_cookies = decodeURIComponent(document.cookie).split(';');

    // If there are no cookies set
    if (current_cookies.length === 1 && current_cookies[0].match(/^ *$/)) {
      return;
    }

    for (var i = 0; i < current_cookies.length; i++) {

      const cookie_name = current_cookies[i].split(/=(.*)/)[0].trim();

      // Skip, if cookie is user preferences cookie
      if (cookie_name === cm_cookie) {
        continue;
      }

      const cookie_category = getCookieCategoryFromManifest(cookie_name);

      if (cookie_category === false) {
        if (options['delete-undefined-cookies']) {
          deleteCookie(cookie_name);
        }

        continue;
      }

      if (cookie_category.optional === false) {
        continue;
      }

      if (!cm_user_preferences || cm_user_preferences.hasOwnProperty(cookie_category['category-name']) === false) {
        deleteCookie(cookie_name);
        continue;
      }

      if (cm_user_preferences[cookie_category['category-name']] === 'off' || cm_user_preferences[cookie_category['category-name']] === 'false') {
        deleteCookie(cookie_name);
      }
    }
  };

  const getUserPreferences = function () {

    const cookie = getCookie(options['user-preference-cookie-name']);

    if (!cookie) {
      return false;
    }

    try {
      return JSON.parse(cookie);
    } catch (e) {
      console.error(`Unable to parse user preference cookie "${cm_cookie}" as JSON.`, e);
      return false;
    }
  };

  const getCookieCategoryFromManifest = function (cookie_name) {

    const cookie_manifest = options['cookie-manifest'];

    for (var i = 0; i < cookie_manifest.length; i++) {
      const category_cookies = cookie_manifest[i]['cookies'];
      for (var x = 0; x < category_cookies.length; x++) {
        const cookie_prefix = category_cookies[x];
        if (cookie_name.startsWith(cookie_prefix)) {
          return cookie_manifest[i];
        }
      }
    }
    return false;
  };

  const getCookie = function (cookie_name) {
    const name = cookie_name + "=";
    const decoded_cookie = decodeURIComponent(document.cookie);
    const cookie_array = decoded_cookie.split(';');

    for (var i = 0; i < cookie_array.length; i++) {
      let cookie_part = cookie_array[i];
      while (cookie_part.charAt(0) === ' ') {
        cookie_part = cookie_part.substring(1);
      }
      if (cookie_part.indexOf(name) === 0) {
        return cookie_part.substring(name.length, cookie_part.length);
      }
    }
    return false;
  };

  const deleteCookie = function (cookie_name) {
    deleteCookieWithoutDomain(cookie_name);

    if (configOptionIsNotEmptyObject('domains')) {
      let dotHostname = "." + window.location.hostname;
      for (var i = 0; i < options['domains'].length; i++) {
        if (dotHostname.indexOf(options['domains'][i]) >= 0) {
          deleteCookieFromDomain(cookie_name, options['domains'][i]);
        }
      }
    } else {
      deleteCookieFromCurrentAndUpperDomain(cookie_name);
    }

    if (localStorage) {
      localStorage.removeItem(cookie_name);
    }

    if (sessionStorage) {
      sessionStorage.removeItem(cookie_name);
    }
  };

  const deleteCookieWithoutDomain = function (cookie_name) {
    document.cookie = cookie_name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
  };

  const deleteCookieFromCurrentAndUpperDomain = function (cookie_name) {
    let hostname = window.location.hostname;
    let dotHostname = "." + hostname;
    document.cookie = cookie_name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=' + hostname + ';path=/;';
    document.cookie = cookie_name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=' + dotHostname + ';path=/;';

    let firstDot = hostname.indexOf('.');
    let upperDomain = hostname.substring(firstDot);
    let dotUpperDomain = "." + upperDomain;
    document.cookie = cookie_name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=' + upperDomain + ';path=/;';
    document.cookie = cookie_name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=' + dotUpperDomain + ';path=/;';
  };

  const deleteCookieFromDomain = function (cookie_name, domain) {
    let dotDomain = "." + domain;
    document.cookie = cookie_name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=' + domain + ';path=/;';
    document.cookie = cookie_name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=' + dotDomain + ';path=/;';
  };


  const setCookie = function (cookie_value) {

    const cookie_name = options['user-preference-cookie-name'];

    let cookie_secure = configOptionIsTrue('user-preference-cookie-secure');

    let cookie_expiry_days = 365;
    if (configOptionIsNumeric('user-preference-cookie-expiry-days')) {
      cookie_expiry_days = options['user-preference-cookie-expiry-days'];
    }

    const date = new Date();
    date.setTime(date.getTime() + (cookie_expiry_days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    let cookie_raw = cookie_name + "=" + encodeURIComponent(cookie_value) + ";" + expires + ";path=/";
    if (cookie_secure) {
      cookie_raw += ";secure";
    }
    document.cookie = cookie_raw;
  };

  const findAndBindPreferencesForm = function () {

    if (!configOptionIsString('preference-form-id')
    ) {
      return;
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        findAndBindPreferencesForm();
      });
      return;
    }

    const theForm = getForm();
    if (theForm === null) {
      return;
    }
    theForm.addEventListener('submit', function (e) {
      savePreferencesFromForm(e);
      manageCookies();
      checkShouldCookieBannerBeVisible();
    });
    setPreferencesInForm();
  };

  const getForm = function () {
    return document.getElementById(options["preference-form-id"]);
  };

  const setPreferencesInForm = function () {
    if (configOptionIsFalse('set-checkboxes-in-preference-form')) {
      return;
    }

    const theForm = getForm();
    if (theForm === null) {
      return;
    }
    const userPreferences = getUserPreferences();

    for (const category in userPreferences) {
      let checkBoxes = theForm.querySelectorAll('input[name="' + category + '"]');
      for (let n = 0; n < checkBoxes.length; n++) {
        if (userPreferences.hasOwnProperty(category)) {
          checkBoxes[n].checked = checkBoxes[n].value === userPreferences[category];
        }
      }
    }
  };

  const savePreferencesFromForm = function (event) {
    event.preventDefault();

    const theForm = document.getElementById(options["preference-form-id"]);
    const radioInputs = theForm.querySelectorAll('input[type="radio"]:checked');

    const categories = {};

    for (var i = 0; i < radioInputs.length; i++) {
      const node = radioInputs.item(i);
      categories[node.getAttribute('name')] = node.getAttribute('value');
    }

    savePreferences(categories);

    const savedCallback = options['preference-form-saved-callback'];
    if (savedCallback !== false && typeof savedCallback === 'function') {
      savedCallback(getUserPreferences());
    }
  };

  const savePreferencesFromCookieBanner = function (decision) {
    const categories = {};

    for (var i = 0; i < options['cookie-manifest'].length; i++) {
      const category = options['cookie-manifest'][i];
      if (category.optional) {
        categories[category['category-name']] = decision === 'accept' ? 'on' : 'off';
      }
    }

    savePreferences(categories);

    const savedCallback = options['cookie-banner-saved-callback'];
    let decisionCallback;

    if (decision === 'accept') {
      decisionCallback = options['cookie-banner-accept-callback'];
    } else if (decision === 'reject') {
      decisionCallback = options['cookie-banner-reject-callback'];
    }

    if (decisionCallback !== false && typeof decisionCallback === 'function') {
      decisionCallback();
    }

    if (savedCallback !== false && typeof savedCallback === 'function') {
      savedCallback(getUserPreferences());
    }

    manageCookies();
  }

  const savePreferences = function (user_cookie_preferences) {
    setCookie(JSON.stringify(user_cookie_preferences));

    const preferenceSavedCallback = options['user-preference-saved-callback'];
    if (preferenceSavedCallback !== false && typeof preferenceSavedCallback === 'function') {
      preferenceSavedCallback(getUserPreferences());
    }
  };

  const addBannerButtonListeners = function () {
    const cookieBanner = document.getElementById(options['cookie-banner-id']);
    const buttons = cookieBanner.querySelectorAll('button');

    buttons.forEach(button => {
      if (button.hasAttribute('data-cm-action')) {
        button.addEventListener('click', (e) => {
          e.preventDefault();

          const type = button.getAttribute('data-cm-action');

          switch (type) {
            case 'accept':
              savePreferencesFromCookieBanner(type)
              break;
            case 'reject':
              savePreferencesFromCookieBanner(type)
              break;
            case 'hide':
              cookieBanner.hidden = true;
              break;
          }

          if (options['cookie-banner-auto-hide'] === true) {
            cookieBanner.hidden = true;
          }
        })
      }
    })
  }

  const findAndBindCookieBanner = function () {
    if (!configOptionIsString('cookie-banner-id')) {
      return;
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        findAndBindCookieBanner();
      });
      return;
    }

    const cookieBanner = document.getElementById(options['cookie-banner-id']);

    if (cookieBanner !== null) {
      checkShouldCookieBannerBeVisible();
      addBannerButtonListeners();
    }
  };

  const checkShouldCookieBannerBeVisible = function () {
    const cookieBanner = document.getElementById(options['cookie-banner-id']);
    if (cookieBanner === null) {
      return;
    }

    const userPreferenceForm = document.getElementById(options['preference-form-id']);
    const visibleOnPreferencePage = options['cookie-banner-visible-on-page-with-preference-form'];

    if (getUserPreferences()) {
      cookieBanner.hidden = true;
    } else if (userPreferenceForm !== null && visibleOnPreferencePage === false) {
      cookieBanner.hidden = true;
    } else {
      cookieBanner.hidden = false;
    }
  };

  const configOptionIsTrue = function (optionName) {
    return options.hasOwnProperty(optionName) && options[optionName] === true;
  };

  const configOptionIsFalse = function (optionName) {
    if (options.hasOwnProperty(optionName)) {
      return options[optionName] === false;
    }
    return true;
  };

  const configOptionIsNumeric = function (optionName) {
    return options.hasOwnProperty(optionName)
      && !isNaN(options[optionName]);
  };

  const configOptionIsString = function (optionName) {
    return options.hasOwnProperty(optionName)
      && typeof options[optionName] === 'string'
      && options[optionName].trim() !== '';
  };

  const configOptionIsNotEmptyObject = function (optionName) {
    return options.hasOwnProperty(optionName)
      && typeof options[optionName] === 'object'
      && options[optionName].length > 0;
  };

  exports.init = init;

})));
