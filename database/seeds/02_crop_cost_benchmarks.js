/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
await knex('crop_cost_benchmarks').del();
  await knex('crop_cost_benchmarks').insert([
    {
      region: 'Mbeya', district: 'Mbarali', crop_name: 'Maize', farming_method: 'rain_fed',
      seed_cost_per_acre: 45000, fertilizer_cost_per_acre: 180000, land_prep_cost_per_acre: 90000,
      labor_cost_per_acre: 120000, irrigation_cost_per_acre: 0, pesticide_cost_per_acre: 40000,
      machinery_cost_per_acre: 60000, harvesting_cost_per_acre: 50000, transport_cost_per_acre: 30000,
      expected_yield_per_acre: 1200, market_price_per_kg: 600,
    },
    {
      region: 'Mbeya', district: 'Mbarali', crop_name: 'Rice', farming_method: 'irrigated',
      seed_cost_per_acre: 60000, fertilizer_cost_per_acre: 220000, land_prep_cost_per_acre: 100000,
      labor_cost_per_acre: 180000, irrigation_cost_per_acre: 150000, pesticide_cost_per_acre: 55000,
      machinery_cost_per_acre: 80000, harvesting_cost_per_acre: 70000, transport_cost_per_acre: 35000,
      expected_yield_per_acre: 2000, market_price_per_kg: 900,
    },
    {
      region: 'Arusha', district: 'Arumeru', crop_name: 'Avocado', farming_method: 'irrigated',
      seed_cost_per_acre: 250000, fertilizer_cost_per_acre: 150000, land_prep_cost_per_acre: 80000,
      labor_cost_per_acre: 160000, irrigation_cost_per_acre: 120000, pesticide_cost_per_acre: 45000,
      machinery_cost_per_acre: 40000, harvesting_cost_per_acre: 60000, transport_cost_per_acre: 40000,
      expected_yield_per_acre: 3500, market_price_per_kg: 1200,
    },
    {
      region: 'Dodoma', district: 'Chamwino', crop_name: 'Sunflower', farming_method: 'rain_fed',
      seed_cost_per_acre: 35000, fertilizer_cost_per_acre: 100000, land_prep_cost_per_acre: 70000,
      labor_cost_per_acre: 90000, irrigation_cost_per_acre: 0, pesticide_cost_per_acre: 30000,
      machinery_cost_per_acre: 50000, harvesting_cost_per_acre: 40000, transport_cost_per_acre: 25000,
      expected_yield_per_acre: 800, market_price_per_kg: 950,
    },
    {
      region: 'Kagera', district: 'Bukoba', crop_name: 'Coffee', farming_method: 'rain_fed',
      seed_cost_per_acre: 180000, fertilizer_cost_per_acre: 130000, land_prep_cost_per_acre: 90000,
      labor_cost_per_acre: 200000, irrigation_cost_per_acre: 0, pesticide_cost_per_acre: 50000,
      machinery_cost_per_acre: 30000, harvesting_cost_per_acre: 80000, transport_cost_per_acre: 35000,
      expected_yield_per_acre: 600, market_price_per_kg: 3500,
    },
    {
      region: 'Morogoro', district: 'Kilombero', crop_name: 'Sugarcane', farming_method: 'irrigated',
      seed_cost_per_acre: 120000, fertilizer_cost_per_acre: 200000, land_prep_cost_per_acre: 110000,
      labor_cost_per_acre: 220000, irrigation_cost_per_acre: 180000, pesticide_cost_per_acre: 60000,
      machinery_cost_per_acre: 100000, harvesting_cost_per_acre: 90000, transport_cost_per_acre: 50000,
      expected_yield_per_acre: 30000, market_price_per_kg: 65,
    },
    {
      region: 'Tanga', district: 'Muheza', crop_name: 'Mango', farming_method: 'rain_fed',
      seed_cost_per_acre: 90000, fertilizer_cost_per_acre: 100000, land_prep_cost_per_acre: 70000,
      labor_cost_per_acre: 100000, irrigation_cost_per_acre: 0, pesticide_cost_per_acre: 35000,
      machinery_cost_per_acre: 30000, harvesting_cost_per_acre: 50000, transport_cost_per_acre: 40000,
      expected_yield_per_acre: 4000, market_price_per_kg: 500,
    },
    {
      region: 'Iringa', district: 'Kilolo', crop_name: 'Beans', farming_method: 'rain_fed',
      seed_cost_per_acre: 55000, fertilizer_cost_per_acre: 90000, land_prep_cost_per_acre: 65000,
      labor_cost_per_acre: 95000, irrigation_cost_per_acre: 0, pesticide_cost_per_acre: 30000,
      machinery_cost_per_acre: 40000, harvesting_cost_per_acre: 35000, transport_cost_per_acre: 20000,
      expected_yield_per_acre: 500, market_price_per_kg: 1800,
    },
  ]);
};
