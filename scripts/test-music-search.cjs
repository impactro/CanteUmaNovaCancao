const assert = require('node:assert/strict');
const search = require('../src/service/musicSearchCore.cjs');

const fixture = [
    { number: 10, title: 'Primeiras manhãs', author: 'Ana', music: { text: 'Graça e paz' } },
    { number: 11, title: 'Paz verdadeira', author: 'Primeiras Vozes', music: { text: 'Outra letra' } },
    { number: 12, title: 'Caminho de Luz', author: 'Paulo', music: { text: 'Nas primeiras manhãs eu cantarei' } },
    { number: 13, title: 'Canção da Graça', author: 'Maria Oliveira', music: { text: 'Esperança viva' } },
    { number: 13, title: 'Canção duplicada', author: 'Maria Oliveira', music: { text: 'Esperança viva' } }
];

assert.equal(search.normalizeText('  Canção Ágil  '), 'cancao agil');
assert.equal(search.searchMusics(fixture, '10')[0].number, 10, 'número exato deve liderar');
assert.equal(search.searchMusics(fixture, 'primeiras manhas')[0].number, 10, 'acentos devem ser ignorados');
assert.equal(search.searchMusics(fixture, 'primeira manhas')[0].number, 10, 'erro de digitação deve ser tolerado');
assert.equal(search.searchMusics(fixture, 'maria oliveira')[0].number, 13, 'autor deve ser pesquisável');
assert.equal(search.searchMusics(fixture, 'esperanca viva')[0].number, 13, 'conteúdo deve ser pesquisável');
assert.equal(search.searchMusics(fixture, 'primeiras manhas')[0].title, 'Primeiras manhãs', 'título deve ranquear antes de letra');
assert.equal(search.searchMusics(fixture, 'esperanca viva').filter(item => item.number === 13).length, 1, 'números duplicados devem ser eliminados');
assert.deepEqual(search.searchMusics(fixture, 'a'), [], 'consultas de um caractere devem ser ignoradas');

console.log('Music search behavior passed');
