import React, { useState } from 'react';
import BookCard from './components/BookCard';
import ExternalHelpers from './components/ExternalHelpers';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // --- Funciones de Fetch (Lógica de script.js) ---
  const fetchGoogleBooks = async (q, cat) => {
    let searchTerms = q || '';
    if (cat) searchTerms += `+subject:${cat}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerms)}&langRestrict=es&maxResults=20`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.items || []).map(book => ({
      id: book.id,
      title: book.volumeInfo.title,
      author: book.volumeInfo.authors?.join(', ') || 'Desconocido',
      cover: book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150x200?text=Sin+Portada',
      link: book.volumeInfo.previewLink,
      source: 'Google Books'
    }));
  };

  const fetchGutenberg = async (q, cat) => {
    let url = `https://gutendex.com/books/?search=${encodeURIComponent(q)}&topic=${encodeURIComponent(cat)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results.map(book => ({
      id: `gt-${book.id}`,
      title: book.title,
      author: book.authors[0]?.name || 'Desconocido',
      cover: book.formats['image/jpeg'] || 'https://via.placeholder.com/150x200?text=Sin+Portada',
      link: book.formats['text/html'] || book.formats['application/epub+zip'] || '#',
      source: 'Project Gutenberg'
    }));
  };

  const fetchOpenLibrary = async (q, cat) => {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&subject=${encodeURIComponent(cat)}&limit=20`;
    const res = await fetch(url);
    const data = await res.json();
    return data.docs.map(book => ({
      id: book.key,
      title: book.title,
      author: book.author_name?.[0] || 'Desconocido',
      cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : 'https://via.placeholder.com/150x200?text=Sin+Portada',
      link: `https://openlibrary.org${book.key}`,
      source: 'Open Library'
    }));
  };

  const handleSearch = async () => {
    if (!query && !category) return;
    
    setLoading(true);
    setHasSearched(true);

    try {
      const results = await Promise.allSettled([
        fetchGutenberg(query, category),
        fetchOpenLibrary(query, category),
        fetchGoogleBooks(query, category)
      ]);

      const allBooks = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);

      setBooks(allBooks);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
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
          <button onClick={handleSearch}>Buscar</button>
        </div>
      </header>

      <main id="bookResults">
        {loading && <p style={{color: 'white', textAlign: 'center'}}>Buscando en múltiples bibliotecas...</p>}
        
        {!loading && books.length > 0 && books.map(book => (
          <BookCard key={book.id} book={book} />
        ))}

        {!loading && hasSearched && books.length === 0 && (
          <p style={{color: 'white', textAlign: 'center'}}>No se encontraron resultados.</p>
        )}

        {!hasSearched && (
          <p className="placeholder" style={{color:'white', textAlign:'center'}}>
            Busca un libro para comenzar...
          </p>
        )}
      </main>

      <ExternalHelpers query={query} />
    </div>
  );
}

export default App;