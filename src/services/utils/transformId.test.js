const transformId = require('./transformId');

describe('Services/Utils', ()=>{
    describe('transformId', ()=>{
        it('#transformId should return "cat01-hello-world"', ()=>{
            const type = 'cat', 
                id=1, 
                title=`Hello World !!@#$%^&*()`;
            expect(transformId(type, id, title)).toEqual('cat01-hello-world');
        });
    });
});