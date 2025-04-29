/**
 * Test script to query VUSD (Vesper vDollar) price from CoinGecko API
 */

// Using native fetch for Node.js (available since Node 18+)
// VUSD token identifier on CoinGecko
const VUSD_ID = 'vesper-vdollar';

// Test different API endpoints
async function testCoinGeckoAPI() {
  console.log('Testing CoinGecko API for VUSD (Vesper vDollar) token information...\n');
  
  try {
    // 1. Test simple price endpoint
    console.log('1. Testing simple price endpoint:');
    const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${VUSD_ID}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_last_updated_at=true`);
    const priceData = await priceResponse.json();
    console.log(JSON.stringify(priceData, null, 2));
    console.log('\n-----------------------------------\n');
    
    // 2. Test detailed coin data endpoint
    console.log('2. Testing detailed coin data endpoint:');
    const detailedResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${VUSD_ID}?localization=false&tickers=false&community_data=false&developer_data=false`);
    const detailedData = await detailedResponse.json();
    
    // Extract and print only the important fields for brevity
    const relevantData = {
      id: detailedData.id,
      symbol: detailedData.symbol,
      name: detailedData.name,
      contract_address: detailedData.platforms?.ethereum,
      current_price: detailedData.market_data?.current_price?.usd,
      market_cap: detailedData.market_data?.market_cap?.usd,
      price_change_24h_percentage: detailedData.market_data?.price_change_percentage_24h,
      last_updated: detailedData.last_updated
    };
    
    console.log(JSON.stringify(relevantData, null, 2));
    
  } catch (error) {
    console.error('Error querying CoinGecko API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response text:', await error.response.text());
    }
  }
}

// Run the test
testCoinGeckoAPI();