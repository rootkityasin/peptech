// Dedicated verification launcher. Never points Medusa at the client's database.
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const cwd=path.resolve(__dirname,'../backend/apps/backend');
const scripts={prepare:'verify-commerce-sandbox.ts',settle:'verify-commerce-settlement.ts',billing:'verify-commerce-billing.ts', 'billing-verify':'verify-commerce-billing.ts','billing-advance':'verify-commerce-billing.ts','billing-renewal':'verify-commerce-billing.ts','billing-cancel':'verify-commerce-billing.ts',refund:'verify-commerce-billing.ts'};
for(const stage of ['controls','skip-advance','skip-verify'])scripts[`billing-${stage}`]='verify-commerce-billing.ts';
scripts.webhooks='verify-commerce-webhooks.ts';
scripts.bank='verify-commerce-bank.ts';
const mode=process.argv[2];
if(!scripts[mode])throw new Error('Choose prepare, settle or billing');
const result=spawnSync(path.resolve(cwd,'../../node_modules/.bin/medusa'),['exec',`./src/scripts/${scripts[mode]}`],{
 cwd,stdio:'inherit',env:{...process.env,DATABASE_URL:'postgresql://postgres:peptech_test_only@127.0.0.1:55439/peptech_commerce_test',
 STRIPE_COMMERCE_DATABASE_URL:'postgresql://postgres:peptech_test_only@127.0.0.1:55439/peptech_commerce_test',
 PEPTECH_BILLING_STAGE:mode==='refund'?'refund':mode.replace('billing-','')==='billing'?'prepare':mode.replace('billing-',''),STRIPE_STOREFRONT_URL:'http://localhost:3003',JWT_SECRET:'isolated-test-jwt',COOKIE_SECRET:'isolated-test-cookie'}});
process.exit(result.status??1);
