document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('book-form');
    const booksList = document.getElementById('books');
    const booksListContainer = document.getElementById('books-list');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const writer = document.getElementById('writer').value;
        const date = document.getElementById('date').value;
        const expirationTime = document.getElementById('expirationTime').value;
        const genre = document.getElementById('genre').value;

        await createBook({ title, writer, date, expirationTime, genre });
        loadBooks();
        form.reset();
    });

    async function createBook(bookData) {
        const response = await fetch('https://bookapi-alejo.vercel.app/bookapi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData),
        });

        if (!response.ok) {
            console.error('Error al crear el libro');
        }
    }

    async function loadBooks() {
        const response = await fetch('https://bookapi-alejo.vercel.app/bookapi');
        const data = await response.json();
        booksList.innerHTML = '';
        if (data.books.length === 0) {
            booksListContainer.innerHTML = '<h3>No hay libros para mostrar</h3>';
        } else {
            data.books.forEach(book => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${book.title} de ${book.writer} ${book.date ? `(${book.date})` : ''}
                    ${book.expirationTime ? `<br>Expira el: ${book.expirationTime}` : ''}
                    <br>Genero: ${book.genre}
                    <br>Disponible: ${book.available ? '  Si' : 'No'}
                    <div class="book-actions">
                        <button class="update" data-id="${book._id}" data-available="${book.available}">Cambiar Disponibilidad</button>
                        <button class="delete" data-id="${book._id}">Eliminar</button>
                    </div>
                `;
                booksList.appendChild(li);
            });
        }

        document.querySelectorAll('.update').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const available = e.target.getAttribute('data-available') === 'true' ? false : true;
                await fetch(`https://bookapi-alejo.vercel.app/bookapi/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ available })
                });
                loadBooks();
            });
        });

        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const confirmed = confirm('¿Estás seguro de que deseas eliminar este libro?');
                if (confirmed) {
                    await fetch(`https://bookapi-alejo.vercel.app/bookapi/${id}`, {
                        method: 'DELETE'
                    });
                    loadBooks();
                }
            });
        });
    }

    loadBooks();
});