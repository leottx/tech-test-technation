import { getAllInvoices, splitCamelCase } from './utils.js';

function calculatesEachTotal(invoices) {
  if (Array.isArray(invoices[0])) {
    const invoiceMatrix = [...invoices];

    return invoiceMatrix.map((invoiceArray) => {
      let totalOverall = 0;
      let totalPaid = 0;
      let totalPendingPayment = 0;
      let totalExpired = 0;
      let totalIssued = 0;

      invoiceArray.forEach((invoice) => {
        const { status, value } = invoice;
        totalOverall += value;

        switch (status) {
          case 'issued':
            totalIssued += value;
            break;
          case 'paid':
            totalPaid += value;
            break;
          case 'expired':
            totalExpired += value;
            break;
          case 'pending':
            totalPendingPayment += value;
            break;
          default:
            break;
        }
      });

      return {
        totalOverall,
        totalIssued,
        totalPendingPayment,
        totalPaid,
        totalExpired
      };
    });
  }

  let totalOverall = 0;
  let totalPaid = 0;
  let totalPendingPayment = 0;
  let totalExpired = 0;
  let totalIssued = 0;

  invoices.forEach((invoice) => {
    totalOverall += invoice.value;
    const { status, value } = invoice;

    switch (status) {
      case 'issued':
        totalIssued += value;
        break;
      case 'paid':
        totalPaid += value;
        break;
      case 'expired':
        totalExpired += value;
        break;
      case 'pending':
        totalPendingPayment += value;
      default:
        break;
    }
  })

  return {
    totalOverall,
    totalIssued,
    totalPendingPayment,
    totalPaid,
    totalExpired
  };
}

function populateDashboarTable(invoices) {
  const table = document.getElementById('invoice-table');
  const tableBody = table.querySelector('tbody');
  const tableHead = table.querySelector('thead');

  const isTableHeadEmpty = !tableHead.children.length;
  const totals = calculatesEachTotal(invoices);

  tableHead.innerHTML = '';
  tableBody.innerHTML = '';

  if (!Array.isArray(totals)) {
    const headers = Object.keys(totals);
    const tableRow = document.createElement('tr');

    headers.forEach((header) => {
      tableRow.innerHTML = tableRow.innerHTML + `<th>${splitCamelCase(header)}</th>`;
    });

    tableHead.appendChild(tableRow);
  

    tableBody.innerHTML = `
      <tr>
        <td>${totals.totalOverall}</td>
        <td>${totals.totalIssued}</td>
        <td>${totals.totalPendingPayment}</td>
        <td>${totals.totalPaid}</td>
        <td>${totals.totalExpired}</td>
      </tr>
    `;
    return;
  }

  const headers = Object.keys(totals[0]);
  const tableRow = document.createElement('tr');

  tableRow.innerHTML = '<th>Quarter</th>';

  headers.forEach((header) => {
    tableRow.innerHTML = tableRow.innerHTML + `<th>${splitCamelCase(header)}</th>`;
  });

  tableHead.appendChild(tableRow);

  totals.forEach((total, index) => {
    const tableRow = document.createElement('tr');

    tableRow.innerHTML = `  
        <td>${(index + 1) + 'º'}</td>
        <td>${total.totalOverall}</td>
        <td>${total.totalIssued}</td>
        <td>${total.totalPendingPayment}</td>
        <td>${total.totalPaid}</td>
        <td>${total.totalExpired}</td>
      `

    tableBody.appendChild(tableRow);
  });
} 

function filterInvoicesByDate(invoices, dateCriteria, choosenDate) {
  if (dateCriteria === 'quarter') {
    const filtertedInvoicesByQuarter = [[], [], [], []];

    invoices.forEach((invoice) => {
      const date = new Date(invoice.issuance);
      const quarter = Math.floor((date.getMonth() + 3) / 3) - 1;

      filtertedInvoicesByQuarter[quarter].push(invoice);
    })

    return filtertedInvoicesByQuarter;
  }

  const filteredInvoicesByMonthOrYear = invoices.filter((invoice) => {
    const issuanceDate = new Date(invoice.issuance);
    const isSameMonth = issuanceDate.getMonth() === choosenDate.getMonth();
    const isSameYear = issuanceDate.getFullYear() === choosenDate.getFullYear();

    switch (dateCriteria) {
      case 'month':
        return isSameMonth && isSameYear;
      case 'year':
        return isSameYear;
      default:
        return false;
    }
  });

  return filteredInvoicesByMonthOrYear;
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const invoices = await getAllInvoices('../data/invoices.json');
    const searchBtn = document.getElementById('search-btn');
    const datePicker = document.querySelector('#date-picker');
    const dateCriteriaEl = document.querySelector('#date-criteria');
    const currentDate = new Date().toISOString().split('T')[0];
    
    datePicker.value = currentDate

    let dateCriteria = dateCriteriaEl.value;
    let date = datePicker.value;
    let filteredInvoices = filterInvoicesByDate(invoices, dateCriteria, new Date(date));

    console.log(invoices);

    populateDashboarTable(filteredInvoices);

    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dateCriteria = dateCriteriaEl.value;
      date = datePicker.value;

      if (!date) {
        alert('Please select a date');
      }

      filteredInvoices = filterInvoicesByDate(invoices, dateCriteria, new Date(date));

      populateDashboarTable(filteredInvoices);
    })
  } catch (error) {
    console.error('Error during invoices fetching:', error);
  }
})