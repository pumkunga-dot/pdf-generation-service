const fs = require('fs');
(async ()=>{
  try{
    const body = { customerName: 'UI Test User', items: [{ name: 'Item A', qty: 2, price: 100 }], total: 200 };
    const res = await fetch('http://localhost:3000/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Status ' + res.status);
    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);
    fs.writeFileSync('invoice_ui_test.pdf', buf);
    const size = fs.statSync('invoice_ui_test.pdf').size;
    console.log('WROTE', size);
  }catch(err){
    console.error('ERROR', err);
    process.exit(1);
  }
})();
