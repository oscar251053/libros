import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fuente 1: Gutendex (Project Gutenberg)
  const fetchGutenberg = async (searchQuery) => {
    const url = `https://gutendex.com/books/?search=${encodeURIComponent(searchQuery)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results.map(book => ({
      id: `guten-${book.id}`,
      title: book.title,
      author: book.authors.length > 0 ? book.authors[0].name : 'Desconocido',
      cover: book.formats['image/jpeg'] || 'https://via.placeholder.com/150x200?text=Sin+Portada',
      link: book.formats['application/epub+zip'] || book.formats['text/html'] || '#',
      source: 'Project Gutenberg'
    }));
  };

  // Fuente 2: Open Library
  const fetchOpenLibrary = async (searchQuery) => {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=10`;
    const response = await fetch(url);
    const data = await response.json();
    return data.docs.map((book, index) => ({
      id: `open-${book.key || index}`,
      title: book.title,
      author: book.author_name ? book.author_name[0] : 'Desconocido',
      cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : 'https://via.placeholder.com/150x200?text=Sin+Portada',
      link: `https://openlibrary.org${book.key}`,
      source: 'Open Library'
    }));
  };

  const handleSearch = async () => {
    if (!query) {
      alert('Por favor, escribe algo para buscar.');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      // Ejecutamos ambas búsquedas en paralelo
      const [gutenbergRes, openLibraryRes] = await Promise.allSettled([
        fetchGutenberg(query),
        fetchOpenLibrary(query)
      ]);

      let allResults = [];
      if (gutenbergRes.status === 'fulfilled') allResults = [...allResults, ...gutenbergRes.value];
      if (openLibraryRes.status === 'fulfilled') allResults = [...allResults, ...openLibraryRes.value];

      setBooks(allResults);
    } catch (error) {
      console.error("Error general:", error);
    } finally {
      setLoading(false);
    }
  };

  const openExternal = (urlBase) => {
    window.open(`${urlBase}${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="app-container">
      <header>
        <h1>📚 Buscador de libros</h1>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Buscar por autor o título..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Todas las categorías</option>
            <option value="fiction">Ficción</option>
            <option value="history">Historia</option>
            <option value="poetry">Poesía</option>
            <option value="drama">Teatro / Drama</option>
            <option value="juvenile+fiction">Juvenil</option>
          </select>

          <input 
            type="number" 
            placeholder="Año (ej: 1900)" 
            min="1000" 
            max="2025"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <button onClick={handleSearch}>Buscar</button>
        </div>
      </header>

      <main id="bookResults">
        {loading && <p>Buscando en múltiples bibliotecas...</p>}
        
        {!loading && books.length > 0 && books.map(book => (
          <div className="book-card" key={book.id}>
            <div>
              <span className="source-badge">{book.source}</span>
              <img src={book.cover} alt={book.title} />
              <h3>{book.title}</h3>
              <p><strong>Autor:</strong> {book.author}</p>
            </div>
            <a href={book.link} target="_blank" rel="noopener noreferrer" className="download-btn">
              Leer / Descargar
            </a>
          </div>
        ))}

        {!loading && hasSearched && books.length === 0 && (
          <p>No se encontraron resultados en ninguna biblioteca.</p>
        )}
      </main>

      <section id="external-search-help" style={{ textAlign: 'center', padding: '0 20px 20px 20px', color: 'white' }}>
        <p>¿No encontraste lo que buscabas? Intenta en estas bibliotecas manuales:</p>
        <div className="search-container">
          <button onClick={() => openExternal('https://www.elejandria.com/buscar?q=')}>Elejandría</button>
          <button onClick={() => openExternal('https://infolibros.org/?s=')}>InfoLibros</button>
          <button onClick={() => openExternal('https://aprendergratis.es/?s=')}>Aprender Gratis</button>
        </div>
      </section>
    </div>
  );
};

export default App;