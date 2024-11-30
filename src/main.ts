/**
 * COPYRIGHT 2023 Micah De Silva
 */

import QRCode from 'qrcode';

// Interface for Role data
interface Role {
    name: string;
    description: string;
    iconPath: string;
    roleType: string;
    gist: string;
    encoding: string;
}

const tb = ["Chef","Empath","Fortune Teller","Investigator","Librarian","Mayor","Monk","Ravenkeeper","Slayer","Soldier","Undertaker","Virgin","Washerwoman","Butler","Drunk","Recluse","Saint","Baron","Poisoner","Scarlet Woman","Spy","Imp"]

let filteredRoles = []

function getRolesFromQueryString(): string[] {
    const params = new URLSearchParams(window.location.search);
    const rolesParam = params.get('roles');

    if (!rolesParam) {
        return [];
    }

    // Split the rolesParam based on the encoding pattern
    return rolesParam.match(/[A-Z][a-z]*/g) || [];
}

// Function to create a role button
function createRoleButton(role: Role): HTMLDivElement {
    const button = document.createElement('div');
    button.className = 'role-button';
    button.innerHTML = `
        <img src="${role.iconPath}" alt="${role.name} Icon">
        <p>${role.name}</p>
        <p class="role-gist">${role.gist}</p>  <!-- Add gist here -->
    `;
    button.onclick = () => showPopup(role);
    return button;
}

// Function to show the popup
function showPopup(role: Role): void {
    const popup = document.getElementById('popup') as HTMLDivElement;
    const popupIcon = document.getElementById('popupIcon') as HTMLImageElement;
    const popupTitle = document.getElementById('popupTitle') as HTMLHeadingElement;
    const popupDescription = document.getElementById('popupDescription') as HTMLParagraphElement;

    popupIcon.src = role.iconPath;
    popupTitle.textContent = role.name;
    popupDescription.textContent = role.description;

    popup.style.display = 'block';

    popup.addEventListener('click', function(event) {
        // Check if the clicked target is the modal itself, not its children
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });
}

// Function to close the popup
function closePopup(): void {
    const popup = document.getElementById('popup') as HTMLDivElement;
    popup.style.display = 'none';
}

// Function to fetch roles from the JSON file
async function fetchRoles(): Promise<Role[]> {
    const response = await fetch('res/roles.json');
    return response.json();
}

document.getElementById('viewOrderButton')?.addEventListener('click', () => {
    fetch('res/nightsheet.json')
        .then(response => response.json())
        .then(data => displayNightOrder(data));
    showModal();
});

function displayNightOrder(nightData: any): void {
    let selectedRoles = Array.from(filteredRoles,role => role.name);

    selectedRoles.push("DAWN", "MINION INFO", "DEMON INFO", "DUSK");

    const firstNightOrder = nightData.firstNight.filter(role => selectedRoles.includes(role));
    const otherNightOrder = nightData.otherNight.filter(role => selectedRoles.includes(role));

    updateOrderList('firstNightOrder', firstNightOrder);
    updateOrderList('otherNightOrder', otherNightOrder);

    document.getElementById('nightOrderModal')!.style.display = 'block';
}

function updateOrderList(listId: string, order: string[]): void {
    const listElement = document.getElementById(listId) as HTMLUListElement;
    listElement.innerHTML = ''; // Clear existing list
    order.forEach(role => {
        let listItem = document.createElement("div");
        if(role == "DAWN" || role == "MINION INFO" || role == "DEMON INFO" || role == "DUSK"){
            listItem.textContent = role;
        } else {
            var checkBox = document.createElement('input') as HTMLInputElement;
            checkBox.type = "checkbox";
            checkBox.setAttribute("id", role);
            checkBox.value = role;
            let label = document.createElement("label");
            label.setAttribute("for", role);
            label.textContent = role;
            listItem.append(checkBox);
            listItem.append(label);
        }
        listElement.appendChild(listItem);
    });
}

function showModal(): void {
    const modal = document.getElementById('nightOrderModal')!;
    modal.style.display = 'block';

    modal.addEventListener('click', function(event) {
        // Check if the clicked target is the modal itself, not its children
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

document.getElementById('rules')?.addEventListener('click', () => {
    showRules();
});

function showRules(): void {
    const modal = document.getElementById('rulesModal')!;
    modal.style.display = 'block';

    modal.addEventListener('click', function(event) {
        // Check if the clicked target is the modal itself, not its children
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

document.getElementById('roleCounts')?.addEventListener('click', () => {
    showRoleCounts();
});

function showRoleCounts(): void {
    const modal = document.getElementById('roleCountsModal')!;
    modal.style.display = 'block';

    modal.addEventListener('click', function(event) {
        // Check if the clicked target is the modal itself, not its children
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

async function init(): Promise<void> {
    const roles = await fetchRoles();
    const encodedSelectedRoles = getRolesFromQueryString();

    var opts = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.3,
        margin: 1,
        color: {
          dark:"#636877FF",
          light:"#1B2021FF"
        }
      }
      
      let scriptUrl = document.URL;
      QRCode.toDataURL(scriptUrl, opts, function (err, url) {
        if (err) throw err
      
        var img = document.getElementById('qrcode') as HTMLImageElement;
        img.src = url;
      })

    // Create a mapping of encodings to role names
    const roleDecodings = roles.reduce((acc, role) => {
        acc[role.encoding] = role.name;
        return acc;
    }, {});

    const selectedRoles = encodedSelectedRoles.map(encoding => roleDecodings[encoding]);

    filteredRoles = roles.filter(role => selectedRoles.includes(role.name)
    );

    if (filteredRoles.length === 0 || selectedRoles.length === 0) {
        filteredRoles = roles.filter(role => tb.includes(role.name));
    }

    const townsfolkContainer = document.getElementById('townsfolkContainer') as HTMLDivElement;
    const outsidersContainer = document.getElementById('outsidersContainer') as HTMLDivElement;
    const minionsContainer = document.getElementById('minionsContainer') as HTMLDivElement;
    const demonsContainer = document.getElementById('demonsContainer') as HTMLDivElement;

    filteredRoles.forEach(role => {
        const roleButton = createRoleButton(role);
        switch (role.roleType) {
            case 'townsfolk':
                townsfolkContainer.appendChild(roleButton);
                break;
            case 'outsider':
                outsidersContainer.appendChild(roleButton);
                break;
            case 'minion':
                minionsContainer.appendChild(roleButton);
                break;
            case 'demon':
                demonsContainer.appendChild(roleButton);
                break;
        }
    });
}

init();

// SCRIPT NAME TO PAGE TITLE
function getPageNameFromQueryString(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    if(!urlParams.get('roles')){
        return "Trouble Brewing";
    }
    return urlParams.get('name');
}

function setDocumentTitle(): void {
    const pageName = getPageNameFromQueryString();
    if (pageName) {
        document.title = `${pageName} - BotC Script Viewer`;
    } else {
        document.title = `Unnamed Script - BotC Script Viewer`;
    }
}

setDocumentTitle();