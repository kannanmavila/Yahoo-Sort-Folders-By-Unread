// ==UserScript==
// @name         Yahoo! Mail (New) - Sort By Unread
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Sort folders in Yahoo! mail by no. of unread messages
// @author       You
// @match        https://mail.yahoo.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const REPEAT_EVERY = 30000; // 0 for no repeat
    const CUE = '[data-test-id="custom-folder-list"]'; // Script will be executed once CUE appears

    // The actual stuff
    function doStuff() {
        let nList = document.querySelector('[data-test-id="custom-folder-list"] ul')
        let folders = Array.prototype.slice.call(nList.getElementsByTagName('li'))
        const favorites = ['temp']
        const favorite_marker = '⭐ '

        function isFavorite(folder) {
            return favorites.includes(folder.querySelector('[role="heading"]').innerText.toLowerCase().replace('⭐', ''))
        }

        function unreadCount(folder) {
            // displayed-count may or may not exist
            return (folder.querySelector('[data-test-id="displayed-count"]') || {}).innerText || 0
        }

        function starFolder(folder) {
            const folderName = folder.querySelector('[role="heading"]').innerText
            if (folderName.startsWith(favorite_marker)) return
            folder.querySelector('[role="heading"]').innerText = favorite_marker + folderName
        }

        // Remove all folders from the list
        while (nList.lastChild) { nList.removeChild(nList.lastChild); }

        // Sort according to no. of unread emails in a folder and favorites
        folders.sort(function (a, b) {
            const aUnread = unreadCount(a)
            const bUnread = unreadCount(b)
            if (isFavorite(a)) return -1
            if (bUnread > aUnread || isFavorite(b)) return 1
            if (aUnread > bUnread) return -1
            return 0
        })

        // Add the folders back, in the sorted order
        // Also add a '⭐' to the favorite folders
        folders.forEach(function (f) {
            if(isFavorite(f)) starFolder(f)
            nList.append(f)
        })
    }

    let waitTillLoad = setInterval(function() {
        if (document.querySelectorAll(CUE).length) {
            clearInterval(waitTillLoad);
            doStuff();
            if (REPEAT_EVERY) setInterval(doStuff, REPEAT_EVERY);
        }
    }, 500); // check every 500ms
})();
