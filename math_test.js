import fs from 'fs';

// Mock DB states
let batches = [];
let distributions = [];
let returns = [];

const hairTypes = [
  { id: 'ht1', name: '13x4 (Đi 1 bỏ 3)', unitPrice: 370000 },
  { id: 'ht2', name: '5x5 (Đi 1 bỏ 2)', unitPrice: 235000 }
];

console.log('--- BẮT ĐẦU TEST LUỒNG TOÁN HỌC ---');

// 1. Owner nhập hàng (Batches)
console.log('\n[Bước 1] Owner nhập hàng từ xưởng:');
batches.push({
  id: 'b1',
  items: [
    { hairTypeId: 'ht1', hairTypeName: '13x4 (Đi 1 bỏ 3)', quantity: 100 },
    { hairTypeId: 'ht2', hairTypeName: '5x5 (Đi 1 bỏ 2)', quantity: 50 }
  ]
});
console.log('- Nhập 100 phôi ht1, 50 phôi ht2.');

// Hàm tính tồn kho (giống useData.jsx)
function getInventory() {
  const inv = {};
  batches.forEach(b => b.items.forEach(it => {
    if (!inv[it.hairTypeId]) inv[it.hairTypeId] = { id: it.hairTypeId, name: it.hairTypeName, imported: 0, given: 0, returned: 0 };
    inv[it.hairTypeId].imported += it.quantity;
  }));
  distributions.forEach(d => d.items.forEach(it => {
    if (!inv[it.hairTypeId]) inv[it.hairTypeId] = { id: it.hairTypeId, name: it.hairTypeName, imported: 0, given: 0, returned: 0 };
    inv[it.hairTypeId].given += it.quantityGiven;
  }));
  returns.filter(r => r.status === 'confirmed').forEach(r => r.items.forEach(it => {
    if (inv[it.hairTypeId]) {
      inv[it.hairTypeId].returned += it.quantity;
    }
  }));
  
  return Object.values(inv).map(v => ({
    ...v,
    rawAvailable: v.imported - v.given,
    finishedAvailable: v.returned
  }));
}

let inv = getInventory();
console.log('-> TỒN KHO SAU NHẬP HÀNG:');
console.table(inv);


// 2. Thợ xin nhận việc và Owner duyệt (Distributions)
console.log('\n[Bước 2] Thợ A xin nhận việc và Owner duyệt:');
console.log('- Thợ A nhận: 20 ht1, 10 ht2');
distributions.push({
  id: 'd1',
  workerId: 'w1',
  status: 'holding',
  items: [
    { hairTypeId: 'ht1', hairTypeName: '13x4 (Đi 1 bỏ 3)', quantityGiven: 20, quantityReturned: 0 },
    { hairTypeId: 'ht2', hairTypeName: '5x5 (Đi 1 bỏ 2)', quantityGiven: 10, quantityReturned: 0 }
  ]
});

inv = getInventory();
console.log('-> TỒN KHO SAU KHI GIAO CHO THỢ:');
console.table(inv);


// 3. Thợ trả hàng một phần (Returns)
console.log('\n[Bước 3] Thợ A làm xong một phần và trả hàng:');
console.log('- Thợ A trả: 5 ht1, 10 ht2');
returns.push({
  id: 'r1',
  workerId: 'w1',
  distributionId: 'd1',
  status: 'pending',
  items: [
    { hairTypeId: 'ht1', hairTypeName: '13x4 (Đi 1 bỏ 3)', quantity: 5, unitPrice: 370000, subtotal: 5 * 370000 },
    { hairTypeId: 'ht2', hairTypeName: '5x5 (Đi 1 bỏ 2)', quantity: 10, unitPrice: 235000, subtotal: 10 * 235000 }
  ]
});

// Owner duyệt trả hàng
returns[0].status = 'confirmed';
// Update Distribution quantityReturned
const dist = distributions.find(d => d.id === 'd1');
dist.items.forEach(di => {
  const retItem = returns[0].items.find(ri => ri.hairTypeId === di.hairTypeId);
  if (retItem) {
    di.quantityReturned += retItem.quantity;
  }
});

console.log('-> TRẠNG THÁI HÀNG ĐANG GIỮ CỦA THỢ A (Sau khi trả):');
console.table(dist.items);

inv = getInventory();
console.log('-> TỒN KHO SAU KHI THỢ A TRẢ HÀNG:');
console.table(inv);


// 4. Tính lương
console.log('\n[Bước 4] Tính tiền công cho Thợ A:');
const totalWage = returns[0].items.reduce((sum, item) => sum + item.subtotal, 0);
console.log(`- Phiếu trả hàng r1: 5 * 370,000 + 10 * 235,000 = ${totalWage.toLocaleString()} VNĐ`);

console.log('\n--- KẾT THÚC TEST ---');
