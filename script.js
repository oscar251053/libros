document.getElementById('searchBtn').addEventListener('click', searchBooks);

async function searchBooks() {
    const query = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('bookResults');

    if (!query) {
        resultsContainer.innerHTML = '<p>Por favor, escribe algo para buscar.</p>';
        return;
    }

    resultsContainer.innerHTML = '<p>Buscando en múltiples bibliotecas...</p>';

    try {
        // Ejecutamos ambas búsquedas en paralelo para mayor velocidad
        const [gutenbergRes, openLibraryRes] = await Promise.allSettled([
            fetchGutenberg(query),
            fetchOpenLibrary(query)
        ]);

        let allBooks = [];

        if (gutenbergRes.status === 'fulfilled') allBooks = [...allBooks, ...gutenbergRes.value];
        if (openLibraryRes.status === 'fulfilled') allBooks = [...allBooks, ...openLibraryRes.value];

        displayBooks(allBooks);
    } catch (error) {
        resultsContainer.innerHTML = '<p>Error general al conectar con las bibliotecas.</p>';
    }
}

// Fuente 1: Gutendex (Project Gutenberg)
async function fetchGutenberg(query) {
    const url = `https://gutendex.com/books/?search=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results.map(book => ({
        title: book.title,
        author: book.authors.length > 0 ? book.authors[0].name : 'Desconocido',
        cover: book.formats['image/jpeg'] || 'https://via.placeholder.com/150x200?text=Sin+Portada',
        link: book.formats['application/epub+zip'] || book.formats['text/html'] || '#',
        source: 'Project Gutenberg'
    }));
}

// Fuente 2: Open Library
async function fetchOpenLibrary(query) {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`;
    const response = await fetch(url);
    const data = await response.json();
    return data.docs.map(book => ({
        title: book.title,
        author: book.author_name ? book.author_name[0] : 'Desconocido',
        cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : 'https://via.placeholder.com/150x200?text=Sin+Portada',
        link: `https://openlibrary.org${book.key}`,
        source: 'Open Library'
    }));
}

function displayBooks(books) {
    const resultsContainer = document.getElementById('bookResults');
    resultsContainer.innerHTML = '';

    if (books.length === 0) {
        resultsContainer.innerHTML = '<p>No se encontraron resultados en ninguna biblioteca.</p>';
        return;
    }

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';

        bookCard.innerHTML = `
            <div>
                <span class="source-badge">${book.source}</span>
                <img src="${book.cover}" alt="${book.title}">
                <h3>${book.title}</h3>
                <p><strong>Autor:</strong> ${book.author}</p>
            </div>
            <a href="${book.link}" target="_blank" class="download-btn">Leer / Descargar</a>
        `;
        resultsContainer.appendChild(bookCard);
    });
}