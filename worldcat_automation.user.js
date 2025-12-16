// ==UserScript==
// @name         WorldCat Auto Add to List – Text-contains (EN, 2024)
// @namespace    http://tampermonkey.net/
// @version      5.1
// @match        https://search.worldcat.org/de/search*
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    let listName = localStorage.getItem("wc_list_name");
    if (!listName) {
        listName = prompt("Enter the visible name of the list (e.g. RCII):");
        localStorage.setItem("wc_list_name", listName);
    }

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    async function findDialog() {
        for (let i = 0; i < 50; i++) {
            const dialogs = [...document.querySelectorAll("div[role='dialog']")];
            const match = dialogs.find(d => d.innerText.includes("Medium zu einer Liste hinzufügen"));
            if (match) return match;
            await sleep(200);
        }
        return null;
    }

    async function processPage() {

        let saveButtons = [...document.querySelectorAll("button[data-testid^='add-list']")];
        console.log("Found save buttons:", saveButtons.length);

        for (let i = 0; i < saveButtons.length; i++) {

            console.log(`→ Processing title ${i + 1} of ${saveButtons.length}`);

            saveButtons[i].click();
            await sleep(700);

            const dialog = await findDialog();
            if (!dialog) {
                console.warn("No dialog found, skipping title.");
                continue;
            }

            // Search for button by visible text (contains list name)
            const listButton = [...dialog.querySelectorAll("button")]
                .find(b => b.textContent.replace(/\s+/g, ' ').includes(listName));

            if (!listButton) {
                alert(`The list "${listName}" was NOT found in the dialog.\n\nPlease check spelling or use a more distinctive part of the name.`);
                return;
            }

            listButton.click();
            await sleep(500);

            const addBtn = dialog.querySelector("button[data-testid='add-item-dialog-add-button']");
            if (addBtn) addBtn.click();

            await sleep(900);
        }

        const nextBtn = document.querySelector("button[aria-label='Go to next page']");
        if (nextBtn) {
            console.log("→ Moving to the next page...");
            nextBtn.click();
            await sleep(2500);
            processPage();
        } else {
            alert("DONE – all pages processed.");
        }
    }

    setTimeout(processPage, 1500);

})();
