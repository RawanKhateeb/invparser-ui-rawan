const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// Mock invoice data
const mockInvoices = {
  'INV-001': {
    InvoiceId: 'INV-001',
    VendorName: 'Aaron Bergman',
    InvoiceDate: '2024-01-15',
    BillingAddressRecipient: 'John Smith',
    ShippingAddress: '123 Main St, New York, NY 10001',
    SubTotal: 1500.00,
    ShippingCost: 50.00,
    InvoiceTotal: 1550.00,
    Items: [
      {
        id: '1',
        Name: 'Office Supplies',
        Description: 'Box of pens and pencils',
        Quantity: 10,
        UnitPrice: 50.00,
        Amount: 500.00,
      },
      {
        id: '2',
        Name: 'Desk Lamp',
        Description: 'LED desk lamp',
        Quantity: 5,
        UnitPrice: 200.00,
        Amount: 1000.00,
      },
    ],
  },
  'INV-002': {
    InvoiceId: 'INV-002',
    VendorName: 'Acme Corp',
    InvoiceDate: '2024-01-20',
    BillingAddressRecipient: 'Jane Doe',
    ShippingAddress: '456 Oak Ave, Los Angeles, CA 90001',
    SubTotal: 3000.00,
    ShippingCost: 100.00,
    InvoiceTotal: 3100.00,
    Items: [
      {
        id: '1',
        Name: 'Server Hardware',
        Description: 'Enterprise server',
        Quantity: 2,
        UnitPrice: 1500.00,
        Amount: 3000.00,
      },
    ],
  },
  'INV-003': {
    InvoiceId: 'INV-003',
    VendorName: 'TechSupply Inc',
    InvoiceDate: '2024-01-25',
    BillingAddressRecipient: 'Bob Johnson',
    ShippingAddress: '789 Pine Rd, Chicago, IL 60601',
    SubTotal: 800.00,
    ShippingCost: 25.00,
    InvoiceTotal: 825.00,
    Items: [
      {
        id: '1',
        Name: 'Computer Parts',
        Description: 'RAM and SSD',
        Quantity: 4,
        UnitPrice: 200.00,
        Amount: 800.00,
      },
    ],
  },
  'INV-004': {
    InvoiceId: 'INV-004',
    VendorName: 'Aaron Bergman',
    InvoiceDate: '2024-02-05',
    BillingAddressRecipient: 'Alice White',
    ShippingAddress: '321 Elm St, Boston, MA 02101',
    SubTotal: 2200.00,
    ShippingCost: 75.00,
    InvoiceTotal: 2275.00,
    Items: [
      {
        id: '1',
        Name: 'Furniture',
        Description: 'Office chairs',
        Quantity: 4,
        UnitPrice: 550.00,
        Amount: 2200.00,
      },
    ],
  },
  'INV-005': {
    InvoiceId: 'INV-005',
    VendorName: 'SuperStore',
    InvoiceDate: '2024-02-10',
    BillingAddressRecipient: 'Mike Wilson',
    ShippingAddress: '555 Market St, San Francisco, CA 94102',
    SubTotal: 4500.00,
    ShippingCost: 150.00,
    InvoiceTotal: 4650.00,
    Items: [
      {
        id: '1',
        Name: 'Bulk Supplies',
        Description: 'Office equipment and accessories',
        Quantity: 50,
        UnitPrice: 90.00,
        Amount: 4500.00,
      },
    ],
  },
  'INV-006': {
    InvoiceId: 'INV-006',
    VendorName: 'SuperStore',
    InvoiceDate: '2024-02-15',
    BillingAddressRecipient: 'Sarah Davis',
    ShippingAddress: '789 Commerce St, Seattle, WA 98101',
    SubTotal: 2800.00,
    ShippingCost: 80.00,
    InvoiceTotal: 2880.00,
    Items: [
      {
        id: '1',
        Name: 'Printers',
        Description: 'Network printers',
        Quantity: 3,
        UnitPrice: 800.00,
        Amount: 2400.00,
      },
      {
        id: '2',
        Name: 'Paper Supplies',
        Description: 'A4 and A3 paper reams',
        Quantity: 20,
        UnitPrice: 20.00,
        Amount: 400.00,
      },
    ],
  },
  'INV-007': {
    InvoiceId: 'INV-007',
    VendorName: 'SuperStore',
    InvoiceDate: '2024-02-20',
    BillingAddressRecipient: 'Tom Brown',
    ShippingAddress: '222 Industrial Way, Denver, CO 80202',
    SubTotal: 3200.00,
    ShippingCost: 120.00,
    InvoiceTotal: 3320.00,
    Items: [
      {
        id: '1',
        Name: 'Office Furniture',
        Description: 'Desks and shelving units',
        Quantity: 8,
        UnitPrice: 400.00,
        Amount: 3200.00,
      },
    ],
  },
};

const server = http.createServer((req, res) => {
  // Default CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  const urlParts = req.url.split('?')[0].split('/').filter(Boolean);

  console.log(`${req.method} ${req.url}`);

  // GET /invoice/:id
  if (req.method === 'GET' && urlParts[0] === 'invoice' && urlParts[1]) {
    const invoiceId = urlParts[1];
    const invoice = mockInvoices[invoiceId];
    
    if (invoice) {
      res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ invoice }));
    } else {
      res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invoice not found' }));
    }
    return;
  }

  // GET /invoices/vendor/:name
  if (req.method === 'GET' && urlParts[0] === 'invoices' && urlParts[1] === 'vendor' && urlParts[2]) {
    const vendorName = decodeURIComponent(urlParts[2]);
    const invoices = Object.values(mockInvoices).filter(
      inv => inv.VendorName.toLowerCase().includes(vendorName.toLowerCase())
    );

    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      invoices: invoices.map(inv => ({
        InvoiceId: inv.InvoiceId,
        VendorName: inv.VendorName,
        InvoiceDate: inv.InvoiceDate,
        ShippingAddress: inv.ShippingAddress,
        InvoiceTotal: inv.InvoiceTotal,
      })),
      count: invoices.length 
    }));
    return;
  }

  // GET /invoices - Get all invoices
  if (req.method === 'GET' && urlParts[0] === 'invoices' && !urlParts[1]) {
    const invoices = Object.values(mockInvoices).map(inv => ({
      InvoiceId: inv.InvoiceId,
      VendorName: inv.VendorName,
      InvoiceDate: inv.InvoiceDate,
      ShippingAddress: inv.ShippingAddress,
      InvoiceTotal: inv.InvoiceTotal,
    }));

    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      invoices,
      count: invoices.length,
      total: invoices.length
    }));
    return;
  }

  // POST /extract - Mock upload endpoint
  if (req.method === 'POST' && urlParts[0] === 'extract') {
    console.log('=== POST /extract received ===');
    
    // Just consume the data without processing
    req.on('data', () => {
      // Ignore data
    });

    req.on('end', () => {
      console.log('Upload complete, sending response');
      
      // Generate a random invoice ID
      const invoiceId = 'INV-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      const responseData = { 
        invoiceId,
        vendor: 'Unknown Vendor',
        amount: 0,
        status: 'processed',
        message: 'Invoice processed successfully'
      };
      
      const jsonStr = JSON.stringify(responseData);
      
      res.writeHead(200, {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonStr),
      });
      res.end(jsonStr);
    });
    
    return;
  }

  // Health check
  if (req.method === 'GET' && urlParts[0] === 'health') {
    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`\n✅ Mock Invoice API Server running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET /invoice/:id - Get invoice details`);
  console.log(`  GET /invoices - Get all invoices (with count)`);
  console.log(`  GET /invoices/vendor/:name - Search invoices by vendor`);
  console.log(`  POST /extract - Upload and extract invoice`);
  console.log(`  GET /health - Health check\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
