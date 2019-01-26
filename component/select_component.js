import {machine, useContext, useState} from './machine.js'

const machineInfo = {
    id: 'selectComponent',
    initialState: 'closed',
    context: {},
    states: {
        closed: {
            onEntry: 'closedEntry',
            on: {
                OPEN: {
                    target: 'opened'
                }, TYPE: {
                    target: 'typing'
                }
            }
        },
        opened: {
            onEntry: 'openedEntry',
            on: {
                CLOSE: {
                    target: 'closed'
                }, TYPE: {
                    target: 'typing'
                }
            }
        },
        typing: {
            onEntry: 'selectInput',
            on: {
                TYPE: {
                    target: 'typing'
                },
                CLOSE: {
                    target: 'closed'
                }
            }
        }
    },
    actions: {
        openedEntry: (event) => {
            const [context, setContext] = useContext();
            let el = findElement(context.comp_id, 'select-menu-outer');
            el.style.display = 'block';
            let selectControl = findElement(context.comp_id, 'select-control');
            selectControl.classList.add('opened');
        },
        closedEntry: (event) => {
            const [context, setContext] = useContext();
            let el = findElement(context.comp_id, 'select-menu-outer');
            el.style.display = 'none';
            let selectControl = findElement(context.comp_id, 'select-control');
            selectControl.classList.remove('opened');
        },
        selectInput: (event) => {
            const [context, setContext] = useContext();
            clearOptions(context.comp_id);
            let menu = findElement(context.comp_id, 'select-menu');
            menu.appendChild(createOption("Подождите..."));

            let newValue = findElement(context.comp_id, 'select-input').getElementsByTagName('input')[0].value;

            fetch('https://api.hh.ru/suggests/areas?text=' + newValue)
                .then(function (response) {
                    return response.json();
                })
                .then(function (suggestJson) {
                    clearOptions(context.comp_id);
                    if (!suggestJson.hasOwnProperty('items')) {
                        menu.appendChild(createOption("Введите не менее 2 символов", {}));
                    }
                    let i = 0;
                    for (; i < suggestJson.items.length; i++) {
                        menu.appendChild(createOption(suggestJson.items[i].text, {
                            mousedown: (event) => {
                                selectOptionClick(context.comp_id, event)
                            }
                        }, suggestJson.items[i].id));
                    }
                    if (i === 0) {
                        menu.appendChild(createOption("Нет результатов", {}));
                    }
                });
        }
    }

};

let selects = document.getElementsByClassName('select-box');
for (let i = 0; i < selects.length; i++) {
    let component = selects[i];
    let comp_input = findElement(component.id, 'select-input');
    let info = {...machineInfo};
    info.context = {comp_id: component.id};
    let comp_machine = machine(info);
    comp_input.addEventListener('focusin', () => {
        comp_machine.transition('OPEN');
    });
    comp_input.addEventListener('focusout', () => {
        comp_machine.transition('CLOSE');
    });
    comp_input.addEventListener('input', () => {
        comp_machine.transition('TYPE');
    });
    let clearButton = findElement(component.id, 'select-clear');
    clearButton.addEventListener('click', () => {
        selectClear(component.id,)
    });
}

function findElements(selectId, className) {
    let select = document.getElementById(selectId);
    return select.getElementsByClassName(className);
}

function findElement(selectId, className) {
    return findElements(selectId, className)[0];
}

function clearOptions(selectId) {
    let el = findElement(selectId, 'select-menu');
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

function createOption(text, events, id) {
    let option = document.createElement('div');
    option.className = "select-option";
    option.innerText = text;
    if (id) {
        option.setAttribute('data-id', id)
    }
    for (let e in events) {
        option.addEventListener(e, events[e]);
    }
    return option;
}

function selectOptionClick(selectId, event) {
    let tag = document.createElement('div');
    tag.className = "select-value";
    let span = document.createElement('span');
    span.className = "select-value-icon";
    span.setAttribute("aria-hidden", "true");
    span.innerText = "×";
    span.addEventListener('click', (e) => {
        e.target.parentElement.remove();
    });
    let a = document.createElement('a');
    a.className = "select-value-label";
    a.innerText = event.target.innerText;
    tag.appendChild(span);
    tag.appendChild(a);
    tag.setAttribute('data-id', event.target.getAttribute('data-id'));
    let input = findElement(selectId, 'select-input');
    input.before(tag);
}

function selectClear(selectId) {
    let content = findElement(selectId, 'content');
    let tags = findElements(selectId, 'select-value');
    let N = tags.length;
    for (let i = N; i > 0; i--) {
        let r = content.removeChild(tags[i - 1]);
    }
    let input = findElement(selectId, 'select-input').getElementsByTagName('input')[0];
    input.value = '';
    clearOptions(selectId);
}
