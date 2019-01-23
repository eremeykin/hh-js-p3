function selectClick(event) {
    let el = document.getElementsByClassName('select-menu-outer')[0];
    el.style.display = 'block';
}

function selectBlur(event){
    let el = document.getElementsByClassName('select-menu-outer')[0];
    el.style.display = 'none';
}

function selectInput(value){
    fetch('https://api.hh.ru/suggests/areas?text=' + value)
        .then(function(response) {
            return response.json();
        })
        .then(function(suggestJson) {
            console.log(JSON.stringify(suggestJson));
            let el = document.getElementsByClassName('select-menu')[0];
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
            console.log(suggestJson.items.length);
            for (let i=0; i<suggestJson.items.length; i++){
                let option = document.createElement('div');
                option.className="select-option";
                console.log(suggestJson.items[i]);
                option.innerText = suggestJson.items[i].text;
                el.appendChild(option);
            }
        });
}

console.log('here');
console.log(selectClick);