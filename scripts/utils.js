async function getAllInvoices(path) {
	try {
		const response = await fetch(path);

		if (!response.ok) {
			throw new Error('Error loading data');
		}

		return await response.json();
	} catch (error) {
		return error;
	}
}

function splitCamelCase(text) {
  return text.split('').reduce((result, char, index) => {
    if (index > 0 && char === char.toUpperCase()) {
      result += ' ';
    }
    
    return result + char;
  }, '').toLowerCase();
}

export { getAllInvoices, splitCamelCase };