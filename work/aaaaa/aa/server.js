const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3030;

let cachedRates = null;
let lastFetchTime = null;
const CACHE_DURATION = 10 * 60 * 1000;

app.use(express.static(path.join(__dirname)));

async function fetchRatesFromAPI() {
    try {
        console.log('환율 정보를 가져오는 중...');
        
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/KRW');
        
        const krwToOthers = {};
        if (response.data && response.data.rates) {
            Object.keys(response.data.rates).forEach(currency => {
                krwToOthers[currency] = response.data.rates[currency];
            });
        }
        
        return krwToOthers;
    } catch (error) {
        console.error('Primary API 실패:', error.message);
        
        try {
            console.log('백업 API 시도 중...');
            const response = await axios.get('https://open.er-api.com/v6/latest/KRW');
            
            const krwToOthers = {};
            if (response.data && response.data.rates) {
                Object.keys(response.data.rates).forEach(currency => {
                    krwToOthers[currency] = response.data.rates[currency];
                });
            }
            
            return krwToOthers;
        } catch (backupError) {
            console.error('백업 API도 실패:', backupError.message);
            
            console.log('기본 환율 데이터 사용');
            return getDefaultRates();
        }
    }
}

function getDefaultRates() {
    return {
        'USD': 0.00075,
        'EUR': 0.00069,
        'JPY': 0.11,
        'CNY': 0.0054,
        'GBP': 0.00059,
        'AUD': 0.00116,
        'CAD': 0.00104,
        'CHF': 0.00066,
        'HKD': 0.00583,
        'SGD': 0.00101,
        'SEK': 0.00813,
        'NOK': 0.00829,
        'NZD': 0.00127,
        'MXN': 0.01499,
        'INR': 0.06314,
        'RUB': 0.07524,
        'BRL': 0.00427,
        'THB': 0.02571,
        'MYR': 0.00334,
        'PHP': 0.04388,
        'IDR': 11.89,
        'VND': 19.01,
        'TWD': 0.02435,
        'AED': 0.00275,
        'SAR': 0.00281
    };
}

app.get('/api/exchange-rates', async (req, res) => {
    const now = Date.now();
    
    if (!cachedRates || !lastFetchTime || (now - lastFetchTime > CACHE_DURATION)) {
        try {
            cachedRates = await fetchRatesFromAPI();
            lastFetchTime = now;
            console.log('환율 정보 업데이트 완료');
        } catch (error) {
            console.error('환율 정보 가져오기 실패:', error);
            if (!cachedRates) {
                cachedRates = getDefaultRates();
            }
        }
    }
    
    res.json({
        rates: cachedRates,
        lastUpdate: lastFetchTime
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ===================================
    💰 원화 환율 계산기 서버 시작됨
    ===================================
    
    🌐 접속 주소:
       - http://localhost:${PORT}
       - http://127.0.0.1:${PORT}
    
    📌 기능:
       - 실시간 환율 정보 제공
       - 25개국 통화 지원
       - 자동 환율 업데이트 (10분마다)
    
    🔄 서버 종료: Ctrl + C
    ===================================
    `);
    
    fetchRatesFromAPI().then(rates => {
        cachedRates = rates;
        lastFetchTime = Date.now();
        console.log('초기 환율 정보 로드 완료');
    });
});

process.on('SIGINT', () => {
    console.log('\n서버를 종료합니다...');
    process.exit();
});