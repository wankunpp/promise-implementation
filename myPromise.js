
class myPromise {
    constructor(executor){
        this._resolveHandlers = [];
        this._rejectHandlers = [];
        this._state = 'pending';

        executor(this._resolve.bind(this),this._reject.bind(this));
    }

    _resolve(result) {
        //A promise is pending when neither resolved or rejected 
        //once the promise resolves to a value, it will always remain at that value and never resolve again.
        if(this._state === 'pending'){
            while(this._resolveHandlers.length>0){
                const handler = this._resolveHandlers.shift();
                const thenPromise = this._resolveHandlers.shift();
                
                //if then throw a error , thenPromise is onRejected, handle the error
                try{
                    var returnedValue = handler(result);
                }catch(e){
                    thenPromise._reject(e);
                }
    
                //if then returns a Promise, resolve that value resolved by this promise 
                if(returnedValue instanceof myPromise){
                    returnedValue.then((value) =>{
                        thenPromise._resolve(value);
                    }).catch((e) =>thenPromise._reject(e))
                }else{
                    thenPromise._resolve(returnedValue);
                }
            }
        }

        this._state = 'resolved';
    }

    _reject(error) {
        if(this._state === 'pending'){
            while(this._rejectHandlers.length >0){
                const handler = this._rejectHandlers.shift();
                const thenPromise = this._rejectHandlers.shift();

                const returnValue = handler(error);
            }

            //if rejected ,downstream the error, no resolve value will be handle 
            while(this._resolveHandlers.length > 0){
                let releaseHandler = this._resolveHandlers.shift();
                let releasePromise = this._resolveHandlers.shift();
                releasePromise._reject(error);
            }
        }

        this._state = 'rejected';
    }

    //myPromise.then() returns a new promise resolving to the return value of the called handler
    then(onFulfilled, onRejected){
        const thenPromise = new myPromise(() =>{});

        //store the returned promise and onFulfilled handler
        this._resolveHandlers.push(onFulfilled);
        this._resolveHandlers.push(thenPromise);

        //when onRejected param provided, sotre the returned promise and onRejected handler 
        if(typeof onRejected === 'function'){
            this._rejectHandlers.push(onRejected);
            this._rejectHandlers.push(thenPromise);
        }

        return thenPromise;
    }

    catch(onRejected){
        const newPromise = new myPromise(() =>{});

        this._rejectHandlers.push(onRejected);
        this._rejectHandlers.push(newPromise);

        return newPromise;
    }
}