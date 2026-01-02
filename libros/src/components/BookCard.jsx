import React from 'react';

const BookCard = ({ book }) => {
  return (
    <div className="book-card">
      <div>
        <span className="source-badge">{book.source}</span>
        <img src={book.cover} alt={book.title} />
        <h3>{book.title}</h3>
        <p><strong>Autor:</strong> {book.author}</p>
      </div>
      <a href={book.link} target="_blank" rel="noopener noreferrer" className="download-btn">
        Leer / Ver Detalles
      </a>
    </div>
  );
};

export default BookCard;