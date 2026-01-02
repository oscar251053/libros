import React from 'react';

const ExternalHelpers = ({ query }) => {
  const openLink = (baseUrl) => {
    window.open(`${baseUrl}${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <section id="external-search-help" style={{ textAlign: 'center', padding: '40px 20px', color: 'white' }}>
      <p>¿No encontraste lo que buscabas? Intenta en estas bibliotecas manuales:</p>
      <div className="external-buttons">
        <button onClick={() => openLink('https://www.elejandria.com/buscar?q=')}>Elejandría</button>
        <button onClick={() => openLink('https://infolibros.org/?s=')}>InfoLibros</button>
        <button onClick={() => openLink('https://aprendergratis.es/?s=')}>Aprender Gratis</button>
        <button onClick={() => openLink('https://freeditorial.com/es/books/search?q=')}>Freeditorial</button>
        <button onClick={() => openLink('https://booknet.com/es/search?q=')}>Booknet</button>
        <button onClick={() => openLink('https://planetalibro.net/buscar?q=')}>Planetalibro</button>
      </div>
    </section>
  );
};

export default ExternalHelpers;