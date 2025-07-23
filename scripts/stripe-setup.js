const Stripe = require('stripe');
const dotenv = require('dotenv');

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setup() {
  console.log('Setting up Stripe billing meter...');

  const meter = await stripe.billing.meters.create({
    display_name: 'Credits',
    name: 'credits',
    value_settings: {
      aggregation_mode: 'sum',
    },
  });

  console.log('Stripe billing meter created:');
  console.log(`Meter ID: ${meter.id}`);
  console.log('Please add this to your .env file as STRIPE_CREDIT_METER_ID');

  console.log('\nNext, you should update your Stripe products to use this meter.');
  console.log('This script does not handle product updates automatically.');
}

async function testGrant(customerId, amount) {
  console.log(`Granting ${amount} credits to customer ${customerId}...`);
  // This is a placeholder for a test grant.
  // In a real scenario, you would use the Stripe API to grant credits.
  console.log('Test grant functionality is not implemented in this script.');
}

async function fullSetup() {
    console.log('Full setup functionality is not implemented in this script.');
}

const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'setup':
    setup();
    break;
  case 'test-grant':
    if (args.length < 2) {
      console.error('Usage: node stripe-setup-script.js test-grant <customer_id> <amount>');
      process.exit(1);
    }
    testGrant(args[0], parseInt(args[1], 10));
    break;
  case 'full-setup':
    fullSetup();
    break;
  default:
    console.log('Usage: node stripe-setup-script.js <command>');
    console.log('Commands: setup, test-grant, full-setup');
}
