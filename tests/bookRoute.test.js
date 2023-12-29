process.env.NODE_ENV = 'test';
const request = require("supertest");
const app = require("../app");
const db = require("../db");



describe('Book routes integration test', () => {
    let sampleBook;

    beforeEach(async () => {
        sampleBook = {
            isbn: "0691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
        };
    })
    

    it('should get a list of books', async () => {
        const response = await request(app).get('/books');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('books');
    });

    it('should get a specific book by ID', async () => {
        const createResponse = await request(app).post('/books').send(sampleBook);
        if(!createResponse.body || !createResponse.body.book) {
            console.error('Error creating book', createResponse.body);
            return;
        }
        const createdBook = createResponse.body.book;

        const response = await request(app).get(`/books/${createdBook.isbn}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('book');
        expect(response.body.book.isbn).toBe(createdBook.isbn);
    });

    it('should create a new book', async() => {
        const response = await request(app).post('/books').send(sampleBook);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('book');
    });

    it('should update an existing book', async () => {
        const createResponse = await request(app).post('/books').send(sampleBook);
        if(!createResponse.body || !createResponse.body.book) {
            console.error('Error creating book', createResponse.body);
            return;
        }
        const createdBook = createResponse.body.book;

        const updatedBookData= {
            amazon_url: "https://www.amazon.com/Harry-Potter-Philosophers-Stone-Rowling/dp/0747532699",
            author: "J.K.Rowling",
            language: "english",
            pages: 223,
            publisher: "Bloomsbury",
            title: "Harry Potter and the Philosopher's Stone",
            year: 1997
        }; 
        
        const updateResponse = await request(app).put(`/books/${createdBook.isbn}`).send(updatedBookData);

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body).toHaveProperty('book');
        const updatedBook = updateResponse.body.book;

        expect(updatedBook.isbn).toBe(createdBook.isbn);
        expect(updatedBook.title).toBe(updatedBookData.title);
        expect(updatedBook.author).toBe(updatedBookData.author)
    });

    it('should delete an existing book', async() => {
        const createResponse = await request(app).post('/books').send(sampleBook);
        const createdBook = createResponse.body.book;

        const deleteResponse =await request(app).delete(`/books/${createdBook.isbn}`);
        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body).toHaveProperty('message');
        expect(deleteResponse.body.message).toBe('Book deleted');
    });



});

afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
  });
  
  
  afterAll(async function () {
    await db.end()
  });