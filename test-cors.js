#!/usr/bin/env node

// Script de test CORS pour vérifier la configuration
const https = require('https');
const http = require('http');

function testCORS(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const options = {
      method: method,
      headers: {
        'Origin': 'http://localhost:5173',
        'Content-Type': 'application/json'
      }
    };

    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          corsHeaders: {
            'access-control-allow-origin': res.headers['access-control-allow-origin'],
            'access-control-allow-methods': res.headers['access-control-allow-methods'],
            'access-control-allow-headers': res.headers['access-control-allow-headers'],
            'access-control-allow-credentials': res.headers['access-control-allow-credentials']
          }
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Test de configuration CORS pour FEVEO 2050\n');
  
  const tests = [
    {
      name: 'Health Check',
      url: 'https://api.feveo2025.sn/health',
      method: 'GET'
    },
    {
      name: 'API Test',
      url: 'https://api.feveo2025.sn/api/test',
      method: 'GET'
    },
    {
      name: 'Preflight OPTIONS',
      url: 'https://api.feveo2025.sn/api/wallet/verify-gie',
      method: 'OPTIONS'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`🔍 Test: ${test.name}`);
      console.log(`📡 ${test.method} ${test.url}`);
      
      const result = await testCORS(test.url, test.method);
      
      console.log(`✅ Status: ${result.status}`);
      console.log('📋 CORS Headers:');
      Object.entries(result.corsHeaders).forEach(([key, value]) => {
        if (value) {
          console.log(`   ${key}: ${value}`);
        }
      });
      
      if (result.corsHeaders['access-control-allow-origin']) {
        console.log('✅ CORS configuré correctement');
      } else {
        console.log('❌ CORS manquant');
      }
      
      console.log('─'.repeat(50));
      
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
      console.log('─'.repeat(50));
    }
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { testCORS };
