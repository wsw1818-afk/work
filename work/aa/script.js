let exchangeRates = {};
let lastUpdateTime = null;

const currencyNames = {
    'USD': '미국 달러',
    'EUR': '유로',
    'JPY': '일본 엔',
    'CNY': '중국 위안',
    'GBP': '영국 파운드',
    'AUD': '호주 달러',
    'CAD': '캐나다 달러',
    'CHF': '스위스 프랑',
    'HKD': '홍콩 달러',
    'SGD': '싱가포르 달러',
    'SEK': '스웨덴 크로나',
    'NOK': '노르웨이 크로네',
    'NZD': '뉴질랜드 달러',
    'MXN': '멕시코 페소',
    'INR': '인도 루피',
    'RUB': '러시아 루블',
    'BRL': '브라질 헤알',
    'THB': '태국 바트',
    'MYR': '말레이시아 링깃',
    'PHP': '필리핀 페소',
    'IDR': '인도네시아 루피아',
    'VND': '베트남 동',
    'TWD': '대만 달러',
    'AED': 'UAE 디르함',
    'SAR': '사우디 리얄'
};

const currencySearchKeys = {
    'USD': '미국 달러 USD america dollar'.toLowerCase(),
    'EUR': '유로 EUR 유럽 europe'.toLowerCase(),
    'JPY': '일본 엔 JPY japan yen'.toLowerCase(),
    'CNY': '중국 위안 CNY china yuan 인민폐'.toLowerCase(),
    'GBP': '영국 파운드 GBP britain pound 영연방'.toLowerCase(),
    'AUD': '호주 달러 AUD australia dollar'.toLowerCase(),
    'CAD': '캐나다 달러 CAD canada dollar'.toLowerCase(),
    'CHF': '스위스 프랑 CHF swiss franc 스위스'.toLowerCase(),
    'HKD': '홍콩 달러 HKD hongkong dollar'.toLowerCase(),
    'SGD': '싱가포르 달러 SGD singapore dollar'.toLowerCase(),
    'SEK': '스웨덴 크로나 SEK sweden krona'.toLowerCase(),
    'NOK': '노르웨이 크로네 NOK norway krone'.toLowerCase(),
    'NZD': '뉴질랜드 달러 NZD newzealand dollar'.toLowerCase(),
    'MXN': '멕시코 페소 MXN mexico peso'.toLowerCase(),
    'INR': '인도 루피 INR india rupee'.toLowerCase(),
    'RUB': '러시아 루블 RUB russia ruble 러시아'.toLowerCase(),
    'BRL': '브라질 헤알 BRL brazil real'.toLowerCase(),
    'THB': '태국 바트 THB thailand baht'.toLowerCase(),
    'MYR': '말레이시아 링깃 MYR malaysia ringgit'.toLowerCase(),
    'PHP': '필리핀 페소 PHP philippines peso'.toLowerCase(),
    'IDR': '인도네시아 루피아 IDR indonesia rupiah'.toLowerCase(),
    'VND': '베트남 동 VND vietnam dong'.toLowerCase(),
    'TWD': '대만 달러 TWD taiwan dollar'.toLowerCase(),
    'AED': 'UAE 디르함 AED emirates dirham 아랍에미리트'.toLowerCase(),
    'SAR': '사우디 리얄 SAR saudi riyal 사우디아라비아'.toLowerCase()
};

const currencyFlags = {
    'USD': '🇺🇸',
    'EUR': '🇪🇺',
    'JPY': '🇯🇵',
    'CNY': '🇨🇳',
    'GBP': '🇬🇧',
    'AUD': '🇦🇺',
    'CAD': '🇨🇦',
    'CHF': '🇨🇭',
    'HKD': '🇭🇰',
    'SGD': '🇸🇬',
    'SEK': '🇸🇪',
    'NOK': '🇳🇴',
    'NZD': '🇳🇿',
    'MXN': '🇲🇽',
    'INR': '🇮🇳',
    'RUB': '🇷🇺',
    'BRL': '🇧🇷',
    'THB': '🇹🇭',
    'MYR': '🇲🇾',
    'PHP': '🇵🇭',
    'IDR': '🇮🇩',
    'VND': '🇻🇳',
    'TWD': '🇹🇼',
    'AED': '🇦🇪',
    'SAR': '🇸🇦'
};

async function fetchExchangeRates() {
    try {
        const response = await fetch('/api/exchange-rates');
        const data = await response.json();
        
        if (data.rates) {
            exchangeRates = data.rates;
            lastUpdateTime = new Date();
            updateUI();
            updateRatesTable();
            calculate();
        }
    } catch (error) {
        console.error('환율 정보를 가져오는데 실패했습니다:', error);
        document.getElementById('updateTime').textContent = '환율 정보를 불러올 수 없습니다';
    }
}

function updateUI() {
    if (lastUpdateTime) {
        const timeString = lastUpdateTime.toLocaleTimeString('ko-KR');
        const dateString = lastUpdateTime.toLocaleDateString('ko-KR');
        document.getElementById('updateTime').textContent = `마지막 업데이트: ${dateString} ${timeString}`;
    }
}

function updateRatesTable() {
    const tableContainer = document.getElementById('ratesTable');
    
    if (Object.keys(exchangeRates).length === 0) {
        return;
    }
    
    const mainCurrencies = ['USD', 'EUR', 'JPY', 'CNY', 'GBP', 'AUD', 'CAD', 'CHF'];
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>통화</th>
                    <th>환율 (1 KRW 기준)</th>
                    <th>100원당</th>
                    <th>1만원당</th>
                    <th>10만원당</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    mainCurrencies.forEach(currency => {
        if (exchangeRates[currency]) {
            const rate = exchangeRates[currency];
            const per100 = (rate * 100).toFixed(currency === 'JPY' || currency === 'IDR' || currency === 'VND' ? 0 : 4);
            const per10k = (rate * 10000).toFixed(currency === 'JPY' || currency === 'IDR' || currency === 'VND' ? 0 : 2);
            const per100k = (rate * 100000).toFixed(currency === 'JPY' || currency === 'IDR' || currency === 'VND' ? 0 : 2);
            
            tableHTML += `
                <tr>
                    <td>${currencyFlags[currency]} ${currency}</td>
                    <td>${rate.toFixed(6)}</td>
                    <td>${per100}</td>
                    <td>${formatNumber(per10k)}</td>
                    <td>${formatNumber(per100k)}</td>
                </tr>
            `;
        }
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    tableContainer.innerHTML = tableHTML;
}

function calculate() {
    const krwAmount = parseFloat(document.getElementById('krwAmount').value) || 0;
    const currency = document.getElementById('currency').value;
    
    if (exchangeRates[currency] && krwAmount > 0) {
        const rate = exchangeRates[currency];
        const result = krwAmount * rate;
        
        const decimals = (currency === 'JPY' || currency === 'IDR' || currency === 'VND') ? 0 : 2;
        
        document.getElementById('result').textContent = 
            `${currencyFlags[currency]} ${formatNumber(result.toFixed(decimals))} ${currency}`;
        document.getElementById('exchangeRate').textContent = 
            `환율: 1 KRW = ${rate.toFixed(6)} ${currency}`;
    } else {
        document.getElementById('result').textContent = '-';
        document.getElementById('exchangeRate').textContent = '환율: -';
    }
}

function reverseCalculate() {
    const foreignAmount = parseFloat(document.getElementById('foreignAmount').value) || 0;
    const currency = document.getElementById('currency').value;
    
    if (exchangeRates[currency] && foreignAmount > 0) {
        const rate = exchangeRates[currency];
        const krwAmount = foreignAmount / rate;
        
        document.getElementById('reverseResult').style.display = 'block';
        document.getElementById('reverseResult').innerHTML = `
            <strong>₩ ${formatNumber(krwAmount.toFixed(0))}</strong>
            <div class="small-text">${currencyFlags[currency]} ${formatNumber(foreignAmount)} ${currency} → 원화</div>
        `;
    } else {
        document.getElementById('reverseResult').style.display = 'none';
    }
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString('ko-KR');
}

function searchCurrencies() {
    const searchTerm = document.getElementById('currencySearch').value.toLowerCase();
    const select = document.getElementById('currency');
    const options = select.querySelectorAll('option');
    
    if (searchTerm === '') {
        options.forEach(option => option.style.display = 'block');
        return;
    }
    
    options.forEach(option => {
        const currency = option.value;
        const searchKey = currencySearchKeys[currency] || '';
        if (searchKey.includes(searchTerm)) {
            option.style.display = 'block';
        } else {
            option.style.display = 'none';
        }
    });
    
    const visibleOptions = Array.from(options).filter(option => 
        option.style.display !== 'none'
    );
    
    if (visibleOptions.length === 1) {
        select.value = visibleOptions[0].value;
        calculate();
        const event = new Event('change');
        select.dispatchEvent(event);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchExchangeRates();
    setInterval(fetchExchangeRates, 60000);
    
    document.getElementById('refreshBtn').addEventListener('click', fetchExchangeRates);
    
    document.getElementById('krwAmount').addEventListener('input', calculate);
    document.getElementById('currency').addEventListener('change', () => {
        calculate();
        const reverseInput = document.getElementById('reverseInput');
        const reverseLabel = document.getElementById('reverseLabel');
        const currency = document.getElementById('currency').value;
        
        if (reverseInput.style.display !== 'none') {
            reverseLabel.textContent = `${currencyFlags[currency]} ${currency} 금액`;
            reverseCalculate();
        }
    });
    
    document.getElementById('reverseBtn').addEventListener('click', () => {
        const reverseInput = document.getElementById('reverseInput');
        const reverseLabel = document.getElementById('reverseLabel');
        const currency = document.getElementById('currency').value;
        
        if (reverseInput.style.display === 'none') {
            reverseInput.style.display = 'block';
            reverseLabel.textContent = `${currencyFlags[currency]} ${currency} 금액`;
        } else {
            reverseInput.style.display = 'none';
            document.getElementById('reverseResult').style.display = 'none';
        }
    });
    
    document.getElementById('foreignAmount').addEventListener('input', reverseCalculate);
    
    document.getElementById('currencySearch').addEventListener('input', searchCurrencies);
    
    document.getElementById('currencySearch').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const select = document.getElementById('currency');
            const visibleOptions = Array.from(select.options).filter(option => 
                option.style.display !== 'none'
            );
            if (visibleOptions.length > 0) {
                select.value = visibleOptions[0].value;
                calculate();
                const event = new Event('change');
                select.dispatchEvent(event);
                document.getElementById('currencySearch').value = '';
                searchCurrencies();
            }
        }
    });
    
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('krwAmount').value = btn.dataset.amount;
            calculate();
        });
    });
});

window.addEventListener('online', () => {
    fetchExchangeRates();
});

window.addEventListener('offline', () => {
    document.getElementById('updateTime').textContent = '오프라인 - 저장된 환율 사용 중';
});