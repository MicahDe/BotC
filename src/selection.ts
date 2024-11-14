/**
 * COPYRIGHT 2023 Micah De Silva
 */

 // Interface for Role data
interface Role {
    name: string;
    description: string;
    iconPath: string;
    roleType: string;
    gist: string;
    encoding: string;
}

// Function to show the popup
function showPopupSP(role: Role): void {
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
function closePopupSP(): void {
    const popup = document.getElementById('popup') as HTMLDivElement;
    popup.style.display = 'none';
}

// Function to fetch roles from the JSON file
async function fetchRolesForSelectionPage(): Promise<Role[]> {
    const response = await fetch('res/roles.json');
    return response.json();
}

function modifyCount(divId: string, amount: number) {

    const element = document.getElementById(divId) as HTMLDivElement;
    let currentValue = Number(element.textContent.split("(")[1].split(")")[0]);

    element.textContent = element.textContent.split("(")[0] + "(" + (currentValue + amount) + ")";
}

// Function to create a checkbox for each role
function createRoleCheckbox(role: Role): HTMLDivElement {
    const roleBox = document.createElement('div');
    roleBox.className = 'role-box';
    roleBox.setAttribute('data-encoding', role.encoding); // Set the data-encoding attribute

    const icon = document.createElement('img');
    icon.src = role.iconPath;
    icon.alt = `${role.name} Icon`;
    icon.className = 'role-icon';

    const roleName = document.createElement('p');
    roleName.textContent = role.name;
    roleName.className = 'role-name';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = role.name;
    checkbox.name = role.name;
    checkbox.value = role.name;
    checkbox.className = 'role-checkbox';

    const selectionArea = document.createElement('div');
    selectionArea.className = 'selection-area';
    selectionArea.textContent = '+'; // Indicate this area is for selection

    checkbox.addEventListener('change', function() {
        if (this.checked) {
            roleBox.classList.add('selected');
            selectionArea.textContent = '';
            switch (role.roleType) {
                case 'townsfolk':
                    modifyCount('townsfolk-title', 1);
                    break;
                case 'outsider':
                    modifyCount('outsiders-title', 1);
                    break;
                case 'minion':
                    modifyCount('minions-title', 1);
                    break;
                case 'demon':
                    modifyCount('demons-title', 1);
                    break;
            }
        } else {
            roleBox.classList.remove('selected');
            selectionArea.textContent = '+';
            switch (role.roleType) {
                case 'townsfolk':
                    modifyCount('townsfolk-title', -1);
                    break;
                case 'outsider':
                    modifyCount('outsiders-title', -1);
                    break;
                case 'minion':
                    modifyCount('minions-title', -1);
                    break;
                case 'demon':
                    modifyCount('demons-title', -1);
                    break;
            }
        }
    });

    const gist = document.createElement('p');
    gist.textContent = role.gist;
    gist.className = 'role-gist';


    roleBox.appendChild(icon);
    roleBox.appendChild(roleName);
    roleBox.appendChild(gist);
    roleBox.appendChild(checkbox);
    roleBox.appendChild(selectionArea);


    // Event listener for checkbox
    selectionArea.addEventListener('click', function() {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
    });

    // Show description popup when the rest of the box is clicked
    roleBox.addEventListener('click', function(event) {
        if (event.target !== checkbox && event.target !== selectionArea) {
            showPopupSP(role);
        }
    });


    return roleBox;
}

// Function to generate the URL
function generateUrl(): void {
    const selectedRoles = Array.from(document.querySelectorAll('.role-checkbox:checked'))
                              .map(input => {
                                  // Assuming the data-encoding is set on the parent div of the checkbox
                                  return input.closest('.role-box').getAttribute('data-encoding');
                              });
    const scriptName = (document.getElementById('scriptName') as HTMLInputElement).value.trim();

    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace('selection', 'script');
    url.searchParams.set('roles', selectedRoles.join(''));
    if (scriptName) {
        url.searchParams.set('name', scriptName);
    }

    const urlContainer = document.getElementById('urlContainer') as HTMLDivElement;
    const generatedUrlInput = document.getElementById('generatedUrl') as HTMLInputElement;
    generatedUrlInput.value = url.toString();
}


// Function to copy the URL to the clipboard
function copyToClipboard(): void {
    const generatedUrlInput = document.getElementById('generatedUrl') as HTMLInputElement;
    generatedUrlInput.select();
    document.execCommand('copy');
}

// Function to launch the URL in a new tab
function launchUrl(): void {
    const generatedUrlInput = document.getElementById('generatedUrl') as HTMLInputElement;
    const url = generatedUrlInput.value;
    if (url) {
        window.open(url, '_blank');
    }
}

// Function to initialize the selection page
async function initSelectionPage(): Promise<void> {    
    const roles = await fetchRolesForSelectionPage();
    const townsfolkContainer = document.getElementById('townsfolkContainer') as HTMLDivElement;
    const outsidersContainer = document.getElementById('outsidersContainer') as HTMLDivElement;
    const minionsContainer = document.getElementById('minionsContainer') as HTMLDivElement;
    const demonsContainer = document.getElementById('demonsContainer') as HTMLDivElement;
    
    roles.forEach(role => {
        const roleCheckbox = createRoleCheckbox(role);
        switch (role.roleType) {
            case 'townsfolk':
                townsfolkContainer.appendChild(roleCheckbox);
                break;
            case 'outsider':
                outsidersContainer.appendChild(roleCheckbox);
                break;
            case 'minion':
                minionsContainer.appendChild(roleCheckbox);
                break;
            case 'demon':
                demonsContainer.appendChild(roleCheckbox);
                break;
        }
    });

    const generateUrlButton = document.getElementById('generateUrlButton') as HTMLButtonElement;
    generateUrlButton.onclick = generateUrl;

    const copyUrlButton = document.getElementById('copyUrlButton') as HTMLButtonElement;
    copyUrlButton.onclick = copyToClipboard;

    document.getElementById('launchUrlButton')!.addEventListener('click', launchUrl);
}


initSelectionPage();
