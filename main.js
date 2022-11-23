function fixAmount(val) {
    let tmp = val.split(' ').join('');

    // 0-9 kimi, vergul, noqte olmayanlari bosa cevir
    tmp = tmp.replace(/[^0-9\,\.]/g, '');

    // vergulu noqteye cevir
    tmp = tmp.replace(/\,/g, '.');

    tmp = tmp.split('');
    
    for (let i = 0, dotOccured = false; i < tmp.length; ++i) {
        let ch = tmp[i];

        if (ch == '.') {
            if (!dotOccured) {
                dotOccured = true;
            } else {
                tmp[i] = '';
            }
        }
    }
    
    let new_value = [];
    let counter = 1;
    
    let dotI = tmp.indexOf('.');
    let endI = tmp.length - 1;
    let mainI = 0;
    
    if (dotI >= 0) {
        let j = dotI + 4 > endI ? endI : dotI + 4;
        while (j >= dotI) {
            new_value[mainI++] = tmp[j--]; 
        }
    }
                
    let i = dotI < 0 ? endI : dotI - 1;
    while (i >= 0) {
        let ch = tmp[i];

        new_value[mainI++] = ch;

        if (counter == 3) {
            new_value[mainI++] = ' ';
            counter = 1;
        } else {
            ++counter;
        }

        --i;
    }

    return new_value.reverse().join('').trim();
}

function getRate(from, to) {
    return fetch(`https://api.exchangerate.host/latest?base=${ from }&symbols=${ to }`)
        .then((res) => {
            return res.json();
        })
        .then((json) => {
            let rate = json['rates'][to];
            return rate;
        });
}

window.onload = function() {
    let conv_inp = document.getElementsByClassName('converter-input');
    for (const inp of conv_inp) {
        inp.addEventListener('keyup', function(e) {
            this.value = fixAmount(this.value);
        });

        inp.addEventListener('change', function(e) {
            let from = document.getElementById('currency-from').querySelector('.currency-active');
            let to = document.getElementById('currency-to').querySelector('.currency-active');

            let from_val = from.innerText;
            let to_val = to.innerText;

            let amount = this.value.replace(' ', '');
            amount = Number(amount);

            if (amount % 1 == 0) this.value = fixAmount(String(amount));

            if (this.id == 'converter-from') {
                let converter_to = document.getElementById('converter-to');
                getRate(from_val, to_val)
                .then((data) => {
                    converter_to.value = fixAmount(String(amount * data));
                });
            } else if (this.id == 'converter-to') {
                let converter_from = document.getElementById('converter-from');
                getRate(to_val, from_val)
                .then((data) => {
                    converter_from.value = fixAmount(String(amount * data));
                });
            }
        });
    }

    let currencies = document.getElementsByClassName('currency');
    for (const currency of currencies) {
        currency.addEventListener('click', function(e) {
            let active_currency = this.parentNode.querySelector('.currency-active');
            active_currency.classList.remove('currency-active');
            
            this.classList.add('currency-active')

            let currency_info_from = document.getElementById('currency-info-from');
            let currency_info_to = document.getElementById('currency-info-to');

            let from = document.getElementById('currency-from').querySelector('.currency-active');
            let to = document.getElementById('currency-to').querySelector('.currency-active');

            let from_val = from.innerText;
            let to_val = to.innerText;

            let amount = document.getElementById('converter-from').value.replace(' ', '');
            amount = Number(amount);

            let converter_to = document.getElementById('converter-to');
            getRate(from_val, to_val)
            .then((data) => {
                currency_info_from.innerText = `1 ${ from_val } = ${ fixAmount(String(data)) } ${ to_val }`;
                currency_info_to.innerText = `1 ${ to_val } = ${ fixAmount(String(1 / data)) } ${ from_val }`;
                converter_to.value = fixAmount(String(amount * data));
            });
        });        
    }
    
    let from = document.getElementById('currency-from').querySelector('.currency-active');
    from.click();
};