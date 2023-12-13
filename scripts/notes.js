import { getAllInvoices } from "./utils.js";

function populateInvoiceTable(invoices) {
	const table = document.getElementById('invoice-table');
	const tableBody = table.querySelector('tbody');
	const tableHead = table.querySelector('thead');

	if (!tableHead.children.length) {
		tableHead.innerHTML = '';
		const headers = Object.keys(invoices[0]);
		const tableRow = document.createElement('tr');

		headers.forEach((header) => {
			tableRow.innerHTML= tableRow.innerHTML + `<th>${header}</th>`;
		});

		tableHead.appendChild(tableRow);
	}

	tableBody.innerHTML = '';

	invoices.forEach((invoice) => {
		const tableRow = document.createElement('tr');

		tableRow.innerHTML = `
			<td>${invoice.number ? invoice.number : '-'}</td>
			<td>${invoice.taker ? invoice.taker : '-'}</td>
			<td>${invoice.issuance ? invoice.issuance : '-'}</td>
			<td>${invoice.due ? invoice.due : '-'}</td>
			<td>${invoice.payment ? invoice.payment : '-'}</td>
			<td>${invoice.value ? invoice.value : '-'}</td>
			<td>
			<a href="${invoice.slip}">${getFileName(invoice.slip)}</a>
			</td>
			<td>
			<a href="${invoice.nf}">${getFileName(invoice.nf)}</a>
			</td>
			<td>${invoice.status}</td>
		`;

		tableBody.appendChild(tableRow);
	});
}

function getFileName(path) {
	const fileName = path.split('/');

	return fileName[fileName.length - 1];
}

function filterInvoices(invoices, filter) {
	return invoices.filter((invoice) => 
    Object.keys(filter).every(key => 
      filter[key] ? invoice[key].toString() === filter[key] : true
    )
  );
}

document.addEventListener('DOMContentLoaded', async () => {
	try {
		const invoices = await getAllInvoices('../data/invoices.json');
		const searchBtn = document.getElementById('search-btn');
		const clearBtn = document.getElementById('clear-btn');
		
		populateInvoiceTable(invoices);

		clearBtn.addEventListener('click', (e) => {
			e.preventDefault();
			const filterElements = document.querySelectorAll('.content__filter');
			
			filterElements.forEach((element) => element.value = '');
		})

		searchBtn.addEventListener('click', (e) => {
			e.preventDefault();
			const filterElements = document.querySelectorAll('.content__filter');
			const filter = Array.from(filterElements).reduce((filter, element) => {
				filter[element.id] = element.value.trim();
				return filter;
			}, {});

			const filteredInvoices = filterInvoices(invoices, filter);

			populateInvoiceTable(filteredInvoices);
		});

	} catch (error) {
		console.error('Error fetching invoices:', error);
	}
});