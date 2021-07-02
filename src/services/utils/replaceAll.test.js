const {
    replaceAll,
    removeAllSpecialChars,
} = require('./replaceAll');

describe('Services/Utils', ()=>{
    describe('removeAllSpecialChars', ()=>{
        it('#removeAllSpecialChars should return "Hello"', ()=>{
            const text = `Hello!@#$%^&*(){}[]|-=+-`;
            expect(removeAllSpecialChars(text)).toEqual('Hello');
        });
        it(`#replaceAll should return "hello-world"`, ()=>{
            expect(replaceAll(`hello world`, ' ', '-')).toEqual('hello-world');
        });
    });
});