const http = require('http');

const authData = JSON.stringify({ email: 'dev-tester@peptech.bio', password: 'Peptech123!' });

const authReq = http.request('http://localhost:9000/auth/user/emailpass', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(authData)
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const token = JSON.parse(body).token;
    const invItemId = 'iitem_01M4X4YZ1A2KNTXM9GVBPBKYXF'; // PEP-PEN-TESAMORELIN
    const locId = 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ';

    // 1. Update stocked quantity to 15 (simulating Admin panel save)
    console.log(`Testing Admin panel inventory update: setting stocked_quantity to 15...`);
    const updateBody = JSON.stringify({ stocked_quantity: 15 });
    const updateReq = http.request('http://localhost:9000/admin/inventory-items/' + invItemId + '/location-levels/' + locId, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(updateBody)
      }
    }, (uRes) => {
      let uData = '';
      uRes.on('data', d => uData += d);
      uRes.on('end', () => {
        console.log('Update HTTP Status:', uRes.statusCode);
        const parsed = JSON.parse(uData);
        const level = parsed.inventory_item?.location_levels?.find(l => l.location_id === locId);
        console.log('Successfully updated in Medusa Admin! New Stocked Quantity:', level?.stocked_quantity);

        // 2. Revert back to 10
        console.log(`Reverting stocked_quantity back to 10...`);
        const revertBody = JSON.stringify({ stocked_quantity: 10 });
        const revertReq = http.request('http://localhost:9000/admin/inventory-items/' + invItemId + '/location-levels/' + locId, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(revertBody)
          }
        }, (rRes) => {
          let rData = '';
          rRes.on('data', d => rData += d);
          rRes.on('end', () => {
            console.log('Revert HTTP Status:', rRes.statusCode);
            const rParsed = JSON.parse(rData);
            const rLevel = rParsed.inventory_item?.location_levels?.find(l => l.location_id === locId);
            console.log('Confirmed reverted to standard 10 units! Current Stocked Quantity:', rLevel?.stocked_quantity);
          });
        });
        revertReq.write(revertBody);
        revertReq.end();
      });
    });
    updateReq.write(updateBody);
    updateReq.end();
  });
});

authReq.write(authData);
authReq.end();
