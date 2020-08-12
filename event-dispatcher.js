const EventEmitter = require('events');

class GulppressEventEmitter extends EventEmitter { }

class EventDispatcher {

    constructor() {
        this.eventEmitter = new GulppressEventEmitter();
    }

    _normaliseEventAndOperate (event, cb) {
        if(typeof event !== 'object') {
            event = [event];
        }

        event.forEach(cb);
    }

    on (event, cb) {
        this._normaliseEventAndOperate(event, singleEvent => {
            this.eventEmitter.on(singleEvent, cb);
        });

        return this;
    }

    emit (event, data) {
        this._normaliseEventAndOperate(event, singleEvent => {
            this.eventEmitter.emit(singleEvent, data);
        });

        return this;
    }

    onFilter (event, cb) {
        this._normaliseEventAndOperate(event, singleEvent => {
            this.eventEmitter.on(singleEvent, cb);
        });

        return this;
    }

    emitFilter (event, val, data) {
        if(!data) {
            data = {};
        }

        data.filterValue = val;

        this._normaliseEventAndOperate(event, singleEvent => {
            this.emit(singleEvent, data);
        });

        return data.filterValue;
    }

}

module.exports = EventDispatcher;