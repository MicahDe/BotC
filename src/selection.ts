/**
 * COPYRIGHT 2024 Micah De Silva
 */

interface Role {
    name: string;
    description: string;
    iconPath: string;
    roleType: string;
    gist: string;
    encoding: string;
}

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

function closePopupSP(): void {
    const popup = document.getElementById('popup') as HTMLDivElement;
    popup.style.display = 'none';
}

async function fetchRolesForSelectionPage(): Promise<Role[]> {
    const response = await fetch('res/roles.json');
    return response.json();
}

function modifyCount(divId: string, amount: number) {

    const element = document.getElementById(divId) as HTMLDivElement;
    let currentValue = Number(element.textContent.split("(")[1].split(")")[0]);

    element.textContent = element.textContent.split("(")[0] + "(" + (currentValue + amount) + ")";
}

function createRoleCheckbox(role: Role): HTMLDivElement {
    const roleBox = document.createElement('div');
    roleBox.className = 'role-box';
    roleBox.setAttribute('data-encoding', role.encoding); 

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
    selectionArea.textContent = '+';

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


    selectionArea.addEventListener('click', function() {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
    });

    roleBox.addEventListener('click', function(event) {
        if (event.target !== checkbox && event.target !== selectionArea) {
            showPopupSP(role);
        }
    });


    return roleBox;
}

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

export async function generateRandomScript(): Promise<void> {
    const url = new URL(window.location.href);
    let scriptRoles = "";
    let roles = await fetchRolesForSelectionPage();
    let townsfolk = 0;
    let outsiders = 0;
    let minions = 0;
    let demons = 0;
    let roleAdded = false;

    while(townsfolk < 13 || outsiders < 4 || minions < 4 || demons < 4) {
        let role = roles[Math.floor(Math.random() * roles.length)];

        if(!scriptRoles.includes(role.encoding)) {
            switch(role.roleType) {
                case "townsfolk":
                    if(townsfolk < 13) {
                        scriptRoles += role.encoding;
                        townsfolk++;
                        roleAdded = true;
                    } break;
                case "outsider":
                    if(outsiders < 4) {
                        scriptRoles += role.encoding;
                        outsiders++;
                        roleAdded = true;
                    } break;
                case "minion":
                    if(minions < 4) {
                        scriptRoles += role.encoding;
                        minions++;
                        roleAdded = true;
                    } break;
                case "demon":
                    if(demons < 4) {
                        scriptRoles += role.encoding;
                        demons++;
                        roleAdded = true;
                    } break;
                default: break;
            }

            if(roleAdded) {
                switch(role.encoding) {
                    case "Cho":
                        if(!scriptRoles.includes("Ki")) {
                            if(townsfolk < 13) {
                                scriptRoles += "Ki";
                                townsfolk++;
                            } else {
                                scriptRoles = scriptRoles.replace("Cho", '');
                                townsfolk--;
                            }
                        } break;
                    case "Hu":
                        if(!scriptRoles.includes("Da")) {
                            if(outsiders < 4) {
                                scriptRoles += "Da";
                                outsiders++;
                            } else {
                                scriptRoles = scriptRoles.replace("Hu", '');
                                townsfolk--;
                            }
                        } break;
                    default: break;
                }
            }
        }
        roleAdded = false;
    }

    url.pathname = 'script.html';
    url.searchParams.set('roles', scriptRoles);
    url.searchParams.set('name', "Random Script");
    window.open(url, '_blank');
}


function copyToClipboard(): void {
    const generatedUrlInput = document.getElementById('generatedUrl') as HTMLInputElement;
    generatedUrlInput.select();
    document.execCommand('copy');
}

function launchUrl(): void {
    const generatedUrlInput = document.getElementById('generatedUrl') as HTMLInputElement;
    const url = generatedUrlInput.value;
    if (url) {
        window.open(url, '_blank');
    }
}

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

    const generateRandomScriptButton = document.getElementById('generateRandomScriptButton') as HTMLButtonElement;
    generateRandomScriptButton.onclick = generateRandomScript;

    const copyUrlButton = document.getElementById('copyUrlButton') as HTMLButtonElement;
    copyUrlButton.onclick = copyToClipboard;

    document.getElementById('launchUrlButton')!.addEventListener('click', launchUrl);
}

// Only do this if we're on the selection page
if (window.location.pathname.includes('selection'))
{
    initSelectionPage();
}
